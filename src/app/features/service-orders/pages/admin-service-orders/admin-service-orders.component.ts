import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ServiceOrderService } from '../../services/service-order.service';
import { TechnicianService } from '../../../technicians/services/technician.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ViewTechnicianDto } from '../../../../interfaces/technician.model';
import { ViewServiceOrderDto } from '../../../../interfaces/service-order.model';
import { CitiesLabels, CommandArea, Period, PeriodLabels, ServiceOrderStatus, ServiceOrderStatusLabels, TypeOfOs, TypeOfOsLabels } from '../../../../interfaces/enums.model';
import { PhonesPipe } from '../../../../shared/pipes/phones.pipe';
import { FormatDurationPipe } from '../../../../shared/pipes/format-duration.pipe';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-admin-service-orders',
  imports: [
    CommonModule,
    TableModule,
    DatePickerModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    ToastModule,
    InputTextModule,
    TagModule,
    PhonesPipe,
    FormatDurationPipe,
    ButtonModule,
    FieldsetModule,
    InputNumberModule,
    MultiSelectModule
  ],
  templateUrl: './admin-service-orders.component.html',
  styleUrl: './admin-service-orders.component.scss',
  providers: [MessageService]
})
export class AdminServiceOrdersComponent implements OnInit, OnDestroy {

  @ViewChild('dt') dt!: Table;

