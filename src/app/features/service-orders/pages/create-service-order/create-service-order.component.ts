import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core'; // Adicionado ViewChild
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog'; // <-- Adicionar DialogModule


import { ServiceOrderService } from '../../services/service-order.service';
import { DatePickerModule } from "primeng/datepicker"; // ou CalendarModule para p-calendar
import { SelectModule } from 'primeng/select';
import { PanelModule } from "primeng/panel";
import { InputMaskModule } from 'primeng/inputmask';
import { KeyFilterModule } from 'primeng/keyfilter'; // Para pKeyFilter


// Importar o componente de criação de oferta
import { CreateRequestOfferComponent } from "../../../offers/components/create-request-offer/create-request-offer.component";
import { City, ClientTypeLabels, CommandAreaLabels, OfferStatus, PeriodLabels, Technology, TechnologyLabels, TypeOfOs, TypeOfOsLabels } from '../../../../interfaces/enums.model';
import { CreateServiceOrderDto } from '../../../../interfaces/service-order.model';
import { ViewOfferDto } from '../../../../interfaces/offers.model';
import { OffersService } from '../../../offers/services/offers.service';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, of, shareReplay, startWith, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ShowOffersListComponent } from "../../../offers/components/show-offers-list/show-offers-list.component";

@Component({
  selector: "app-create-service-order",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule, // ou CalendarModule
    ButtonModule,
    ToastModule,
    PanelModule,
    InputMaskModule,
    DialogModule, // <-- Adicionar DialogModule aos imports
    CreateRequestOfferComponent, // Componente do formulário de oferta
    KeyFilterModule,
    ShowOffersListComponent
],
  templateUrl: "./create-service-order.component.html",
  providers: [MessageService],
})
export class CreateServiceOrderComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  router = inject(Router);
  private messageService = inject(MessageService);
  private serviceOrderService = inject(ServiceOrderService);
  private offersService = inject(OffersService);

  private destroy$ = new Subject<void>();

  @ViewChild(CreateRequestOfferComponent)
  createRequestOfferComponent!: CreateRequestOfferComponent; // Para resetar o form se necessário

  offersOptions: ViewOfferDto[] = []; // Lista de ofertas disponíveis

  createOsForm!: FormGroup;
  isSubmitting = false;
  isLoadingContract = false;

  // Controle do Modal de Criação de Oferta
  displayCreateOfferModal: boolean = false;

  // Controle do Modal de Ver Ofertas
  displayOffersModal: boolean = false;

  // Opções para Dropdowns
  commandAreaOptions: any[];
  clientTypeOptions: any[];
  technologyOptions: any[];
  //dropdowns dinâmicos
  typeOfOsOptions!: any[];
  // typeOfOsOptions: { label: string; value: TypeOfOs }[] = [
  //   {label: 'Instalação' , value: TypeOfOs.INSTALLATION},
  //   {label: 'Manutenção', value: TypeOfOs.MAINTENANCE},
  //   {label: 'Mudança de Endereço', value: TypeOfOs. CHANGE_OF_ADDRESS},
  //   {label: 'Mudança de Tecnologia', value: TypeOfOs.CHANGE_OF_TECHNOLOGY},
  //   {label: 'Projetos', value: TypeOfOs.PROJECTS},
  //   {label: 'Remoção de Equipamentos', value: TypeOfOs.KIT_REMOVAL},
  //   {label: 'Viabilidade Técnica', value: TypeOfOs. TECHNICAL_VIABILITY},
  //   {label: 'Visita Técnica', value: TypeOfOs.TECHNICAL_VISIT},
  //   {label: 'Rede Interna', value: TypeOfOs.INTERNAL}
  // ];
  scheduleDateOptions: any[];
  periodOptions: any[];

  constructor() {
    this.commandAreaOptions = Object.entries(CommandAreaLabels).map(([key, value]) => ({ label: value, value: key }));
    this.clientTypeOptions = Object.entries(ClientTypeLabels).map(([key, value]) => ({ label: value, value: key }));
    this.technologyOptions = Object.entries(TechnologyLabels).map(([key, value]) => ({ label: value, value: key }));
    // this.typeOfOsOptions = [];
    this.scheduleDateOptions = [];
    this.periodOptions = [];
  }

  ngOnInit(): void {
    this.initForm();
    this.observerChanges(); // Configura observadores para mudanças nos campos
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private initForm(): void {
    // Usando a estrutura que você forneceu
    this.createOsForm = this.fb.group({
      contractNumber: [null, [Validators.pattern("^[0-9]*$"), Validators.required]],
      identificationNumber: [null, Validators.pattern("^[0-9]*$")],
      clientName: [null, Validators.required],
      phone1: [null, Validators.required],
      phone2: [null],
      commandArea: [null, Validators.required],
      city: [null, Validators.required],
      district: [null, Validators.required],
      address: [null, Validators.required],
      clientType: [null, Validators.required],
      serviceOrderType: [{value: null, disabled: true}, Validators.required],
      scheduleDate: [{value: null, disabled: true}, Validators.required],
      period: [{value: null, disabled: true}, Validators.required],
      technology: [Technology.FIBER_OPTIC, Validators.required],
    });
  }

  private defineCityToSearchOffer(): City {
    const cityControl = this.createOsForm.get('city');
    switch (cityControl?.value) {
      case "Assis":
        return City.ASSIS;
      case "Cândido Mota":
        return City.CANDIDO_MOTA;
      case "Candido Mota":
        return City.CANDIDO_MOTA; // Corrigido para Candido Mota
      case "Palmital":
        return City.PALMITAL;
      case "Oscar Bressane":
        return City.OSCAR_BRESSANE;
      case "Ibirarema":
        return City.IBIRAREMA;
      case "Echaporã":
        return City.ECHAPORA;
      case "Echapora":
        return City.ECHAPORA; // Corrigido para Echaporã
      default:
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Cidade inválida ou não selecionada.',
        });
        return City.ASSIS; // Retorna Assis como padrão, mas pode ser ajustado conforme necessário
    }
  }

  private getOffersForCity(city: City) {
    this.offersService.getAllOffers(undefined, city, undefined, OfferStatus.AVAILABLE).subscribe({
      next: (offers) => {
        if (offers && offers.length > 0) {
          this.typeOfOsOptions = Array.from(new Set(offers.map(offer => offer.typeOfOs)))
            .map(type => ({ label: TypeOfOsLabels[type], value: type }));
          this.offersOptions = offers; // Armazena as ofertas disponíveis
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'Informação',
            detail: 'Nenhuma oferta disponível para a cidade selecionada.',
          });
          this.typeOfOsOptions = [];
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao buscar ofertas disponíveis.',
        });
        console.error(err);
      }
    })
  }

  private resetDropdownOptions(): void {
    const typeOfOsControl = this.createOsForm.get('serviceOrderType')!;
    const scheduleDateControl = this.createOsForm.get('scheduleDate')!;
    const periodControl = this.createOsForm.get('period')!;

    // Reseta as opções dos dropdowns
    typeOfOsControl.setValue(null, { emitEvent: false });
    typeOfOsControl.disable(); // Desabilita o campo de tipo de OS
    scheduleDateControl.setValue(null, { emitEvent: false });
    scheduleDateControl.disable(); // Desabilita o campo de data agendada
    periodControl.setValue(null, { emitEvent: false });
    periodControl.disable(); // Desabilita o campo de período
    this.typeOfOsOptions = [];
    this.scheduleDateOptions = [];
    this.periodOptions = [];
  }

  observerChanges(): void {
    const typeOfOsControl = this.createOsForm.get('serviceOrderType')!;
    const scheduleDateControl = this.createOsForm.get('scheduleDate')!;
    const periodControl = this.createOsForm.get('period')!;

    // Observa mudanças no tipo de OS e na data agendada
    typeOfOsControl.valueChanges.subscribe((value) => {
      this.scheduleDateOptions = []; // Limpa as datas disponíveis
      this.periodOptions = []; // Limpa os períodos disponíveis
      if (value) {
        scheduleDateControl.enable(); // Habilita o campo de data agendada
      }
      this.scheduleDateOptions = this.offersOptions
        .filter(offer => offer.typeOfOs === value)
        .map(offer => offer.date)
        .filter((date, index, self) => self.indexOf(date) === index)
    })

    scheduleDateControl.valueChanges.subscribe((selectedDate) => {
      this.periodOptions = [];
      periodControl.setValue(null, { emitEvent: false });
      periodControl.disable(); 

      if (selectedDate && this.offersOptions.length > 0) {
        const selectedTypeOfOs = this.createOsForm.get('serviceOrderType')?.value;
        if (!selectedTypeOfOs) {
          return;
        }

        -
        periodControl.enable();
        this.periodOptions = this.offersOptions
          .filter(offer =>
            offer.date === selectedDate && 
            offer.typeOfOs === selectedTypeOfOs
          )
          .map(offer => ({ label: PeriodLabels[offer.period], value: offer.period }))
          .filter((period, index, self) => self.findIndex(p => p.value === period.value) === index);
      }
    });
  }

  getContractDetails(): void {
    const contractNumberControl = this.createOsForm.get('contractNumber');
    if (!contractNumberControl || !contractNumberControl.value) {
        this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Número do contrato é inválido ou não foi preenchido.' });
        return;
    }
    // Habilitar campos para edição após a busca, ou mantê-los desabilitados e apenas exibir
    this.serviceOrderService
      .getContractDetails(contractNumberControl.value)
      .subscribe({
        next: (details) => {
          if (details.result && details.result.length > 0) {
            const contractInfo = details.result[0];
            this.createOsForm.patchValue({
              clientName: contractInfo.Cliente_Nome,
              phone1: contractInfo.Cliente_Tel_Celular,
              phone2: contractInfo.Cliente_Tel_Residencial || '', // Garante string vazia se null
              city: contractInfo.EnderecoInstalacao_Cidade,
              district: contractInfo.EnderecoInstalacao_Bairro,
              address: `${contractInfo.EnderecoInstalacao_Logradouro || ''}, ${contractInfo.EnderecoInstalacao_Numero || ''}`.trim(),
            });
            this.resetDropdownOptions(); // Reseta as opções dos dropdowns

            // Habilitar campos de tipo de OS, data agendada e período
            this.createOsForm.get('serviceOrderType')?.enable();

            this.getOffersForCity(this.defineCityToSearchOffer()); // Busca ofertas para a cidade definida
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Contrato não encontrado ou sem detalhes.' });
            // Limpar campos se o contrato não for encontrado
            this.createOsForm.patchValue({
                clientName: "", phone1: "", phone2: "", city: "", district: "", address: ""
            });
            this.resetDropdownOptions();
          }
        },
        error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao buscar detalhes do contrato.' });
            console.error(err);
        }
      });
  }

  onSubmit(): void {
    if (this.createOsForm.invalid) {
      this.createOsForm.markAllAsTouched(); // Garante que todas as mensagens de erro apareçam
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    this.isSubmitting = true;
    const rawFormValue = this.createOsForm.getRawValue(); // Pega valores de campos desabilitados também

    const dto: CreateServiceOrderDto = {
      ...rawFormValue,
      city: this.defineCity(), // Define a cidade com base no valor do formulário
    };

    this.serviceOrderService.create(dto).subscribe({
      next: (newOs) => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Ordem de Serviço #${ newOs.identificationNumber || newOs.id } criada!`, // Assumindo que newOs tem id ou identificationNumber
        });
        this.isSubmitting = false;
        this.createOsForm.reset(); // Reseta o formulário após o sucesso
        this.resetDropdownOptions(); // Reseta os dropdowns após o sucesso
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: err.error?.message || "Falha ao criar Ordem de Serviço.",
        });
        console.error(err);
        this.isSubmitting = false;
      },
    });
  }

  // --- Métodos para o Modal de Criação de Oferta ---
  showCreateOfferDialog(): void {
    this.displayCreateOfferModal = true;
    if (this.createRequestOfferComponent) {
       // Certifique-se de que o createRequestOfferComponent tem um método público para resetar,
       // ou confie no *ngIf para recriá-lo.
       // this.createRequestOfferComponent.resetForm(); // Exemplo
    }
  }

  onOfferCreated(createdOffer: ViewOfferDto): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Oferta Criada',
      detail: `Oferta para ${TypeOfOsLabels[createdOffer.typeOfOs]} em ${createdOffer.city} no período da ${PeriodLabels[createdOffer.period]} foi solicitada.`,
    });
    this.displayCreateOfferModal = false;
  }

  onOfferCreationCancelled(): void {
    this.displayCreateOfferModal = false;
  }


  defineCity(): City {
    switch (this.createOsForm.get('city')?.value) {
      case "Assis":
        return City.ASSIS;
      case "Cândido Mota":
        return City.CANDIDO_MOTA;
      case "Candido Mota":
        return City.CANDIDO_MOTA; // Corrigido para Candido Mota
      case "Palmital":
        return City.PALMITAL;
      case "Oscar Bressane":
        return City.OSCAR_BRESSANE;
      case "Ibirarema":
        return City.IBIRAREMA;
      case "Echaporã":
        return City.ECHAPORA;
      case "Echapora":
        return City.ECHAPORA; // Corrigido para Echaporã
      default:
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Cidade inválida ou não selecionada.',
        });
        return City.ASSIS; // Retorna Assis como padrão, mas pode ser ajustado conforme necessário
    }
  }
}