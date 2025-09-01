import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ViewOltUserDto, OLTsLabels, CreateOltUserDto } from '../../../../interfaces/olt.model';
import { OltService } from '../../services/olt.service';
import { CommonModule} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-olt-users',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule, 
    SelectModule, 
    ToastModule, 
    ToolbarModule, 
    TooltipModule,
    PasswordModule, 
    ConfirmDialogModule, 
    TagModule
  ],
  templateUrl: './olt-users.component.html',
  styleUrl: './olt-users.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class OltUsersComponent implements OnInit{
  private oltService = inject(OltService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  oltUsers: ViewOltUserDto[] = [];
  isLoading = true;

  // Dialog de Criação
  displayCreateDialog = false;
  createForm!: FormGroup;
  isSubmitting = false;

  // Opções de Dropdown
  oltOptions: any[];

  constructor() {
    this.oltOptions = Object.entries(OLTsLabels).map(([value, label]) => ({ label, value }));
  }

  ngOnInit(): void {
    this.loadOltUsers();
    this.initCreateForm();
  }

  loadOltUsers(): void {
    this.isLoading = true;
    this.oltService.getOltUsers().subscribe({
      next: (data) => {
        this.oltUsers = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar usuários da OLT.' });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  initCreateForm(): void {
    this.createForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      olt: [null, Validators.required]
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
    this.isSubmitting = true;
    const dto: CreateOltUserDto = this.createForm.value;

    this.oltService.createOltUser(dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário de OLT criado!' });
        this.isSubmitting = false;
        this.displayCreateDialog = false;
        this.loadOltUsers();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao criar usuário.' });
        this.isSubmitting = false;
      }
    });
  }

  confirmDelete(user: ViewOltUserDto): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o usuário "${user.username}" da OLT ${OLTsLabels[user.olt]}? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isLoading = true;
        this.oltService.deleteOltUser(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário excluído.' });
            this.loadOltUsers();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao excluir usuário.' });
            this.isLoading = false;
          }
        });
      }
    });
  }
}
