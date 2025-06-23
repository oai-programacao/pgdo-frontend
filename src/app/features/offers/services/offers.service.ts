import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TypeOfOs, City, Period, OfferStatus } from '../../../interfaces/enums.model';
import { CreateOfferRequestDto, ViewOfferDto } from '../../../interfaces/offers.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class OffersService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + "/offers";

  createRequestOffer(offer: CreateOfferRequestDto): Observable<ViewOfferDto> {
    return this.http.post<ViewOfferDto>(`${this.apiUrl}`, offer);
  }

  /**
   * Lista todas as ofertas com filtros opcionais.
   * @param typeOfOs - Tipo de Ordem de Serviço (opcional)
   * @param city - Cidade da oferta (opcional)
   * @param period - Período da oferta (opcional)
   * @param status - Status da oferta (opcional)
   * @returns Observable<ViewOfferRequestDto[]> - Uma lista de ofertas
   */
  getAllOffers(
    typeOfOs?: TypeOfOs,
    city?: City,
    period?: Period,
    status?: OfferStatus,
    date?: string
  ): Observable<ViewOfferDto[]> {
    let params = new HttpParams();

    // Correção: Enviar o valor da chave do enum, não o índice numérico se TypeOfOs for um enum string.
    // Se TypeOfOs[typeOfOs] estiver funcionando, significa que o backend espera o nome da string do enum.
    if (typeOfOs !== undefined && typeOfOs !== null) {
      params = params.set("typeOfOs", typeOfOs); // Envia o valor string do enum diretamente
    }
    if (city !== undefined && city !== null) {
      params = params.set("city", city); // Envia o valor string do enum diretamente
    }
    if (period !== undefined && period !== null) {
      params = params.set("period", period); // Envia o valor string do enum diretamente
    }
    if (status !== undefined && status !== null) {
      params = params.set("status", status); // Envia o valor string do enum diretamente
    }

    if (date !== undefined && date !== null) {
      params = params.set("date", date); // Envia o valor string do enum diretamente
    }

    return this.http.get<ViewOfferDto[]>(this.apiUrl, { params });
  }

  getSummaryOffers(
    city?: City,
    typeOfOs?: TypeOfOs,
    period?: Period,
  ): Observable<any[]> {
     let params = new HttpParams();

    // Correção: Enviar o valor da chave do enum, não o índice numérico se TypeOfOs for um enum string.
    // Se TypeOfOs[typeOfOs] estiver funcionando, significa que o backend espera o nome da string do enum.
    if (typeOfOs !== undefined && typeOfOs !== null) {
      params = params.set("typeOfOs", typeOfOs); // Envia o valor string do enum diretamente
    }
    if (city !== undefined && city !== null) {
      params = params.set("city", city); // Envia o valor string do enum diretamente
    }
    if (period !== undefined && period !== null) {
      params = params.set("period", period); // Envia o valor string do enum diretamente
    }
    return this.http.get<any[]>(`${this.apiUrl}/summary`, { params });
  }
}
