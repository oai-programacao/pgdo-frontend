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
import { Injectable, NgZone, inject, OnDestroy } from "@angular/core";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { Subject, Observable, BehaviorSubject, timer } from "rxjs";
import { environment } from "../../../environments/environment";
import SockJS from "sockjs-client";

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

@Injectable({ providedIn: "root" })
export class WsService implements OnDestroy {
  private ngZone = inject(NgZone);
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  private notificationSubject = new Subject<any>();
  private offerStatusSubject = new Subject<any>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>(ConnectionStatus.DISCONNECTED);

  public notificationEvents$: Observable<any> = this.notificationSubject.asObservable();
  public offerStatusEvents$: Observable<any> = this.offerStatusSubject.asObservable();
  public connectionStatus$: Observable<ConnectionStatus> = this.connectionStatusSubject.asObservable();

  connect(): void {
    const token = localStorage.getItem("pgdo_access_token");
    
    if (!token) {
      console.error("WS Service: Token de autenticação não encontrado.");
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      return;
    }

    if (this.client?.connected) {
      console.log("WS Service: Já conectado.");
      return;
    }

    this.connectionStatusSubject.next(ConnectionStatus.CONNECTING);
    console.log("WS Service: Iniciando conexão...");

    this.client = new Client({
      webSocketFactory: () => {
        let sockjsUrl = environment.wsUrl;
        
        if (sockjsUrl.startsWith('ws://')) {
          sockjsUrl = sockjsUrl.replace('ws://', 'http://');
        } else if (sockjsUrl.startsWith('wss://')) {
          sockjsUrl = sockjsUrl.replace('wss://', 'https://');
        }


        console.log(` WS Service: Conectando via SockJS em: ${sockjsUrl}`);
        return new SockJS(sockjsUrl);
      },

      connectHeaders: {
        Authorization: `Bearer ${token}`,
        
      },

      debug: (str) => {
        if (!str.includes("PING") && !str.includes("PONG")) {
          console.log("STOMP Debug:", new Date().toISOString(), str);
        }
      },
      
      reconnectDelay: this.reconnectInterval,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      this.ngZone.run(() => {
        console.log("WS Service: STOMP conectado com sucesso!", frame);
        this.connectionStatusSubject.next(ConnectionStatus.CONNECTED);
        this.reconnectAttempts = 0;
        this.setupSubscriptions();
      });
    };

    this.client.onStompError = (frame) => {
      this.ngZone.run(() => {
        console.error("WS Service: Erro STOMP:", frame.headers["message"], frame.body);
        this.connectionStatusSubject.next(ConnectionStatus.ERROR);
        this.handleReconnection();
      });
    };

    this.client.onWebSocketError = (event) => {
      this.ngZone.run(() => {
        console.error("WS Service: Erro WebSocket:", event);
        this.connectionStatusSubject.next(ConnectionStatus.ERROR);
        this.handleReconnection();
      });
    };

    this.client.onDisconnect = () => {
      this.ngZone.run(() => {
        console.log("WS Service: Desconectado.");
        this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
        this.clearSubscriptions();
      });
    };

    try {
      this.client.activate();
    } catch (error) {
      console.error("WS Service: Erro ao ativar cliente:", error);
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
    }
  }

  private setupSubscriptions(): void {
    if (!this.client?.connected) {
      console.error("WS Service: Cliente não conectado para configurar inscrições.");
      return;
    }

    try {
      const userNotificationSub = this.client.subscribe(
        "/user/topic/notifications",
        (message: IMessage) => {
          console.log("Notificação pessoal recebida:", message.body);
          const parsedMessage = this.parseMessage(message.body);
          this.notificationSubject.next(parsedMessage);
        }
      );

      const globalOffersSub = this.client.subscribe(
        "/topic/offers.request",
        (message: IMessage) => {
          console.log("Evento global de ofertas recebido:", message.body);
          const parsedMessage = this.parseMessage(message.body);
          this.offerStatusSubject.next(parsedMessage);
        }
      );

      const offersUpdateSub = this.client.subscribe(
        "/topic/offers.update",
        (message: IMessage) => {
          console.log(" Atualização de ofertas recebida:", message.body);
          const parsedMessage = this.parseMessage(message.body);
          this.notificationSubject.next(parsedMessage);
        }
      );

      this.subscriptions.push(userNotificationSub, globalOffersSub, offersUpdateSub);
      console.log(`WS Service: ${this.subscriptions.length} inscrições configuradas.`);

    } catch (error) {
      console.error("WS Service: Erro ao configurar inscrições:", error);
    }
  }

  private clearSubscriptions(): void {
    this.subscriptions.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error(" WS Service: Erro ao cancelar inscrição:", error);
      }
    });
    this.subscriptions = [];
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`WS Service: Máximo de tentativas de reconexão (${this.maxReconnectAttempts}) atingido.`);
      this.connectionStatusSubject.next(ConnectionStatus.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.connectionStatusSubject.next(ConnectionStatus.RECONNECTING);
    
    console.log(`WS Service: Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${this.reconnectInterval}ms...`);
    
    timer(this.reconnectInterval).subscribe(() => {
      if (this.client && !this.client.connected) {
        this.disconnect();
        this.connect();
      }
    });
  }

  disconnect(): void {
    if (this.client) {
      this.clearSubscriptions();
      this.client.deactivate();
      this.client = null;
      this.connectionStatusSubject.next(ConnectionStatus.DISCONNECTED);
      console.log("WS Service: Desconectado manualmente.");
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatusSubject.value;
  }

  forceReconnect(): void {
    console.log(" WS Service: Forçando reconexão...");
    this.reconnectAttempts = 0;
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }

  private parseMessage(body: string): any {
    try {
      return JSON.parse(body);
    } catch (error) {
      console.warn("⚠️ WS Service: Erro ao fazer parse da mensagem, retornando como string:", error);
      return { message: body, timestamp: new Date().toISOString() };
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
