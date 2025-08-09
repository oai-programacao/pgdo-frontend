import { inject, Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SseService {

  private ngZone = inject(NgZone);
  private authService = inject(AuthService);

  private eventSource: EventSource | null = null;

    // Usamos Subjects para criar Observables que "emitem" os eventos para o resto da app
  private notificationSubject = new Subject<any>();
  // Você pode adicionar outros subjects para outros tipos de eventos no futuro
  // private serviceOrderSubject = new Subject<any>();

  // Expomos os Observables para os componentes se inscreverem
  public notificationEvents$: Observable<any> = this.notificationSubject.asObservable();
  // public serviceOrderEvents$: Observable<any> = this.serviceOrderSubject.asObservable();


  // Conecta ao endpoint SSE. Deve ser chamado pelo AuthService após o login/refresh.
  connect(): void {
    // Se já houver uma conexão, feche-a primeiro para evitar múltiplas conexões
    if (this.eventSource) {
      this.disconnect();
    }

    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('SSE Connection: Cannot connect without an access token.');
      return;
    }

    const sseUrl = `http://localhost:8080/api/sse/subscribe?token=${token}`;
    this.eventSource = new EventSource(sseUrl);
    console.log('SSE: Connecting to', sseUrl);

    // Listener para o evento "notification" que seu backend envia
    this.eventSource.addEventListener('notification', (event: MessageEvent) => {
      this.ngZone.run(() => {
        try {
          const notificationData: any = JSON.parse(event.data);
          console.log('SSE: Received notification event:', notificationData);
          this.notificationSubject.next(notificationData);
        } catch (error) {
          console.error('SSE: Error parsing notification event data.', error);
        }
      });
    });

    // Listener para o evento de conexão bem-sucedida (opcional, mas bom para debug)
    this.eventSource.addEventListener('connected', (event: MessageEvent) => {
      console.log('SSE: Connection established successfully.', event.data);
    });

    // Listener para erros na conexão
    this.eventSource.onerror = (error) => {
      console.error('SSE: Connection error.', error);
      // O EventSource tentará se reconectar automaticamente.
      // Se a reconexão falhar repetidamente (ex: token expirou e não consegue renovar),
      // o erro será persistente.
      // Podemos fechar a conexão se o estado for 'CLOSED'
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        console.warn('SSE: Connection was closed by the server. Disconnecting.');
        this.disconnect();
      }
    };
  }

  // Desconecta. Deve ser chamado pelo AuthService no logout.
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE: Disconnected.');
    }
  }
  
}
