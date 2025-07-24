import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
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
import { ViewRegisterClientResponseDto } from "../../../../interfaces/register-client.model";
import { Tag } from "primeng/tag";
import { CpfCnpjPipe } from "../../../../shared/pipes/cpf-cnpj.pipe";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { PhonesPipe } from "../../../../shared/pipes/phones.pipe";
import { TimelineModule } from 'primeng/timeline';

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
    TimelineModule
],
  templateUrl: "./confirm-installation.component.html",
  styleUrl: "./confirm-installation.component.scss",
  providers: [FormBuilder, RegisterClientService, CpfCnpjPipe, MessageService],
})
export class ConfirmInstalationComponent implements OnInit {
  form!: FormGroup;

  maxDate: Date | undefined;
  selectedContract: any = null;
  responseData!: ViewRegisterClientResponseDto[];
  totalRecords: number = 0;
  isLoading: boolean = false;
  rows = 10;
  first = 0;

  

  detailsVisible = false;

  private readonly fb = inject(FormBuilder);
  private readonly registerClientService = inject(RegisterClientService);
  private readonly messageService = inject(MessageService);

  statusOptions = [
    { label: "Instalado", value: "INSTALLED" },
    { label: "Não Instalado", value: "NOT_INSTALLED" },
  ];

  constructor() {
    this.maxDate = new Date();
  }

  detailsVisibleTrue(contract: any) {
    this.detailsVisible = true;
    this.selectedContract = contract;

     this.selectedContract = {
    ...contract,
   contactHistory: [
  {
    date: '2025-07-23T14:30:00',
    user: 'João Ninguém',
    notes: 'Cliente não atendeu.',
    type: 'Telefone',
    result: 'Não atendido',
    outcome: 'Não atendido' 
  },
  {
    date: '2025-07-22T10:15:00',
    user: 'Maria Silva',
    notes: 'Contato realizado com sucesso.',
    type: 'WhatsApp',
    result: 'Atendido',
    outcome: 'Atendido' 
  }
]
  };
  }

  ngOnInit() {
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
    if(outcome === 'Atendido') return 'Atendido';
    if(outcome === 'Não atendido') return 'Não Atendido';
    return 'Outro';
  }

getStatusSeverity(outcome: string): "success" | "danger" | "warn" | "info" | "secondary" | "contrast" | undefined {
  switch(outcome){
    case 'Atendido':
      return 'success';
      case 'Não Atendido':
        return 'danger';
        default:
          return 'info';
  }
}


registerNewTrytoContact(){

  this.messageService.add({
    severity: 'info',
    summary: 'Atenção',
    detail: 'Funcionalidade ainda não implementada.'
  })
  
}
}
