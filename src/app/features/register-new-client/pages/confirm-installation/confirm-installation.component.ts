import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { ToolbarModule } from "primeng/toolbar";
import { FieldsetModule } from "primeng/fieldset";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { TableModule } from "primeng/table";
import { SelectModule } from "primeng/select";
import { RegisterClientService } from "../../services/register-client.service";
import { ButtonModule } from "primeng/button";
import {
  ContactAttemptResponse,
  ViewRegisterClientResponseDto,
} from "../../../../interfaces/register-client.model";
import { Tag } from "primeng/tag";
import { CpfCnpjPipe } from "../../../../shared/pipes/cpf-cnpj.pipe";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { ConfirmationService, MessageService } from "primeng/api";
import { PhonesPipe } from "../../../../shared/pipes/phones.pipe";
import { TimelineModule } from "primeng/timeline";
import { ConfirmPopupModule } from "primeng/confirmpopup";

@Component({
  selector: "app-confirm-instalation",
  imports: [
    CommonModule,
    ToolbarModule,
    DatePickerModule,
    TableModule,
    ReactiveFormsModule,
    FieldsetModule,
    SelectModule,
    ButtonModule,
    Tag,
    CpfCnpjPipe,
    TooltipModule,
    DialogModule,
    ToastModule,
    PhonesPipe,
    TimelineModule,
    ConfirmPopupModule,
  ],
  templateUrl: "./confirm-installation.component.html",
  styleUrl: "./confirm-installation.component.scss",
  providers: [
    FormBuilder,
    RegisterClientService,
    CpfCnpjPipe,
    MessageService,
    ConfirmationService,
  ],
})
export class ConfirmInstalationComponent implements OnInit, OnChanges {
  form!: FormGroup;
  filterForm!: FormGroup;
  maxDate: Date | undefined;
  isSubmittingAttempt = false;

  selectedContract: any = null;
  responseData!: ViewRegisterClientResponseDto[];
  totalRecords: number = 0;
  isLoading: boolean = false;
  rows = 10;
  first = 0;

  contactCreated: { [contractId: string]: boolean } = {};

  attemptForm!: FormGroup;

  attemptFormVisibleDialog = false;
  detailsVisible = false;

  attemptsData!: ContactAttemptResponse[];

  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly registerClientService = inject(RegisterClientService);
  private readonly messageService = inject(MessageService);

  statusOptions = [
    { label: "Instalado", value: "INSTALLED" },
    { label: "Não Instalado", value: "NOT_INSTALLED" },
  ];


  contactAttemptResults: any[] = [
    { label: "Falou com o Cliente", value: "SPOKE_TO_CLIENT" },
    { label: "Falou com o Familiar", value: "SPOKE_TO_RELATIVE" },
    { label: "Linha Ocupada", value: "BUSY_LINE" },
    { label: "Número Inválido", value: "INVALID_NUMBER" },
    {
      label: "Cliente Solicitou Retorno",
      value: " CLIENT_REQUESTED_CALLBACK_LATER",
    },
    { label: "Não Atendido", value: "NO_ANSWER" },
    { label: "Cliente Validou o Contrato", value: "CLIENT_VALIDATED_CONTRACT" },
    { label: "Cliente Rejeitou o Contrato", value: "CLIENT_REJECTED_CONTRACT" },
    {
      label: "Cliente Solicitou Alterações",
      value: "CLIENT_REQUESTED_CHANGES",
    },
    { label: "Deixou Recado na Caixa Postal", value: "VOICEMAIL_LEFT" },
  ];

  constructor() {
    this.maxDate = new Date();
  }

  private initAttemptForm(): void {
    this.attemptForm = this.fb.group({
      outcome: [null, Validators.required],
      notes: ["", Validators.required],
      attemptNotes: ["string"],
    });
  }

