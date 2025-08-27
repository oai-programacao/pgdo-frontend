import { CommonModule, DatePipe } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { TableModule } from "primeng/table";
import { OffersService } from "../../services/offers.service";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdminOffersService } from "../../services/admin-offers.service";
import { DatePickerModule } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { BadgeModule } from "primeng/badge";
import { OverlayBadgeModule } from "primeng/overlaybadge";
import { Subscription } from "rxjs";
import { City, TypeOfOs, Period, OfferStatus } from "../../../../interfaces/enums.model";
import { CreateManyAvailableOffersDto } from "../../../../interfaces/offers.model";
import { TooltipModule } from "primeng/tooltip";
import { AuthService } from "../../../../core/auth/auth.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { WsService } from "../../../../core/sse/sse.service";
import { NotificationRelayService } from "../../../../core/sse/notification-relay.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter, debounceTime } from "rxjs/operators";
import { OfferStateService } from "../../../../core/sse/offer-state.service";

@Component({
  selector: "app-offers-list",
  imports: [
    CommonModule, TableModule, ButtonModule, SelectModule, FormsModule,
    ReactiveFormsModule, DatePickerModule, InputNumberModule, DialogModule,
    ToastModule, BadgeModule, OverlayBadgeModule, TooltipModule,
  ],
  templateUrl: "./offers-list.component.html",
  styleUrl: "./offers-list.component.scss",
  providers: [ConfirmationService, DatePipe],
})
export class OffersListComponent implements OnInit, OnDestroy {
  // --- INJEÇÕES DE DEPENDÊNCIA ---
  private offersService = inject(OffersService);
  private adminOffersService = inject(AdminOffersService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private wsService = inject(WsService);
  private notificationRelayService = inject(NotificationRelayService);
  private offerStateService = inject(OfferStateService);
  // --- INSCRIÇÕES ---
  private subscriptions: Subscription[] = [];

  // --- PROPRIEDADES DO COMPONENTE ---
  cities = [
    { label: "Todas as Cidades", value: null },
    { label: "Assis", value: City.ASSIS },
    { label: "Cândido Mota", value: City.CANDIDO_MOTA },
    { label: "Palmital", value: City.PALMITAL },
    { label: "Echaporã", value: City.ECHAPORA },
    { label: "Ibirarema", value: City.IBIRAREMA },
    { label: "Oscar Bressane", value: City.OSCAR_BRESSANE },
  ];

  typesOfOs = [
    { label: "Todos os Tipos de OS", value: null },
    { label: "Instalação", value: TypeOfOs.INSTALLATION },
    { label: "Mudança de Endereço", value: TypeOfOs.CHANGE_OF_ADDRESS },
    { label: "Visita Técnica", value: TypeOfOs.TECHNICAL_VISIT },
    { label: "Manutenção", value: TypeOfOs.MAINTENANCE },
    { label: "Retirada de Kit", value: TypeOfOs.KIT_REMOVAL },
    { label: "Mudança de Tecnologia", value: TypeOfOs.CHANGE_OF_TECHNOLOGY },
    { label: "Viabilidade Técnica", value: TypeOfOs.TECHNICAL_VIABILITY },
    { label: "Projetos", value: TypeOfOs.PROJECTS },
    { label: "Interno", value: TypeOfOs.INTERNAL },
  ];

  periods = [
    { label: "Todos os Períodos", value: null },
    { label: "Manhã", value: "MORNING" },
    { label: "Tarde", value: "AFTERNOON" },
    { label: "Noite", value: "NIGHT" },
  ];

  selectedCity: City | null = null;
  selectedTypeOfOs: TypeOfOs | null = null;
  selectedPeriod: Period | null = null;
  displayCreateDialog = false;
  createOffersForm!: FormGroup;
  isSubmitting = false;
  displayRequestedOffersDialog = false;
  displayDeleteDialog = false;
  quantityToDelete = 1;
  offerToDelete?: any;
  offers: any[] = [];
  requestedOffers: any[] = [];
  isLoading = false;
  lastUpdateTime?: Date;

  ngOnInit(): void {
    this.initializeComponent();
    this.setupNotificationListeners();
    this.initCreateOfferForm();
  }

  ngOnDestroy(): void {
    // Limpa todas as inscrições
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Inicializa o componente carregando dados iniciais
   */
  private initializeComponent(): void {
    this.loadOffers();
    this.loadRequestedOffers();
    this.lastUpdateTime = new Date();
  }

  /**
   * Configura listeners para notificações WebSocket e atualizações
   */
  private setupNotificationListeners(): void {
    // Listener para atualizações gerais
    const refreshSub = this.notificationRelayService.refreshRequired$.pipe(
      debounceTime(500) // Evita múltiplas atualizações muito próximas
    ).subscribe((source: string) => {
      console.log(`🔄 OffersListComponent: Atualização solicitada (fonte: ${source})`);
      this.refreshData();
    });

    // Listener para notificações específicas
    const notificationSub = this.notificationRelayService.notifications$.pipe(
      filter(notification => this.shouldHandleNotification(notification.type))
    ).subscribe(notification => {
      console.log(`📢 OffersListComponent: Notificação específica recebida:`, notification);
      this.handleSpecificNotification(notification);
    });

    // Listener direto para eventos WebSocket de ofertas
    const wsOffersSub = this.wsService.offerStatusEvents$.pipe(
      filter(event => event != null)
    ).subscribe(event => {
      console.log(`🌐 OffersListComponent: Evento WebSocket de ofertas:`, event);
      this.handleWebSocketOfferEvent(event);
    });

    this.subscriptions.push(refreshSub, notificationSub, wsOffersSub);
  }

  /**
   * Determina se deve processar uma notificação específica
   */
  private shouldHandleNotification(type: string): boolean {
    const relevantTypes = [
      'OFFERS_UPDATED',
      'REQUESTED_OFFERS_UPDATED',
      'OFFER_REQUESTED',
      'OFFER_ACCEPTED',
      'OFFER_REJECTED',
      'OFFER_CREATED',
      'OFFER_DELETED'
    ];
    return relevantTypes.includes(type);
  }

  /**
   * Processa notificações específicas
   */
  private handleSpecificNotification(notification: {type: string, data: any}): void {
    switch (notification.type) {
      case 'OFFERS_UPDATED':
        this.loadOffers();
        break;
      case 'REQUESTED_OFFERS_UPDATED':
        this.loadRequestedOffers();
        break;
      case 'OFFER_REQUESTED':
        this.loadRequestedOffers();
        this.showLocalNotification('Nova solicitação de oferta recebida!', 'info');
        break;
      case 'OFFER_ACCEPTED':
      case 'OFFER_REJECTED':
        this.loadRequestedOffers();
        this.loadOffers();
        break;
      case 'OFFER_CREATED':
      case 'OFFER_DELETED':
        this.loadOffers();
        break;
    }
  }

  /**
   * Processa eventos WebSocket específicos de ofertas
   */
  private handleWebSocketOfferEvent(event: any): void {
    // Atualiza dados baseado no tipo de evento
    if (event.eventName === 'OFFER_REQUESTED') {
      this.loadRequestedOffers();
    } else if (['OFFER_ACCEPTED', 'OFFER_REJECTED', 'OFFER_CREATED', 'OFFER_DELETED'].includes(event.eventName)) {
      this.loadOffers();
      this.loadRequestedOffers();
    }
  }

  /**
   * Atualiza todos os dados
   */
  private refreshData(): void {
    this.loadOffers();
    this.loadRequestedOffers();
    this.lastUpdateTime = new Date();
  }

  /**
   * Exibe notificação local no componente
   */
  private showLocalNotification(message: string, severity: 'success' | 'info' | 'warn' | 'error' = 'info'): void {
    this.messageService.add({
      severity,
      summary: 'Atualização',
      detail: message,
      life: 4000
    });
  }

  /**
   * Inicializa o formulário de criação de ofertas
   */
  private initCreateOfferForm(): void {
    this.createOffersForm = this.fb.group({
      typeOfOs: [null, Validators.required],
      city: [null, Validators.required],
      period: [null, Validators.required],
      date: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  /**
   * Verifica se o usuário é administrador
   */
  isAdmin(): boolean {
    return (
      this.authService.isAuthenticated() &&
      Array.isArray(this.authService.currentUserSubject.value?.roles) &&
      this.authService.currentUserSubject.value?.roles.includes("ROLE_ADMIN")
    );
  }

  /**
   * Carrega ofertas com tratamento de erro melhorado
   */
  loadOffers(): void {
    this.isLoading = true;
    this.offersService.getSummaryOffers(
        this.selectedCity === null ? undefined : this.selectedCity,
        this.selectedTypeOfOs === null ? undefined : this.selectedTypeOfOs,
        this.selectedPeriod === null ? undefined : this.selectedPeriod
      ).subscribe({
      next: (offers) => {
        this.offers = offers; // Mantém para a tabela local
        this.isLoading = false;
        this.offerStateService.updateAvailableOffersCount(offers.length); // ✅ ATUALIZA ESTADO GLOBAL
        console.log(`✅ OffersListComponent: ${offers.length} ofertas carregadas.`);
      },
        error: (error) => {
          console.error("❌ OffersListComponent: Erro ao carregar ofertas:", error);
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao carregar ofertas. Tente novamente.',
            life: 5000
          });
        },
      });
  }

  /**
   * Carrega ofertas solicitadas com tratamento de erro melhorado
   */
   private loadRequestedOffers(): void {
    this.offersService.getAllOffers(undefined, undefined, undefined, OfferStatus.PENDING).subscribe({
      next: (offers) => {
        this.requestedOffers = offers; // Mantém para a tabela local
        this.offerStateService.updateRequestedOffersCount(offers.length); // ✅ ATUALIZA ESTADO GLOBAL
        console.log(`✅ OffersListComponent: ${offers.length} ofertas solicitadas carregadas.`);
      },
        error: (error) => {
          console.error("❌ OffersListComponent: Erro ao carregar ofertas solicitadas:", error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao carregar ofertas solicitadas.',
            life: 5000
          });
        },
      });
  }

  /**
   * Manipula mudanças nos filtros
   */
  onFilterChange(): void {
    this.loadOffers();
  }

  /**
   * Abre diálogo de exclusão
   */
  openDeleteDialog(offer: any): void {
    this.offerToDelete = offer;
    this.quantityToDelete = 1;
    this.displayDeleteDialog = true;
  }

  /**
   * Cancela exclusão
   */
  cancelDelete(): void {
    this.displayDeleteDialog = false;
    this.offerToDelete = undefined;
    this.quantityToDelete = 1;
  }

  /**
   * Confirma exclusão com feedback melhorado
   */
  confirmDelete(): void {
    if (!this.offerToDelete || this.quantityToDelete <= 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Quantidade para deletar deve ser maior que zero.",
      });
      return;
    }

    const offer = this.offerToDelete;
    const dateParts = offer.date.split("/");
    const formattedDateForApi = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    this.adminOffersService
      .deleteByCriteria(
        this.quantityToDelete,
        offer.typeOfOs,
        offer.city,
        offer.period,
        formattedDateForApi
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: `${this.quantityToDelete} oferta(s) deletada(s).`,
          });
          this.cancelDelete();
          this.loadOffers();
          
