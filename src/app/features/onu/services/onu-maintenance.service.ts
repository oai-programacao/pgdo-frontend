import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOnuMaintenanceDto, ViewOnuMaintenanceDto } from '../../../interfaces/onu.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OnuMaintenanceService {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/onus`;

  createMaintenance(onuId: string, dto: CreateOnuMaintenanceDto): Observable<ViewOnuMaintenanceDto> {
    return this.http.post<ViewOnuMaintenanceDto>(`${this.apiUrl}/${onuId}/maintenances`, dto);
  }

  findMaintenancesByOnuId(onuId: string): Observable<ViewOnuMaintenanceDto[]> {
    return this.http.get<ViewOnuMaintenanceDto[]>(`${this.apiUrl}/${onuId}/maintenances`);
  }
}