  openAttemptDialog(contract: any) {

    this.registerClientService
      .getContactAttempts("", contract.id)
      .subscribe({
        next: (response) => {
          console.log("Resposta getContactAttempts:", response);

          const contactAttempt = response.content[0];
          if (!contactAttempt) {
            this.messageService.add({
              severity: "warn",
              summary: "Atenção",
              detail: "Nenhum contato encontrado para este contrato.",
            });
            return;
          }

          this.selectedContract = {
            ...contract,
            contactAttempts: response.content,
            id: contactAttempt.id,
          };

          console.log("ID do contato para buscar detalhes:", contactAttempt.id);

          this.registerClientService
            .getContactAttemptById(contactAttempt.id)
            .subscribe({
              next: (contact) => {
                console.log("Resposta getContactAttemptById:", contact);
                this.selectedContract = {
                  ...this.selectedContract,
                  ...contact,
                };
                console.log(
                  "ID do contato salvo em selectedContract.id:",
                  this.selectedContract.id
                );
                this.attemptFormVisibleDialog = true;
              },
              error: (err) => {
                console.log("Erro getContactAttemptById:", err);
                this.messageService.add({
                  severity: "error",
                  summary: "Erro",
                  detail: "Não foi possível buscar o contato.",
                });
              },
            });
        },
        error: (err) => {
          console.log("Erro getContactAttempts:", err);
        },
      });
  }

detailsVisibleTrue(contract: any) {
  this.detailsVisible = true;
  this.selectedContract = contract;

  const taskId = contract.taskId || contract.id;

  this.registerClientService.getContactByIdAttempts(taskId).subscribe({
    next: (response) => {
      this.attemptsData = response;
    },
    error: (e) => {
      console.log(e);
    }
  });
}

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      status: [null],
      saleId: [null],
      clientName: [""],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnInit() {
    this.initAttemptForm();
    this.initFilterForm();
    this.form = this.fb.group({
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      status: [null],
    });
  }

  clearFilters() {
    this.form.reset();
    this.messageService.add({
      severity: "info",
      summary: "Filtros Limpos",
      detail: "Todos os filtros foram limpos.",
    });
  }

  loadContracts(event?: any): void {
    this.isLoading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);

    const startDate = this.form.value.startDate;
    const endDate = this.form.value.endDate;
    const status = this.form.value.status;

    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    };

    const startDateFormatted = formatDate(startDate);
    const endDateFormatted = formatDate(endDate);

    this.registerClientService
      .getContractsByDateStatus(
        startDateFormatted,
        endDateFormatted,
        status,
        page,
        this.rows
      )
      .subscribe({
        next: (response) => {
          this.responseData = response.content;
          this.totalRecords = response.page.totalElements;
          this.isLoading = false;
          this.form.reset();

          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Contratos carregados com sucesso!",
          });
        },
        error: (e) => {
          console.log(e);
          this.isLoading = false;
        },
      });
  }

  applyFilters() {
    this.first = 0;
    this.loadContracts();
  }

  getContactAttemptOutcomeLabel(outcome: string): string {
    if (outcome === "Atendido") return "Atendido";
    if (outcome === "Não atendido") return "Não Atendido";
    return "Outro";
  }

  getStatusSeverity(
    outcome: string
  ):
    | "success"
    | "danger"
    | "warn"
    | "info"
    | "secondary"
    | "contrast"
    | undefined {
    switch (outcome) {
      case "Atendido":
        return "success";
      case "Não Atendido":
        return "danger";
      default:
        return "info";
    }
  }

  showTheAttemptNotes(){
    const id = this.selectedContract.id;

    this.registerClientService.getContactByIdAttempts(id).subscribe({
      next: (response) => {
        this.attemptsData = response;
      },
      error: (e) => {
        console.log(e)
      }
    })
  }

  submitContactAttempt() {
    const contactId = this.selectedContract.id;
    this.registerClientService
      .postContactAttempt(contactId, this.attemptForm.value)
      .subscribe({
        next: (response) => {
         this.attemptForm.reset();
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Tentativa de contato registrada com sucesso!",
          });
          this.attemptFormVisibleDialog = false;
        },
        error: (e) => {
          console.log("Erro postContactAttempt:", e);
        },
      });
  }
}
