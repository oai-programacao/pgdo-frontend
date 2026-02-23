import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class FinancialService {
  private readonly BASE_URL = environment.apiUrl; // ex: 'http://localhost:8080/api'

  constructor(private http: HttpClient) {}

  searchAndRegisterClient(documento: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/client/rbx/searchAndRegister`, { documento });
  }

  getCarne(contractNumber: string): Observable<Blob> {
    const url = `${this.BASE_URL}/carne/render`;
    const headers = new HttpHeaders({ Accept: 'application/pdf'});

    return this.http.get(url, {
      headers,
      params: { contractNumber },
      responseType: 'blob',
    });
  }
}