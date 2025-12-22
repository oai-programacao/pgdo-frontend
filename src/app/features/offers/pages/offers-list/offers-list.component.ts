import { CommonModule, DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { TableModule } from "primeng/table";
import { OffersService } from "../../services/offers.service";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AdminOffersService } from "../../services/admin-offers.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DatePickerModule } from "primeng/datepicker";
import { InputNumberModule } from "primeng/inputnumber";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { BadgeModule } from "primeng/badge";
import { OverlayBadgeModule } from "primeng/overlaybadge";
import { interval, Subscription } from "rxjs";
import {
  City,
  TypeOfOs,
  Period,
  OfferStatus,
} from "../../../../interfaces/enums.model";
import { CreateManyAvailableOffersDto } from "../../../../interfaces/offers.model";
import { TooltipModule } from "primeng/tooltip";
import { AuthService } from "../../../../core/auth/auth.service";
import { WsService } from "../../../../core/websocket/ws.service";
import { TagModule } from 'primeng/tag';


@Component({
  selector: "app-offers-list",
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    BadgeModule,
    OverlayBadgeModule,
    TooltipModule,
    TagModule
  ],
  templateUrl: "./offers-list.component.html",
  styleUrl: "./offers-list.component.scss",
  providers: [MessageService, ConfirmationService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush, // Otimização de performance
})
export class OffersListComponent implements OnInit, OnDestroy {
  private offersService = inject(OffersService);
  private adminOffersService = inject(AdminOffersService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private cdRef = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private wsService = inject(WsService);

  private subscriptions = new Subscription();
  private pollingSubscription?: Subscription;
  loadingOffers: Record<string, boolean> = {};

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
  private lastResquestedOffersCount = 0;
  private isInitialLoad = true;

  offers: any[] = [];
  requestedOffers: any[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadOffers();
    this.loadRequestedOffers();
    this.initCreateOfferForm();

    this.subscriptions.add(
      this.adminOffersService.refreshOffers$.subscribe(() => {
        console.log(
          "[OffersListComponent] Evento de refresh recebido. Recarregando ofertas..."
        );
        this.loadOffers();
        this.loadRequestedOffers();
        this.cdRef.detectChanges();
      })
    );
    this.pollingSubscription = interval(1500).subscribe(() => {
      this.loadRequestedOffers();
      this.loadOffers();
    });
  }

  ngOnDestroy(): void {
    console.log(
      "[OffersListComponent] ngOnDestroy: Limpando subscriptions específicas do componente."
    );
    this.subscriptions.unsubscribe();
  }

  notifyAllPendingRequests(): void {
    this.offersService
      .getAllOffers(undefined, undefined, undefined, OfferStatus.PENDING)
      .subscribe({
        next: (offers) => {
          if (!offers || offers.length === 0) {
            this.messageService.add({
              severity: "info",
              summary: "Solicitações",
              detail: "Nenhuma solicitação pendente encontrada.",
              life: 4000,
            });
            return;
          }
          offers.forEach((offer) => {
            this.messageService.add({
              severity: "warn",
              summary: "Solicitação Pendente",
              detail: `${this.formattedTypeOfOs(
                offer.typeOfOs
              )} em ${this.formattedCity(
                offer.city as City
              )} (${this.formattedPeriod(offer.period)}) - ${offer.date}`,
              life: 6000,
            });
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Falha ao buscar solicitações pendentes.",
            life: 5000,
          });
          console.error("Erro ao buscar solicitações pendentes:", error);
        },
      });
  }

  private initCreateOfferForm() {
    this.createOffersForm = this.fb.group({
      typeOfOs: [null, Validators.required],
      city: [null, Validators.required],
      period: [null, Validators.required],
      date: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserSubject.value;
    return (
      this.authService.isAuthenticated() &&
      Array.isArray(user?.roles) &&
      user.roles.includes("ROLE_ADMIN")
    );
  }

  loadOffers() {
    this.isLoading = true;
    this.offersService
      .getSummaryOffers(
        this.selectedCity === null ? undefined : this.selectedCity,
        this.selectedTypeOfOs === null ? undefined : this.selectedTypeOfOs,
        this.selectedPeriod === null ? undefined : this.selectedPeriod
      )
      .subscribe({
        next: (offers) => {
          this.offers = offers;
          this.isLoading = false;
          this.cdRef.detectChanges(); // Força a detecção de mudanças
        },
        error: (error) => {
          console.error("Erro ao carregar ofertas:", error);
          this.isLoading = false;
          this.cdRef.detectChanges(); // Força a detecção de mudanças
        },
      });
  }

  private loadRequestedOffers() {
    this.offersService
      .getAllOffers(undefined, undefined, undefined, OfferStatus.PENDING)
      .subscribe({
        next: (offers) => {
          if (
            offers.length > this.lastResquestedOffersCount &&
            !this.isInitialLoad &&
            this.isAdmin()
          ) {
            this.messageService.add({
              severity: "info",
              summary: "Nova Solicitação",
              detail: "Uma nova oferta foi criada!",
              life: 3000,
            });
            this.playNotificationSound();
          }
          this.requestedOffers = offers;
          this.lastResquestedOffersCount = offers.length;
          this.isInitialLoad = false;
          this.cdRef.detectChanges(); // Força a detecção de mudanças
        },
        error: (error) => {
          console.error("Erro ao carregar ofertas solicitadas:", error);
          this.cdRef.detectChanges(); // Força a detecção de mudanças
        },
      });
  }

  onFilterChange() {
    this.loadOffers();
  }

  openDeleteDialog(offer: any): void {
    this.offerToDelete = offer;
    this.quantityToDelete = 1;
    this.displayDeleteDialog = true;
  }

  cancelDelete(): void {
    this.displayDeleteDialog = false;
    this.offerToDelete = undefined;
    this.quantityToDelete = 1;
  }

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
        },
        error: (err) => {
          console.error("Erro ao deletar ofertas:", err);
          const detail =
            err.error?.detail || err.message || "Falha ao deletar ofertas.";
          this.messageService.add({
            severity: "error",
            summary: "Erro na Exclusão",
            detail,
          });
        },
      });
  }

  acceptOffer(offerId: string) {
    if (this.loadingOffers[offerId]) {
      return;
    }

    this.loadingOffers[offerId] = true;

    this.wsService.acceptOffer(offerId);

    this.messageService.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Oferta aceita com sucesso!",
      life: 4000,
    });

    this.playNotificationSound();
    this.loadRequestedOffers();
  }

  rejectOffer(offerId: string) {
    if (this.loadingOffers[offerId]) {
      return;
    }

    this.loadingOffers[offerId] = true;

    this.wsService.rejectOffer(offerId);

    this.messageService.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Oferta rejeitada com sucesso!",
      life: 4000,
    });

    this.loadRequestedOffers();
  }

  playNotificationSound() {
    const audio = new Audio("/closeoff.mp3");
    audio
      .play()
      .catch((e) => console.error("Erro ao reproduzir notificação sonora", e));
  }

  showCreateDialog(): void {
    this.createOffersForm.reset({ quantity: 1 });
    this.displayCreateDialog = true;
  }

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
    const formValue = this.createOffersForm.value;
    const dto: CreateManyAvailableOffersDto = formValue;

    this.adminOffersService.createAvailableOffer(dto).subscribe({
      next: (createdOffers: any) => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `${
            Array.isArray(createdOffers) ? createdOffers.length : "Ofertas"
          } ofertas foram criadas!`,
        });
        this.isSubmitting = false;
        this.displayCreateDialog = false;
        this.loadOffers();
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao criar ofertas.",
        });
        console.error(err);
        this.isSubmitting = false;
      },
    });
  }

  // ✅ Métodos de formatação corrigidos (métodos normais, não getters)
  formattedPeriod(period: Period | null): string {
    if (!period) return "Todos os Períodos";
    const found = this.periods.find((p) => p.value === period);
    return found ? found.label : period;
  }

  formattedTypeOfOs(typeOfOs: TypeOfOs | null): string {
    if (!typeOfOs) return "Todos os Tipos de OS";
    const found = this.typesOfOs.find((t) => t.value === typeOfOs);
    return found ? found.label : typeOfOs;
  }

  formattedCity(city: City | null): string {
    if (!city) return "Todas as Cidades";
    const found = this.cities.find((c) => c.value === city);
    return found ? found.label : city;
  }
}
