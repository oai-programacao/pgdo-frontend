import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractCodePlanDTO, FinancialService } from './service/financial.service';

type StatusType = 'success' | 'error' | 'warn' | null;
type Mode = 'sync' | 'manual';

@Component({
  selector: 'app-financial',
  imports: [FormsModule, CommonModule],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.scss'
})
export class FinancialComponent {

  // ── Modo ─────────────────────────────────────────────────
  mode: Mode = 'sync';

  // ── Gerar Carnê ──────────────────────────────────────────
  loading = false;
  statusType: StatusType = null;
  statusMessage = '';

  // ── Modo Sync ────────────────────────────────────────────
  cpf = '';
  syncLoading = false;
  syncStatusType: StatusType = null;
  syncStatusMessage = '';

  clientId: string | null = null;
  contracts: ContractCodePlanDTO[] = [];
  contractsLoading = false;
  selectedContract = '';

  // ── Modo Manual ──────────────────────────────────────────
  manualContract = '';

  // ── Icons ─────────────────────────────────────────────────
  get statusIcon(): string {
    return { success: '✓', error: '✕', warn: '⚠' }[this.statusType!] ?? '';
  }

  get syncStatusIcon(): string {
    return { success: '✓', error: '✕', warn: '⚠' }[this.syncStatusType!] ?? '';
  }

  constructor(private financialService: FinancialService) {}

  // ── Troca de modo ─────────────────────────────────────────
  setMode(mode: Mode): void {
    this.mode = mode;
    this.statusType = null;
  }

  // ── Sincronizar cliente ───────────────────────────────────
  syncClient(): void {
    const doc = this.cpf.trim();

    if (!doc) {
      this.setSyncStatus('warn', 'Informe o CPF do cliente.');
      return;
    }

    this.syncLoading = true;
    this.syncStatusType = null;
    this.contracts = [];
    this.selectedContract = '';
    this.clientId = null;

    this.financialService.searchAndRegisterClient(doc).subscribe({
      next: (res: any) => {
        const { foundInRBX, foundInPGDO, message, client } = res;

        if (!foundInRBX && !foundInPGDO) {
          this.setSyncStatus('warn', message ?? 'Cliente não encontrado. Verifique o CPF informado.');
          this.syncLoading = false;
          return;
        }

        if (foundInRBX && client?.id) {
          this.clientId = client.id;
          this.setSyncStatus('success', message ?? 'Cliente sincronizado! Carregando contratos...');
          this.loadContracts(client.id);
        } else {
          this.setSyncStatus('warn', message ?? 'Situação não identificada. Contate o suporte.');
        }

        this.syncLoading = false;
      },
      error: (err) => {
        if (err.status === 0) {
          this.setSyncStatus('error', 'Sem conexão com o servidor.');
        } else {
          this.setSyncStatus('error', 'Erro inesperado ao sincronizar. Tente novamente.');
        }
        this.syncLoading = false;
      },
    });
  }

  // ── Buscar contratos por clientId ────────────────────────
  loadContracts(clientId: string): void {
    this.contractsLoading = true;
    this.contracts = [];

    this.financialService.getContractsByClientId(clientId).subscribe({
      next: (contracts: any[]) => {
        this.contracts = contracts;
        if (contracts.length === 1) {
          this.selectedContract = contracts[0].codeContractRbx;
        }
        this.contractsLoading = false;
      },
      error: () => {
        this.setSyncStatus('warn', 'Cliente sincronizado, mas não foi possível carregar os contratos.');
        this.contractsLoading = false;
      },
    });
  }

  // ── Resetar fluxo sync ───────────────────────────────────
  resetSync(): void {
    this.cpf = '';
    this.clientId = null;
    this.contracts = [];
    this.selectedContract = '';
    this.syncStatusType = null;
    this.statusType = null;
  }

  // ── Gerar Carnê PDF ──────────────────────────────────────
  fetchCarne(contractNumber: string): void {
    const value = contractNumber?.trim();

    if (!value) {
      this.setStatus('warn', 'Selecione ou informe um contrato antes de continuar.');
      return;
    }

    this.loading = true;
    this.statusType = null;

    this.financialService.getCarne(value).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        window.open(objectUrl, '_blank');
        URL.revokeObjectURL(objectUrl);
        this.setStatus('success', 'Carnê baixado com sucesso! Verifique seus downloads.');
        this.loading = false;
      },
      error: async (err) => {
        if (err.error instanceof Blob) await err.error.text();

        if (err.status === 504) {
          this.setStatus('error', 'O serviço financeiro demorou para responder. Tente novamente em instantes.');
        } else if (err.status === 502) {
          this.setStatus('error', 'O serviço financeiro está indisponível. Tente mais tarde.');
        } else if (err.status === 404) {
          this.setStatus('warn', 'Contrato não encontrado. Verifique o número informado.');
        } else if (err.status === 0) {
          this.setStatus('error', 'Sem conexão com o servidor.');
        } else {
          this.setStatus('error', 'Erro inesperado. Verifique se o cliente está sincronizado ou contate o suporte.');
        }
        this.loading = false;
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  private setStatus(type: StatusType, message: string): void {
    this.statusType = type;
    this.statusMessage = message;
  }

  private setSyncStatus(type: StatusType, message: string): void {
    this.syncStatusType = type;
    this.syncStatusMessage = message;
  }
}