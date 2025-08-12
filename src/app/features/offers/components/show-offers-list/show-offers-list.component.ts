import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { OffersService } from "../../services/offers.service";
import { City, Period, TypeOfOs } from "../../../../interfaces/enums.model";
import { TableModule } from "primeng/table";
import { SelectModule } from "primeng/select";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { interval, Subject, Subscription } from "rxjs";
import { MessageService } from "primeng/api";
import { SseService } from "../../../../core/sse/sse.service";

@Component({
  selector: "app-show-offers-list",
  imports: [TableModule, SelectModule, CommonModule, FormsModule],
  templateUrl: "./show-offers-list.component.html",
  styleUrl: "./show-offers-list.component.scss",
  providers: [MessageService]
})
export class ShowOffersListComponent implements OnInit, OnDestroy {
  private offersService = inject(OffersService);
  private messageService = inject(MessageService);
    private sseService = inject(SseService);

  private notificationSubscription?: Subscription;
  isLoading = false;
  offers: any[] = [];

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
  private sseSubscription?: Subscription;
  hasNewOffers = false;

  showDialogRequestedOffers$ = new Subject<boolean>();
  requestedOffers: any[] = [];
  private offersSubscription: any;
  private pollingSubscription?: Subscription;


ngOnInit(): void {
  this.loadOffers();

  // Inscreva-se no SSE
  if (this.sseService.notificationEvents$) {
    this.sseSubscription = this.sseService.notificationEvents$.subscribe((data) => {
      console.log("Notificação recebida no componente:", data);
      this.loadOffers();
      this.messageService.add({
        severity: "info",
        summary: "Nova oferta",
        detail: `Nova oferta: ${this.formattedTypeOfOs(data.typeOfOs as TypeOfOs)} em ${this.formattedCity(data.city as City)} (${this.formattedPeriod(data.period as Period)}) - ${data.date}`,
        life: 4000,
      });
    });
  }

  // Atualização periódica das ofertas
  this.pollingSubscription = interval(5000).subscribe(() => {
    this.loadOffers();
  });
}
ngOnDestroy(): void {
  this.sseSubscription?.unsubscribe();
  this.pollingSubscription?.unsubscribe();
}

  private loadOffers() {
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
        },
        error: (error) => {
          console.error("Erro ao carregar ofertas:", error);
          this.isLoading = false;
        },
      });
  }

  onFilterChange() {
    this.loadOffers();
  }

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
