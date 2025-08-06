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

@Component({
  selector: "app-update-user",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    AvatarModule,
    MessageModule
  ],
  templateUrl: "./update-user.component.html",
  styleUrl: "./update-user.component.scss",
})
export class UpdateUserComponent implements OnInit {
  // deixar um popup de confirmação para salvar as alterações

  id!: string;
  form!: FormGroup;
  userLogged!: any;
  employeeService = inject(UpdateUserService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  ngOnInit() {
    this.form = this.fb.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
    });

    const user = this.authService.currentUserSubject.value;
    const email = user?.employeeId;

    if (email) {
      console.log("Email para busca:", email);
      this.employeeService.getEmployeeByEmail(email).subscribe({
        next: (employee) => {
          console.log("employee recebido:", employee);
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
            next: () => {},
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
}
