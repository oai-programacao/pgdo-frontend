import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

// PrimeNG Modules
import { ButtonModule } from "primeng/button";
import { MessagesModule } from "primeng/messages";
import { MessageModule } from "primeng/message";
import { MessageService } from "primeng/api";

import { OffersService } from "../../services/offers.service"; // Ajuste o caminho
import {
  TypeOfOs,
  City,
  Period,
  TypeOfOsLabels,
  CitiesLabels,
  PeriodLabels,
} from "../../../../interfaces/enums.model";
import {
  CreateOfferRequestDto,
  ViewOfferDto,
} from "../../../../interfaces/offers.model";
import { BlockOffersRequestService } from "../../services/block-offers-request.service";
import {
  BlockPeriodOffers,
  BlockPeriodOffersLabels,
  ViewBlockOffersDto,
} from "../../../../interfaces/block-offers-request.model";
import { DatePickerModule } from "primeng/datepicker";
import { SelectModule } from "primeng/select";
import { WsService } from "../../../../core/websocket/ws.service";

interface DropdownOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: "app-create-request-offer",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    MessagesModule,
    MessageModule,
  ],
  templateUrl: "./create-request-offer.component.html",
  styleUrl: "./create-request-offer.component.scss",
  providers: [MessageService], // Adicionar se não estiver globalmente provido e usar Toast
})
export class CreateRequestOfferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private blockOffersRequestService = inject(BlockOffersRequestService);
  private wsService = inject(WsService);

  private destroy$ = new Subject<void>();

  @Input() initialData?: Partial<CreateOfferRequestDto>; // Para pré-popular o formulário se necessário
  @Input() showCancelButton = true; // Controla a visibilidade do botão Cancelar

  @Output() offerCreated = new EventEmitter<ViewOfferDto>();
  @Output() creationCancelled = new EventEmitter<void>();

  createOfferForm!: FormGroup;
  isSubmitting = false;

  typeOfOsOptions: DropdownOption<TypeOfOs>[] = [];
  cityOptions: DropdownOption<City>[] = [];
  periodOptions: DropdownOption<Period>[] = [];

  activeBlock: ViewBlockOffersDto | null = null;
  minDateValue: Date = new Date();

  ngOnInit(): void {
    this.loadDropdownOptions();
    this.initForm();
    this.loadExistingBlocks(); // Carrega as regras de bloqueio
    if (this.initialData) {
      this.createOfferForm.patchValue(this.initialData);
    }
  }

  private loadExistingBlocks(): void {
    this.blockOffersRequestService
      .getAllBlockOffers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blocks) => {
          // Pega a regra mais recente (com a maior data de liberação)
          if (blocks && blocks.length > 0) {
            this.activeBlock = blocks[0];
            const releaseDate = this.parsePtBrDate(
              this.activeBlock.initialDate
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normaliza para o início do dia

            // A data mínima será a data de liberação OU hoje (o que for maior)
            if (releaseDate && releaseDate > today) {
              this.minDateValue = releaseDate;
            } else {
              this.minDateValue = today;
            }

            this.createOfferForm?.updateValueAndValidity(); // Força a revalidação
          }
        },
        error: (err) =>
          console.error("Erro ao carregar blocos existentes:", err),
      });
  }

  private loadDropdownOptions(): void {
    this.typeOfOsOptions = Object.keys(TypeOfOsLabels).map((key) => ({
      label: TypeOfOsLabels[key as TypeOfOs],
      value: key as TypeOfOs,
    }));
    this.cityOptions = Object.keys(CitiesLabels).map((key) => ({
      label: CitiesLabels[key as City],
      value: key as City,
    }));
    this.periodOptions = Object.keys(PeriodLabels).map((key) => ({
      label: PeriodLabels[key as Period],
      value: key as Period,
    }));
  }

  private initForm(): void {
    this.createOfferForm = this.fb.group(
      {
        typeOfOs: [null, Validators.required],
        city: [null, Validators.required],
        period: [null, Validators.required],
        date: [null, Validators.required],
      },
      {
        validators: this.dateAndPeriodReleaseValidator(), // Adiciona o validador customizado
      }
    );

    if (this.initialData) {
      this.createOfferForm.patchValue(this.initialData);
    }
  }

  // --- VALIDADOR CUSTOMIZADO CORRIGIDO ---
  private dateAndPeriodReleaseValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (!this.activeBlock) return null; // Sem regra, sem validação

      const dateControl = form.get("date");
      const periodControl = form.get("period");

      if (!dateControl?.value || !periodControl?.value) return null;

      // As datas do formulário e do backend estão como "dd/MM/yyyy"
      const selectedDateString = dateControl.value;
      const releaseDateString = this.activeBlock.initialDate;

      // Converte ambas para um formato comparável (YYYY-MM-DD)
      const comparableSelectedDate =
        this.toComparableFormat(selectedDateString);
      const comparableReleaseDate = this.toComparableFormat(releaseDateString);

      if (!comparableSelectedDate || !comparableReleaseDate) return null; // Formato inválido

      // REGRA 1: Data selecionada não pode ser anterior à data de liberação
      if (comparableSelectedDate < comparableReleaseDate) {
        return {
          dateIsBeforeRelease: `As solicitações estão liberadas apenas a partir de ${releaseDateString}.`,
        };
      }

      // REGRA 2: Se for exatamente na data de liberação, validar o período
      if (comparableSelectedDate === comparableReleaseDate) {
        const releasePeriod = this.activeBlock.periodOffer;
        const selectedPeriod = periodControl.value;

        if (
          releasePeriod === BlockPeriodOffers.MORNING &&
          selectedPeriod !== Period.MORNING
        ) {
          return {
            periodNotAllowed: `Neste dia, as solicitações estão liberadas apenas para o período da MANHÃ.`,
          };
        }

        if (
          releasePeriod === BlockPeriodOffers.AFTERNOON &&
          selectedPeriod !== Period.AFTERNOON
        ) {
          return {
            periodNotAllowed: `Neste dia, as solicitações estão liberadas apenas para o período da TARDE.`,
          };
        }
      }

      return null; // Sem erros de validação
    };
  }

  // --- FUNÇÕES AUXILIARES ---

  // Converte "DD/MM/YYYY" para "YYYY-MM-DD" para comparação segura
  private toComparableFormat(dateStr: string): string | null {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
    const parts = dateStr.split("/");
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
      2,
      "0"
    )}`;
  }

  // Converte "DD/MM/YYYY" para um objeto Date
  private parsePtBrDate(dateStr: string): Date | null {
    const comparableFormat = this.toComparableFormat(dateStr);
    return comparableFormat ? new Date(comparableFormat + "T00:00:00") : null;
  }

  onSubmit(): void {
    if (this.createOfferForm.invalid) {
      this.createOfferForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    const formValues = this.createOfferForm.value;

    const dto: CreateOfferRequestDto = {
      typeOfOs: formValues.typeOfOs,
      city: formValues.city,
      period: formValues.period,
      date: formValues.date,
    };

    this.wsService.sendOfferRequest(dto);
    this.isSubmitting = false;
    this.offerCreated.emit();
  }

  onCancel(): void {
    this.creationCancelled.emit();
    this.createOfferForm.reset(); // Opcional: limpar o formulário ao cancelar
  }

  // Helper para acessar controles do formulário no template
  get f() {
    return this.createOfferForm.controls;
  }

  getOfferBlockPeriodLabel(period: BlockPeriodOffers): string {
    return BlockPeriodOffersLabels[period] || "Período Desconhecido";
  }
}
