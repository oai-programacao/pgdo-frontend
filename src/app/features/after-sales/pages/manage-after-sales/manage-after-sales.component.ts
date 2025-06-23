import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ViewAfterSaleDto, AfterSalesStatusLabels, ContactAttemptOutcomeLabels, AfterSalesStatus, CreateContactAttemptDto, ContactAttemptOutcome } from '../../../../interfaces/after-sales.model';
import { CustomPageResponse } from '../../../../interfaces/service-order.model';
import { AfterSalesService } from '../../services/after-sales.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TimelineModule } from 'primeng/timeline';
import { SaleStatus } from '../../../../interfaces/sales.model';

@Component({
  selector: 'app-manage-after-sales',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    TagModule,
    InputTextModule, 
    InputNumberModule, 
    SelectModule, 
    DialogModule,
    TextareaModule, 
    ToastModule, 
    ToolbarModule, 
    TooltipModule, 
    FieldsetModule,
    TimelineModule, 
    DatePipe
  ],
  templateUrl: './manage-after-sales.component.html',
  styleUrl: './manage-after-sales.component.scss',
  providers: [MessageService, DatePipe]
})
export class ManageAfterSalesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private afterSalesService = inject(AfterSalesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  // Estado da Tabela
  afterSales: ViewAfterSaleDto[] = [];
  totalRecords = 0;
  isLoading = true;
  rows = 10;
  first = 0;

  // Filtros
  filterForm!: FormGroup;
  statusOptions: any[];

  // Dialogs
  displayAttemptDialog = false;
  attemptForm!: FormGroup;
  isSubmittingAttempt = false;

  displayDetailsDialog = false;
  selectedAfterSale: ViewAfterSaleDto | null = null;

  // Opções para Dropdown de Resultado do Contato
  outcomeOptions: any[];

  constructor() {
    this.statusOptions = this.mapLabelsToOptions(AfterSalesStatusLabels);
    this.outcomeOptions = this.mapLabelsToOptions(ContactAttemptOutcomeLabels);
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.initAttemptForm();
    this.syncFiltersWithUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      status: [null],
      saleId: [null],
      clientName: ['']
    });
  }

  private initAttemptForm(): void {
    this.attemptForm = this.fb.group({
      outcome: [null, Validators.required],
      notes: ['', Validators.required]
    });
  }

  private syncFiltersWithUrl(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
      this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
      this.first = page * this.rows;

      const filters = {
        status: params.get('status') as AfterSalesStatus || null,
        saleId: params.get('saleId') ? Number(params.get('saleId')) : null,
        clientName: params.get('clientName') || null,
      };
      this.filterForm.patchValue(filters, { emitEvent: false });
      this.loadAfterSales();
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.first = 0;
      this.updateUrl();
    });
  }

  loadAfterSales(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);
    const filters = this.filterForm.value;

    this.afterSalesService.getAfterSales(page, this.rows, filters.status, filters.saleId, filters.clientName)
    .subscribe({
      next: (response: CustomPageResponse<ViewAfterSaleDto>) => {
        this.afterSales = response.content;
        this.totalRecords = response.page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar pós-vendas.' });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  updateUrl(): void {
    const page = Math.floor(this.first / this.rows);
    const formValues = this.filterForm.value;
    const queryParams: any = { page, size: this.rows };
    for (const key in formValues) {
      if (formValues[key]) {
        queryParams[key] = formValues[key];
      }
    }
    this.router.navigate([], { relativeTo: this.route, queryParams });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  // --- Lógica dos Dialogs ---
  openDetailsDialog(afterSale: ViewAfterSaleDto): void {
    this.selectedAfterSale = afterSale;
    this.displayDetailsDialog = true;
  }

  openContactAttemptDialog(afterSale: ViewAfterSaleDto): void {
    this.selectedAfterSale = afterSale;
    this.attemptForm.reset();
    this.displayAttemptDialog = true;
  }

  submitContactAttempt(): void {
    if (this.attemptForm.invalid || !this.selectedAfterSale) {
      this.attemptForm.markAllAsTouched();
      return;
    }
    this.isSubmittingAttempt = true;
    const dto: CreateContactAttemptDto = this.attemptForm.value;

    this.afterSalesService.registerContactAttempt(this.selectedAfterSale.id, dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Tentativa de contato registrada!' });
        this.isSubmittingAttempt = false;
        this.displayAttemptDialog = false;
        this.loadAfterSales();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao registrar tentativa.' });
        this.isSubmittingAttempt = false;
      }
    });
  }

  // --- Helpers de Template ---
  private mapLabelsToOptions = (labels: Record<string, string>): any[] => Object.entries(labels).map(([value, label]) => ({ label, value }));
  getStatusLabel = (status: AfterSalesStatus) => AfterSalesStatusLabels[status] || status;
  getContactAttemptOutcomeLabel = (outcome: ContactAttemptOutcome) => ContactAttemptOutcomeLabels[outcome] || outcome;

  getStatusSeverity(status: SaleStatus): any {
    const statusMap: Record<string, string> = { 'COMPLETED': 'success', 'APPROVED': 'success', 'PENDING': 'warning', 'CANCELED': 'danger' };
    return statusMap[status] || 'info';
  }
}
