import { ToastService } from "./../toast/toast.service";
import { Injectable, NgZone } from "@angular/core";
import { RxStompService } from "@stomp/ng2-stompjs";
import { Subject, Observable } from "rxjs";
import { wsStompConfig } from "./wsStompConfig";

@Injectable({ providedIn: "root" })
export class WsService {
  private notificationsSubject = new Subject<any>();
  public notifications$: Observable<any> =
    this.notificationsSubject.asObservable();

  private rxStompService = new RxStompService();
  private activated = false;

  constructor(private toastService: ToastService, private ngZone: NgZone) {}

  public initWebSocket(): void {
    if (this.activated) return;
    this.activated = true;

    // Pega o token JWT do localStorage
    const token = localStorage.getItem("pgdo_access_token");
    if (!token) {
      console.warn("Token não encontrado, WS não será inicializado");
      return;
    }

    // Decodifica o email do token (sub)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const email = payload.sub;

    console.log("Conectando WS para o usuário:", email);

    this.rxStompService.configure({
      ...wsStompConfig,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    this.rxStompService.activate();

    this.rxStompService.connected$.subscribe(() => console.log("WS conectado"));
    this.rxStompService.connectionState$.subscribe((state) =>
      console.log("Estado da conexão:", state)
    );

    // Subscribing ao destino específico do usuário
    this.rxStompService
      .watch(`/user/${email}/topic/notifications`)
      .subscribe((msg) => {
        console.log("Mensagem recebida:", msg.body);
        const payload = JSON.parse(msg.body);
        this.handleEvent(payload.eventName, payload.data);
      });
  }

  public disconnect(): void {
    if (!this.activated) return;
    this.rxStompService.deactivate();
    this.activated = false;
    console.log("WebSocket desconectado");
  }

  public sendOfferRequest(dto: any): void {
    this.rxStompService.publish({
      destination: "/app/offer.request",
      body: JSON.stringify(dto),
    });
  }

  acceptOffer(offerId: string) {
    this.rxStompService.publish({
      destination: "/app/offer.accept",
      body: JSON.stringify({ id: offerId }),
    });
  }

  rejectOffer(offerId: string) {
    this.rxStompService.publish({
      destination: "/app/offer.reject",
      body: JSON.stringify({ id: offerId }),
    });
  }

  private handleEvent(eventName: string, data: any): void {
    this.ngZone.run(() => {
      switch (eventName) {
        case "new_offer_request":
          this.playSound();
          this.toastService.show(
            `Nova oferta solicitada por ${data.responsible || data.sellerName || "Usuário"}`,
            "info"
          );
          break;

        case "offer_status_accept":
          this.playSoundAccept();
          this.toastService.show(
            `${data.message} por ${data.actionByName || "usuário"}`,
            "success"
          );
          break;

        case "offer_status_reject":
          this.playSoundReject();
          this.toastService.show(
            `${data.message} por ${data.actionByName || "usuário"}`,
            "error"
          );
          break;

        default:
          break;
      }

      // Dispara o observable para subscribers globais
      this.notificationsSubject.next({ eventName, data });
    });
  }

  private playSound(): void {
    const audio = new Audio("/chegouoff.mp3");
    audio.play();
  }

  private playSoundAccept(): void {
    const audio = new Audio("/env.mp3");
    audio.play();
  }

  private playSoundReject(): void {
    const audio = new Audio("/receb.wav");
    audio.play();
  }
}
