import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateSaleDto, SaleAccessionStatus, SaleContractStatus, SaleStatus, TransferSaleDto, UpdateSaleDto, ViewSaleDto } from '../../../interfaces/sales.model';
import { Observable } from 'rxjs';
import { CustomPageResponse } from '../../../interfaces/service-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/sales';

  createSale(saleData: CreateSaleDto): Observable<ViewSaleDto> {
    return this.http.post<ViewSaleDto>(`${this.apiUrl}`, saleData);
  }

  transferSaleToAnotherSellers(saleId: string, newSellerId: TransferSaleDto): Observable<ViewSaleDto> {
    return this.http.patch<ViewSaleDto>(`${this.apiUrl}/${saleId}/seller`, newSellerId );
  }

  getSaleById(saleId: string): Observable<ViewSaleDto> {
    return this.http.get<ViewSaleDto>(`${this.apiUrl}/${saleId}`);
  }

  updateSale(saleId: string, saleData: UpdateSaleDto): Observable<ViewSaleDto> {
    return this.http.patch<ViewSaleDto>(`${this.apiUrl}/${saleId}`, saleData);
  }

  getSales(page: number, size: number, status?: SaleStatus, clientCode?: number, clientName?: string, date?: string, contractStatus?: SaleContractStatus, accessionStatus?: SaleAccessionStatus, sellerId?: string, validatorId?: string): Observable<CustomPageResponse<ViewSaleDto>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (clientCode) {
      params = params.set('clientCode', clientCode.toString());
    }
    if (clientName) {
      params = params.set('clientName', clientName);
    }
    if (date) {
      params = params.set('date', date);
    }
    if (contractStatus) {
      params = params.set('contractStatus', contractStatus);
    }
    if (accessionStatus) {
      params = params.set('accessionStatus', accessionStatus);
    }
    if (sellerId) {
      params = params.set('sellerId', sellerId);
    }
    if (validatorId) {
      params = params.set('validatorId', validatorId);
    }
    return this.http.get<CustomPageResponse<ViewSaleDto>>(`${this.apiUrl}`, { params });
  }

  approveSale(saleId: string): Observable<ViewSaleDto> {
    return this.http.patch<ViewSaleDto>(`${this.apiUrl}/${saleId}/approve`, null);
  }
}
