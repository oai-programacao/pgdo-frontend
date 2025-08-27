// import { inject, Injectable, NgZone } from "@angular/core";
// import { Observable, Subject } from "rxjs";
// import { AuthService } from "../auth/auth.service";
// import { environment } from "../../../environments/environment";

// @Injectable({
//   providedIn: "root",
// })
// export class SseService {
//   private ngZone = inject(NgZone);
//   private authService = inject(AuthService);

//   private eventSource: EventSource | null = null;

//   // Usamos Subjects para criar Observables que "emitem" os eventos para o resto da app
//   private notificationSubject = new Subject<any>();
//   // Você pode adicionar outros subjects para outros tipos de eventos no futuro
//   // private serviceOrderSubject = new Subject<any>();

//   // Expomos os Observables para os componentes se inscreverem
//   public notificationEvents$: Observable<any> =
//     this.notificationSubject.asObservable();
//   // public serviceOrderEvents$: Observable<any> = this.serviceOrderSubject.asObservable();

//   private offerStatusSubject = new Subject<any>();
//   public offerStatusEvents$: Observable<any> =
//     this.offerStatusSubject.asObservable();

//   // Conecta ao endpoint SSE. Deve ser chamado pelo AuthService após o login/refresh.
//   connect(token: string | null): void {
//     // Se já houver uma conexão, feche-a primeiro para evitar múltiplas conexões
//     if (this.eventSource) {
//       this.disconnect();
//     }

//     if (!token) {
//       console.error("SSE Connection: Cannot connect without an access token.");
//       return;
//     }

//     const sseUrl = `${environment.apiUrl}/sse/subscribe?token=${token}`;
//     this.eventSource = new EventSource(sseUrl);
//     console.log("SSE: Connecting to", sseUrl);

//     // Listener para o evento "notification" que seu backend envia
//     this.eventSource.addEventListener("notification", (event: MessageEvent) => {
//       this.ngZone.run(() => {
//         try {
//           const data = JSON.parse(event.data);
//           console.log("SSE: Received 'notification' event ->", data);
//           this.notificationSubject.next(data);
//         } catch (error) {
//           console.error("SSE: Error parsing 'notification' event.", error);
//         }
//       });
//     });

//     // Listener para o evento de conexão bem-sucedida (opcional, mas bom para debug)
//     this.eventSource.addEventListener(
//       "offer_status_update",
//       (event: MessageEvent) => {
//         this.ngZone.run(() => {
//           try {
//             const data = JSON.parse(event.data);
//             console.log("SSE: Received 'offer_status_update' event ->", data);
//             this.offerStatusSubject.next(data);
//           } catch (error) {
//             console.error(
//               "SSE: Error parsing 'offer_status_update' event.",
//               error
//             );
//           }
//         });
//       }
//     );

//     // Listener para erros na conexão
//     this.eventSource.onerror = (error) => {
//       console.error("SSE: Connection error.", error);
//       // O EventSource tentará se reconectar automaticamente.
//       // Se a reconexão falhar repetidamente (ex: token expirou e não consegue renovar),
//       // o erro será persistente.
//       // Podemos fechar a conexão se o estado for 'CLOSED'
//       if (this.eventSource?.readyState === EventSource.CLOSED) {
//         console.warn(
//           "SSE: Connection was closed by the server. Disconnecting."
//         );
//         this.disconnect();
//       }
//     };
//   }

//   // Desconecta. Deve ser chamado pelo AuthService no logout.
//   disconnect(): void {
//     if (this.eventSource) {
//       this.eventSource.close();
//       this.eventSource = null;
//       console.log("SSE: Disconnected.");
//     }
//   }
// }

import { Injectable, NgZone, inject } from "@angular/core";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { Subject, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import SockJS from "sockjs-client";

@Injectable({ providedIn: "root" })
export class WsService {
  private ngZone = inject(NgZone);
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];

  private notificationSubject = new Subject<any>();
  public notificationEvents$: Observable<any> =
    this.notificationSubject.asObservable();

  private offerStatusSubject = new Subject<any>();
  public offerStatusEvents$: Observable<any> =
    this.offerStatusSubject.asObservable();

  connect() {
    const token = localStorage.getItem("pgdo_access_token");
    if (!token) {
      console.error("WS Service: Token não encontrado.");
      return;
    }
    if (this.client?.connected) { 
      return;
    }

    this.client = new Client({
      webSocketFactory: () => {
        // --- CORREÇÃO ---
        // 1. A URL NÃO DEVE conter o token.
        //    Use a wsUrl do ambiente e converta para http.
        const sockjsUrl = environment.wsUrl
          .replace("ws://", "http://")
          .replace("wss://", "https://");

        console.log(`[VALIDAÇÃO] URL para SockJS (SEM token): ${sockjsUrl}`);
        return new SockJS(sockjsUrl);
      },

      // 2. O token DEVE ser enviado no cabeçalho.
      //    O seu interceptor no backend (`JwtChannelInterceptor`) vai ler este cabeçalho.
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      debug: (str) => {
        if (!str.includes("PING") && !str.includes("PONG")) {
          console.log("STOMP Debug:", new Date(), str);
        }
      },
      reconnectDelay: 5000,
    });

    this.client.onConnect = (frame) => {
      console.log(
        "✅ ✅ ✅ WS Service: STOMP CONECTADO COM SUCESSO! ✅ ✅ ✅",
        frame
      );
      this.ngZone.run(() => {
        const sub1 = this.client!.subscribe(
          "/user/topic/notifications",
          (message: IMessage) => {
            this.notificationSubject.next(this.parseMessage(message.body));
          }
        );
        const sub2 = this.client!.subscribe(
          "/topic/offers.request",
          (message: IMessage) => {
            this.offerStatusSubject.next(this.parseMessage(message.body));
          }
        );
        this.subscriptions.push(sub1, sub2);
      });
    };

    this.client.onStompError = (frame) => {
      console.error(
        "❌ WS Service: Erro no protocolo STOMP.",
        frame.headers["message"],
        frame.body
      );
    };

    this.client.onWebSocketError = (event) => {
      console.error("❌ WS Service: Erro na conexão WebSocket.", event);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions = [];
      console.log("WS Service: Desconectado.");
    }
  }

  private parseMessage(body: string): any {
    try {
      return JSON.parse(body);
    } catch (e) {
      return body;
    }
  }
}
