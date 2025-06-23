import { Component, inject } from '@angular/core';
import { MenuItem } from '../../interfaces/menu-item.model';
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardWidgetComponent } from "../../shared/components/card-widget/card-widget.component";
import { AuthService } from '../../core/auth/auth.service';
import { map, Observable } from 'rxjs';
import { AdminDashboardComponent } from "../../features/home/pages/admin-dashboard/admin-dashboard.component";
import { StoreManagerDashboardComponent } from '../../features/home/pages/store-manager-dashboard/store-manager-dashboard.component';

@Component({
  selector: "app-home",
  imports: [CommonModule, AdminDashboardComponent, StoreManagerDashboardComponent],
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