  // Injeções de dependências
  private readonly messageService = inject(MessageService);
  private readonly serviceOrderService = inject(ServiceOrderService);
  private readonly fb = inject(FormBuilder);
  private readonly technicianService = inject(TechnicianService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private pendingFirstValue: number | null = null;

  // Variaveis do componente
  technicians: ViewTechnicianDto[] = [];
  technicianOptions: { label: string; value: string | null }[] = [];
  os: ViewServiceOrderDto[] = [];
  osGroup!: FormGroup;
  totalRecords = 0;
  isLoading = true;
  rows = 20;
  first = 0;

  // Ordem de Serviço Selecionada
  selectedServiceOrder: ViewServiceOrderDto | null = null;

  //Opções de filtro
  statusOptions: any[];
  serviceOrderTypeOptions: any[];
  cityOptions: any[];
  periodOptions: any[];

  // Formulários
  filterForm!: FormGroup;
  helperForm!: FormGroup;
  unproductiveVisitForm!: FormGroup;
  isSubmittingSubForm = false; // Flag de loading para os sub-formulários

  constructor() {
      this.statusOptions = this.mapLabelsToOptions(ServiceOrderStatusLabels);
      this.serviceOrderTypeOptions = this.mapLabelsToOptions(TypeOfOsLabels);
      this.cityOptions = this.mapLabelsToOptions(CitiesLabels);
      this.periodOptions = this.mapLabelsToOptions(PeriodLabels);
      this.osGroup = this.fb.group({
        orders: this.fb.array([]) // FormArray para armazenar as ordens de serviço
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.initForms();
     this.initializeStateFromUrl(); // 2. Lemos a URL e populamos o formulário/paginação
    this.initTechnicians();
    this.loadServiceOrders();
  }

  /**
   * Retorna o FormArray de ordens de serviço
   */
  get orders(): FormArray {
    return this.osGroup.get('orders') as FormArray;
  }

  trackById(index: number, item: ViewServiceOrderDto): string {
    return item.id;
  }

  applyFilters(): void {
  // 1. Reseta a paginação para a primeira página
  this.first = 0;
  
  // 2. Chama o método de carregamento, que já usa filterForm.value
  this.loadServiceOrders();
  }

  private initializeStateFromUrl(): void {
    const params = this.route.snapshot.queryParams;

    // Popula o formulário de filtros com os parâmetros da URL
    // patchValue é seguro e só atualiza os campos que existem
    this.filterForm.patchValue(params);

    // Trata os parâmetros de paginação
    // O '+' converte a string da URL para número
    this.rows = params['rows'] ? +params['rows'] : 20;
    const page = params['page'] ? +params['page'] : 0;
    this.first = page * this.rows;
  }

  loadServiceOrders(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
     if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);

    // A mágica acontece aqui: toda vez que carregamos dados, atualizamos a URL
    this.updateUrlQueryParams();
    // Em vez de tentar definir algo aqui, guardamos o valor que queremos aplicar
    this.pendingFirstValue = this.first;
  
    this.serviceOrderService.findAll(this.filterForm.value, page, this.rows).subscribe({
      next: (dataPage) => {
        this.os = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.populateOrdersArray();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar Ordens de Serviço.' })
    });
  }

  clearFilters(): void { 
    this.filterForm.reset(); 
    this.first = 0; // Reseta a paginação para a primeira página
    this.loadServiceOrders(); // Recarrega as ordens de serviço sem filtros
  }

  private updateUrlQueryParams(): void {
    const page = Math.floor(this.first / this.rows);

    const params: any = {
      page: page > 0 ? page : null, // Não mostra 'page=0' na URL
      rows: this.rows !== 20 ? this.rows : null, // Não mostra o valor padrão 'rows=20'
    };

    // Adiciona os valores do formulário de filtro que não sejam nulos ou vazios
    for (const key in this.filterForm.value) {
      const value = this.filterForm.value[key];
      if (value && (!Array.isArray(value) || value.length > 0)) {
        params[key] = value;
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      replaceUrl: true // Evita poluir o histórico do navegador
    });
  }

  private initForms(): void {
    // Formulário para filtrar Ordens de Serviço
    this.filterForm = this.fb.group({
      contractNumber: [null],
      clientName: [''],
      technicianId: [null],
      statuses: [[]],
      typesOfOS: [[]],
      cities: [[]],
      periods: [[]],
      startDate: [null],
      endDate: [null],
    });
    // Formulário para criar uma Ajuda Técnica na OS
    this.helperForm = this.fb.group({
      technicianId: [null, Validators.required],
      start: [null, Validators.required],
      end: [null, Validators.required],
    })
    // Formulário para registrar uma Visita Não Produtiva
    this.unproductiveVisitForm = this.fb.group({
      technicianId: [null, Validators.required],
      date: [null, Validators.required],
      observation: ['', Validators.required],
    });
  }

  private initTechnicians(): void {
    this.technicianService.findAll(true).pipe(takeUntil(this.destroy$)).subscribe({
      next: (technicians) => {
        this.technicians = technicians;
        this.technicianOptions = technicians.map(tech => ({
          label: `${tech.name}`,
          value: tech.id
        }));
      },
      error: () => this.messageService.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: 'Falha ao carregar técnicos.' 
      })
    });
  }

  // private populateOrdersArray() {
  //   const ordersArray = this.orders;
  //   ordersArray.clear(); // Limpa o FormArray para evitar duplicação

  //   this.os.forEach((order) => {
  //     console.log('Populating order:', order);
  //     ordersArray.push(this.createServiceOrderGroup(order));
  //   });
  //   this.isLoading = false;
  // }

  private populateOrdersArray() {
    // 2. Usamos o setTimeout para desacoplar a atualização do formulário
    // do ciclo de detecção de mudanças do evento (onPage).
    setTimeout(() => {
      const serviceOrderGroups = this.os.map(order => this.createServiceOrderGroup(order));
      const newOrdersArray = this.fb.array(serviceOrderGroups);
      this.osGroup.setControl('orders', newOrdersArray);

      // 3. AGORA, com o formulário 100% pronto e sincronizado,
      // nós desligamos o loading. Isso fará o *ngIf recriar a tabela.
      this.isLoading = false;
      
      // 4. Avisa o Angular para garantir a atualização da view.
      this.cdr.markForCheck();
    }, 0);
  }

  // 2. ADICIONE O LIFECYCLE HOOK ngAfterViewChecked
  ngAfterViewChecked(): void {
    // Este método é chamado depois que a view é checada/atualizada.
    // Verificamos se há um valor de 'first' pendente para ser aplicado.
    if (this.pendingFirstValue !== null && this.dt) {
      this.dt.first = this.pendingFirstValue;
      
      // Limpamos o valor pendente para que isso não execute novamente
      // em cada ciclo de detecção de mudanças.
      this.pendingFirstValue = null;
    }
  }

  /**
   * Cria um FormGroup para uma Ordem de Serviço
   * @param serviceOrder A ordem de serviço a ser mapeada
   * @returns Um FormGroup representando a ordem de serviço
   */
  private createServiceOrderGroup(serviceOrder: ViewServiceOrderDto): FormGroup {
    return this.fb.group({
      id: [serviceOrder.id, Validators.required],
      contractNumber: [serviceOrder.contractNumber, Validators.required],
      identificationNumber: [serviceOrder.identificationNumber, Validators.required],
      clientName: [serviceOrder.clientName, Validators.required],
      phone1: [serviceOrder.phone1, Validators.required],
      phone2: [serviceOrder.phone2],
      responsiblePerson: [serviceOrder.responsiblePerson, Validators.required],
      CommandArea: [serviceOrder.commandArea, Validators.required],
      city: [serviceOrder.city, Validators.required],
      district: [serviceOrder.district, Validators.required],
      address: [serviceOrder.address, Validators.required],
      clientType: [serviceOrder.clientType, Validators.required],
      typeOfOs: [serviceOrder.typeOfOs, Validators.required],
      scheduleDate: [serviceOrder.scheduleDate],
      period: [serviceOrder.period, Validators.required],
      technology: [serviceOrder.technology],
      technician: [serviceOrder.technician?.id],
      status: [serviceOrder.status, Validators.required],
      technicalHelp: [serviceOrder.technicalHelp || []],
      unproductiveVisits: [serviceOrder.unproductiveVisits || []],
      startOfOs: [serviceOrder.startOfOs],
      endOfOs: [serviceOrder.endOfOs],
      durationOfOs: [serviceOrder.durationOfOs],
      cabling: [serviceOrder.cabling],
      observation: [serviceOrder.observation],
      createdAt: [serviceOrder.createdAt],
      updatedAt: [serviceOrder.updatedAt],
      updatedBy: [serviceOrder.updatedBy],
    })
  }

  private mapLabelsToOptions = (labels: Record<string, string>): any[] => Object.entries(labels).map(([value, label]) => ({ label, value }));
  getStatusLabel = (status: ServiceOrderStatus) => ServiceOrderStatusLabels[status] || status;
  getTypeOfOsLabel = (type: TypeOfOs) => TypeOfOsLabels[type] || type;
  getPeriodLabel = (period: Period) => PeriodLabels[period] || period;

}
