import { inject, Injectable, NgZone } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class SseService {
  private ngZone = inject(NgZone);
  private eventSource: EventSource | null = null;

  // Canal para notificações GERAIS (ex: novas solicitações para admins)
  private notificationSubject = new Subject<any>();
  public notificationEvents$: Observable<any> = this.notificationSubject.asObservable();

  // Canal ESPECÍFICO para atualizações de status (aceito/rejeitado)
  private offerStatusSubject = new Subject<any>();
  public offerStatusEvents$: Observable<any> = this.offerStatusSubject.asObservable();

  // O método connect agora recebe o token para evitar dependência circular
  connect(token: string | null): void {
    if (this.eventSource) {
      this.disconnect();
    }
    if (!token) {
      console.error("SSE Connection: Cannot connect without an access token.");
      return;
    }

    const sseUrl = `${environment.apiUrl}/sse/subscribe?token=${token}`;
    this.eventSource = new EventSource(sseUrl);

    // Listener para o evento "notification" (para admins)
    this.eventSource.addEventListener("notification", (event: MessageEvent) => {
      this.ngZone.run(() => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE: Received 'notification' event ->", data);
          this.notificationSubject.next(data);
        } catch (error) {
          console.error("SSE: Error parsing 'notification' event.", error);
        }
      });
    });

    // Listener para o evento "offer_status_update" (para o solicitante)
    this.eventSource.addEventListener("offer_status_update", (event: MessageEvent) => {
      this.ngZone.run(() => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE: Received 'offer_status_update' event ->", data);
          this.offerStatusSubject.next(data);
        } catch (error) {
          console.error("SSE: Error parsing 'offer_status_update' event.", error);
        }
      });
    });

    this.eventSource.onerror = (error) => {
      console.error("SSE: Connection error.", error);
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.disconnect();
      }
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
