// src/app/features/olt/pages/olt-query-by-slot/olt-query-by-slot.component.ts
import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common"; // Adicionar DatePipe
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { MessageService } from "primeng/api";

import { OltService } from "../../services/olt.service";

// PrimeNG Modules
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ButtonModule } from "primeng/button";
// TableModule não é mais o principal, mas pode ser usado dentro do modal se necessário
import { PanelModule } from "primeng/panel";
import { ToastModule } from "primeng/toast";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { CardModule } from "primeng/card"; // Para os cards das ONTs
import { DialogModule } from "primeng/dialog"; // Para o modal de detalhes
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { SlotInfoSummaryDto, OLTs, OntInfoSummaryDto } from "../../../../interfaces/olt.model";
import { ScrollerModule } from "primeng/scroller";

@Component({
  selector: "app-olt-query-by-slot",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    PanelModule,
    ToastModule,
    ProgressSpinnerModule,
    CardModule,
    DialogModule,
    TagModule,
    TooltipModule,
    ScrollerModule
  ],
  templateUrl: "./olt-query-by-slot.component.html",
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OltQueryBySlotComponent implements OnInit {
  private fb = inject(FormBuilder);
  private oltService = inject(OltService);
  private messageService = inject(MessageService);

  queryForm!: FormGroup;
  results$: Observable<SlotInfoSummaryDto[]> = of([]); // Continua sendo um array de SlotInfoSummaryDto
  isLoading = false;
  hasSearched = false;

  oltOptions: { label: string; value: OLTs }[];

  // Para o Modal de Detalhes da ONT
  displayOntDetailModal = false;
  selectedOntDetail?: OntInfoSummaryDto;

  constructor() {
    this.oltOptions = Object.values(OLTs).map((olt) => ({
      label: olt.replace(/_/g, " "),
      value: olt,
    }));
  }

  ngOnInit(): void {
    this.queryForm = this.fb.group({
      slot: [
        "",
        [Validators.required, Validators.pattern("^[0-9]+(/[0-9]+)*$")],
      ],
      olt: [null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha os campos corretamente.",
      });
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    const { slot, olt } = this.queryForm.value;

    this.results$ = this.oltService.getOntSummaryBySlot(slot, olt).pipe(
      tap(() => (this.isLoading = false)),
      catchError((err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro na Consulta",
          detail: err.message || "Falha ao buscar dados do slot.",
        });
        this.isLoading = false;
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false
      })
    );
  }

  showOntDetails(ont: OntInfoSummaryDto): void {
    this.selectedOntDetail = ont;
    this.displayOntDetailModal = true;
  }

  // Helper para a severidade da tag de status da ONT
  getOntStatusSeverity(status: string | undefined): any {
    if (!status) return "info";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("online")) return "success";
    if (
      lowerStatus.includes("offline") ||
      lowerStatus.includes("los") ||
      lowerStatus.includes("dying-gasp")
    )
      return "danger";
    // Adicione outros mapeamentos de status para severidade se necessário
    return "info";
  }

    // Função trackBy para a lista de Portas
  trackByPort(index: number, portInfo: SlotInfoSummaryDto): string {
    return portInfo.port; // Use um ID único da porta, como o nome/número dela
  }

  // Função trackBy para a lista de ONTs
  trackByOnt(index: number, ont: OntInfoSummaryDto): string {
    return ont.sn; // O Serial Number é um ótimo identificador único
  }
}
