import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputSwitchModule } from 'primeng/inputswitch'; // Para o campo isActive
import { TooltipModule } from 'primeng/tooltip'; // Para pTooltip


import { TechnicianService } from '../../services/technician.service';
import { CreateTechnicianDto, UpdateTechnicianDto, ViewTechnicianDto } from '../../../../interfaces/technician.model';

@Component({
  selector: "app-technician-list",
  imports: [
    CommonModule,
    FormsModule, // Para ngModel nos filtros
    ReactiveFormsModule, // Para formulário de criação
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    InputSwitchModule,
    TooltipModule,
  ],
  templateUrl: "./technician-list.component.html",
  styleUrl: "./technician-list.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class TechnicianListComponent implements OnInit {
  private technicianService = inject(TechnicianService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  technicians: ViewTechnicianDto[] = [];
  isLoading = false;

  // Filtros
  filterIsActiveOptions = [
    { label: "Todos", value: null },
    { label: "Ativos", value: true },
    { label: "Inativos", value: false },
  ];
  selectedIsActive: { label: string; value: boolean | null } =
    this.filterIsActiveOptions[1]; // Padrão: Ativos

  // Dialog e Formulário de Criação
  displayCreateDialog = false;
  createTechnicianForm!: FormGroup;
  isSubmitting = false;

  // Dialog e Formulário de Atualização
  displayUpdateDialog = false;
  updateTechnicianForm!: FormGroup;
  isSubmittingUpdate = false; // Renomeado para clareza
  selectedTechnicianForUpdate: ViewTechnicianDto | null = null;

  ngOnInit(): void {
    this.loadTechnicians();
    this.initCreateForm();
    this.initUpdateForm(); // Inicializar formulário de atualização
  }

  loadTechnicians(): void {
    this.isLoading = true;
    this.technicianService
      .findAll(this.selectedIsActive.value === null ? undefined : this.selectedIsActive.value)
      .subscribe({
        next: (data) => {
          this.technicians = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Falha ao carregar técnicos.",
          });
          this.isLoading = false;
          console.error(err);
        },
      });
  }

  onFilterChange(): void {
    this.loadTechnicians();
  }

  // --- Métodos de Criação ---
  showCreateDialog(): void {
    this.createTechnicianForm.reset(); // Reseta o formulário
    this.displayCreateDialog = true;
  }

  initCreateForm(): void {
    this.createTechnicianForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      rbxUsername: ["", Validators.required],
    });
  }

  createTechnician(): void {
    if (this.createTechnicianForm.invalid) {
      this.createTechnicianForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos obrigatórios.",
      });
      return;
    }
    this.isSubmitting = true;
    const dto: CreateTechnicianDto = this.createTechnicianForm.value;

    this.technicianService.create(dto).subscribe({
      next: (newEmployee) => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Técnico ${newEmployee.name} criado!`,
        });
        this.displayCreateDialog = false;
        this.loadTechnicians(); // Recarrega a lista
        this.isSubmitting = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao criar colaborador.",
        });
        console.error(err);
        this.isSubmitting = false;
      },
    });
  }

  // --- Métodos de Atualização ---
  initUpdateForm(): void {
    this.updateTechnicianForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      rbxUsername: [""], // Não obrigatório por padrão
      isActive: [true, Validators.required], // Default para true, InputSwitch lida bem com booleano
    });
  }

  showUpdateDialog(technician: ViewTechnicianDto): void {
    this.selectedTechnicianForUpdate = technician;
    this.updateTechnicianForm.patchValue({
      name: technician.name,
      email: technician.email,
      rbxUsername: technician.rbxUsername || "",
      isActive: technician.isActive, // Diretamente o booleano
    });
    this.isSubmittingUpdate = false;
    this.displayUpdateDialog = true;
  }

  updateTechnician(): void {
    if (
      !this.selectedTechnicianForUpdate ||
      !this.selectedTechnicianForUpdate.id
    ) {
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "Nenhum técnico selecionado para atualização.",
      });
      return;
    }

    if (this.updateTechnicianForm.invalid) {
      this.updateTechnicianForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha corretamente todos os campos obrigatórios.",
      });
      return;
    }

    this.isSubmittingUpdate = true;
    const formValues = this.updateTechnicianForm.value;
    const dto: UpdateTechnicianDto = {
      name: formValues.name,
      email: formValues.email,
      rbxUsername: formValues.rbxUsername || null,
      isActive: formValues.isActive, // Envia o valor booleano do form
    };

    this.technicianService
      .update(this.selectedTechnicianForUpdate.id, dto)
      .subscribe({
        next: (updatedTechnician) => {
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: `Técnico ${updatedTechnician.name} atualizado!`,
          });
          this.displayUpdateDialog = false;
          this.loadTechnicians();
          this.isSubmittingUpdate = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: err.error?.message || "Falha ao atualizar técnico.",
          });
          console.error(err);
          this.isSubmittingUpdate = false;
        },
      });
  }

  getSeverityForStatus(isActive: boolean): "success" | "danger" {
    return isActive ? "success" : "danger";
  }
}
