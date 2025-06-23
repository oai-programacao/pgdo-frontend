import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, catchError, throwError } from 'rxjs';
import { CreateOltUserDto, OLTs, OntInfoBySnDto, SlotInfoSummaryDto, ViewOltUserDto } from '../../../interfaces/olt.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class OltService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/olt`;

  getOntSummaryBySlot(
    slot: string,
    olt: OLTs
  ): Observable<SlotInfoSummaryDto[]> {
    if (!slot || !olt) {
      return of([]); // Retorna array vazio se os parâmetros não forem válidos
    }
    const params = new HttpParams().set("olt", olt);
    return this.http
      .get<SlotInfoSummaryDto[]>(`${this.apiUrl}/slot/${slot}`, { params })
      .pipe(catchError(this.handleError));
  }

  getDisplayOntBySN(sn: string, olt: OLTs): Observable<OntInfoBySnDto | null> {
    if (!sn || !olt) {
      return of(null); // Retorna null se os parâmetros não forem válidos
    }
    const params = new HttpParams().set("olt", olt);
    return this.http
      .get<OntInfoBySnDto>(`${this.apiUrl}/sn/${sn}`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of(null); // Trata 404 Not Found como resultado nulo
          }
          return this.handleError(error); // Relança outros erros
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = "Ocorreu um erro desconhecido ao consultar a OLT.";
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Erro ${error.status}: ${
        error.message || "Erro no servidor"
      }`;
      if (error.status === 404) {
        errorMessage = "Recurso não encontrado na OLT.";
      } else if (error.status === 400) {
        errorMessage = "Requisição inválida. Verifique os parâmetros.";
      }
    }
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  createOltUser(user: CreateOltUserDto): Observable<ViewOltUserDto> {
    return this.http.post<ViewOltUserDto>(`${this.apiUrl}/users`, user);
  }

  getOltUsers(): Observable<ViewOltUserDto[]> {
    return this.http.get<ViewOltUserDto[]>(`${this.apiUrl}/users`);
  }

  deleteOltUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  getOltUserById(userId: string): Observable<ViewOltUserDto> {
    return this.http.get<ViewOltUserDto>(`${this.apiUrl}/users/${userId}`);
  }
}
