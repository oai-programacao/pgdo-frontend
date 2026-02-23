import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ContractCodePlanDTO {
  contractCode: string;
  planName: string;
  planCodigo: number;
}

@Injectable({
  providedIn: 'root',
})
export class FinancialService {
  private readonly BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Sincroniza cliente no PGDO via RBX.
   * POST /client/rbx/searchAndRegister
   * Retorna sempre 200 com { foundInRBX, foundInPGDO, message, client }
   */
  searchAndRegisterClient(documento: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/client/rbx/searchAndRegister`, { documento });
  }

  /**
   * Busca todos os contratos de um cliente pelo ID.
   * GET /contract/{clientId}/all
   * Retorna List<ContractResponsePgdoDTO>
   */
  getContractsByClientId(clientId: string): Observable<ContractCodePlanDTO[]> {
    return this.http.get<ContractCodePlanDTO[]>(`${this.BASE_URL}/contract/${clientId}/contract-codes`);
  }

  /**
   * Gera o carnê em PDF pelo número do contrato.
   * GET /carne/render?contractNumber={contractNumber}
   * Retorna Blob (application/pdf)
   */
  getCarne(contractNumber: string): Observable<Blob> {
    const headers = new HttpHeaders({ Accept: 'application/pdf' });
    return this.http.get(`${this.BASE_URL}/carne/render`, {
      headers,
      params: { contractNumber },
      responseType: 'blob',
    });
  }
}