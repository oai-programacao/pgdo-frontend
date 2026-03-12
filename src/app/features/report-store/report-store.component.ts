import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { forkJoin, Observable } from 'rxjs';
import { ReportStoreService } from './service/report-store.service';

interface ReportOption { label: string; value: string; }
interface GeneratedPdf { label: string; periodLabel: string; safeUrl: SafeResourceUrl | null; blobUrl: string; filename: string; }
interface ComparisonPdf extends GeneratedPdf { tag: 'current' | 'previous'; }
interface HistoryItem { label: string; blobUrl: string; safeUrl: SafeResourceUrl | null; filename: string; }

@Component({
  selector: 'app-report-store',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CalendarModule,
    MultiSelectModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './report-store.component.html',
  styleUrl: './report-store.component.scss',
})
export class ReportStoreComponent implements OnDestroy {

  // ── Seção 1: Gerar por período ───────────────────────────────────────────
  dateRange: Date[] | null = null;
  selectedReports: string[] = [];
  isLoading = false;

  // ── Seção 2: Comparativo Mensal ──────────────────────────────────────────
  selectedCompareReport: string | null = null;
  isLoadingCompare = false;

  // ── Shared ───────────────────────────────────────────────────────────────
  today = new Date();
  generatedPdfs: GeneratedPdf[] = [];
  comparisonPdfs: ComparisonPdf[] = [];
  history: HistoryItem[] = [];

  readonly isMobile: boolean = /iPhone|iPad|iPod|Android|Mobile|Tablet/i.test(navigator.userAgent);

  private _allBlobUrls: string[] = [];

  readonly currentMonthLabel: string;
  readonly prevMonthLabel: string;

  reportOptions: ReportOption[] = [
    { label: 'Ranking de Vendas', value: 'vendas' },
    { label: 'Ranking de Upgrades', value: 'upgrade' },
    { label: 'Ranking de Downgrades', value: 'downgrade' },
    { label: 'Ranking de Cancelamentos', value: 'cancel' },
    { label: 'Ranking por Motivo de Cancel.', value: 'cancel_reason' },
    { label: 'Ranking de Transferências', value: 'transferOwnership' },
    { label: 'Ranking de Suspensões', value: 'suspensao' },
    { label: 'Ranking de Mudança de Endereço', value: 'mudancaEndereco' },
    { label: 'Ranking de Mudança de Vencimento', value: 'mudancaVencimento' },
    { label: 'Ranking de Envio de Pagamento', value: 'envioPagamento' },
    { label: 'Ranking de Lib. de Confiança', value: 'liberacaoConfianca' },
  ];

  constructor(
    private reportService: ReportStoreService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
  ) {
    const now = new Date();
    const opts = { month: 'long', year: 'numeric' } as const;
    this.currentMonthLabel = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('pt-BR', opts);
    this.prevMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString('pt-BR', opts);
  }

  // ── Validações ────────────────────────────────────────────────────────────
  get dateRangeInvalid(): boolean {
    const [s, e] = this.dateRange ?? [];
    return !!s && !!e && e < s;
  }

  get canGenerate(): boolean {
    return !!this.dateRange?.[0] && !!this.dateRange?.[1] &&
      !this.dateRangeInvalid && this.selectedReports.length > 0 &&
      !this.isLoading && !this.isLoadingCompare;
  }

  get canCompare(): boolean {
    return !!this.selectedCompareReport && !this.isLoading && !this.isLoadingCompare;
  }

  // ── Seção 1: Gerar por período ────────────────────────────────────────────
  generateReports(): void {
    if (!this.canGenerate) return;

    this.isLoading = true;
    this.generatedPdfs = [];

    const s = this._fmt(this.dateRange![0]);
    const e = this._fmt(this.dateRange![1]);
    const periodLabel = `${this._display(this.dateRange![0])} — ${this._display(this.dateRange![1])}`;

    const requests: Record<string, Observable<Blob>> = {};
    this.selectedReports.forEach(r => requests[r] = this._getRequest(r, s, e));

    forkJoin(requests).subscribe({
      next: (results) => {
        Object.entries(results).forEach(([key, blob]) => {
          const pdf = this._makePdf(key, blob as Blob, s, e, periodLabel);
          this.generatedPdfs.push(pdf);
          this._addToHistory(pdf);
        });
        this.isLoading = false;
        this.messageService.add({
          severity: 'success', summary: 'Relatórios gerados',
          detail: `${this.generatedPdfs.length} relatório(s) gerado(s) com sucesso.`, life: 3000
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error', summary: 'Erro ao gerar',
          detail: 'Não foi possível gerar um ou mais relatórios.', life: 5000
        });
      },
    });
  }

