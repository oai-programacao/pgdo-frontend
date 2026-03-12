import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputMaskModule } from "primeng/inputmask";
import { SelectModule } from "primeng/select";
import { DatePickerModule } from "primeng/datepicker";
import { TableModule } from "primeng/table";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AuditSellerService } from "../audit-seller/service/audit-seller.service";
import {
  AuditFlowFilterDTO,
  AuditFlowResponseDTO,
} from "../../interfaces/audit-request.model";

@Component({
  selector: "app-auditoria-vendedor",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    ProgressSpinnerModule,
  ],
  templateUrl: "./audit-seller.component.html",
  styleUrl: "./audit-seller.component.scss",
  providers: [MessageService],
})
export class AuditSellerComponent {
  // =========================================================
  // INJEÇÕES
  // =========================================================
  private readonly messageService = inject(MessageService);
  private readonly auditFlowService = inject(AuditSellerService);

  // =========================================================
  // PROPRIEDADES
  // =========================================================
  auditorias: AuditFlowResponseDTO[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;
  searched: boolean = false;
  currentPage: number = 0;
  pageSize: number = 20;

  filtros: AuditFlowFilterDTO = {
    nameSeller: "",
    cpfClientSearch: "",
    typeFlow: null,
    dataInicio: null,
    dataFim: null,
  };

  typeFlowOptions = [
    { label: "💰 Venda", value: "SALE" },
    { label: "🔍 Busca de Cliente", value: "SEARCH_CLIENT" },
    { label: "⬆️ Upgrade", value: "UPGRADE" },
    { label: "⬇️ Downgrade", value: "DOWNGRADE" },
    { label: "📍 Mudança de Endereço", value: "CHANGE_OF_ADDRESS" },
    { label: "❌ Cancelamento", value: "CANCEL" },
    { label: "⏸️ Suspensão Ativa", value: "ACTIVE_CONTRACT_SUSPENSE" },
    { label: "📅 Alterar Vencimento", value: "CHANGE_DATE_EXPIRED" },
    { label: "👤 Transferência de Titularidade", value: "TRANSFER_TITLE" },
    { label: "🔓 Desbloquear Contrato", value: "UNLOCK_CONTRACT" },
    { label: "🚫 Cancelar Contrato", value: "CANCEL_CONTRACT" },
    { label: "⏸️ Suspender Contrato", value: "SUSPENSE_CONTRACT" },
    {
      label: "🗓️ Cancelar Agend. Suspensão",
      value: "CANCEL_SUSPENSE_SCHEDULING",
    },
    { label: "🤝 Renegociação de Dívida", value: "RENEGOTIATION" },
  ];

  // =========================================================
  // BUSCA
  // =========================================================
  buscar(page: number = 0) {
    this.isLoading = true;
    this.searched = true;
    this.currentPage = page;

    const params: any = { page, size: this.pageSize };
    if (this.filtros.nameSeller?.trim())
      params.nameSeller = this.filtros.nameSeller.trim();
    if (this.filtros.cpfClientSearch?.trim())
      params.cpfClientSearch = this.filtros.cpfClientSearch;
    if (this.filtros.typeFlow) params.typeFlow = this.filtros.typeFlow;
    if (this.filtros.dataInicio)
      params.dataInicio = this.filtros.dataInicio.toISOString();
    if (this.filtros.dataFim) {
      const fim = new Date(this.filtros.dataFim);
      fim.setHours(23, 59, 59);
      params.dataFim = fim.toISOString();
    }

    this.auditFlowService.filtrar(params).subscribe({
      next: (data) => {
        this.auditorias = data.content;
        this.totalRecords = data.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Não foi possível buscar os registros de auditoria.",
        });
      },
    });
  }

  limparFiltros() {
    this.filtros = {
      nameSeller: "",
      cpfClientSearch: "",
      typeFlow: null,
      dataInicio: null,
      dataFim: null,
    };
    this.auditorias = [];
    this.totalRecords = 0;
    this.currentPage = 0;
    this.searched = false;
  }

  // =========================================================
  // UTILITÁRIOS
  // =========================================================
  getInitials(name: string): string {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

  getFlowLabel(typeFlow: string): string {
    return (
      this.typeFlowOptions.find((o) => o.value === typeFlow)?.label ?? typeFlow
    );
  }

  getFlowClass(typeFlow: string): string {
    const map: Record<string, string> = {
      SALE: "flow-sale",
      SEARCH_CLIENT: "flow-search",
      UPGRADE: "flow-upgrade",
      DOWNGRADE: "flow-downgrade",
      CHANGE_OF_ADDRESS: "flow-address",
      CANCEL: "flow-cancel",
      ACTIVE_CONTRACT_SUSPENSE: "flow-active",
      CHANGE_DATE_EXPIRED: "flow-date",
      TRANSFER_TITLE: "flow-transfer",
      UNLOCK_CONTRACT: "flow-unlock",
      CANCEL_CONTRACT: "flow-cancel-contract",
      SUSPENSE_CONTRACT: "flow-suspense",
      CANCEL_SUSPENSE_SCHEDULING: "flow-cancel-suspense",
      RENEGOTIATION: "flow-renegotiation",
    };
    return map[typeFlow] ?? "";
  }

  getFlowIcon(typeFlow: string): string {
    const map: Record<string, string> = {
      SALE: "pi pi-dollar",
      SEARCH_CLIENT: "pi pi-search",
      UPGRADE: "pi pi-arrow-up",
      DOWNGRADE: "pi pi-arrow-down",
      CHANGE_OF_ADDRESS: "pi pi-home",
      CANCEL: "pi pi-times",
      ACTIVE_CONTRACT_SUSPENSE: "pi pi-check-circle",
      CHANGE_DATE_EXPIRED: "pi pi-calendar",
      TRANSFER_TITLE: "pi pi-users",
      UNLOCK_CONTRACT: "pi pi-unlock",
      CANCEL_CONTRACT: "pi pi-ban",
      SUSPENSE_CONTRACT: "pi pi-pause",
      CANCEL_SUSPENSE_SCHEDULING: "pi pi-stopwatch",
      RENEGOTIATION: "pi pi-handshake",
    };
    return map[typeFlow] ?? "pi pi-circle";
  }

  onPageChange(event: any) {
  this.pageSize = event.rows;
  const page = Math.floor(event.first / event.rows);
  this.buscar(page);
}
}
