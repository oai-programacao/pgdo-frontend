import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateRegisterClientDto, ViewRegisterClientResponseDto } from '../../../interfaces/register-client.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterClientService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  
  registerClient(data: CreateRegisterClientDto): Observable<ViewRegisterClientResponseDto> {
    const url = `${this.apiUrl}/clientContract`;
    return this.http.post<ViewRegisterClientResponseDto>(url, data);
  }
}
