import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateManyAvailableOffersDto, ViewOfferDto } from '../../../interfaces/offers.model';
import { City, Period, TypeOfOs } from '../../../interfaces/enums.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class AdminOffersService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/admin/offers';

  createAvailableOffer(offer: CreateManyAvailableOffersDto): Observable<ViewOfferDto> {
    return this.http.post<ViewOfferDto>(`${this.apiUrl}`, offer);
  }

  acceptOffer(offerId: string): Observable<ViewOfferDto> {
    return this.http.put<ViewOfferDto>(`${this.apiUrl}/${offerId}/accept`, {});
  }

  rejectOffer(offerId: string): Observable<ViewOfferDto> {
    return this.http.put<ViewOfferDto>(`${this.apiUrl}/${offerId}/reject`, {});
  }

   deleteByCriteria(
    quantity: number, 
    typeOfOs: TypeOfOs, 
    city: City, 
    period: Period, 
    date: string // Formato YYYY-MM-DD
  ): Observable<void> {
    
    let params = new HttpParams()
      .set('quantity', quantity.toString())
      .set('typeOfOs', typeOfOs)
      .set('city', city)
      .set('period', period)
      .set('date', date);

    return this.http.delete<void>(this.apiUrl, { params });
  }
}