  // ── Seção 2: Comparativo Mensal ───────────────────────────────────────────
  generateMonthlyComparison(): void {
    if (!this.canCompare) return;

    this.isLoadingCompare = true;
    this.comparisonPdfs = [];

    const now = new Date();
    const currFirst = new Date(now.getFullYear(), now.getMonth(), 1);
    const currLast = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const prevFirst = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevLast = new Date(now.getFullYear(), now.getMonth(), 0);

    const s1 = this._fmt(currFirst); const e1 = this._fmt(currLast);
    const s2 = this._fmt(prevFirst); const e2 = this._fmt(prevLast);

    forkJoin({
      current: this._getRequest(this.selectedCompareReport!, s1, e1),
      previous: this._getRequest(this.selectedCompareReport!, s2, e2),
    }).subscribe({
      next: ({ current, previous }) => {
        const currLabel = `${this._display(currFirst)} — ${this._display(currLast)}`;
        const prevLabel = `${this._display(prevFirst)} — ${this._display(prevLast)}`;

        this.comparisonPdfs = [
          { ...this._makePdf(this.selectedCompareReport!, current, s1, e1, currLabel), tag: 'current' },
          { ...this._makePdf(this.selectedCompareReport!, previous, s2, e2, prevLabel), tag: 'previous' },
        ];

        this.isLoadingCompare = false;
        this.messageService.add({
          severity: 'success', summary: 'Comparativo gerado',
          detail: `${this.currentMonthLabel} vs ${this.prevMonthLabel}.`, life: 4000
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoadingCompare = false;
        this.messageService.add({
          severity: 'error', summary: 'Erro no comparativo',
          detail: 'Não foi possível gerar o comparativo mensal.', life: 5000
        });
      },
    });
  }

  // ── Histórico ─────────────────────────────────────────────────────────────
  reopenFromHistory(item: HistoryItem): void {
    this.generatedPdfs = [{
      label: item.label, periodLabel: '',
      safeUrl: item.safeUrl, blobUrl: item.blobUrl, filename: item.filename
    }];
  }

  clearAll(): void {
    this.history = []; this.generatedPdfs = []; this.comparisonPdfs = [];
    this._revokeAll();
  }

  clearFilters(): void { this.dateRange = null; this.selectedReports = []; }

  clearComparison(): void { this.comparisonPdfs = []; }

  clearCompareFilters(): void { this.selectedCompareReport = null; }

  // ── Helpers públicos ──────────────────────────────────────────────────────
  getReportLabel(value: string | null): string {
    return this.reportOptions.find(o => o.value === value)?.label ?? '';
  }

  openInNewTab(blobUrl: string): void { window.open(blobUrl, '_blank'); }

  // ── Helpers privados ──────────────────────────────────────────────────────
  private _makePdf(key: string, blob: Blob, s: string, e: string, periodLabel: string): GeneratedPdf {
    const blobUrl = URL.createObjectURL(blob);
    const safeUrl = this.isMobile ? null : this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this._allBlobUrls.push(blobUrl);
    return {
      label: this.getReportLabel(key), periodLabel, safeUrl, blobUrl,
      filename: `relatorio-loja-${key}-${s}-a-${e}.pdf`
    };
  }

  private _addToHistory(pdf: GeneratedPdf): void {
    if (!this.history.some(h => h.filename === pdf.filename))
      this.history.unshift({ label: pdf.label, blobUrl: pdf.blobUrl, safeUrl: pdf.safeUrl, filename: pdf.filename });
  }

  private _getRequest(key: string, s: string, e: string): Observable<Blob> {
    const map: Record<string, Observable<Blob>> = {
      'vendas': this.reportService.getVendasRankingReport(s, e),
      'upgrade': this.reportService.getUpgradeRankingReport(s, e),
      'downgrade': this.reportService.getDowngradeRankingReport(s, e),
      'cancel': this.reportService.getCancelRankingReport(s, e),
      'cancel_reason': this.reportService.getCancelReasonRankingReport(s, e),
      'transferOwnership': this.reportService.getTransferOwnershipRankingReport(s, e),
      'suspensao': this.reportService.getSuspensionRankingReport(s, e),
      'mudancaEndereco': this.reportService.getUpdateAddressRankingReport(s, e),
      'mudancaVencimento': this.reportService.getDateTransferRankingReport(s, e),
      'envioPagamento': this.reportService.getPaymentShipmentRankingReport(s, e),
      'liberacaoConfianca': this.reportService.getTrustReleaseRankingReport(s, e),
    };
    return map[key];
  }

  private _fmt(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private _display(d: Date): string {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private _revokeAll(): void {
    this._allBlobUrls.forEach(u => URL.revokeObjectURL(u));
    this._allBlobUrls = [];
  }

  ngOnDestroy(): void { this._revokeAll(); }
}