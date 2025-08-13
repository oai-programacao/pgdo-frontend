import { CommonModule, DatePipe } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
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
import { SseService } from "../../../../core/sse/sse.service";
import { interval, Subscription } from "rxjs";
import {
  City,
  TypeOfOs,
  Period,
  OfferStatus,
} from "../../../../interfaces/enums.model";
import { CreateManyAvailableOffersDto } from "../../../../interfaces/offers.model";
import { TooltipModule } from "primeng/tooltip";

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
    SelectModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    BadgeModule,
    OverlayBadgeModule,
    TooltipModule,
  ],
  templateUrl: "./offers-list.component.html",
  styleUrl: "./offers-list.component.scss",
  providers: [MessageService, ConfirmationService, DatePipe],
})
export class OffersListComponent implements OnInit, OnDestroy {
  private offersService = inject(OffersService);
  private adminOffersService = inject(AdminOffersService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private sseService = inject(SseService);
  private datePipe = inject(DatePipe);

  // Propriedades para o SSE
  private sseSubscription?: Subscription; // Propriedade para guardar a inscrição
  private pollingSubscription?: Subscription;
  private lastOffersCount = 0;

  
  // Filtros
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

  // Propriedades para o formulário de criação
  displayCreateDialog = false;
  createOffersForm!: FormGroup;
  isSubmitting = false;

  // Propriedades para as ofertas solicitadas
  displayRequestedOffersDialog = false;

  // Propriedades para o Dialog de Exclusão
  displayDeleteDialog = false;
  quantityToDelete = 1;
  offerToDelete?: any;

  // Data
  offers: any[] = [];
  requestedOffers: any[] = [];
  isLoading = false;
  private lastOffersSnapshot: any[] = [];



  ngOnInit() {
    this.loadOffers();
    this.loadRequestedOffers();
    this.initCreateOfferForm();

    // Inscreve-se nos eventos de notificação do SseService
    this.subscribeToRealtimeUpdates();

    this.pollingSubscription = interval(5000).subscribe(() => {
      this.checkForNewOffers();
    });
  }

  ngOnDestroy(): void {
    // É CRUCIAL se desinscrever para evitar memory leaks!
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }

    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

private checkForNewOffers() {
    this.offersService
      .getSummaryOffers(
        this.selectedCity === null ? undefined : this.selectedCity,
        this.selectedTypeOfOs === null ? undefined : this.selectedTypeOfOs,
        this.selectedPeriod === null ? undefined : this.selectedPeriod
      )
      .subscribe({
        next: (offers) => {
          if (JSON.stringify(this.lastOffersSnapshot) !== JSON.stringify(offers)) {
            this.lastOffersSnapshot = offers;
            this.offers = offers;
          }
        },
        error: (e) => {
          console.log(e);
        }
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

private subscribeToRealtimeUpdates(): void {
    this.sseSubscription = this.sseService.notificationEvents$.subscribe(
      (notification) => {
        const audio = new Audio("/mixkit-software-interface-start-2574.wav");
        audio.play().catch(() => {});

        this.messageService.add({
          severity: "info",
          summary: "Atualização",
          detail: notification.message || "Novas ofertas solicitadas foram recebidas.",
          life: 5000,
        });

        this.loadRequestedOffers();
        this.loadOffers(); 
      }
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
          this.lastOffersSnapshot = offers; 
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Erro ao carregar ofertas:", error);
          this.isLoading = false;
        },
      });
  }


  private loadRequestedOffers() {
    this.offersService
      .getAllOffers(undefined, undefined, undefined, OfferStatus.PENDING)
      .subscribe({
        next: (offers) => {
          this.requestedOffers = offers;
        },
        error: (error) => {
          console.error("Erro ao carregar ofertas solicitadas:", error);
        },
      });
  }

  onFilterChange() {
    this.loadOffers();
  }

  //-------Método de exclusão de ofertas-------//
  // Abre o dialog de exclusão
  openDeleteDialog(offer: any): void {
    this.offerToDelete = offer;
    this.quantityToDelete = 1; // Reseta para 1 toda vez que abre
    this.displayDeleteDialog = true;
  }

  // Fecha o dialog
  cancelDelete(): void {
    this.displayDeleteDialog = false;
    this.offerToDelete = undefined;
    this.quantityToDelete = 1;
  }

  // Executa a exclusão
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

    // O backend espera YYYY-MM-DD, então formatamos a data "DD/MM/YYYY" de volta
    // Isso é um pouco frágil, o ideal seria que a projeção retornasse LocalDate/Date
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
          this.cancelDelete(); // Fecha o dialog
          this.loadOffers(); // Recarrega a lista
        },
        error: (err) => {
          console.error("Erro ao deletar ofertas:", err);
          // Exibe a mensagem de erro vinda do backend
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

  //-------Método de aceitar/rejeitar ofertas-------//
  acceptOffer(offerId: string): void {
  this.adminOffersService.acceptOffer(offerId).subscribe({
    next: (updatedOffer) => {
      this.messageService.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Oferta aceita com sucesso!",
        life: 4000
      });
      this.playNotificationSound();
      this.loadRequestedOffers(); // Recarrega a lista de ofertas solicitadas
    },
    error: (err) => {
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao aceitar oferta.",
        life: 4000
      });
      console.error(err);
    },
  });
}

