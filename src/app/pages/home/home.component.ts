import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { map, Observable } from 'rxjs';
import { HomeBodyComponent } from "../../features/home/components/home-body/home-body.component";

@Component({
  selector: "app-home",
  imports: [CommonModule, HomeBodyComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  public authService = inject(AuthService);
  userRoles$: Observable<string[] | undefined>;

  constructor() {
    this.userRoles$ = this.authService.currentUser$.pipe(
      map((user) => user?.roles)
    );
  }

  // Helper para usar no template com o Observable userRoles$
  // (Se você não quiser expor o authService diretamente ou quiser uma lógica mais centralizada)
  userHasRole(
    userRoles: string[] | undefined | null,
    targetRole: string
  ): boolean {
    if (!userRoles) {
      return false;
    }
    return userRoles.includes(targetRole);
  }
}
