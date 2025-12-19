import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import {
  catchError,
  map,
  switchMap,
  shareReplay,
  tap,
  filter,
  take,
} from "rxjs/operators";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import {
  AuthenticatedUser,
  CustomJwtPayload,
  LoginDto,
  LoginResponseDto,
} from "./auth.model";
import { environment } from "../../../environments/environment";
import { WsService } from "../websocket/ws.service";

const ACCESS_TOKEN_KEY = "pgdo_access_token";
const REFRESH_TOKEN_KEY = "pgdo_refresh_token";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl + "/auth";

  public currentUserSubject = new BehaviorSubject<AuthenticatedUser | null>(
    this.getUserFromToken()
  );
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => !!user)
  );

  private isRefreshingToken = false;
  private tokenRefreshed$ = new BehaviorSubject<boolean | null>(null);
  private tokenExpirationTimer: any = null; // Para nosso "despertador"

  constructor(private wsService: WsService) {
    // Ao iniciar o serviço, verifica se há um token válido e agenda o refresh
    const initialUser = this.currentUserSubject.getValue();
    if (initialUser) {
      this.scheduleProactiveRefresh(this.getAccessToken()!);
    }
  }

  private getUserFromToken(): AuthenticatedUser | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);

      // 1. VERIFICAR EXPIRAÇÃO DO TOKEN (ESSENCIAL)
      // O campo 'exp' no JWT é em SEGUNDOS, Date.now() é em MILISSEGUNDOS
      if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
        console.warn(
          "Token de acesso expirado durante a inicialização/verificação."
        );
        this.clearTokens(); // Limpa tokens expirados
        return null;
      }

      // 2. Mapear para sua interface AuthenticatedUser
      // Certifique-se que 'sub' (subject) existe, pois é padrão para o username/email
      if (!decodedToken.sub) {
        console.error("Token JWT não contém a claim 'sub' (subject/email).");
        this.clearTokens();
        return null;
      }

      const user: AuthenticatedUser = {
        email: decodedToken.email!,
        roles: decodedToken.roles || [], // Garante que roles seja um array, mesmo se ausente
        employeeId: decodedToken.sub, // Se o backend enviar
        name: decodedToken.name, // Se o backend enviar
      };
      return user;
    } catch (error) {
      console.error("Erro ao decodificar o token de acesso:", error);
      this.clearTokens(); // Limpa tokens inválidos/malformados
      return null;
    }
  }

  login(credentials: LoginDto): Observable<LoginResponseDto> {
  const headers = new HttpHeaders({
    'X-Client-Type': 'EMPLOYEE',
  });

  return this.http
    .post<LoginResponseDto>(
      `${this.apiUrl}/login`,
      credentials,
      { headers }
    )
    .pipe(
      tap((response) => {
        this.storeTokensAndScheduleRefresh(response);
        const user = this.getUserFromToken();
        this.currentUserSubject.next(user);
        this.wsService.initWebSocket();
      }),
      catchError(this.handleError)
    );
} 

  refreshToken(): Observable<LoginResponseDto> {
    const currentRefreshToken = this.getRefreshToken();
    if (!currentRefreshToken) {
      this.logout();
      return throwError(() => new Error("Refresh token not available."));
    }

    if (this.isRefreshingToken) {
      return this.tokenRefreshed$.pipe(
        filter((result) => result !== null),
        take(1),
        switchMap((success) =>
          success
            ? this.createTokenResponseFromStorage()
            : throwError(() => new Error("Failed refresh attempt."))
        )
      );
    }

    this.isRefreshingToken = true;
    this.tokenRefreshed$.next(null);

    return this.http
      .post<LoginResponseDto>(`${this.apiUrl}/refresh`, {
        refreshToken: currentRefreshToken,
      })
      .pipe(
        tap((response) => {
          this.storeTokensAndScheduleRefresh(response);
          this.currentUserSubject.next(this.getUserFromToken());
          this.isRefreshingToken = false;
          this.tokenRefreshed$.next(true);
        }),
        catchError((err) => {
          this.isRefreshingToken = false;
          this.tokenRefreshed$.next(false);
          this.logout();
          return throwError(
            () => new Error("Session expired. Please login again.")
          );
        }),
        shareReplay()
      );
  }

  logout(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer); // Cancela o "despertador" no logout
      this.tokenExpirationTimer = null;
    }
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.router.navigate(["/login"]);
    // Ajuste para sua rota de login, se '' não for ela

    this.wsService.disconnect(); // Desconecta o WebSocket ao sair
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    // Agora esta verificação é mais robusta pois getUserFromToken() já checa a expiração
    return !!this.getUserFromToken();
  }

  private storeTokensAndScheduleRefresh(response: LoginResponseDto): void {
    // 1. Limpa qualquer timer antigo
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    // 2. Armazena os novos tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
    // 3. Agenda a próxima renovação proativa
    this.scheduleProactiveRefresh(response.accessToken);
  }

  private scheduleProactiveRefresh(token: string): void {
    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const expiresAtMs = (decodedToken.exp ?? 0) * 1000;
      const nowMs = Date.now();
      const expiresInMs = expiresAtMs - nowMs;

      // Renova 1 minuto (60000 ms) antes de expirar. Ajuste o buffer se necessário.
      // Apenas agenda se o token for válido por mais de 1 minuto.
      const proactiveRefreshDelay = expiresInMs - 60000;

      if (proactiveRefreshDelay > 0) {
        this.tokenExpirationTimer = setTimeout(() => {
          console.log("Proactively refreshing token now...");
          this.refreshToken().subscribe({
            next: () => console.log("Proactive token refresh successful."),
            error: (err) =>
              console.error("Proactive token refresh failed:", err),
          });
        }, proactiveRefreshDelay);
        console.log(
          `Token refresh scheduled in ${(
            proactiveRefreshDelay /
            1000 /
            60
          ).toFixed(2)} minutes.`
        );
      } else {
        console.warn(
          "Token is about to expire, not scheduling proactive refresh."
        );
      }
    } catch (error) {
      console.error("Failed to decode token for scheduling refresh:", error);
    }
  }

  private createTokenResponseFromStorage(): Observable<LoginResponseDto> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (accessToken && refreshToken) {
      return of({ accessToken, refreshToken });
    }
    return throwError(
      () => new Error("Could not create token response from storage.")
    );
  }

  private storeTokens(response: LoginResponseDto): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    if (response.refreshToken) {
      // O backend sempre envia um novo refresh token
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = `Erro ${error.status}: `;
    if (error.error instanceof ErrorEvent) {
      // Erro de cliente ou rede
      errorMessage += error.error.message;
    } else {
      // Erro de backend
      // Tenta pegar uma mensagem mais específica do corpo do erro, se disponível
      const serverError = error.error;
      if (serverError && typeof serverError.message === "string") {
        errorMessage += serverError.message;
      } else if (typeof error.message === "string") {
        errorMessage += error.message;
      } else {
        errorMessage += "Erro no servidor";
      }

      // Mensagem específica para falha no login (401 do endpoint /login)
      if (error.status === 401 && error.url?.includes("/auth/login")) {
        errorMessage = "Email ou senha inválidos.";
      } else if (error.status === 401) {
        // Para outros 401, pode ser token expirado, mas o interceptor vai tratar o refresh
        errorMessage = "Sessão inválida ou expirada.";
      } else if (error.status === 403) {
        errorMessage = "Você não tem permissão para realizar esta ação.";
      }
    }
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  public isAdmin$ = this.currentUser$.pipe(
    map(
      (user) =>
        !!user && Array.isArray(user.roles) && user.roles.includes("ROLE_ADMIN")
    )
  );
}
