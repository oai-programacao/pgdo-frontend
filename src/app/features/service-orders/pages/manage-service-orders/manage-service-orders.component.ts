// import { CommonModule, DatePipe } from '@angular/common';
// import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { MessageService, ConfirmationService } from 'primeng/api';
// import { ButtonModule } from 'primeng/button';
// import { CalendarModule } from 'primeng/calendar';
// import { ConfirmDialogModule } from 'primeng/confirmdialog';
// import { DialogModule } from 'primeng/dialog';
// import { DropdownModule } from 'primeng/dropdown';
// import { FieldsetModule } from 'primeng/fieldset';
// import { InputNumberModule } from 'primeng/inputnumber';
// import { InputTextModule } from 'primeng/inputtext';
// import { MultiSelectModule } from 'primeng/multiselect';
// import { ProgressSpinnerModule } from 'primeng/progressspinner';
// import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
// import { TagModule } from 'primeng/tag';
// import { TextareaModule } from 'primeng/textarea';
// import { TimelineModule } from 'primeng/timeline';
// import { ToastModule } from 'primeng/toast';
// import { ToolbarModule } from 'primeng/toolbar';
// import { TooltipModule } from 'primeng/tooltip';
// import { debounceTime, distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';
// import { EmployeeService } from '../../../employees/services/employee.service';
// import { TechnicianService } from '../../../technicians/services/technician.service';
// import { ServiceOrderService } from '../../services/service-order.service';
// import { ViewEmployeeDto } from '../../../../interfaces/employee.model';
// import { CreateServiceOrderHelperDto, CreateServiceOrderUnproductiveVisitDto, UpdateServiceOrderDto, ViewServiceOrderDto } from '../../../../interfaces/service-order.model';
// import { ViewTechnicianDto } from '../../../../interfaces/technician.model';
// import { ServiceOrderStatusLabels, TypeOfOsLabels, PeriodLabels, ServiceOrderStatus, TypeOfOs, Period, CitiesLabels } from '../../../../interfaces/enums.model';
// import { SelectModule } from 'primeng/select';
// import { DatePickerModule } from 'primeng/datepicker';
// import { FormatDurationPipe } from '../../../../shared/pipes/format-duration.pipe';

// @Component({
//   selector: 'app-manage-service-orders',
//   imports: [
//     CommonModule, 
//     ReactiveFormsModule, 
//     FormsModule,
//     TableModule, 
//     ButtonModule, 
//     InputTextModule, 
//     SelectModule, 
//     DatePickerModule,
//     TagModule, 
//     ToastModule, 
//     ToolbarModule, 
//     MultiSelectModule, 
//     InputNumberModule, 
//     TooltipModule, 
//     FieldsetModule,
//     ConfirmDialogModule, 
//     DialogModule, 
//     TextareaModule, 
//     ProgressSpinnerModule, 
//     TimelineModule, 
//     DatePipe,
//     FormatDurationPipe
//   ],
//   templateUrl: './manage-service-orders.component.html',
//   styleUrl: './manage-service-orders.component.scss',
//   providers: [MessageService, ConfirmationService, DatePipe]
// })
// export class ManageServiceOrdersComponent implements OnInit, OnDestroy{
//  // --- Injeções ---
//   private fb = inject(FormBuilder);
//   private serviceOrderService = inject(ServiceOrderService);
//   private employeeService = inject(EmployeeService);
//   private technicianService = inject(TechnicianService);
//   private router = inject(Router);
//   private route = inject(ActivatedRoute);
//   private messageService = inject(MessageService);
//   private confirmationService = inject(ConfirmationService);
//   private datePipe = inject(DatePipe);
//   private destroy$ = new Subject<void>();

//   // --- Estado da Tabela e Paginação ---
//   serviceOrders: ViewServiceOrderDto[] = [];
//   totalRecords = 0;
//   isLoading = true;
//   rows = 10;
//   first = 0;

//   // --- Filtros ---
//   filterForm!: FormGroup;
//   statusOptions: any[];
//   serviceOrderTypeOptions: any[];
//   cityOptions: any[];
//   periodOptions: any[];
//   technicians: ViewTechnicianDto[] = [];
//   responsiblePersons$!: Observable<ViewEmployeeDto[]>;

