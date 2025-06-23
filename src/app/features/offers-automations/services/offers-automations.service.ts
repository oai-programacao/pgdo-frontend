import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateOffersAutomationDto, UpdateOffersAutomationDto, ViewOffersAutomationDto } from '../../../interfaces/offers-automation.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OffersAutomationsService {

  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/offers-automations`;

  createOffersAutomation(data: CreateOffersAutomationDto): Observable<ViewOffersAutomationDto> {
    return this.http.post<ViewOffersAutomationDto>(`${this.url}`, data);
  }

  getOffersAutomations(): Observable<ViewOffersAutomationDto[]> {
    return this.http.get<ViewOffersAutomationDto[]>(`${this.url}`);
  }

  updateOffersAutomationStatus(id: string, data: UpdateOffersAutomationDto): Observable<ViewOffersAutomationDto> {
    return this.http.patch<ViewOffersAutomationDto>(`${this.url}/${id}/status`, data);
  }
}
