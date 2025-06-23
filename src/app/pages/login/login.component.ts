import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from "primeng/password";
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: "app-login",
  imports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm!: FormGroup;
  isLoading = false;
  loginError: string | null = null;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  // Getters para fácil acesso aos controles do formulário no template
  get email() {
    return this.loginForm.get("email");
  }

  get password() {
    return this.loginForm.get("password");
  }

  onSubmit(): void {
    this.loginError = null; // Reseta mensagens de erro anteriores

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca todos os campos como "tocados" para exibir erros de validação
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(["app/home"]); // Redireciona para a página inicial após login bem-sucedido
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.loginError = "Email ou senha incorretos.";
        } else {
          this.loginError = "Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.";
        }
      },
    });

  }
}
