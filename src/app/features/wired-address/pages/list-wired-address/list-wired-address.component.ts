import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CitiesLabels, City } from '../../../../interfaces/enums.model';
import { ViewWiredAddressDto } from '../../../../interfaces/wired-address.model';
import { WiredAddressService } from '../../services/wired-address.service';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-list-wired-address',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule,
    ToastModule, 
    ToolbarModule, 
    MultiSelectModule, 
    TooltipModule, 
    FieldsetModule,
    TagModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './list-wired-address.component.html',
  styleUrl: './list-wired-address.component.scss',
  providers: [MessageService, DatePipe]
})
export class ListWiredAddressComponent implements OnInit, OnDestroy{

  private fb = inject(FormBuilder);
  private wiredAddressService = inject(WiredAddressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  // Estado da Tabela
  addresses: ViewWiredAddressDto[] = [];
  totalRecords = 0;
  isLoading = true;
  rows = 10;
  first = 0;

  // Filtros
  filterForm!: FormGroup;
  cityOptions: any[];

  constructor() {
    this.cityOptions = Object.entries(CitiesLabels).map(([value, label]) => ({ label, value }));
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.syncFiltersWithUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      clientName: [''],
      address: [''],
      cities: [[]]
    });
  }

  private syncFiltersWithUrl(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
      this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
      this.first = page * this.rows;

      const filters = {
        clientName: params.get('clientName') || null,
        address: params.get('address') || null,
        cities: params.getAll('cities') || [],
      };
      this.filterForm.patchValue(filters, { emitEvent: false });
      this.loadAddresses();
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

  loadAddresses(event?: TableLazyLoadEvent): void {
    this.isLoading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);
    const filters = this.filterForm.value;

    this.wiredAddressService.getWiredAddresses(filters, page, this.rows).subscribe({
      next: (dataPage) => {
        this.addresses = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar endereços.' });
        this.isLoading = false;
      }
    });
  }

  updateUrl(): void {
    const page = Math.floor(this.first / this.rows);
    const formValues = this.filterForm.value;
    const queryParams: any = { page, size: this.rows };
    for (const key in formValues) {
      const value = formValues[key];
      if (value && (!Array.isArray(value) || value.length > 0)) {
        queryParams[key] = value;
      }
    }
    this.router.navigate([], { relativeTo: this.route, queryParams });
  }

  clearFilters(): void {
    this.filterForm.reset({ clientName: '', address: '', cities: [] });
  }

  // Helper para exibir o label do enum de cidade na tabela
  getCityLabel(city: City): string {
    return CitiesLabels[city] || city;
  }

}
