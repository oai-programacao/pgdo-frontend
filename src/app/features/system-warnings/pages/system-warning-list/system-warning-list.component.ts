import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ViewSystemWarningDto, CreateSystemWarningDto, UpdateSystemWarningDto } from '../../../../interfaces/system-warnings.model';
import { SystemWarningService } from '../../services/system-warning.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-system-warning-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ToolbarModule,
    TooltipModule,
    ToggleSwitchModule
  ],
  templateUrl: './system-warning-list.component.html',
  styleUrl: './system-warning-list.component.scss',
  providers: [MessageService]
})
export class SystemWarningListComponent implements OnInit{
  private systemWarningService = inject(SystemWarningService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  warnings: ViewSystemWarningDto[] = [];
  isLoading = true;

  // Para o Dialog de Criação
  displayCreateDialog = false;
  createForm!: FormGroup;
  isCreating = false;

  // Para o Dialog de Atualização
  displayUpdateDialog = false;
  updateForm!: FormGroup;
  isUpdating = false;
  selectedWarning: ViewSystemWarningDto | null = null;

  ngOnInit(): void {
    this.loadWarnings();
    this.initCreateForm();
    this.initUpdateForm();
  }

  loadWarnings(): void {
    this.isLoading = true;
    this.systemWarningService.getWarnings().subscribe({
      next: (data) => {
        this.warnings = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar avisos do sistema.' });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // --- Lógica de Criação ---
  initCreateForm(): void {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
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
    this.isCreating = true;
    const dto: CreateSystemWarningDto = this.createForm.value;

    this.systemWarningService.createWarning(dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aviso criado com sucesso!' });
        this.isCreating = false;
        this.displayCreateDialog = false;
        this.loadWarnings(); // Recarrega a lista
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar o aviso.' });
        this.isCreating = false;
        console.error(err);
      }
    });
  }

  // --- Lógica de Atualização ---
  initUpdateForm(): void {
    this.updateForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      isActive: [true] // O valor inicial será sobrescrito ao abrir o dialog
    });
  }

  openUpdateDialog(warning: ViewSystemWarningDto): void {
    this.selectedWarning = warning;
    this.updateForm.patchValue({
      title: warning.title,
      description: warning.description,
      isActive: warning.isActive
    });
    this.displayUpdateDialog = true;
  }

  submitUpdateForm(): void {
    if (this.updateForm.invalid || !this.selectedWarning) {
      this.updateForm.markAllAsTouched();
      return;
    }
    this.isUpdating = true;
    // Criamos o DTO de atualização apenas com os campos que o backend espera
    const dto: UpdateSystemWarningDto = { 
      title: this.updateForm.value.title,
      description: this.updateForm.value.description,
      isActive: this.updateForm.value.isActive
    };
    
    this.systemWarningService.updateWarning(this.selectedWarning.id, dto).subscribe({
      next: (updatedWarning) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Aviso atualizado com sucesso!' });
        this.isUpdating = false;
        this.displayUpdateDialog = false;
        this.loadWarnings(); // Recarrega a lista para refletir a mudança
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar o aviso.' });
        this.isUpdating = false;
        console.error(err);
      }
    });
  }
  
  // --- Helpers ---
  getSeverityForStatus(isActive: boolean): "success" | "danger" {
    return isActive ? 'success' : 'danger';
  }
}
