import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ViewSaleDto, SaleStatusLabels, SaleContractStatusLabels, SaleAccessionStatusLabels, SaleStatus, SaleContractStatus, SaleAccessionStatus, CreateSaleDto, UpdateSaleDto, TransferSaleDto } from '../../../../interfaces/sales.model';
import { CustomPageResponse } from '../../../../interfaces/service-order.model';
import { SalesService } from '../../services/sales.service';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
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
import { EmployeeService } from '../../../employees/services/employee.service';
import { EmployeeRole, ViewEmployeeDto } from '../../../../interfaces/employee.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SignaturePadComponent } from "../../../../shared/components/signature-pad/signature-pad.component";

@Component({
  selector: 'app-admin-manage-sales',
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
    FieldsetModule,
    ConfirmDialogModule,
    SignaturePadComponent
],
  templateUrl: './admin-manage-sales.component.html',
  styleUrl: './admin-manage-sales.component.scss',
  providers: [MessageService, DatePipe, ConfirmationService]
})
export class AdminManageSalesComponent implements OnInit, OnDestroy{
  // --- Injeções e Propriedades ---
  private fb = inject(FormBuilder);
  private saleService = inject(SalesService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();

  // Estado da Tabela
  sales: ViewSaleDto[] = [];
  totalRecords = 0;
  isLoading = true;
  rows = 10;
  first = 0;

  // Opções de Colaborador
  sellers: ViewEmployeeDto[] = [];
  sellersOptions: ViewEmployeeDto[] = [];
  selectedSeller: ViewEmployeeDto | null = null;

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

  // Dialog de Transferência
  displayTransferDialog = false;
  transferForm!: FormGroup;
  isTransferring = false;

  constructor() {
    this.statusOptions = this.mapLabelsToOptions(SaleStatusLabels);
    this.contractStatusOptions = this.mapLabelsToOptions(SaleContractStatusLabels);
    this.accessionStatusOptions = this.mapLabelsToOptions(SaleAccessionStatusLabels);
  }

  ngOnInit(): void {
    this.initSellers();
    this.initFilterForm();
    this.initCreateForm();
    this.initUpdateForm();
    this.initTransferForm();
    this.syncFiltersWithUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSellers(): void {
    this.employeeService.findAll(true, EmployeeRole.STORE_EMPLOYEE).subscribe({
      next: (sellers: ViewEmployeeDto[]) => {
        this.sellers = sellers;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar vendedores.' });
        console.error(err);
      }
    })
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      clientCode: [null],
      clientName: [null],
      status: [null],
      contractStatus: [null],
      accessionStatus: [null],
      sellerId: [null]
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
        status: params.get('status') as SaleStatus || null,
        contractStatus: params.get('contractStatus') as SaleContractStatus || null,
        accessionStatus: params.get('accessionStatus') as SaleAccessionStatus || null,
        sellerId: params.get('sellerId') || null
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

  private initTransferForm(): void {
    this.transferForm = this.fb.group({
      newEmployeeId: [null, Validators.required]
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

  // --- NOVA LÓGICA DE TRANSFERÊNCIA ---
  openTransferDialog(sale: ViewSaleDto): void {
    this.selectedSale = sale;
    this.transferForm.reset();
    this.displayTransferDialog = true;
    this.sellersOptions = this.sellers.filter(seller => seller.id !== sale.seller.id);
  }

  submitTransferForm(): void {
    if (this.transferForm.invalid || !this.selectedSale) {
      return;
    }
    this.isTransferring = true;
    const dto: TransferSaleDto = {
      newEmployeeId: this.transferForm.value.newEmployeeId
    }

    this.saleService.transferSaleToAnotherSellers(this.selectedSale.id, dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Venda #${this.selectedSale?.contractNumber} transferida.` });
        this.displayTransferDialog = false;
        this.isTransferring = false;
        this.loadSales();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao transferir a venda.' });
        this.isTransferring = false;
      }
    });
  }

   confirmApprove(sale: ViewSaleDto): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja aprovar a venda do contrato #${sale.contractNumber}?`,
      header: 'Confirmar Aprovação',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sim, Aprovar',
      rejectLabel: 'Não, Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.isLoading = true;
        this.saleService.approveSale(sale.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Venda aprovada.' });
            this.loadSales();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao aprovar a venda.' });
            this.isLoading = false;
          }
        });
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
