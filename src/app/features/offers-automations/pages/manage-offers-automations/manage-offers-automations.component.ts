import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TypeOfOsLabels, PeriodLabels, CitiesLabels } from '../../../../interfaces/enums.model';
import { ViewOffersAutomationDto, OfferAutomationTypeLabels, CreateOffersAutomationDto } from '../../../../interfaces/offers-automation.model';
import { OffersAutomationsService } from '../../services/offers-automations.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-manage-offers-automations',
  imports: [
    FormsModule,
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule,
    TextareaModule, 
    MultiSelectModule, 
    SelectButtonModule, 
    InputNumberModule, 
    ToastModule,
    ToolbarModule, 
    TooltipModule, 
    TagModule, 
    ToggleSwitchModule, 
  ],
  templateUrl: './manage-offers-automations.component.html',
  styleUrl: './manage-offers-automations.component.scss',
  providers: [MessageService]
})
export class ManageOffersAutomationsComponent implements OnInit{
  private offersAutomationsService = inject(OffersAutomationsService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  automations: ViewOffersAutomationDto[] = [];
  isLoading = true;

  // Dialog de Criação
  displayCreateDialog = false;
  createForm!: FormGroup;
  isSubmitting = false;
  
  // Opções para Dropdowns e Seletores
  typeOfOsOptions: any[];
  periodOptions: any[];
  cityOptions: any[];
  automationTypeOptions: any[];

  constructor() {
    // Mapeia os Enums e Labels para o formato que os componentes do PrimeNG esperam
    this.typeOfOsOptions = this.mapLabelsToOptions(TypeOfOsLabels);
    this.periodOptions = this.mapLabelsToOptions(PeriodLabels);
    this.cityOptions = this.mapLabelsToOptions(CitiesLabels);
    this.automationTypeOptions = this.mapLabelsToOptions(OfferAutomationTypeLabels);
  }

  ngOnInit(): void {
    this.loadAutomations();
    this.initCreateForm();
  }

  loadAutomations(): void {
    this.isLoading = true;
    this.offersAutomationsService.getOffersAutomations().subscribe({
      next: (data) => {
        this.automations = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar automações.' });
        this.isLoading = false;
      }
    });
  }

  initCreateForm(): void {
    this.createForm = this.fb.group({
      description: ['', Validators.required],
      serviceOrderTypes: [[], Validators.required],
      periods: [[], Validators.required],
      cities: [[], Validators.required],
      offerAutomationType: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  openCreateDialog(): void {
    this.createForm.reset({ quantity: 1 }); // Reseta o form com um valor padrão
    this.displayCreateDialog = true;
  }

  submitCreateForm(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const dto: CreateOffersAutomationDto = this.createForm.value;

    this.offersAutomationsService.createOffersAutomation(dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Automação criada com sucesso!' });
        this.isSubmitting = false;
        this.displayCreateDialog = false;
        this.loadAutomations();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao criar automação.' });
        this.isSubmitting = false;
      }
    });
  }
  
  onStatusChange(automation: ViewOffersAutomationDto, isActive: boolean): void {
    this.isLoading = true;
    this.offersAutomationsService.updateOffersAutomationStatus(automation.id, { isActive }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Automação "${automation.description}" foi ${isActive ? 'ativada' : 'desativada'}.`});
        this.loadAutomations(); // Recarrega para garantir consistência
      },
      error: (err) => {
        // Reverte o switch em caso de erro
        automation.isActive = !isActive;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao atualizar o status.' });
        this.isLoading = false;
      }
    });
  }

  // --- Helpers ---
  private mapLabelsToOptions = (labels: Record<string, string>): any[] => Object.entries(labels).map(([value, label]) => ({ label, value }));
  getOfferAutomationTypeLabel(type: string): string {
    return OfferAutomationTypeLabels[type as keyof typeof OfferAutomationTypeLabels] || type;
  }

  getTypeOfOsLabel(type: string): string {
    return TypeOfOsLabels[type as keyof typeof TypeOfOsLabels] || type;
  }
  getPeriodLabel(period: string): string {
    return PeriodLabels[period as keyof typeof PeriodLabels] || period;
  }
  getCityLabel(city: string): string {
    return CitiesLabels[city as keyof typeof CitiesLabels] || city;
  }
}
