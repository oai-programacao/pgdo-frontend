// 

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, map, debounceTime, distinctUntilChanged, takeUntil, of } from 'rxjs';
import { MessageService } from 'primeng/api';

// Módulos PrimeNG
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar'; // Alterado de DatePickerModule
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

// Serviços
import { ServiceOrderService } from '../../services/service-order.service';
import { EmployeeService } from '../../../employees/services/employee.service'; // Para os dropdowns
import { TechnicianService } from '../../../technicians/services/technician.service'; // Para os dropdowns

// Modelos
import { ViewServiceOrderDto, ServiceOrderFilters, CustomPageResponse } from '../../../../interfaces/service-order.model';
import { City, ClientType, Period, ServiceOrderStatus, TypeOfOsLabels, ServiceOrderStatusLabels, CitiesLabels, PeriodLabels, TypeOfOs } from '../../../../interfaces/enums.model';
import { EmployeeRole, ViewEmployeeDto } from '../../../../interfaces/employee.model';
import { ViewTechnicianDto } from '../../../../interfaces/technician.model';
import { FieldsetModule } from 'primeng/fieldset';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-list-service-order',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    SelectModule, 
    DatePickerModule,
    TagModule, 
    ToastModule, 
    ToolbarModule, 
    MultiSelectModule, 
    InputNumberModule, 
    TooltipModule,
    FieldsetModule,
    DialogModule
  ],
  templateUrl: './list-service-order.component.html',
  providers: [MessageService, DatePipe]
})
export class ListServiceOrderComponent implements OnInit, OnDestroy {
  // --- Injeções ---
  private fb = inject(FormBuilder);
  private serviceOrderService = inject(ServiceOrderService);
  private employeeService = inject(EmployeeService);
  private technicianService = inject(TechnicianService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private datePipe = inject(DatePipe);

  private destroy$ = new Subject<void>();

  // --- Estado da Tabela e Paginação ---
  serviceOrders: ViewServiceOrderDto[] = [];
  totalRecords = 0;
  isLoading = true;
  rows = 10;
  first = 0;


  // --- Filtros e Opções de Dropdown ---
  filterForm!: FormGroup;
  statusOptions: any[];
  serviceOrderTypeOptions: any[];
  cityOptions: any[];
  periodOptions: any[];
  technicians$: Observable<ViewTechnicianDto[]>;
  responsiblePersons$: Observable<ViewEmployeeDto[]>;

  //-----Ver Detalhes da Ordem de Serviço-----
  selectedServiceOrder?: ViewServiceOrderDto;
  displayDetails = false;

  private pollingIntervalId?: any;
private lastServiceOrdersSnapshot: ViewServiceOrderDto[] = [];

  showDetails(serviceOrder: ViewServiceOrderDto): void {
    this.selectedServiceOrder = serviceOrder;
    this.displayDetails = true;
  }

  constructor() {
    this.statusOptions = this.mapLabelsToOptions(ServiceOrderStatusLabels);
    this.serviceOrderTypeOptions = this.mapLabelsToOptions(TypeOfOsLabels);
    this.cityOptions = this.mapLabelsToOptions(CitiesLabels);
    this.periodOptions = this.mapLabelsToOptions(PeriodLabels);

    this.technicians$ = this.technicianService.findAll(true);
    this.responsiblePersons$ = this.employeeService.findAll(true); // Busca todos os funcionários ativos
  }




ngOnInit(): void {
  this.initFilterForm();
  this.syncFiltersWithUrl();

  this.pollingIntervalId = setInterval(() => {
    if (!this.displayDetails) {
      this.loadServiceOrdersPolling();
    }
  }, 5000);
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if(this.pollingIntervalId){
      clearInterval(this.pollingIntervalId);
    }
  }

  private loadServiceOrdersPolling(): void {
  const page = Math.floor(this.first / this.rows);
  const filters = this.formatFilters(this.filterForm.value);

  this.serviceOrderService.findAll(filters, page, this.rows).subscribe({
    next: (dataPage: CustomPageResponse<ViewServiceOrderDto>) => {
      // Só atualiza se mudou
      if (JSON.stringify(this.lastServiceOrdersSnapshot) !== JSON.stringify(dataPage.content)) {
        this.serviceOrders = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.lastServiceOrdersSnapshot = dataPage.content;
      }
    },
    error: () => {
    }
  });
}

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      contractNumber: [null],
      clientName: [''],
      responsiblePersonId: [null],
      technicianId: [null],
      statuses: [[]],
      typesOfOS: [[]],
      cities: [[]],
      periods: [[]],
      startDate: [null],
      endDate: [null],
    });
  }

   private syncFiltersWithUrl(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
      this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
      this.first = page * this.rows;

      // Monta o objeto de filtros a partir da URL
      const filtersToSet: any = {
        contractNumber: params.get('contractNumber') ? Number(params.get('contractNumber')) : null,
        clientName: params.get('clientName') || null,
        responsiblePersonId: params.get('responsiblePersonId') || null,
        technicianId: params.get('technicianId') || null,
        startDate: params.get('startDate') ? new Date(params.get('startDate') + 'T00:00:00') : null,
        endDate: params.get('endDate') ? new Date(params.get('endDate') + 'T23:59:59') : null,
        
        // CORREÇÃO PRINCIPAL: Use SEMPRE params.getAll() para campos MultiSelect
        cities: params.getAll('cities') || [],
        typesOfOS: params.getAll('typesOfOS') || [],
        periods: params.getAll('periods') || [],
        statuses: params.getAll('statuses') || [],
      };
      
      this.filterForm.patchValue(filtersToSet, { emitEvent: false });
      this.loadServiceOrders();
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

  private formatFilters(rawFilters: any): ServiceOrderFilters {
    // Cria uma cópia para não modificar o objeto do formulário diretamente
    const formattedFilters: ServiceOrderFilters = { ...rawFilters };

    // Formata a data de início, se existir, para o formato YYYY-MM-DD que a API espera
    if (rawFilters.startDate && rawFilters.startDate instanceof Date) {
      formattedFilters.startDate = this.datePipe.transform(rawFilters.startDate, 'yyyy-MM-dd');
    } else {
      formattedFilters.startDate = null; // Garante que será nulo se não for uma data válida
    }

    // Formata a data de fim, se existir
    if (rawFilters.endDate && rawFilters.endDate instanceof Date) {
      formattedFilters.endDate = this.datePipe.transform(rawFilters.endDate, 'yyyy-MM-dd');
    } else {
      formattedFilters.endDate = null;
    }

    // Os outros filtros do formulário (clientName, statuses, etc.) já devem estar no formato correto
    // e são mantidos pelo spread operator (...rawFilters).
    return formattedFilters;
  }
    

  loadServiceOrders(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);
    const filters = this.formatFilters(this.filterForm.value);

    this.serviceOrderService.findAll(filters, page, this.rows).subscribe({
      next: (dataPage: CustomPageResponse<ViewServiceOrderDto>) => {
        this.serviceOrders = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar Ordens de Serviço.' });
        this.isLoading = false;
      }
    });
  }
  
  onPageChange(event: TableLazyLoadEvent): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.updateUrl();
  }

  updateUrl(): void {
    const page = Math.floor(this.first / this.rows);
    const formValues = this.filterForm.value;
    
    const queryParams: any = { page, size: this.rows };

    for (const key in formValues) {
      const value = formValues[key];
      if (value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        if ((key === 'startDate' || key === 'endDate') && value instanceof Date) {
          queryParams[key] = this.datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      // Omitir queryParamsHandling para sobrescrever, o que é melhor para esta lógica
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      clientName: '',
      cities: [],
      typesOfOS: [],
      periods: [],
      statuses: []
    });
    // O valueChanges cuidará do resto
  }
  
  // Helpers
  private mapLabelsToOptions(labels: Record<string, string>): any[] {
    return Object.entries(labels).map(([value, label]) => ({ label, value }));
  }
  
  getStatusLabel(status: ServiceOrderStatus): any { return ServiceOrderStatusLabels[status] || status; }
  getTypeOfOsLabel(type: TypeOfOs): string { return TypeOfOsLabels[type] || type; }
  getPeriodLabel(period: Period): string { return PeriodLabels[period] || period; }
  getCityLabel(city: City): string { return CitiesLabels[city] || city; }

  getStatusSeverity(status: ServiceOrderStatus): any {
    const statusMap: Record<string, string> = {
      'EXECUTED': 'success', 'NORMALIZED': 'success',
      'IN_PRODUCTION': 'info', 'TARGETED': 'info',
      'CANCELED': 'danger', 'TECHNICAL_INFEASIBILITY': 'danger',
      'RESCHEDULED': 'warning', 'PARTIALLY_EXECUTED': 'warning', 'RESCHEDULED_PENDING': 'warning'
    };
    return statusMap[status] || 'secondary';
  }
}