//   // --- Edição em Linha ---
//   @ViewChild('dt') table?: Table;
//   editingRowData: { [s: string]: ViewServiceOrderDto } = {};

//   // --- Dialogs e Forms ---
//   displayDetailsDialog = false;
//   displayHelperDialog = false;
//   displayUnproductiveVisitDialog = false;
//   displaySummaryDialog = false; // Para o botão de "Contagem Geral"
  
//   selectedServiceOrder: ViewServiceOrderDto | null = null;
  
//   helperForm!: FormGroup;
//   unproductiveVisitForm!: FormGroup;
//   isSubmittingSubForm = false; // Flag de loading para os sub-formulários

//   summaryData: { status: string, count: number }[] = [];
//   isLoadingSummary = false;

//   constructor() {
//     this.statusOptions = this.mapLabelsToOptions(ServiceOrderStatusLabels);
//     this.serviceOrderTypeOptions = this.mapLabelsToOptions(TypeOfOsLabels);
//     this.cityOptions = this.mapLabelsToOptions(CitiesLabels);
//     this.periodOptions = this.mapLabelsToOptions(PeriodLabels);
//   }

//   ngOnInit(): void {
//     this.initForms();
//     this.syncFiltersWithUrl();
//     this.initTechnicians();
//     this.responsiblePersons$ = this.employeeService.findAll(true);
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   private initTechnicians(): void {
//     this.technicianService.findAll(true).pipe(takeUntil(this.destroy$)).subscribe({
//       next: (technicians) => {
//         this.technicians = technicians;
//       },
//       error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar técnicos.' })
//     })
//   }

//   // --- Inicialização e Lógica de Filtros ---
//   private initForms(): void {
//     this.filterForm = this.fb.group({
//       contractNumber: [null], 
//       clientName: [''], 
//       responsiblePersonId: [null],
//       technicianId: [null], 
//       statuses: [[]], 
//       typesOfOS: [[]], 
//       cities: [[]],
//       periods: [[]], 
//       startDate: [null], 
//       endDate: [null], 
//       cabling: [null],
//     });
//     this.helperForm = this.fb.group({
//       technicianId: [null, Validators.required],
//       start: [null, Validators.required],
//       end: [null, Validators.required],
//     });
//     this.unproductiveVisitForm = this.fb.group({
//       technicianId: [null, Validators.required],
//       date: [new Date(), Validators.required],
//       observation: ['', Validators.required],
//     });
//   }

//   private syncFiltersWithUrl(): void {
//     this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
//       const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
//       this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
//       this.first = page * this.rows;

//       const filters: any = {};
//       params.keys.forEach(key => {
//         if (this.filterForm.controls[key]) {
//           const value = params.getAll(key);
//           filters[key] = value.length > 1 ? value : params.get(key);
//         }
//       });
      
//       if (params.get('startDate')) filters.startDate = new Date(params.get('startDate') + 'T00:00:00');
//       if (params.get('endDate')) filters.endDate = new Date(params.get('endDate') + 'T23:59:59');
//       if (params.has('cabling')) filters.cabling = params.get('cabling') === 'true';

//       this.filterForm.patchValue(filters, { emitEvent: false });
//       this.loadServiceOrders();
//     });

//     this.filterForm.valueChanges.pipe(
//       debounceTime(500),
//       distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
//       takeUntil(this.destroy$)
//     ).subscribe(() => {
//       this.first = 0;
//       this.updateUrl();
//     });
//   }

//    loadServiceOrders(event?: TableLazyLoadEvent): void {
//     this.isLoading = true;
//     if (event) {
//       this.first = event.first ?? 0;
//       this.rows = event.rows ?? 10;
//     }
//     const page = Math.floor(this.first / this.rows);

//     this.serviceOrderService.findAll(this.filterForm.value, page, this.rows).subscribe({
//       next: (dataPage) => {
//         this.serviceOrders = dataPage.content;
//         this.totalRecords = dataPage.page.totalElements;
//         this.isLoading = false;
//       },
//       error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar Ordens de Serviço.' })
//     });
//   }

//   updateUrl(): void {
//     const page = Math.floor(this.first / this.rows);
//     const formValues = this.filterForm.value;
//     const queryParams: any = { page, size: this.rows };

//     for (const key in formValues) {
//       const value = formValues[key];
//       if (value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
//         if ((key === 'startDate' || key === 'endDate') && value instanceof Date) {
//           queryParams[key] = value;
//         } else {
//           queryParams[key] = value;
//         }
//       }
//     }
//     this.router.navigate([], { relativeTo: this.route, queryParams });
//   }

//   clearFilters(): void { this.filterForm.reset(); }

//   // --- Lógica de Edição em Linha ---
//   onRowEditInit(serviceOrder: ViewServiceOrderDto): void {
//     this.editingRowData[serviceOrder.id] = { ...serviceOrder };
//   }

//   onRowEditSave(serviceOrder: ViewServiceOrderDto): void {
//     const { id, scheduleDate, period, technician, startOfOs, endOfOs, observation } = serviceOrder;
//     const dto: Partial<UpdateServiceOrderDto> = {
//       scheduleDate: scheduleDate || undefined,
//       period: period,
//       technician: technician,
//       startOfOs: startOfOs,
//       endOfOs: endOfOs,
//       observation: observation
//     };
    
//     this.serviceOrderService.update(id, dto).subscribe({
//       next: (updatedOs) => {
//         // Atualiza a linha na tabela localmente para uma UX mais rápida
//         const index = this.serviceOrders.findIndex(os => os.id === id);
//         if (index > -1) {
//           this.serviceOrders[index] = updatedOs;
//         }
//         delete this.editingRowData[id];
//         this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `OS #${updatedOs.contractNumber} atualizada.` });
//       },
//       error: (err) => {
//         this.onRowEditCancel(serviceOrder, this.serviceOrders.findIndex(os => os.id === id));
//         this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar OS.' });
//       }
//     });
//   }

//   onRowEditCancel(serviceOrder: ViewServiceOrderDto, index: number): void {
//     if (this.editingRowData[serviceOrder.id]) {
//       this.serviceOrders[index] = this.editingRowData[serviceOrder.id];
//       delete this.editingRowData[serviceOrder.id];
//     }
//   }

//   // --- Lógica para Dialogs ---
//   openDetailsDialog(serviceOrder: ViewServiceOrderDto): void { 
//     this.selectedServiceOrder = serviceOrder;
//     this.displayDetailsDialog = true;
//     // Resetar os formulários para evitar dados antigos
//     this.helperForm.reset();
//     this.unproductiveVisitForm.reset();
//    }
  
//   openAddHelperDialog(serviceOrder: ViewServiceOrderDto): void {
//     this.selectedServiceOrder = serviceOrder;
//     this.helperForm.reset();
//     this.displayHelperDialog = true;
//   }
  
//   submitHelperForm(): void {
//     if (this.helperForm.invalid || !this.selectedServiceOrder) return;
//     this.isSubmittingSubForm = true;
//     const formValue = this.helperForm.value;
//     const dto: CreateServiceOrderHelperDto = {
//       ...formValue,
//       start: (formValue.start as Date).toISOString(),
//       end: (formValue.end as Date).toISOString()
//     };

//     this.serviceOrderService.addHelper(this.selectedServiceOrder.id, dto).subscribe({
//       next: (newHelper) => {
//         this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Ajudante adicionado.' });
//         this.displayHelperDialog = false;
//         // Opcional: Atualizar a OS na lista local para refletir a nova ajuda sem recarregar tudo
//         this.selectedServiceOrder?.technicalHelp?.push(newHelper);
//       },
//       error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao adicionar ajudante.' }),
//       complete: () => this.isSubmittingSubForm = false
//     });
//   }

//   openUnproductiveVisitDialog(serviceOrder: ViewServiceOrderDto): void {
//     this.selectedServiceOrder = serviceOrder;
//     this.unproductiveVisitForm.reset({ date: new Date() });
//     this.displayUnproductiveVisitDialog = true;
//   }

//   submitUnproductiveVisitForm(): void {
//     if (this.unproductiveVisitForm.invalid || !this.selectedServiceOrder) return;
//     this.isSubmittingSubForm = true;
//     const formValue = this.unproductiveVisitForm.value;
//     const dto: CreateServiceOrderUnproductiveVisitDto = {
//       ...formValue,
//       date: (formValue.date as Date).toISOString()
//     };

//     this.serviceOrderService.addUnproductiveVisit(this.selectedServiceOrder.id, dto).subscribe({
//       next: (newVisit) => {
//         this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Visita improdutiva registrada.' });
//         this.displayUnproductiveVisitDialog = false;
//         this.selectedServiceOrder?.unproductiveVisits?.push(newVisit);
//       },
//       error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao registrar visita.' }),
//       complete: () => this.isSubmittingSubForm = false
//     });
//   }

//   openSummaryDialog(): void {
//     this.isLoadingSummary = true;
//     this.displaySummaryDialog = true;
//     this.serviceOrderService.getStatusSummary().subscribe({
//       next: (data) => {
//         this.summaryData = Object.entries(data).map(([status, count]) => ({
//           status: this.getStatusLabel(status as ServiceOrderStatus),
//           count
//         }));
//         this.isLoadingSummary = false;
//       },
//       error: () => {
//         this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar sumário.' });
//         this.isLoadingSummary = false;
//       }
//     });
//   }


//   private mapLabelsToOptions = (labels: Record<string, string>): any[] => Object.entries(labels).map(([value, label]) => ({ label, value }));
//   getStatusLabel = (status: ServiceOrderStatus) => ServiceOrderStatusLabels[status] || status;
//   getTypeOfOsLabel = (type: TypeOfOs) => TypeOfOsLabels[type] || type;
//   getPeriodLabel = (period: Period) => PeriodLabels[period] || period;
//   getStatusSeverity(status: ServiceOrderStatus): any {
//     switch (status) {
//       case ServiceOrderStatus.TARGETED:
//         return 'info';
//       case ServiceOrderStatus.IN_PRODUCTION:
//         return 'warning';
//       case ServiceOrderStatus.EXECUTED:
//         return 'success';
//       case ServiceOrderStatus.CANCELED:
//         return 'error';
//       default:
//         return 'info';
//     }
//   }

// }
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LazyLoadEvent } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

