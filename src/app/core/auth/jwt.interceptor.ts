import { Injectable, inject } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHandlerFn, // Para interceptor funcional
} from "@angular/common/http";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { catchError, switchMap, filter, take } from "rxjs/operators";
import { AuthService } from "./auth.service";
import { LoginResponseDto } from "./auth.model";

export function jwtInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Clona a requisição e adiciona o header de autorização se o token existir
  // e a URL não for para os endpoints de autenticação.
  if (
    token &&
    !req.url.includes("/auth/login") &&
    !req.url.includes("/auth/refresh")
  ) {
    req = addTokenToRequest(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se for um erro 401 E não for uma falha no login ou refresh
      if (
        error.status === 401 &&
        !req.url.includes("/auth/login") &&
        !req.url.includes("/auth/refresh")
      ) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
}

// Variáveis para controlar o processo de refresh (fora da função intercept para manter estado)
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Bloqueia novas tentativas de refresh até este completar

    return authService.refreshToken().pipe(
      switchMap((response: LoginResponseDto) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        return next(addTokenToRequest(request, response.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout(); // Falha no refresh, desloga
        return throwError(
          () => new Error("Session expired. Please login again.")
        );
      })
    );
  } else {
    // Se já estiver atualizando, espera o novo token
    return refreshTokenSubject.pipe(
      filter((token) => token != null),
      take(1),
      switchMap((jwt) => next(addTokenToRequest(request, jwt)))
    );
  }
}

function addTokenToRequest(
  request: HttpRequest<any>,
  token: string
): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
