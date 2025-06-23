import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ClientDataResponse, GenerateBillPixDto, PixResponse, SearchClientFinancialResponse, UnpaidBillsResponse } from '../../../../interfaces/client-financial.model';
import { ClientFinancialService } from '../../services/client-financial.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { QrCodeComponent } from 'ng-qrcode';
import { AccordionModule } from 'primeng/accordion';
import { Observable, of, debounceTime, distinctUntilChanged, tap, switchMap, catchError, finalize, Subject, takeUntil } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-search-client-financial',
  imports: [
    IconFieldModule,
    InputIconModule,
    CommonModule, 
    ReactiveFormsModule, 
    ToolbarModule,
    InputTextModule, 
    ButtonModule, 
    PanelModule,
    AccordionModule, 
    TableModule, 
    DialogModule, 
    ProgressSpinnerModule, 
    ToastModule,
    TooltipModule, 
    QrCodeComponent, 
    TextareaModule,
    DatePipe
  ],
  templateUrl: './search-client-financial.component.html',
  styleUrl: './search-client-financial.component.scss',
  providers: [MessageService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchClientFinancialComponent implements OnInit, OnDestroy {
  private financialService = inject(ClientFinancialService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  searchControl = new FormControl('');
  searchResults$: Observable<ClientDataResponse[]> = of([]);
  isLoadingSearch = false;

  selectedClient: ClientDataResponse | null = null;
  clientDetails: SearchClientFinancialResponse | null = null;
  isLoadingDetails = false;

  displayPixModal = false;
  pixData: PixResponse | null = null;
  isLoadingPix = false;

  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(query => this.isLoadingSearch = (query?.length ?? 0) >= 3),
      switchMap(query => {
        if (!query || query.length < 3) {
          return of([]);
        }
        return this.financialService.getFinancialData(query).pipe(
          catchError(err => {
            this.messageService.add({ severity: 'error', summary: 'Erro na Busca', detail: 'Não foi possível buscar os clientes.' });
            return of([]);
          }),
          finalize(() => this.isLoadingSearch = false)
        );
      }),
      tap(() => this.isLoadingSearch = false),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   selectClient(client: ClientDataResponse): void {
    // 1. Define o cliente selecionado IMEDIATAMENTE.
    // Isso faz com que a UI mude para a tela de detalhes.
    this.selectedClient = client;
    this.isLoadingDetails = true;
    this.clientDetails = null; // Limpa os detalhes antigos para o caso de um novo cliente ser selecionado

    // 2. Busca os detalhes financeiros para o cliente selecionado.
    this.financialService.getClientUnpaidBills(client.codigo).subscribe({
      next: (details) => {
        // --- A MÁGICA PARA EVITAR O ExpressionChangedAfter... ---
        // Adia a atribuição para o próximo ciclo de detecção de mudanças.
        setTimeout(() => {
          // 3. Atualiza o `selectedClient` com os dados mais completos (incluindo o ID do PIX)
          if (details && details.clienteDados) {
            this.selectedClient = { ...client, ...details.clienteDados };
          }
          this.clientDetails = details;
          this.isLoadingDetails = false;
          this.cdr.detectChanges(); // <<< FORÇA A ATUALIZAÇÃO DA VIEW
        }, 0);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível buscar os detalhes do cliente.' });
        this.isLoadingDetails = false;
        this.backToSearch(); // Volta para a busca em caso de erro.
      }
    });
  }

  generatePix(bill: UnpaidBillsResponse): void {
    this.isLoadingPix = true;
    this.pixData = null; // Limpa dados antigos
    this.displayPixModal = true;
    
    // 1. Verificação de segurança: Garante que um cliente foi selecionado e tem o ID necessário.
    if (!this.selectedClient || !this.selectedClient.clienteIdApiPix) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erro de Dados', 
        detail: 'ID do cliente para o PIX não foi encontrado. Por favor, selecione o cliente novamente.' 
      });
      this.isLoadingPix = false;
      this.displayPixModal = false;
      return;
    }

    // 2. Monta o DTO usando o `clienteIdApiPix` do cliente selecionado.
    const dto: GenerateBillPixDto = {
      documentos: [bill.idApiPix],
      pixGerado: [],
      clienteId: this.selectedClient.clienteIdApiPix
    };
    this.financialService.generateBillPix(dto).subscribe({
      next: (pixResponse) => {
        this.pixData = pixResponse;
        this.isLoadingPix = false;
        this.cdr.detectChanges(); // Força a atualização da view
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro PIX', detail: 'Não foi possível gerar o código PIX.' });
        this.isLoadingPix = false;
        this.displayPixModal = false;
      }
    });
  }

  async copyPixCode(code: string | undefined): Promise<void> {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      this.messageService.add({ severity: 'success', summary: 'Copiado', detail: 'Código PIX copiado para a área de transferência!' });
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível copiar o código.' });
    }
  }
  
  downloadPdf(bill: UnpaidBillsResponse): void {
    this.messageService.add({ severity: 'info', summary: 'Aguarde', detail: 'Gerando PDF do boleto...' });
    this.financialService.getBillPdf(bill.boletoPdfLink).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boleto_${bill.documento}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  backToSearch(): void {
    this.selectedClient = null;
    this.clientDetails = null;
    this.searchControl.setValue('', { emitEvent: false });
  }
}
