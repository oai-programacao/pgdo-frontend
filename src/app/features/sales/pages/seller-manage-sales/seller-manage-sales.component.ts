import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { CreateSaleDto, SaleAccessionStatus, SaleAccessionStatusLabels, SaleContractStatus, SaleContractStatusLabels, SaleStatus, SaleStatusLabels, UpdateSaleDto, ViewSaleDto } from '../../../../interfaces/sales.model';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { CustomPageResponse } from '../../../../interfaces/service-order.model';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-seller-manage-sales',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule,
    SelectModule, 
    DatePickerModule, 
    InputNumberModule, 
    DialogModule, 
    ToastModule,
    ToolbarModule, 
    TagModule, 
    TooltipModule, 
    TextareaModule,
    FieldsetModule
  ],
  templateUrl: './seller-manage-sales.component.html',
  styleUrl: './seller-manage-sales.component.scss',
  providers: [MessageService, DatePipe]
})
export class SellerManageSalesComponent implements OnInit, OnDestroy{
   // --- Injeções e Propriedades ---
  private fb = inject(FormBuilder);
  private saleService = inject(SalesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private datePipe = inject(DatePipe);
  private destroy$ = new Subject<void>();

  // Estado da Tabela
  sales: ViewSaleDto[] = [];
  totalRecords = 0;
  isLoading = true;
  rows = 10;
  first = 0;

  // Filtros
  filterForm!: FormGroup;
  statusOptions: any[];
  contractStatusOptions: any[];
  accessionStatusOptions: any[];

  // Dialogs e Forms
  displayCreateDialog = false;
  createForm!: FormGroup;
  isCreating = false;

  displayUpdateDialog = false;
  updateForm!: FormGroup;
  selectedSale: ViewSaleDto | null = null;
  isUpdating = false;

  constructor() {
    this.statusOptions = this.mapLabelsToOptions(SaleStatusLabels);
    this.contractStatusOptions = this.mapLabelsToOptions(SaleContractStatusLabels);
    this.accessionStatusOptions = this.mapLabelsToOptions(SaleAccessionStatusLabels);
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.initCreateForm();
    this.initUpdateForm();
    this.syncFiltersWithUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      clientCode: [null],
      clientName: [null],
      contractNumber: [null],
      status: [null],
      contractStatus: [null],
      accessionStatus: [null],
    });
  }

  private initCreateForm(): void {
    this.createForm = this.fb.group({
      saleDate: [null, Validators.required],
      contractNumber: [null, [Validators.required, Validators.pattern('^[0-9]+$')]],
      contractStatus: [null, Validators.required],
      accessionStatus: [null, Validators.required]
    });
  }
  
  private initUpdateForm(): void {
    this.updateForm = this.fb.group({
      contractStatus: [null],
      accessionStatus: [null],
      observation: ['']
    });
  }

  private syncFiltersWithUrl(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
      this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
      this.first = page * this.rows;

      const filters = {
        clientCode: params.get('clientCode') ? Number(params.get('clientCode')) : null,
        clientName: params.get('clientName') || null,
        contractNumber: params.get('contractNumber') ? Number(params.get('contractNumber')) : null,
        status: params.get('status') as SaleStatus || null,
        contractStatus: params.get('contractStatus') as SaleContractStatus || null,
        accessionStatus: params.get('accessionStatus') as SaleAccessionStatus || null,
      };
      this.filterForm.patchValue(filters, { emitEvent: false });
      this.loadSales();
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

  isUpdateDisabled(sale: ViewSaleDto): boolean {
    if (sale.saleStatus === SaleStatus.COMPLETED || sale.saleStatus === SaleStatus.CANCELED || sale.saleStatus === SaleStatus.APPROVED) {
      return true; // Não permite atualização se a venda já foi concluída ou cancelada
    }
    return false; // Permite atualização se a venda estiver pendente
  }

  loadSales(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);
    const filters = this.filterForm.value;

    this.saleService.getSales(page, this.rows, filters.status, filters.clientCode, filters.clientName, undefined, filters.contractStatus, filters.accessionStatus, filters.sellerId).subscribe({
      next: (dataPage: CustomPageResponse<ViewSaleDto>) => {
        this.sales = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar vendas.' });
        this.isLoading = false;
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

  // --- Lógica de Criação ---
  openCreateDialog(): void {
    this.createForm.reset();
    this.displayCreateDialog = true;
  }

  submitCreateForm(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isCreating = true;
    const formValue = this.createForm.value;

    const dto: CreateSaleDto = formValue;

    this.saleService.createSale(dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Venda criada com sucesso!' });
        this.displayCreateDialog = false;
        this.isCreating = false;
        this.loadSales(); // Recarrega
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar a venda.' });
        this.isCreating = false;
      }
    });
  }
  
  // --- Lógica de Edição ---
  openUpdateDialog(sale: ViewSaleDto): void {
    this.selectedSale = sale;
    this.updateForm.patchValue({
      contractStatus: sale.contractStatus,
      accessionStatus: sale.accessionStatus,
      observation: sale.observation
    });
    this.displayUpdateDialog = true;
    console.log(this.updateForm.value);
  }

  submitUpdateForm(): void {
    if (this.updateForm.invalid || !this.selectedSale) {
      return;
    }
    this.isUpdating = true;
    
    // COMO O BACKEND NÃO EXISTE, MOSTRAMOS UMA MENSAGEM E FECHAMOS
    const dto: UpdateSaleDto = this.updateForm.value;
       this.saleService.updateSale(this.selectedSale.id, dto).subscribe({
      next: (updatedSale) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Venda #${updatedSale.contractNumber} atualizada.` });
        this.displayUpdateDialog = false;
        this.isUpdating = false;
        this.loadSales(); // Recarrega a lista para refletir a mudança
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar a venda.' });
        this.isUpdating = false;
        console.error(err);
      }
    });
  }

  // --- Helpers de Template ---
  mapLabelsToOptions = (labels: Record<string, string>): any[] => Object.entries(labels).map(([value, label]) => ({ label, value }));
  getStatusLabel = (status: SaleStatus) => SaleStatusLabels[status] || status;
  getContractStatusLabel = (status: SaleContractStatus) => SaleContractStatusLabels[status] || status;
  getAccessionStatusLabel = (status: SaleAccessionStatus) => SaleAccessionStatusLabels[status] || status;

  getStatusSeverity(status: SaleStatus): any {
    const statusMap: Record<string, string> = { 'COMPLETED': 'success', 'APPROVED': 'success', 'PENDING': 'warning', 'CANCELED': 'danger' };
    return statusMap[status] || 'info';
  }
}
