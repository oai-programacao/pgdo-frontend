import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { AuthService } from "./core/auth/auth.service";
import { AudioUnlockService } from "./core/audio/audio-unlock.service";
import { WsService, ConnectionStatus } from "./core/sse/sse.service";
import { NotificationRelayService } from "./core/sse/notification-relay.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, CommonModule, ToastModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [MessageService],
})
export class AppComponent implements OnInit, OnDestroy {
  // Injeção de dependências
  private wsService = inject(WsService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private audioUnlockService = inject(AudioUnlockService);
  private notificationRelayService = inject(NotificationRelayService);
  private destroyRef = inject(DestroyRef);

  // Estado da conexão WebSocket
  connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectTimer?: any;

  @HostListener("window:click")
  onFirstClick() {
    this.audioUnlockService.unlockAudio();
  }

  @HostListener("window:beforeunload")
  onBeforeUnload() {
    // Limpa recursos antes de sair da página
    this.cleanup();
  }

  ngOnInit(): void {
    this.initializeWebSocketConnection();
    this.setupNotificationListeners();
    this.setupConnectionStatusMonitoring();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Inicializa a conexão WebSocket se o usuário estiver autenticado
   */
  private initializeWebSocketConnection(): void {
    if (this.authService.isAuthenticated()) {
      console.log("AppComponent: Usuário autenticado, iniciando conexão WebSocket...");
      this.wsService.connect();
    } else {
      console.log(" AppComponent: Usuário não autenticado, WebSocket não será conectado.");
    }

    // Monitora mudanças no status de autenticação
    this.authService.isAuthenticated$?.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(isAuth => {
      if (isAuth && !this.wsService.isConnected()) {
        console.log("AppComponent: Usuário autenticado, conectando WebSocket...");
        this.wsService.connect();
      } else if (!isAuth && this.wsService.isConnected()) {
        console.log("AppComponent: Usuário desautenticado, desconectando WebSocket...");
        this.wsService.disconnect();
      }
    });
  }

  /**
   * Configura os listeners para notificações WebSocket
   */
  private setupNotificationListeners(): void {
    // Listener para notificações pessoais
    this.wsService.notificationEvents$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(event => event != null)
    ).subscribe((event: any) => {
      console.log("AppComponent: Notificação pessoal recebida:", event);
      this.handleNotificationEvent(event);
    });

    // Listener para eventos globais de ofertas
    this.wsService.offerStatusEvents$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(event => event != null)
    ).subscribe((event: any) => {
      console.log(" AppComponent: Evento global de ofertas recebido:", event);
      this.handleOfferStatusEvent(event);
    });
  }

  /**
   * Monitora o status da conexão WebSocket
   */
  private setupConnectionStatusMonitoring(): void {
    this.wsService.connectionStatus$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((status: ConnectionStatus) => {
      this.connectionStatus = status;
      this.handleConnectionStatusChange(status);
    });
  }

  /**
   * Processa eventos de notificação pessoal
   */
  private handleNotificationEvent(event: any): void {
    // Exibe toast para o usuário
    this.showToastNotification(event);
    
    // Dispara atualização nos componentes relevantes
    this.notificationRelayService.triggerRefresh('websocket-notification');
    
    // Emite notificação específica baseada no tipo
    if (event.eventName) {
      this.notificationRelayService.emitNotification(event.eventName, event);
    }
  }

  /**
   * Processa eventos globais de status de ofertas
   */
  private handleOfferStatusEvent(event: any): void {
    console.log("🔄 AppComponent: Processando evento de status de ofertas:", event);
    
    // Para eventos globais, pode não mostrar toast (evitar spam)
    // Mas ainda dispara atualizações nos componentes
    this.notificationRelayService.triggerOffersRefresh();
    
    // Se for um evento importante, mostra notificação
    if (this.isImportantOfferEvent(event)) {
      this.showToastNotification(event);
    }
  }

  /**
   * Determina se um evento de oferta é importante o suficiente para mostrar toast
   */
  private isImportantOfferEvent(event: any): boolean {
    const importantEvents = [
      'OFFER_REQUESTED',
      'OFFER_ACCEPTED', 
      'OFFER_REJECTED',
      'URGENT_OFFER_CREATED'
    ];
    return importantEvents.includes(event.eventName);
  }

