import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateContactAttemptDto, ViewAfterSaleDto } from '../../../interfaces/after-sales.model';
import { CustomPageResponse } from '../../../interfaces/service-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfterSalesService {

  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/after-sales';


  getAfterSales(page: number, size: number, status?: string, saleId?: number, clientName?: string): Observable<CustomPageResponse<ViewAfterSaleDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
   
    if (saleId) {
      params = params.set('saleId', saleId.toString());
    }

    return this.http.get<CustomPageResponse<ViewAfterSaleDto>>(`${this.apiUrl}`, { params });
  }

  registerContactAttempt(afterSaleId: string, body: CreateContactAttemptDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${afterSaleId}/contacts-attempts`, body);
  }

  getAfterSaleById(afterSaleId: string): Observable<ViewAfterSaleDto> {
    return this.http.get<ViewAfterSaleDto>(`${this.apiUrl}/${afterSaleId}`, );
  }
}
