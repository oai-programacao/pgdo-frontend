import { PeriodLabels } from "./../../../../interfaces/enums.model";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { DatePickerModule } from "primeng/datepicker";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ToastModule } from "primeng/toast";
import { ServiceOrderService } from "../../services/service-order.service";
import { TechnicianService } from "../../../technicians/services/technician.service";
import { Router, ActivatedRoute } from "@angular/router";
import { debounceTime, Subject, takeUntil } from "rxjs";
import { ViewTechnicianDto } from "../../../../interfaces/technician.model";
import {
  UpdateServiceOrderDto,
  ViewServiceOrderDto,
} from "../../../../interfaces/service-order.model";
import {
  CitiesLabels,
  City,
  Period,
  ServiceOrderStatus,
  ServiceOrderStatusLabels,
  SubTypeServiceOrder,
  SubTypeServiceOrderLabels,
  TypeOfOs,
  TypeOfOsLabels,
} from "../../../../interfaces/enums.model";
import { PhonesPipe } from "../../../../shared/pipes/phones.pipe";
import { FormatDurationPipe } from "../../../../shared/pipes/format-duration.pipe";
import { ButtonModule } from "primeng/button";
import { FieldsetModule } from "primeng/fieldset";
import { InputNumberModule } from "primeng/inputnumber";
import { MultiSelectModule } from "primeng/multiselect";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { UnproductiveVisitsComponent } from "../../components/unproductive-visits/unproductive-visits.component";
import { HelperTechComponent } from "../../components/helper-tech/helper-tech.component";
import { EditComponent } from "../../components/edit/edit.component";
import { ObservationComponent } from "../../components/observation/observation.component";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { BadgeModule } from "primeng/badge";
import {
  ClientType,
  ClientTypeLabels,
} from "../../../../interfaces/enums.model";
@Component({
  selector: "app-admin-service-orders",
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
    MultiSelectModule,
    TooltipModule,
    DialogModule,
    UnproductiveVisitsComponent,
    HelperTechComponent,
    EditComponent,
    ObservationComponent,
    ConfirmDialogModule,
    BadgeModule,
  ],
  templateUrl: "./admin-service-orders.component.html",
  styleUrl: "./admin-service-orders.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class AdminServiceOrdersComponent implements OnInit, OnDestroy {
  @ViewChild("helperTech") helperTech!: HelperTechComponent;
  @ViewChild("dt") dt!: Table;
  @ViewChild("editOS") editOS!: EditComponent;
  @ViewChild("helperTechDialog") helperTechDialog!: HelperTechComponent;

  private readonly messageService = inject(MessageService);
  private readonly serviceOrderService = inject(ServiceOrderService);
  private readonly fb = inject(FormBuilder);
  private readonly technicianService = inject(TechnicianService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();
  private pendingFirstValue: number | null = null;
  private allowStatusUpdate = new Set<number>();
  public ServiceOrderStatus = ServiceOrderStatus;

  technicians: ViewTechnicianDto[] = [];
  technicianOptions: { label: string; value: string | null }[] = [];
  dataSource: ViewServiceOrderDto[] = [];
  expiredOsCount = 0;
  showingExpired = false;
  osGroup!: FormGroup;
  totalRecords = 0;
  isLoading = true;
  rows = 20;
  first = 0;
  hasObservation: boolean = false;
  osExpired!: boolean;

  selectedServiceOrder: ViewServiceOrderDto | null = null;

  statusOptions: any[] = [
    ...Object.entries(ServiceOrderStatusLabels).map(([key, value]) => ({
      label: value,
      value: ServiceOrderStatus[key as keyof typeof ServiceOrderStatus],
    })),
  ];

  getStatusOptions(os: ViewServiceOrderDto): any[] {
    const ALL_STATUSES = Object.entries(ServiceOrderStatusLabels).map(
      ([key, label]) => ({
        label,
        value: ServiceOrderStatus[key as keyof typeof ServiceOrderStatus],
      })
    );

    const VENDA_ALLOWED = [
      ServiceOrderStatus.UNDEFINED,
      ServiceOrderStatus.IN_PRODUCTION,
      ServiceOrderStatus.RESCHEDULED,
      ServiceOrderStatus.EXECUTED,
    ];

    const isVenda =
      os.typeOfOs?.includes(TypeOfOs.INSTALLATION) && !!os.responsibleSeller;

    return isVenda
      ? ALL_STATUSES.filter((o) => VENDA_ALLOWED.includes(o.value))
      : ALL_STATUSES;
  }

  onStatusChange(
    newStatus: ServiceOrderStatus,
    os: ViewServiceOrderDto,
    index: number
  ) {
    const control = this.orders.at(index).get("status");
    if (!control) return;

    const currentStatus = os.status?.[0];

    const isVenda =
      os.typeOfOs?.includes(TypeOfOs.INSTALLATION) && !!os.responsibleSeller;

    // 🔒 Se já EXECUTED, não muda mais
    if (isVenda && currentStatus === ServiceOrderStatus.EXECUTED) {
      control.setValue(currentStatus, { emitEvent: false });
      return;
    }

    // 🚫 Bloqueia EXECUTED manualmente
    if (isVenda && newStatus === ServiceOrderStatus.EXECUTED) {
      control.setValue(currentStatus, { emitEvent: false });
      return;
    }

    // ⚠️ Confirmação obrigatória ao iniciar produção
    if (isVenda && newStatus === ServiceOrderStatus.IN_PRODUCTION) {
      this.confirmationService.confirm({
        header: "Confirmação",
        message:
          "Deseja mesmo iniciar essa OS de venda? O cliente será notificado via WhatsApp.",
        icon: "pi pi-exclamation-triangle",

        accept: () => {
          this.allowStatusUpdate.add(index);
          control.setValue(newStatus);
        },

        reject: () => {
          control.setValue(currentStatus, { emitEvent: false });
        },
      });
      return;
    }

    // ✅ Outros casos permitidos
    this.allowStatusUpdate.add(index);
  }

  subStatusOptions: any[] = [
    ...Object.entries(SubTypeServiceOrderLabels).map(([key, value]) => ({
      label: value,
      value: SubTypeServiceOrder[key as keyof typeof SubTypeServiceOrder],
    })),
  ];

  serviceOrderTypeOptions: any[];
  cityOptions: City[];
  periodOptions: { label: string; value: Period }[];

  filterForm!: FormGroup;
  helperForm!: FormGroup;
  unproductiveVisitForm!: FormGroup;
  isSubmittingSubForm = false;
  clientTypeOptions: ClientType[];

  isUnproductiveVisitDialogVisible = false;
  isHelperTechDialogVisible = false;
  isEditingTechDialogVisible = false;
  isPostingObeservationTechDialogVisible = false;
  isDeleteTechDialogVisible = false;

  constructor() {
    this.serviceOrderTypeOptions = this.mapLabelsToOptions(TypeOfOsLabels);
    this.cityOptions = this.mapLabelsToOptions(CitiesLabels);
    this.periodOptions = this.mapLabelsToOptions(PeriodLabels);
    this.clientTypeOptions = this.mapLabelsToOptions(ClientTypeLabels);

    this.osGroup = this.fb.group({
      orders: this.fb.array([]),
    });
  }

  openUnproductiveVisitDialog(
    selectServiceOrder: ViewServiceOrderDto | null = null
  ) {
    this.isUnproductiveVisitDialogVisible = true;
    this.selectedServiceOrder = selectServiceOrder;
  }

  openHelperTechDialog(selectServiceOrder: ViewServiceOrderDto | null = null) {
    this.isHelperTechDialogVisible = true;
    this.selectedServiceOrder = selectServiceOrder;
  }

  openEditTechDialog(selectedServiceOrder: ViewServiceOrderDto | null = null) {
    this.selectedServiceOrder = selectedServiceOrder;
    this.isEditingTechDialogVisible = true;
  }

  openObservationTechDialog(
    selectedServiceOrder: ViewServiceOrderDto | null = null
  ) {
    this.selectedServiceOrder = selectedServiceOrder;
    this.isPostingObeservationTechDialogVisible = true;
  }

  onEditSuccess() {
    this.messageService.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Ordem de serviço atualizada com sucesso!",
      life: 1000,
    });
    this.isEditingTechDialogVisible = false;
  }

  onHelperSuccess() {
    this.messageService.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Ajuda técnica adicionada com sucesso!",
      life: 1000,
    });
    this.isHelperTechDialogVisible = false;
  }

  onObservationSuccess() {
    this.messageService.add({
      severity: "success",
      summary: "Sucesso",
      detail: "Observação adicionada com sucesso!",
      life: 1000,
    });
    this.isPostingObeservationTechDialogVisible = false;
    this.loadServiceOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.initForms();
    this.initializeStateFromUrl();
    this.initTechnicians();
    this.loadExpiredOsCount();
    this.loadServiceOrders();
  }

  get orders(): FormArray {
    return this.osGroup.get("orders") as FormArray;
  }

  trackById(index: number, item: ViewServiceOrderDto): string {
    return item.id;
  }

  applyFilters(): void {
    this.first = 0;
    this.loadServiceOrders();
  }

  private initializeStateFromUrl(): void {
    const params = this.route.snapshot.queryParams;

    const formattedParams = { ...params };

    // Converte filtros do tipo array
    ["periods", "statuses", "typesOfOS", "subTypeOs", "cities"].forEach(
      (key) => {
        if (params[key]) {
          formattedParams[key] = Array.isArray(params[key])
            ? params[key]
            : [params[key]];
        } else {
          formattedParams[key] = [];
        }
      }
    );

    this.filterForm.patchValue(formattedParams);

    this.rows = params["rows"] ? +params["rows"] : 20;
    const page = params["page"] ? +params["page"] : 0;
    this.first = page * this.rows;
  }

  loadServiceOrders(event?: TableLazyLoadEvent): void {
    this.isLoading = true;

    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }

    const page = Math.floor(this.first / this.rows);

    this.updateUrlQueryParams();
    this.pendingFirstValue = this.first;

    this.serviceOrderService
      .findAll(this.filterForm.value, page, this.rows)
      .subscribe({
        next: (dataPage) => {
          this.dataSource = dataPage.content ?? [];
          this.totalRecords = dataPage.page.totalElements;
          this.populateOrdersArray();
        },
        error: () =>
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Falha ao carregar Ordens de Serviço.",
          }),
      });
  }

  onTableLazyLoad(event: TableLazyLoadEvent) {
    if (this.showingExpired) {
      this.showExpiredOs(event);
    } else {
      this.loadServiceOrders(event);
    }
  }

  private loadExpiredOsCount(): void {
    this.serviceOrderService.getExpiredCount().subscribe({
      next: (response) => {
        const countValue = response.Count;
        this.expiredOsCount = countValue ?? 0;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.expiredOsCount = 0;
        this.cdr.detectChanges();
      },
    });
  }

  showExpiredOs(event?: TableLazyLoadEvent): void {
    if (!event) {
      this.first = 0;
    }

    this.isLoading = true;
    this.showingExpired = true;

    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 20;
    }

    const page = Math.floor(this.first / this.rows);
    this.updateUrlQueryParams();
    this.pendingFirstValue = this.first;

    this.serviceOrderService.getExpiredCliente(page, this.rows).subscribe({
      next: (dataPage) => {
        let expiredOrders = dataPage.content ?? [];
        this.dataSource = dataPage.content ?? [];
        this.totalRecords = dataPage.page.totalElements ?? 0;
        this.populateOrdersArray();
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao carregar Ordens de Serviço Expiradas.",
        });
      },
    });
  }

  showAllOs(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
    this.showingExpired = false;

    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }

    const page = Math.floor(this.first / this.rows);

    this.pendingFirstValue = this.first;

    this.serviceOrderService.findByOsActive(page, this.rows).subscribe({
      next: (dataPage) => {
        this.dataSource = dataPage.content ?? [];
        this.totalRecords = dataPage.page.totalElements;
        this.populateOrdersArray();
      },
      error: () =>
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao carregar Ordens de Serviço ativas.",
        }),
    });
  }

  updateServiceOrder(index: number): void {
    const formGroup = this.orders.at(index) as FormGroup;
    const id = formGroup.get("id")?.value;

    if (!id) return;

    const technician = formGroup.get("technician")?.value;
    const startOfOs = formGroup.get("startOfOs")?.value;
    const endOfOs = formGroup.get("endOfOs")?.value;

    if (!technician && (startOfOs || endOfOs)) {
      this.messageService.add({
        severity: "warn",
        summary: "Validação",
        detail:
          "Para informar horário de início ou fim, é necessário definir um técnico.",
      });
      formGroup.get("startOfOs")?.setValue(null, { emitEvent: false });
      formGroup.get("endOfOs")?.setValue(null, { emitEvent: false });
      return;
    }

    if (technician && !startOfOs && endOfOs) {
      this.messageService.add({
        severity: "warn",
        summary: "Validação",
        detail:
          "Para informar o horário de fim, o horário de início deve estar preenchido.",
      });
      formGroup.get("endOfOs")?.setValue(null, { emitEvent: false });
      return;
    }

    const dto: UpdateServiceOrderDto = {
      scheduleDate: formGroup.get("scheduleDate")?.value || null,
      period: formGroup.get("period")?.value || null,
      technology: formGroup.get("technology")?.value || null,
      technicianId: technician || null,
      status: formGroup.get("status")?.value || null,
      cabling: formGroup.get("cabling")?.value ?? null,
      isActiveToReport: undefined,
      startOfOs: startOfOs || null,
      endOfOs: endOfOs || null,
      observation: formGroup.get("observation")?.value || null,
    };

    this.serviceOrderService.update(id, dto).subscribe({
      next: (updated?: ViewServiceOrderDto) => {
        formGroup.patchValue(
          {
            technician: updated?.technician?.id ?? dto.technicianId,
            status: updated?.status ?? dto.status,
            startOfOs: updated?.startOfOs ?? dto.startOfOs,
            endOfOs: updated?.endOfOs ?? dto.endOfOs,
            observation: updated?.observation ?? dto.observation,
            durationOfOs: updated?.durationOfOs,
          },
          { emitEvent: false }
        );

        const updatedStatus = updated?.status ?? dto.status ?? [];
        if (updatedStatus.includes(ServiceOrderStatus.EXECUTED)) {
          this.loadServiceOrders();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao atualizar Ordem de Serviço.",
        });
      },
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.first = 0;
    this.loadServiceOrders();
  }

  private setupFormListeners(): void {
    this.orders.controls.forEach((group, index) => {
      const controlsToWatch = [
        "scheduleDate",
        "period",
        "technician",
        "startOfOs",
        "endOfOs",
        "status",
      ];

      controlsToWatch.forEach((controlName) => {
        const control = group.get(controlName);
        if (!control) return;

        control.valueChanges
          .pipe(debounceTime(5000), takeUntil(this.destroy$))
          .subscribe(() => {
            this.updateServiceOrder(index);
          });
      });
    });
  }

  private updateUrlQueryParams(): void {
    const page = Math.floor(this.first / this.rows);

    const params: any = {
      page: page > 0 ? page : null,
      rows: this.rows !== 20 ? this.rows : null,
    };

    for (const key in this.filterForm.value) {
      const value = this.filterForm.value[key];
      if (value && (!Array.isArray(value) || value.length > 0)) {
        params[key] = value;
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: "",
      replaceUrl: true,
    });
  }

  private initForms(): void {
    this.filterForm = this.fb.group({
      contractNumber: [null],
      clientName: [""],
      technicianId: [null],
      statuses: [[]],
      subTypeOs: [[]],
      typesOfOS: [[]],
      cities: [[]],
      periods: [[]],
      startDate: [null],
      endDate: [null],
    });
    this.helperForm = this.fb.group({
      technicianId: [null, Validators.required],
      start: [null, Validators.required],
      end: [null, Validators.required],
    });
    this.unproductiveVisitForm = this.fb.group({
      technicianId: [null, Validators.required],
      date: [null, Validators.required],
      observation: ["", Validators.required],
    });
  }

  logStatusValue(index: number) {
    const control = this.orders.at(index)?.get("status");
    console.log(`Status do index ${index}:`, control?.value);
    return control?.value;
  }

  private initTechnicians(): void {
    this.technicianService
      .findAll(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (technicians) => {
          this.technicians = technicians;
          this.technicianOptions = technicians.map((tech) => ({
            label: `${tech.name}`,
            value: tech.id,
          }));
        },
        error: () =>
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Falha ao carregar técnicos.",
          }),
      });
  }

  private populateOrdersArray() {
    setTimeout(() => {
      const serviceOrderGroups = this.dataSource.map((order) =>
        this.createServiceOrderGroup(order)
      );
      const newOrdersArray = this.fb.array(serviceOrderGroups);
      this.osGroup.setControl("orders", newOrdersArray);

      this.isLoading = false;
      this.cdr.markForCheck();
      this.setupFormListeners();
    }, 0);
  }

  ngAfterViewChecked(): void {
    if (this.pendingFirstValue !== null && this.dt) {
      this.dt.first = this.pendingFirstValue;
      this.pendingFirstValue = null;
    }
  }

  private createServiceOrderGroup(
    serviceOrder: ViewServiceOrderDto
  ): FormGroup {
    return this.fb.group({
      id: [serviceOrder.id],
      contractNumber: [serviceOrder.contractNumber],
      identificationNumber: [serviceOrder.identificationNumber],
      clientName: [serviceOrder.clientName],
      phone1: [serviceOrder.phone1],
      phone2: [serviceOrder.phone2],
      responsiblePerson: [serviceOrder.responsiblePerson],
      CommandArea: [serviceOrder.commandArea],
      city: [serviceOrder.city ?? []],
      district: [serviceOrder.district],
      address: [serviceOrder.address],
      clientType: [serviceOrder.clientType],
      typeOfOs: [serviceOrder.typeOfOs ?? []],
      subTypeOs: [serviceOrder.subTypeOs ?? []],
      scheduleDate: [serviceOrder.scheduleDate],
      period: [serviceOrder.period],
      technology: [serviceOrder.technology],
      technician: [serviceOrder.technician?.id],
      status: [serviceOrder.status ?? []],
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
    });
  }

  private mapLabelsToOptions = (labels: Record<string, string>): any[] =>
    Object.entries(labels).map(([value, label]) => ({ label, value }));
  getStatusLabel = (status: ServiceOrderStatus) =>
    ServiceOrderStatusLabels[status] || status;
  getClientTypeLabel = (type: ClientType) => ClientTypeLabels[type] || type;
  getCitiesLabel = (city: City) => CitiesLabels[city] || city;
  getTypeOfOsLabel = (type: TypeOfOs) => TypeOfOsLabels[type] || type;
  getSubTypeOsLabel = (type: SubTypeServiceOrder) =>
    SubTypeServiceOrderLabels[type] || type;
  getPeriodLabel = (period: Period) => PeriodLabels[period] || period;

  confirmDeleteServiceOrder(event: Event, os: ViewServiceOrderDto) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: "Tem certeza que deseja excluir esta ordem de serviço?",
      header: "Confirmação de Exclusão",
      icon: "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: "Cancelar",
        severity: "secondary",
        outlined: true,
      },
      acceptButtonProps: {
        label: "Confirmar",
        severity: "success",
        outlined: true,
      },
      accept: () => {
        this.deleteOS(os.id);
      },
      reject: () => {
        this.messageService.add({
          severity: "info",
          summary: "Cancelado",
          detail: "Ordem de serviço não excluída.",
        });
      },
    });
  }

  deleteOS(id: string) {
    if (!id) {
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "ID da ordem de serviço não encontrado.",
      });
      return;
    }

    this.serviceOrderService.deleteServiceOrderById(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Ordem de serviço excluída com sucesso.",
        });
        this.loadServiceOrders();
      },
      error: () => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao excluir a ordem de serviço.",
        });
      },
    });
  }

  restoreFiltersFromUrl(): void {
    this.route.queryParams.subscribe((params) => {
      this.filterForm.patchValue({
        contractNumber: params["contractNumber"]
          ? Number(params["contractNumber"])
          : null,
        clientName: params["clientName"] || "",
        technicianId: params["technicianId"] || null,
        statuses: params["statuses"]
          ? Array.isArray(params["statuses"])
            ? params["statuses"]
            : [params["statuses"]]
          : [],
        typesOfOS: params["typesOfOS"]
          ? Array.isArray(params["typesOfOS"])
            ? params["typesOfOS"]
            : [params["typesOfOS"]]
          : [],
        subTypeOs: params["subTypeOs"]
          ? Array.isArray(params["subTypeOs"])
            ? params["subTypeOs"]
            : [params["subTypeOs"]]
          : [],
        cities: params["cities"]
          ? Array.isArray(params["cities"])
            ? params["cities"]
            : [params["cities"]]
          : [],
        periods: params["periods"]
          ? Array.isArray(params["periods"])
            ? params["periods"]
            : [params["periods"]]
          : [],
        startDate: params["startDate"] ? new Date(params["startDate"]) : null,
        endDate: params["endDate"] ? new Date(params["endDate"]) : null,
      });
    });
  }

  showExtraTag(os: any): boolean {
    return (
      !!os?.responsibleSeller &&
      (os.typeOfOs === "INSTALLATION" || os.typeOfOs === "CHANGE_OF_ADDRESS")
    );
  }

  getExtraTagLabel(os: any): string {
    if (os.typeOfOs === "INSTALLATION") {
      return "LOJA | VENDA 💵";
    }

    if (os.typeOfOs === "CHANGE_OF_ADDRESS") {
      return "LOJA | MUDANÇA DE ENDEREÇO 🔄";
    }

    return "";
  }
}