          // Notifica outros componentes sobre a exclusão
          this.notificationRelayService.emitNotification('OFFER_DELETED', {
            quantity: this.quantityToDelete,
            offer: offer
          });
        },
        error: (err) => {
          console.error("❌ OffersListComponent: Erro ao deletar ofertas:", err);
          const detail = err.error?.detail || err.message || "Falha ao deletar ofertas.";
          this.messageService.add({
            severity: "error",
            summary: "Erro na Exclusão",
            detail,
          });
        },
      });
  }

  /**
   * Aceita oferta com feedback melhorado
   */
  acceptOffer(offerId: string): void {
    this.adminOffersService.acceptOffer(offerId).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Oferta aceita com sucesso!",
          life: 4000,
        });
        this.loadRequestedOffers();
        this.loadOffers();
        
        // Notifica outros componentes
        this.notificationRelayService.emitNotification('OFFER_ACCEPTED', { offerId });
      },
      error: (err) => {
        console.error("❌ OffersListComponent: Erro ao aceitar oferta:", err);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao aceitar oferta.",
          life: 4000,
        });
      },
    });
  }

  /**
   * Rejeita oferta com feedback melhorado
   */
  rejectOffer(offerId: string): void {
    this.adminOffersService.rejectOffer(offerId).subscribe({
      next: () => {
        this.messageService.add({
          severity: "info",
          summary: "Sucesso",
          detail: "Oferta rejeitada com sucesso!",
        });
        this.loadRequestedOffers();
        
        // Notifica outros componentes
        this.notificationRelayService.emitNotification('OFFER_REJECTED', { offerId });
      },
      error: (err) => {
        console.error("❌ OffersListComponent: Erro ao rejeitar oferta:", err);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao rejeitar oferta.",
        });
      },
    });
  }

  /**
   * Exibe diálogo de criação
   */
  showCreateDialog(): void {
    this.createOffersForm.reset({ quantity: 1 });
    this.displayCreateDialog = true;
  }

  /**
   * Cria múltiplas ofertas com feedback melhorado
   */
  createManyOffers(): void {
    if (this.createOffersForm.invalid) {
      this.createOffersForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    this.isSubmitting = true;
    const dto: CreateManyAvailableOffersDto = this.createOffersForm.value;

    this.adminOffersService.createAvailableOffer(dto).subscribe({
      next: (createdOffers: any) => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `${createdOffers.length} ofertas foram criadas!`,
        });
        this.isSubmitting = false;
        this.displayCreateDialog = false;
        this.loadOffers();
        
        // Notifica outros componentes sobre a criação
        this.notificationRelayService.emitNotification('OFFER_CREATED', {
          count: createdOffers.length,
          offers: createdOffers
        });
      },
      error: (err) => {
        console.error("❌ OffersListComponent: Erro ao criar ofertas:", err);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao criar ofertas.",
        });
        this.isSubmitting = false;
      },
    });
  }

  /**
   * Força atualização manual dos dados
   */
  forceRefresh(): void {
    console.log("🔄 OffersListComponent: Atualização manual solicitada.");
    this.refreshData();
    this.messageService.add({
      severity: 'info',
      summary: 'Atualizado',
      detail: 'Dados atualizados manualmente.',
      life: 3000
    });
  }

  // --- MÉTODOS DE FORMATAÇÃO (MANTIDOS INALTERADOS) ---
  get formattedPeriod() {
    return (period: Period | null) => {
      if (!period) return "Todos os Períodos";
      switch (period) {
        case "MORNING": return "Manhã";
        case "AFTERNOON": return "Tarde";
        case "NIGHT": return "Noite";
        default: return period;
      }
    };
  }

  get formattedTypeOfOs() {
    return (typeOfOs: TypeOfOs | null) => {
      if (!typeOfOs) return "Todos os Tipos de OS";
      switch (typeOfOs) {
        case TypeOfOs.INSTALLATION: return "Instalação";
        case TypeOfOs.CHANGE_OF_ADDRESS: return "Mudança de Endereço";
        case TypeOfOs.TECHNICAL_VISIT: return "Visita Técnica";
        case TypeOfOs.MAINTENANCE: return "Manutenção";
        case TypeOfOs.KIT_REMOVAL: return "Retirada de Kit";
        case TypeOfOs.CHANGE_OF_TECHNOLOGY: return "Mudança de Tecnologia";
        case TypeOfOs.TECHNICAL_VIABILITY: return "Viabilidade Técnica";
        case TypeOfOs.PROJECTS: return "Projetos";
        case TypeOfOs.INTERNAL: return "Interno";
        default: return typeOfOs;
      }
    };
  }

  get formattedCity() {
    return (city: City | null) => {
      if (!city) return "Todas as Cidades";
      switch (city) {
        case City.ASSIS: return "Assis";
        case City.CANDIDO_MOTA: return "Cândido Mota";
        case City.PALMITAL: return "Palmital";
        case City.ECHAPORA: return "Echaporã";
        case City.IBIRAREMA: return "Ibirarema";
        case City.OSCAR_BRESSANE: return "Oscar Bressane";
        default: return city;
      }
    };
  }
}
