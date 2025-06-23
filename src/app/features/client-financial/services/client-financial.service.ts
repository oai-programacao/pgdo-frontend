import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ClientDataResponse, GenerateBillPixDto, PixResponse, SearchClientFinancialResponse } from '../../../interfaces/client-financial.model';

@Injectable({
  providedIn: 'root'
})
export class ClientFinancialService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/client-financial';

  getFinancialData(nameOrCpf: string): Observable<ClientDataResponse[]> {
    return this.http.get<ClientDataResponse[]>(`${this.apiUrl}/cliente?nomeOuCpf=${nameOrCpf}`);
  }

  getClientUnpaidBills(clientCode: number): Observable<SearchClientFinancialResponse> {
    return this.http.get<SearchClientFinancialResponse>(`${this.apiUrl}?codigoCliente=${clientCode}`);
  }

  getBillPdf(pdfUrl: string): Observable<Blob> {
    const params = new HttpParams().set('pdfUrl', pdfUrl);

    return this.http.get(`${this.apiUrl}/download-boleto-pdf`, { params, responseType: 'blob' });
  }

  generateBillPix(body: GenerateBillPixDto): Observable<PixResponse> {
    return this.http.put<PixResponse>('https://apipix.oai.com.br/BBPix/pixClienteFinanceiroGerar/', body)
  }

  confirmPixReceived(idPix: string): Observable<PixResponse> {
    return this.http.get<PixResponse>('https://apipix.oai.com.br/BBPix/pixClientes?idPix=' + idPix);
  }
}
