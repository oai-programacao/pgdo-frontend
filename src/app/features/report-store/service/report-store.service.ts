import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportStoreService {

  private readonly urlApi = environment.apiUrl + '/panel';
  private readonly http = inject(HttpClient);

  private get(path: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.urlApi}${path}`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
  }

  getVendasRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/vendas/report', startDate, endDate);
  }

  getUpgradeRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/upgrade/report', startDate, endDate);
  }

  getDowngradeRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/downgrade/report', startDate, endDate);
  }

  getCancelRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/cancel/report', startDate, endDate);
  }

  getCancelReasonRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/cancel_reason/report', startDate, endDate);
  }

  getTransferOwnershipRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/transferOwnership/report', startDate, endDate);
  }

  getSuspensionRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/suspensao/report', startDate, endDate);
  }

  getUpdateAddressRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/mudancaEndereco/report', startDate, endDate);
  }

  getDateTransferRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/mudancaVencimento/report', startDate, endDate);
  }

  getPaymentShipmentRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/envioPagamento/report', startDate, endDate);
  }

  getTrustReleaseRankingReport(startDate: string, endDate: string): Observable<Blob> {
    return this.get('/ranking/liberacaoConfianca/report', startDate, endDate);
  }
}