  /**
   * Gerencia mudanças no status da conexão
   */
  private handleConnectionStatusChange(status: ConnectionStatus): void {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        console.log("✅ AppComponent: WebSocket conectado com sucesso!");
        this.clearReconnectTimer();
        this.messageService.add({
          severity: "success",
          summary: "Conexão Estabelecida",
          detail: "Notificações em tempo real ativadas.",
          life: 3000
        });
        break;

      case ConnectionStatus.DISCONNECTED:
        console.log("🔌 AppComponent: WebSocket desconectado.");
        break;

      case ConnectionStatus.CONNECTING:
        console.log("AppComponent: Conectando ao WebSocket...");
        break;

      case ConnectionStatus.RECONNECTING:
        console.log("AppComponent: Tentando reconectar...");
        this.messageService.add({
          severity: "warn",
          summary: "Reconectando",
          detail: "Tentando restabelecer conexão...",
          life: 3000
        });
        break;

      case ConnectionStatus.ERROR:
        console.error("AppComponent: Erro na conexão WebSocket.");
        this.messageService.add({
          severity: "error",
          summary: "Erro de Conexão",
          detail: "Falha ao conectar com o servidor. Tentando novamente...",
          life: 5000
        });
        this.scheduleReconnect();
        break;
    }
  }

  /**
   * Agenda uma tentativa de reconexão
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      if (this.authService.isAuthenticated() && !this.wsService.isConnected()) {
        console.log("🔄 AppComponent: Tentando reconectar WebSocket...");
        this.wsService.forceReconnect();
      }
    }, 10000); // Tenta reconectar após 10 segundos
  }

  /**
   * Limpa o timer de reconexão
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  /**
   * Exibe notificação toast baseada no evento recebido
   */
  private showToastNotification(payload: any): void {
    let summary = "Nova Notificação";
    let detail = "Ocorreu uma atualização.";
    let severity: "success" | "info" | "warn" | "error" = "info";
    let playSound = false;

    // Mapeia eventos para notificações específicas
    switch (payload.eventName) {
      case "OFFER_REQUESTED":
        summary = "Nova Solicitação de Oferta!";
        detail = payload.message || "Um técnico solicitou uma nova oferta.";
        severity = "info";
        playSound = true;
        break;

      case "OFFER_ACCEPTED":
        summary = "Oferta Aceita!";
        detail = payload.message || "Uma solicitação de oferta foi aceita.";
        severity = "success";
        playSound = true;
        break;

      case "OFFER_REJECTED":
        summary = "Oferta Rejeitada";
        detail = payload.message || "Uma solicitação de oferta foi rejeitada.";
        severity = "warn";
        break;

      case "OFFER_CREATED":
        summary = "Nova Oferta Disponível!";
        detail = payload.message || "Uma nova oferta foi criada no sistema.";
        severity = "success";
        break;

      case "OFFER_DELETED":
        summary = "Oferta Removida";
        detail = payload.message || "Uma oferta foi removida do sistema.";
        severity = "warn";
        break;

      case "SYSTEM_MAINTENANCE":
        summary = "Manutenção do Sistema";
        detail = payload.message || "O sistema entrará em manutenção em breve.";
        severity = "warn";
        playSound = true;
        break;

      default:
        summary = payload.title || "Notificação";
        detail = payload.message || payload.detail || "Ocorreu uma atualização no sistema.";
        severity = payload.severity || "info";
        break;
    }

    // Exibe o toast
    this.messageService.add({ 
      severity, 
      summary, 
      detail, 
      life: 7000 
    });

    // Toca som se necessário
    if (playSound) {
      this.playNotificationSound();
    }
  }

  /**
   * Toca som de notificação
   */
  private playNotificationSound(): void {
    if (this.audioUnlockService.canPlayAudio()) {
      const audio = new Audio("/livechat-129007.mp3");
      audio.volume = 0.5; // Volume moderado
      audio.play().catch((error) => {
        console.error("❌ AppComponent: Falha ao tocar áudio de notificação:", error);
      });
    }
  }

  /**
   * Força reconexão manual (pode ser chamado por um botão na UI)
   */
  public forceReconnect(): void {
    if (this.authService.isAuthenticated()) {
      this.wsService.forceReconnect();
    }
  }

  /**
   * Limpa recursos
   */
  private cleanup(): void {
    this.clearReconnectTimer();
    this.wsService.disconnect();
  }
}