import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { City } from '../../../interfaces/enums.model';
import { Observable } from 'rxjs';
import { CustomPageResponse } from '../../../interfaces/service-order.model';
import { ViewWiredAddressDto, WiredAddressFilters } from '../../../interfaces/wired-address.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WiredAddressService {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/wired-addresses`;


 // Método ajustado para aceitar um objeto de filtros e retornar uma página
  getWiredAddresses(
    filters: WiredAddressFilters,
    page: number, 
    size: number
  ): Observable<CustomPageResponse<ViewWiredAddressDto>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters.clientName) {
      params = params.set('clientName', filters.clientName);
    }
    if (filters.address) {
      params = params.set('address', filters.address);
    }
    // O backend espera uma string separada por vírgulas para cities
    if (filters.cities && filters.cities.length > 0) {
      params = params.set('cities', filters.cities.join(','));
    }

    return this.http.get<CustomPageResponse<ViewWiredAddressDto>>(this.apiUrl, { params });
  }
}
