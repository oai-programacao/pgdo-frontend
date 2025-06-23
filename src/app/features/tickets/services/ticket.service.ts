import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateTicketDto, Ticket, UpdateTicketDto } from '../../../interfaces/ticket.model';
import { Observable } from 'rxjs';
import { TicketStatus, TicketTopics } from '../../../interfaces/enums.model';
import { CustomPageResponse } from '../../../interfaces/service-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  createTicket(ticketData: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticketData);
  }

  getAllTickets(
    page: number, 
    size: number, 
    status?: TicketStatus, 
    topic?: TicketTopics
  ): Observable<CustomPageResponse<Ticket>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (topic) {
      params = params.set('topic', topic);
    }

    return this.http.get<CustomPageResponse<Ticket>>(this.apiUrl, { params });
  }

  getTicketById(ticketId: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${ticketId}`);
  }

  updateTicket(ticketId: string, body: UpdateTicketDto): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}`, body);
  }
}
