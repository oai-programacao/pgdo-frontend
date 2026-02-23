import { Component } from '@angular/core';
import { FinancialService } from './service/financialService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type StatusType = 'success' | 'error' | 'warn' | null;

@Component({
  selector: 'app-financial',
  imports: [FormsModule, CommonModule],
  templateUrl: './financial.component.html',
  styleUrl: './financial.component.scss'
})
export class FinancialComponent {

  // ── Carnê ────────────────────────────────────────────────
  contractNumber = '';
  loading = false;
  statusType: StatusType = null;
  statusMessage = '';

  // ── Sync Dialog ──────────────────────────────────────────
  syncDialogOpen = false;
  syncCpf = '';
  syncLoading = false;
  syncStatusType: StatusType = null;
  syncStatusMessage = '';

  get statusIcon(): string {
    return { success: '✓', error: '✕', warn: '⚠' }[this.statusType!] ?? '';
  }

  get syncStatusIcon(): string {
    return { success: '✓', error: '✕', warn: '⚠' }[this.syncStatusType!] ?? '';
  }

  constructor(private financialService: FinancialService) {}

  // ── Gerar Carnê ──────────────────────────────────────────
  fetchCarne(): void {
    const value = this.contractNumber.trim();

    if (!value) {
      this.setStatus('warn', 'Informe o número do contrato antes de continuar.');
      return;
    }

    this.loading = true;
    this.statusType = null;

    this.financialService.getCarne(value).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = `carne-${value}.pdf`;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
        this.setStatus('success', 'Carnê baixado com sucesso! Verifique seus downloads.');
        this.loading = false;
      },
      error: async (err) => {
        if (err.error instanceof Blob) {
          await err.error.text();
        }
        if (err.status === 504) {
          this.setStatus('error', 'O serviço financeiro demorou para responder. Tente novamente em alguns instantes.');
        } else if (err.status === 502) {
          this.setStatus('error', 'O serviço financeiro está temporariamente indisponível. Tente mais tarde.');
        } else if (err.status === 404) {
          this.setStatus('warn', 'Contrato não encontrado. Verifique o número informado e tente novamente.');
        } else if (err.status === 0) {
          this.setStatus('error', 'Sem conexão com o servidor. Verifique sua internet e tente novamente.');
        } else {
          this.setStatus('error', 'Erro inesperado. Verifique se o cliente está sincronizado ou contate o suporte.');
        }
        this.loading = false;
      },
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.loading) {
      this.fetchCarne();
    }
  }

  // ── Dialog Sincronização ─────────────────────────────────
  openSyncDialog(): void {
    this.syncDialogOpen = true;
    this.syncCpf = '';
    this.syncStatusType = null;
    this.syncStatusMessage = '';
  }

  closeSyncDialog(): void {
    if (this.syncLoading) return;
    this.syncDialogOpen = false;
  }

  syncClient(): void {
    const cpf = this.syncCpf.trim();

    if (!cpf) {
      this.setSyncStatus('warn', 'Informe o CPF do cliente.');
      return;
    }

    this.syncLoading = true;
    this.syncStatusType = null;

    this.financialService.searchAndRegisterClient(cpf).subscribe({
      next: () => {
        this.setSyncStatus('success', 'Cliente sincronizado com sucesso!');
        this.syncLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.setSyncStatus('warn', 'Cliente não encontrado. Verifique o CPF informado.');
        } else if (err.status === 409) {
          this.setSyncStatus('warn', 'Cliente já está sincronizado no sistema.');
        } else if (err.status === 0) {
          this.setSyncStatus('error', 'Sem conexão com o servidor.');
        } else {
          this.setSyncStatus('error', 'Não foi possível sincronizar. Tente novamente ou contate o suporte.');
        }
        this.syncLoading = false;
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