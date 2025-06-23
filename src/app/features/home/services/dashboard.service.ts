import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TypeOfOs } from '../../../interfaces/enums.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getServiceOrderActualMonthData(serviceOrderType: TypeOfOs): Observable<any> {
    if (!serviceOrderType) {
      throw new Error('Service order type is required');
    }
    
    return this.http.get<any>(`${this.apiUrl}/service-orders`, {
      params: { serviceOrderType }
    });
  }

  getTechnicianActualMonthData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/technician-service-count`);
  }
}
