import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ViewOnuDto, OnuSignalLabels, OnuColorLabels, OnuCertificateLabels, OnuMaintenanceStatusLabels, CreateOnuMaintenanceDto, OnuSignal, OnuCertificate, OnuColor } from '../../../../interfaces/onu.model';
import { OnuMaintenanceService } from '../../services/onu-maintenance.service';
import { OnuService } from '../../services/onu.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FieldsetModule } from 'primeng/fieldset';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { CustomPageResponse } from '../../../../interfaces/service-order.model';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-manage-onu',
  imports: [
    ToastModule,
    ConfirmDialogModule,
    FieldsetModule,
    SelectModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    ToolbarModule,
    TableModule,
    TagModule,
    DialogModule,
    CommonModule,
    InputTextModule,
    TextareaModule
  ],
  templateUrl: './manage-onu.component.html',
  styleUrl: './manage-onu.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ManageOnuComponent implements OnInit, OnDestroy{
  // --- Injeções ---
  private fb = inject(FormBuilder);
  private onuService = inject(OnuService);
  private maintenanceService = inject(OnuMaintenanceService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();

  // --- Estado da Tabela e Paginação ---
  onus: ViewOnuDto[] = [];
  totalRecords = 0;
  isLoading = true;
  rows = 10;
  first = 0;

  // --- Filtros e Opções de Dropdown ---
  filterForm!: FormGroup;
  signalOptions: any[];
  colorOptions: any[];
  certificateOptions: any[];
  maintenanceStatusOptions: any[];

  // --- ADICIONADO AQUI: Expõe os objetos de Labels para o template ---
  public readonly OnuSignalLabels = OnuSignalLabels;
  public readonly OnuColorLabels = OnuColorLabels;
  public readonly OnuCertificateLabels = OnuCertificateLabels;

  modelsOptions = [
    'HG8010H',
    'EG8145v5',
    'HS8546v5',
    'EGB145X6',
    'HG8145V5',
    'HS8546V',
    'HG8546M',
    'EGB145v5',
    'EG8010',
    'HG8310M',
    'EG8120L',
    'EGB145X6-10',
    'EG8145B7-50'
  ]

  // --- Dialogs e Forms ---
  selectedOnu: ViewOnuDto | null = null;
  displayCreateDialog = false;
  createForm!: FormGroup;
  isSubmittingCreate = false;

  displayUpdateDialog = false;
  updateForm!: FormGroup;
  isSubmittingUpdate = false;

  displayMaintenanceDialog = false;
  maintenanceForm!: FormGroup;
  isSubmittingMaintenance = false;

  constructor() {
    this.signalOptions = this.mapLabelsToOptions(OnuSignalLabels);
    this.colorOptions = this.mapLabelsToOptions(OnuColorLabels);
    this.certificateOptions = this.mapLabelsToOptions(OnuCertificateLabels);
    this.maintenanceStatusOptions = this.mapLabelsToOptions(OnuMaintenanceStatusLabels);
  }

  ngOnInit(): void {
    this.initForms();
    this.syncFiltersWithUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.filterForm = this.fb.group({
      onuCertificate: [null],
      onuColor: [null],
      onuSignal: [null],
      serialNumber: ['', Validators.pattern('^[a-zA-Z0-9-]+$')] // Regex para permitir apenas letras, números e hífens
    });
    this.createForm = this.fb.group({
      serialNumber: ['', Validators.required],
      model: ['', Validators.required],
      onuCertificate: [null, Validators.required],
      onuColor: [null, Validators.required],
      onuSignal: [null, Validators.required],
      observation: [''],
    });
    this.updateForm = this.fb.group({
      serialNumber: ['', Validators.required],
      model: ['', Validators.required],
      onuCertificate: [null, Validators.required],
      onuColor: [null, Validators.required],
      onuSignal: [null, Validators.required],
    });
    this.maintenanceForm = this.fb.group({
      detectedProblem: ['', Validators.required],
      status: [null, Validators.required],
      signal: [null, Validators.required],
      observation: [''],
    });
  }

  private syncFiltersWithUrl(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
      this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
      this.first = page * this.rows;

      const filters = {
        onuCertificate: params.get('onuCertificate') as OnuCertificate || null,
        onuColor: params.get('onuColor') as OnuColor || null,
        onuSignal: params.get('onuSignal') as OnuSignal || null,
        serialNumber: params.get('serialNumber') || ''
      };
      this.filterForm.patchValue(filters, { emitEvent: false });
      this.loadOnus();
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

  loadOnus(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);
    const filters = this.filterForm.value;

    this.onuService.findAllOnus(page, this.rows, filters.onuCertificate, filters.onuColor, filters.onuSignal, filters.serialNumber).subscribe({
      next: (dataPage: CustomPageResponse<ViewOnuDto>) => {
        this.onus = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar ONUs.' });
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

  // --- Lógica de CRUD e Dialogs ---
  openCreateDialog(): void {
    this.createForm.reset();
    this.displayCreateDialog = true;
  }

  submitCreateForm(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isSubmittingCreate = true;
    this.onuService.createOnu(this.createForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'ONU criada!' });
        this.displayCreateDialog = false;
        this.loadOnus();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao criar ONU.' }),
      complete: () => this.isSubmittingCreate = false,
    });
  }

  openUpdateDialog(onu: ViewOnuDto): void {
    this.selectedOnu = onu;
    this.updateForm.patchValue(onu);
    this.displayUpdateDialog = true;
  }

  submitUpdateForm(): void {
    if (!this.selectedOnu || this.updateForm.invalid) return;
    this.isSubmittingUpdate = true;
    this.onuService.updateOnu(this.selectedOnu.id, this.updateForm.value).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'ONU atualizada.' });
        this.displayUpdateDialog = false;
        this.loadOnus();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao atualizar ONU.' }),
      complete: () => this.isSubmittingUpdate = false
    });
  }

  openMaintenanceDialog(onu: ViewOnuDto): void {
    this.selectedOnu = onu;
    this.maintenanceForm.reset();
    this.displayMaintenanceDialog = true;
  }

  submitMaintenanceForm(): void {
    if (!this.selectedOnu || this.maintenanceForm.invalid) return;
    this.isSubmittingMaintenance = true;
    const dto: CreateOnuMaintenanceDto = this.maintenanceForm.value;
    this.maintenanceService.createMaintenance(this.selectedOnu.id, dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Manutenção registrada.' });
        this.displayMaintenanceDialog = false;
        this.loadOnus();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao registrar manutenção.' }),
      complete: () => this.isSubmittingMaintenance = false
    });
  }

  confirmDelete(onu: ViewOnuDto): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a ONU com SN: ${onu.serialNumber}? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.onuService.deleteOnu(onu.id).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'ONU excluída.' });
                this.loadOnus();
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao excluir ONU.' })
        });
      }
    });
  }

  
  getSignalLabel(signal: OnuSignal): string {
    return OnuSignalLabels[signal] || signal;
  }

  getColorLabel(color: OnuColor): string {
    return OnuColorLabels[color] || color;
  }

  getCertificateLabel(certificate: OnuCertificate): string {
    return OnuCertificateLabels[certificate] || certificate;
  }
  
  // Helper para a severidade da tag (já existente e correto)
  getSignalSeverity(signal: OnuSignal): any {
    const map: Record<string, string> = { 'NORMAL': 'success', 'WITH_PROBLEM': 'warning', 'LOS': 'danger' };
    return map[signal] || 'info';
  }
  
  // Helper para popular dropdowns (já existente e correto)
  private mapLabelsToOptions = (labels: Record<string, string>): any[] => Object.entries(labels).map(([value, label]) => ({ label, value }));
}