playNotificationSound() {
  const audio = new Audio('/livechat-129007.mp3'); // ajuste o caminho conforme seu arquivo
  audio.play();
}

  rejectOffer(offerId: string): void {
    this.adminOffersService.rejectOffer(offerId).subscribe({
      next: (updatedOffer) => {
        this.messageService.add({
          severity: "info",
          summary: "Sucesso",
          detail: "Oferta rejeitada com sucesso!",
        });
        this.loadRequestedOffers(); // Recarrega a lista de ofertas solicitadas
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao rejeitar oferta.",
        });
        console.error(err);
      },
    });
  }

  //-------Método de criação de ofertas-------//

  showCreateDialog(): void {
    this.createOffersForm.reset({ quantity: 1 }); // Reseta o form e define quantidade=1
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
          detail: `${createdOffers.length} ofertas foram criadas!`,
        });
        this.isSubmitting = false;
        this.displayCreateDialog = false;
        this.loadOffers(); // Recarrega a lista para mostrar as novas ofertas
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

  //-------Métodos formatação-------//

  get formattedPeriod() {
    return (period: Period | null) => {
      if (!period) return "Todos os Períodos";
      switch (period) {
        case "MORNING":
          return "Manhã";
        case "AFTERNOON":
          return "Tarde";
        case "NIGHT":
          return "Noite";
        default:
          return period;
      }
    };
  }

  get formattedTypeOfOs() {
    return (typeOfOs: TypeOfOs | null) => {
      if (!typeOfOs) return "Todos os Tipos de OS";
      switch (typeOfOs) {
        case TypeOfOs.INSTALLATION:
          return "Instalação";
        case TypeOfOs.CHANGE_OF_ADDRESS:
          return "Mudança de Endereço";
        case TypeOfOs.TECHNICAL_VISIT:
          return "Visita Técnica";
        case TypeOfOs.MAINTENANCE:
          return "Manutenção";
        case TypeOfOs.KIT_REMOVAL:
          return "Retirada de Kit";
        case TypeOfOs.CHANGE_OF_TECHNOLOGY:
          return "Mudança de Tecnologia";
        case TypeOfOs.TECHNICAL_VIABILITY:
          return "Viabilidade Técnica";
        case TypeOfOs.PROJECTS:
          return "Projetos";
        case TypeOfOs.INTERNAL:
          return "Interno";
        default:
          return typeOfOs;
      }
    };
  }

  get formattedCity() {
    return (city: City | null) => {
      if (!city) return "Todas as Cidades";
      switch (city) {
        case City.ASSIS:
          return "Assis";
        case City.CANDIDO_MOTA:
          return "Cândido Mota";
        case City.PALMITAL:
          return "Palmital";
        case City.ECHAPORA:
          return "Echaporã";
        case City.IBIRAREMA:
          return "Ibirarema";
        case City.OSCAR_BRESSANE:
          return "Oscar Bressane";
        default:
          return city;
      }
    };
  }
}
