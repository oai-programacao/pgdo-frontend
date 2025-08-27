import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferStateService {
  private _availableOffersCount = new BehaviorSubject<number>(0);
  public availableOffersCount$: Observable<number> = this._availableOffersCount.asObservable();

  private _requestedOffersCount = new BehaviorSubject<number>(0);
  public requestedOffersCount$: Observable<number> = this._requestedOffersCount.asObservable();

  constructor() { }

  updateAvailableOffersCount(count: number): void {
    this._availableOffersCount.next(count);
    console.log(`📊 OfferStateService: Ofertas disponíveis atualizadas para: ${count}`);
  }

  updateRequestedOffersCount(count: number): void {
    this._requestedOffersCount.next(count);
    console.log(`📊 OfferStateService: Ofertas solicitadas atualizadas para: ${count}`);
  }
}