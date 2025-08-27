import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Serviço responsável por retransmitir notificações entre componentes
 * Atua como um hub central de comunicação para atualizações de dados
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationRelayService {
  
  // Subject para emitir sinais de atualização
  private refreshSubject = new Subject<string>();
  
  // Observable público para componentes se inscreverem
  public refreshRequired$: Observable<string> = this.refreshSubject.asObservable();
  
  // Subject para notificações específicas por tipo
  private notificationSubject = new Subject<{type: string, data: any}>();
  public notifications$: Observable<{type: string, data: any}> = this.notificationSubject.asObservable();

  /**
   * Dispara um sinal de atualização geral
   * @param source - Fonte que está solicitando a atualização (opcional)
   */
  triggerRefresh(source: string = 'unknown'): void {
    console.log(`🔄 NotificationRelayService: Disparando atualização de dados (fonte: ${source})`);
    this.refreshSubject.next(source);
  }

  /**
   * Emite uma notificação específica por tipo
   * @param type - Tipo da notificação
   * @param data - Dados da notificação
   */
  emitNotification(type: string, data: any): void {
    console.log(`📢 NotificationRelayService: Emitindo notificação do tipo '${type}'`, data);
    this.notificationSubject.next({ type, data });
  }

  /**
   * Dispara atualização específica para ofertas
   */
  triggerOffersRefresh(): void {
    this.triggerRefresh('offers');
    this.emitNotification('OFFERS_UPDATED', { timestamp: new Date() });
  }

  /**
   * Dispara atualização específica para solicitações de ofertas
   */
  triggerRequestedOffersRefresh(): void {
    this.triggerRefresh('requested-offers');
    this.emitNotification('REQUESTED_OFFERS_UPDATED', { timestamp: new Date() });
  }
}
