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
    { label: "Fechado Sem Contato", value: "CLOSED_WITHOUT_CONTACT" },
  ];

  contactAttemptResults: any[] = [
    { label: "Falou com o Cliente", value: "SPOKE_TO_CLIENT" },
    { label: "Falou com o Familiar", value: "SPOKE_TO_RELATIVE" },
    {
      label: "Cliente Validou a Instalação",
      value: "CLIENT_VALIDATED_INSTALATION",
    },
    {
      label: "Cliente Solicitou Retorno",
      value: "CLIENT_REQUESTED_CALLBACK_LATER",
    },
    {
      label: "Cliente Rejeitou a Instalação",
      value: "CLIENT_REJECTED_INSTALATION",
    },
    { label: "Linha Ocupada", value: "BUSY_LINE" },
    { label: "Número Inválido", value: "INVALID_NUMBER" },
    { label: "Não Atendido", value: "NO_ANSWER" },
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
      notes: [""],
      attemptNotes: ["", Validators.required],
    });
  }

  openAttemptDialog(contract: any) {
    this.registerClientService.getContactAttempts("", contract.id).subscribe({
      next: (response) => {
        const contactAttempt = response.content[0];
        if (!contactAttempt) {
          this.messageService.add({
            severity: "warn",
            summary: "Atenção",
            detail: "Nenhum contato encontrado para este contrato.",
          });
          return;
        }

        if (
          contactAttempt.status === "CLOSED_WITHOUT_CONTACT" ||
          contactAttempt.status === "EXECUTED_WITH_CONTACT"
        ) {
          let detailMsg = "O contato foi fechado.";
          if (contactAttempt.status === "CLOSED_WITHOUT_CONTACT") {
            detailMsg +=
              " O contato foi fechado sem sucesso e o status do contrato foi atualizado para 'Fechado Sem Contato'.";
          } else if (contactAttempt.status === "EXECUTED_WITH_CONTACT") {
            detailMsg += " O contato foi fechado com sucesso.";
          }
          this.messageService.add({
            severity: "warn",
            summary: "Limite atingido",
            detail: detailMsg,
          });
          this.loadContracts();
          return;
        }

        if (contactAttempt.attempts >= 5) {
          this.messageService.add({
            severity: "warn",
            summary: "Atenção",
            detail:
              "Já foram realizadas 5 tentativas, aguarde atualização do status.",
          });
          this.loadContracts();
          return;
        }

        this.selectedContract = {
          ...contract,
          contactAttempts: response.content,
          id: contactAttempt.id,
        };

        this.registerClientService
          .getContactAttemptById(contactAttempt.id)
          .subscribe({
            next: (contact) => {
              this.selectedContract = {
                ...this.selectedContract,
                ...contact,
              };
              this.attemptFormVisibleDialog = true;
            },
            error: (err) => {
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

  closeAttemptDialog() {
    this.attemptFormVisibleDialog = false;
    this.attemptForm.reset();
  }
  detailsVisibleTrue(contract: any) {
    this.detailsVisible = true;
    this.selectedContract = contract;

    this.registerClientService.getContactAttempts("", contract.id).subscribe({
      next: (response) => {
        const contactAttempt = response.content[0];
        if (!contactAttempt) {
          this.messageService.add({
            severity: "warn",
            summary: "Atenção",
            detail: "Nenhum contato encontrado para este contrato.",
          });
          this.selectedContract.contactHistory = [];
          this.attemptsData = [];
          return;
        }

        const contactId = contactAttempt.id;
        this.registerClientService.getContactByIdAttempts(contactId).subscribe({
          next: (attempts) => {
            this.selectedContract.contactHistory = attempts;
            this.attemptsData = attempts;
          },
          error: (e) => {
            console.log(e);
          },
        });
      },
      error: (e) => {
        console.log(e);
      },
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
    switch (outcome) {
      case "SPOKE_TO_CLIENT":
        return "Falou com o Cliente";
      case "SPOKE_TO_RELATIVE":
        return "Falou com o Familiar";
      case "BUSY_LINE":
        return "Linha Ocupada";
      case "INVALID_NUMBER":
        return "Número Inválido";
      case "CLIENT_REQUESTED_CALLBACK_LATER":
        return "Cliente Solicitou Retorno";
      case "NO_ANSWER":
        return "Não Atendido";
      case "CLIENT_VALIDATED_CONTRACT":
        return "Cliente Validou o Contrato";
      case "CLIENT_REJECTED_CONTRACT":
        return "Cliente Rejeitou o Contrato";
      case "CLIENT_REQUESTED_CHANGES":
        return "Cliente Solicitou Alterações";
      case "VOICEMAIL_LEFT":
        return "Deixou Recado na Caixa Postal";
      default:
        return "Outro";
    }
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
      case "CLIENT_VALIDATED_INSTALATION":
        return "success";
      case "Não Atendido":
        return "danger";
      case "CLOSED_WITHOUT_CONTACT":
        return "warn";
      default:
        return "info";
    }
  }

  showTheAttemptNotes() {
    const id = this.selectedContract.id;
    console.log("Buscando histórico para id:", id);

    this.registerClientService.getContactByIdAttempts(id).subscribe({
      next: (response) => {
        console.log("Histórico recebido:", response);
        this.selectedContract.contactHistory = response;
        this.attemptsData = response;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  submitContactAttempt() {
    const contactId =
      this.selectedContract.contactAfterSaleId || this.selectedContract.id;
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
          this.showTheAttemptNotes();
          this.loadContracts();
        },
        error: (e) => {
          console.log("Erro postContactAttempt:", e);
        },
      });
  }
}
