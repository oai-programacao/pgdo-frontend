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
  contractNumber = '';
  loading = false;

  statusType: StatusType = null;
  statusMessage = '';

  get statusIcon(): string {
    return { success: '✓', error: '✕', warn: '⚠' }[this.statusType!] ?? '';
  }

  constructor(private financialService: FinancialService) { }


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
      error: (err) => {
        if (err.status === 504) {
          this.setStatus(
            'error',
            'Não foi possível gerar o carnê. O serviço financeiro demorou para responder. Tente novamente em alguns instantes.'
          );
        } else if (err.status === 502) {
          this.setStatus(
            'error',
            'O serviço financeiro está temporariamente indisponível. Verifique sua conexão ou tente mais tarde.'
          );
        } else if (err.status === 404) {
          this.setStatus(
            'warn',
            'Contrato não encontrado. Verifique o número informado e tente novamente.'
          );
        } else if (err.status === 0) {
          this.setStatus(
            'error',
            'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
          );
        } else {
          this.setStatus(
            'error',
            'Ocorreu um erro inesperado. Por favor, tente novamente ou contate o suporte.'
          );
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

  private setStatus(type: StatusType, message: string): void {
    this.statusType = type;
    this.statusMessage = message;
  }
}