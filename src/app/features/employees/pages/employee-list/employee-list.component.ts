import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms"; // Para filtros e formulário de criação

// PrimeNG Modules
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { ToastModule } from "primeng/toast";
import { ConfirmationService, MessageService } from "primeng/api"; // Para toasts e confirmação
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";


import { EmployeeService } from "../../services/employee.service";
import { ViewEmployeeDto, EmployeeRole, CreateEmployeeDto, UpdateEmployeeDto } from "../../../../interfaces/employee.model";

@Component({
  selector: "app-employee-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Para ngModel nos filtros
    ReactiveFormsModule, // Para formulário de criação
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    TooltipModule,
  ],
  templateUrl: "./employee-list.component.html",
  providers: [MessageService, ConfirmationService], // Provedores para Toast e ConfirmDialog
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  employees: ViewEmployeeDto[] = [];
  isLoading = false;

  // Filtros
  filterIsActiveOptions = [
    { label: "Todos", value: null },
    { label: "Ativos", value: true },
    { label: "Inativos", value: false },
  ];
  selectedIsActive: { label: string; value: boolean | null } =
    this.filterIsActiveOptions[1];

  employeeRoleOptions = [
    { label: "Todos os Papéis", value: null },
    { label: "Administrador", value: EmployeeRole.ADMIN },
    { label: "Gerente de Loja", value: EmployeeRole.STORE_MANAGER },
    { label: "Colaborador - Loja", value: EmployeeRole.STORE_EMPLOYEE },
    { label: "Analista", value: EmployeeRole.ANALYST },
    { label: "CDS", value: EmployeeRole.CDS },
    { label: "Call Center", value: EmployeeRole.CALL_CENTER },
    { label: "Manutenção", value: EmployeeRole.MAINTENANCE },
    { label: "Torre", value: EmployeeRole.TOWER }
  ];
  selectedRole: EmployeeRole | null = null;

  // Dialog e Formulário de Criação
  displayCreateDialog = false;
  createEmployeeForm!: FormGroup;
  isSubmitting = false;

  // Dialog e Formulário de Atualização
  displayUpdateDialog = false;
  updateEmployeeForm!: FormGroup;
  isUpdating = false;
  selectedEmployeeForUpdate: ViewEmployeeDto | null = null;

  ngOnInit(): void {
    this.loadEmployees();
    this.initCreateForm();
    this.initUpdateForm();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService
      .findAll(
        this.selectedIsActive.value === null
          ? undefined
          : this.selectedIsActive.value,
        this.selectedRole! === null ? undefined : this.selectedRole
      )
      .subscribe({
        next: (data) => {
          this.employees = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: "Falha ao carregar colaboradores.",
          });
          this.isLoading = false;
          console.error(err);
        },
      });
  }

  onFilterChange(): void {
    this.loadEmployees();
  }

  //-----Métodos de Criação -------
  showCreateDialog(): void {
    this.createEmployeeForm.reset(); // Reseta o formulário
    this.displayCreateDialog = true;
  }

  initCreateForm(): void {
    this.createEmployeeForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      rbxUsername: [""], // Não obrigatório, mas pode ser
      role: [null, Validators.required],
    });
  }

  createEmployee(): void {
    if (this.createEmployeeForm.invalid) {
      this.createEmployeeForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha todos os campos obrigatórios.",
      });
      return;
    }
    this.isSubmitting = true;
    const dto: CreateEmployeeDto = this.createEmployeeForm.value;

    this.employeeService.create(dto).subscribe({
      next: (newEmployee) => {
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: `Colaborador ${newEmployee.name} criado!`,
        });
        this.displayCreateDialog = false;
        this.loadEmployees(); // Recarrega a lista
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

  // -- Métodos de Atualização -------
  initUpdateForm(): void {
    this.updateEmployeeForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      rbxUsername: [""], // Não obrigatório, mas pode ser
      role: [null, Validators.required],
    });
  }

  showUpdateDialog(employee: ViewEmployeeDto): void {
    this.selectedEmployeeForUpdate = employee;
    this.updateEmployeeForm.patchValue({
      name: employee.name,
      email: employee.email,
      rbxUsername: employee.rbxUsername || "", // Garante que seja uma string vazia se null/undefined
      role: employee.role,
    });
    this.isUpdating = false;
    this.displayUpdateDialog = true;
  }

  updateEmployee(): void {
    if (!this.selectedEmployeeForUpdate || !this.selectedEmployeeForUpdate.id) {
      this.messageService.add({
        severity: "error",
        summary: "Erro",
        detail: "Nenhum colaborador selecionado para atualização.",
      });
      return;
    }

    if (this.updateEmployeeForm.invalid) {
      this.updateEmployeeForm.markAllAsTouched();
      this.messageService.add({
        severity: "warn",
        summary: "Atenção",
        detail: "Preencha corretamente todos os campos obrigatórios.",
      });
      return;
    }

    this.isUpdating = true;
    const formValues = this.updateEmployeeForm.value;
    const dto: UpdateEmployeeDto = {
      name: formValues.name,
      email: formValues.email,
      rbxUsername: formValues.rbxUsername || null, // Enviar null se vazio, para que o backend possa ignorar se não alterado
      role: formValues.role,
    };

    this.employeeService
      .update(this.selectedEmployeeForUpdate.id, dto)
      .subscribe({
        next: (updatedEmployee) => {
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: `Colaborador ${updatedEmployee.name} atualizado!`,
          });
          this.displayUpdateDialog = false;
          this.loadEmployees(); // Recarrega a lista para refletir as mudanças
          this.isUpdating = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: "error",
            summary: "Erro",
            detail: err.error?.message || "Falha ao atualizar colaborador.", // Exibir mensagem do backend se disponível
          });
          console.error(err);
          this.isUpdating = false;
        },
      });
  }

  //-----Métodos de Ativação/Inativação -------

  confirmActivate(employee: ViewEmployeeDto): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja ATIVAR o colaborador ${employee.name}?`,
      header: "Confirmação de Ativação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, Ativar",
      rejectLabel: "Não",
      accept: () => {
        this.employeeService.activate(employee.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Sucesso",
              detail: "Colaborador ativado!",
            });
            this.loadEmployees();
          },
          error: (err) => {
            this.messageService.add({
              severity: "error",
              summary: "Erro",
              detail: "Falha ao ativar colaborador.",
            });
            console.error(err);
          },
        });
      },
    });
  }

  confirmInactivate(employee: ViewEmployeeDto): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja INATIVAR o colaborador ${employee.name}? Esta ação pode restringir o acesso dele ao sistema.`,
      header: "Confirmação de Inativação",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, Inativar",
      rejectLabel: "Não",
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        this.employeeService.inactivate(employee.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Sucesso",
              detail: "Colaborador inativado!",
            });
            this.loadEmployees();
          },
          error: (err) => {
            this.messageService.add({
              severity: "error",
              summary: "Erro",
              detail: "Falha ao inativar colaborador.",
            });
            console.error(err);
          },
        });
      },
    });
  }

  getSeverityForStatus(isActive: boolean): "success" | "danger" {
    return isActive ? "success" : "danger";
  }
}