@Component({
  selector: 'app-test-table',
  templateUrl: './manage-service-orders.component.html',
  imports: [
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class TestTableComponent implements OnInit {
  // 1. Dados Falsos (HARDCODED)
  allData: any[] = [];
  os: any[] = []; // Dados para a página atual

  // 2. Variáveis de Paginação
  totalRecords = 100;
  rows = 10;
  first = 0;
  isLoading = false;

  // 3. Formulário
  osGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    // Cria 100 itens de dados falsos
    for (let i = 0; i < this.totalRecords; i++) {
      this.allData.push({ id: i + 1, contractNumber: `Contrato ${i + 1}` });
    }

    // Inicializa o formulário com um FormArray vazio
    this.osGroup = this.fb.group({
      orders: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Carrega a primeira página de dados
    this.loadServiceOrders({ first: 0, rows: this.rows });
  }

  get orders(): FormArray {
    return this.osGroup.get('orders') as FormArray;
  }

  loadServiceOrders(event: TableLazyLoadEvent | { first: number, rows: number }) {
    console.log('Carregando com evento:', event);
    this.isLoading = true;

    // Simula a latência da rede
    setTimeout(() => {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
      
      // 4. Simula a paginação da API usando slice()
      this.os = this.allData.slice(this.first, this.first + this.rows);
      
      console.log(`Dados da página atual (itens: ${this.os.length})`, this.os);
      this.populateOrdersArray();
    }, 500); // Atraso de 0.5s para simular a rede
  }

  private populateOrdersArray() {
    console.log('Populando FormArray...');

    const serviceOrderGroups = this.os.map(order => 
      this.fb.group({
        id: [order.id],
        contractNumber: [order.contractNumber]
      })
    );

    const newOrdersArray = this.fb.array(serviceOrderGroups);
    this.osGroup.setControl('orders', newOrdersArray);

    console.log(`FormArray populado (controles: ${this.orders.length})`);
    
    this.isLoading = false;
  }
}