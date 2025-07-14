import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateRegisterClientDto, ViewRegisterClientResponseDto } from '../../../interfaces/register-client.model';
import { Observable } from 'rxjs';
import { CustomPageResponse } from '../../../interfaces/service-order.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterClientService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  
  registerClient(data: CreateRegisterClientDto): Observable<ViewRegisterClientResponseDto> {
    const url = `${this.apiUrl}/clientRegister`;
    return this.http.post<ViewRegisterClientResponseDto>(url, data);
  }


  getAllRegisteredClients(page: number, size: number, clientType?: 'PF' | 'PJ', day?: string): Observable<CustomPageResponse<ViewRegisterClientResponseDto>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (clientType) {
      params = params.set('clientType', clientType);
    }

    if (day) {
      params = params.set('day', day);
    }
    

    const url = `${this.apiUrl}/clientRegister`;
    return this.http.get<CustomPageResponse<ViewRegisterClientResponseDto>>(url, { params });
  }
}
