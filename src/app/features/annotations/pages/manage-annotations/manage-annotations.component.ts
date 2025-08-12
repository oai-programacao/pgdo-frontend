import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { FormatDurationPipe } from '../../../../shared/pipes/format-duration.pipe';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, takeUntil, debounceTime, distinctUntilChanged, mergeMap, map, catchError, forkJoin, of } from 'rxjs';
import { ViewAnnotationDto, AnnotationTypeLabels, AnnotationType, CreateAnnotationDto } from '../../../../interfaces/annotations.model';
import { ViewEmployeeDto } from '../../../../interfaces/employee.model';
import { CustomPageResponse } from '../../../../interfaces/service-order.model';
import { EmployeeService } from '../../../employees/services/employee.service';
import { AnnotationsService } from '../../services/annotations.service';
import { TechnicianService } from '../../../technicians/services/technician.service';
import { ViewTechnicianDto } from '../../../../interfaces/technician.model';

@Component({
  selector: 'app-manage-annotations',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    TagModule, 
    InputTextModule,
    SelectModule, 
    DialogModule, 
    TextareaModule, 
    ToastModule, 
    ToolbarModule,
    TooltipModule, 
    FieldsetModule, 
    DatePickerModule, 
    FormatDurationPipe
  ],
  templateUrl: './manage-annotations.component.html',
  styleUrl: './manage-annotations.component.scss',
  providers: [MessageService, DatePipe]
})
export class ManageAnnotationsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private annotationsService = inject(AnnotationsService);
  private employeeService = inject(EmployeeService);
  private technicianService = inject(TechnicianService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private datePipe = inject(DatePipe);
  private destroy$ = new Subject<void>();

  annotations: ViewAnnotationDto[] = [];
  totalRecords = 0;
  isLoading = true;
  rows = 10;
  first = 0;

  filterForm!: FormGroup;
  annotationTypeOptions: any[];
  employeesAndTechnicians!: { label: string; value: string; }[];
  isLoadingDropdown = false;

  displayCreateDialog = false;
  createForm!: FormGroup;
  isSubmitting = false;

  constructor() {
    this.annotationTypeOptions = Object.entries(AnnotationTypeLabels).map(([value, label]) => ({ label, value }));
    this.loadCombinedOptions();
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.initCreateForm();
    this.syncFiltersWithUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCombinedOptions(): void {
    this.isLoadingDropdown = true;

    const employees$ = this.employeeService.findAll(true).pipe(
      catchError(err => {
        console.error("Erro ao carregar funcionários", err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar funcionários.' });
        return of([]); // Retorna um array vazio em caso de erro
      })
    );

    const technicians$ = this.technicianService.findAll(true).pipe(
      catchError(err => {
        console.error("Erro ao carregar técnicos", err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar técnicos.' });
        return of([]);
      })
    );

    forkJoin({
      employees: employees$,
      technicians: technicians$
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ employees, technicians }) => {
        const mappedEmployees = employees.map(emp => ({ label: emp.name, value: emp.id }));
        const mappedTechnicians = technicians.map(tech => ({ label: `(Téc) ${tech.name}`, value: tech.id }));

        this.employeesAndTechnicians = [...mappedEmployees, ...mappedTechnicians]
          .sort((a, b) => a.label.localeCompare(b.label));
        
        this.isLoadingDropdown = false;
      },
      error: (err) => {
        console.error("Erro inesperado ao combinar chamadas:", err);
        this.isLoadingDropdown = false;
      }
    });
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      employeeId: [null],
      creatorId: [null],
      type: [null]
    });
  }

  private initCreateForm(): void {
    this.createForm = this.fb.group({
      employeeId: [null, Validators.required],
      type: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      description: ['', Validators.required]
    });
  }

  private syncFiltersWithUrl(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
      this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
      this.first = page * this.rows;

      const filters = {
        employeeId: params.get('employeeId') || null,
        creatorId: params.get('creatorId') || null,
        type: params.get('type') as AnnotationType || null,
      };
      this.filterForm.patchValue(filters, { emitEvent: false });
      this.loadAnnotations();
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

  loadAnnotations(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);
    const filters = this.filterForm.value;

    this.annotationsService.getAnnotations(page, this.rows, filters.employeeId, filters.creatorId, filters.type).subscribe({
      next: (dataPage: CustomPageResponse<ViewAnnotationDto>) => {
        this.annotations = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar anotações.' });
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

  openCreateDialog(): void {
    this.createForm.reset();
    this.displayCreateDialog = true;
  }

  submitCreateForm(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.createForm.value;

    // O backend espera timestamps ISO, o p-calendar com showTime retorna um objeto Date
    const dto: CreateAnnotationDto = {
      employeeId: formValue.employeeId,
      type: formValue.type,
      description: formValue.description,
      startDate: this.datePipe.transform(formValue.startDate, 'dd/MM/yyyy HH:mm:ss') || '',
      endDate: this.datePipe.transform(formValue.endDate, 'dd/MM/yyyy HH:mm:ss') || ''
    };

    this.annotationsService.createAnnotation(dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Anotação criada com sucesso!' });
        this.isSubmitting = false;
        this.displayCreateDialog = false;
        this.loadAnnotations();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao criar anotação.' });
        this.isSubmitting = false;
      }
    });
  }

  getAnnotationTypeLabel = (type: AnnotationType) => AnnotationTypeLabels[type] || type;
}
