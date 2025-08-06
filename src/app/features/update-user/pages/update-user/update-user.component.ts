import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { AuthService } from "../../../../core/auth/auth.service";
import { EmployeeService } from "../../../employees/services/employee.service";
import { UpdateUserService } from "../../service/update-user.service";
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from "primeng/api";
import { ToastModule } from 'primeng/toast';

@Component({
  selector: "app-update-user",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    AvatarModule,
    MessageModule,
    ToastModule
  ],
  templateUrl: "./update-user.component.html",
  styleUrl: "./update-user.component.scss",
  providers: [EmployeeService, UpdateUserService, MessageService, ConfirmationService],
})
export class UpdateUserComponent implements OnInit {
  // deixar um popup de confirmação para salvar as alterações

  id!: string;
  form!: FormGroup;
  userLogged!: any;
  employeeService = inject(UpdateUserService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  ngOnInit() {
    this.form = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
    });

    const user = this.authService.currentUserSubject.value;
    const email = user?.employeeId;

    if (email) {
      this.employeeService.getEmployeeByEmail(email).subscribe({
        next: (employee) => {
          this.userLogged = employee;
        },
        error: (err) => {
          console.error("Erro ao buscar employee:", err);
        },
      });
    }
  }

  updatePassword() {
    const user = this.authService.currentUserSubject.value;
    const email = user?.employeeId;

    if (!email) {
      console.error("E-mail do usuário não encontrado!");
      return;
    }

    const formValue = this.form.value.password;

    this.employeeService.getEmployeeByEmail(email).subscribe({
      next: (employee) => {
        if (!employee || !employee.id) {
          console.error("Funcionário não encontrado pelo e-mail!");
          return;
        }

        this.employeeService
          .update(employee.id, { password: formValue })
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: "success",
                summary: "Sucesso",
                detail: "Senha atualizada com sucesso!",
              });
              this.form.reset();
            },
            error: (e) => {
              console.log(e);
            },
          });
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  getUserInitials(): string {
  if (!this.userLogged?.name) return '';
  const names = this.userLogged.name.trim().split(' ');
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}


confirm(event: Event) {
  this.confirmationService.confirm({
    target: event.target as HTMLElement,
    message: 'Você tem certeza que deseja atualizar a senha?',
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    acceptButtonProps: {
      label: 'Salvar',
    },
    rejectButtonProps: {
      label: 'Cancelar',
      severity: 'secondary',
      outlined: true,
    },
    accept: () => {
      this.updatePassword(); 
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'A atualização da senha foi cancelada.',
        life: 3000,
      });
    },
  });
}
}
