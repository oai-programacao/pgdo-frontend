import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateOnuDto, ViewOnuDto, OnuCertificate, OnuColor, OnuSignal, UpdateOnuDto } from '../../../interfaces/onu.model';
import { CustomPageResponse } from '../../../interfaces/service-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OnuService {
  findMaintenancesByOnuId(id: string) {
    throw new Error("Method not implemented.");
  }

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/onus`;

  createOnu(dto: CreateOnuDto): Observable<ViewOnuDto> {
    return this.http.post<ViewOnuDto>(this.apiUrl, dto);
  }

  findAllOnus(
    page: number, 
    size: number, 
    onuCertificate?: OnuCertificate, 
    onuColor?: OnuColor, 
    onuSignal?: OnuSignal,
    serialNumber?: string
  ): Observable<CustomPageResponse<ViewOnuDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (onuCertificate) params = params.set('onuCertificate', onuCertificate);
    if (onuColor) params = params.set('onuColor', onuColor);
    if (onuSignal) params = params.set('onuSignal', onuSignal);
    if (serialNumber) params = params.set('onuSerialNumber', serialNumber.trim());

    return this.http.get<CustomPageResponse<ViewOnuDto>>(this.apiUrl, { params });
  }

  updateOnu(id: string, dto: UpdateOnuDto): Observable<ViewOnuDto> {
    return this.http.patch<ViewOnuDto>(`${this.apiUrl}/${id}`, dto);
  }

  deleteOnu(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  


}
