import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { ViaCepResponse } from "../interfaces/viacep.model";

@Injectable({
  providedIn: 'root',
})
export class ViaCepService {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  private http = inject(HttpClient);

  getAddress(cep: string): Observable<ViaCepResponse> {
    const url = `${this.baseUrl}/${cep}/json/`;
    return this.http.get<ViaCepResponse>(url).pipe(
      catchError((error) => {
        console.error('Error fetching address:', error);
        return throwError(() => new Error('Failed to fetch address'));
      })
    );
  }
}