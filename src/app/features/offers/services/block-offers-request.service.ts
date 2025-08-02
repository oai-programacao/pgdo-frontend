import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateBlockOffersDto, ViewBlockOffersDto } from '../../../interfaces/block-offers-request.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlockOffersRequestService {

  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/blocking-offers';

  createBlockOffer(body: CreateBlockOffersDto): Observable<ViewBlockOffersDto> {
    return this.http.post<ViewBlockOffersDto>(`${this.apiUrl}`, body);
  }

  getAllBlockOffers(): Observable<ViewBlockOffersDto[]> {
    return this.http.get<ViewBlockOffersDto[]>(`${this.apiUrl}`);
  }

  deleteBlockOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
