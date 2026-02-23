import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../core/auth/auth.service";
import { MenuItem } from "../../interfaces/menu-item.model";
import { Subscription } from "rxjs";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnDestroy {
  isSidebarCollapsed = false;

  private authService = inject(AuthService);
  private authStateSubscription?: Subscription;
  menuItems: MenuItem[] = [
    {
      id: "home",
      label: "Home",
      icon: "pi pi-home",
      route: "/app/home",
    },
    // Companhia
    {
      id: "company",
      label: "Empresa",
      icon: "pi pi-building",
      allowedRoles: [
        "ROLE_ADMIN",
        "ROLE_STORE_MANAGER",
        "ROLE_STORE_EMPLOYEE",
        "ROLE_CDS",
        "ROLE_TOWER"
      ],
      expanded: false,
      children: [
        {
          id: "colaboradores",
          label: "Colaboradores",
          icon: "pi pi-users",
          route: "/app/colaboradores",
          allowedRoles: ["ROLE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ANALYST", "ROLE_TOWER"],
          exactMatch: true,
        },
        {
          id: "technicians",
          label: "Técnicos",
          icon: "pi pi-wrench",
          route: "/app/tecnicos",
          allowedRoles: [
            "ROLE_ADMIN",
            "ROLE_STORE_MANAGER",
            "ROLE_ANALYST",
            "ROLE_CDS",
            "ROLE_TOWER"
          ],
          exactMatch: true,
        },
        {
          id: "annotations",
          label: "Anotações",
          icon: "pi pi-pen-to-square",
          route: "/app/anotacoes",
          allowedRoles: [
            "ROLE_ADMIN",
            "ROLE_CALL_CENTER",
            "ROLE_STORE_MANAGER",
            "ROLE_ANALYST",
            "ROLE_CDS",
            "ROLE_TOWER"
          ],
        },
      ],
    },
    // Ordens de Serviço
    {
      id: "service-orders",
      label: "Ordens de Serviço",
      icon: "pi pi-briefcase",
      allowedRoles: [
        "ROLE_ADMIN",
        "ROLE_CALL_CENTER",
        "ROLE_STORE_MANAGER",
        "ROLE_STORE_EMPLOYEE",
        "ROLE_CDS",
        "ROLE_TOWER"
      ], // Papéis para ver o item "Ordens de Serviço"
      expanded: false, // Estado inicial do submenu (opcional)
      children: [
        {
          id: "so-list",
          label: "Consultar OS",
          icon: "pi pi-list",
          route: "/app/ordens-de-servico",
          exactMatch: true,
        },
        {
          id: "so-create",
          label: "Nova OS",
          icon: "pi pi-plus-circle",
          route: "/app/ordens-de-servico/nova",
          exactMatch: true,
        },
        {
          id: "so-manage",
          label: "Gerenciar OS",
          icon: "pi pi-calendar",
          route: "/app/ordens-de-servico/gerenciar",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_CDS", "ROLE_TOWER"],
          exactMatch: true,
        },
        {
          id: "so-offers",
          label: "Gerenciar Ofertas",
          icon: "pi pi-envelope",
          route: "/app/ordens-de-servico/ofertas",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_TOWER"],
          exactMatch: true,
        },
        {
          id: "so-block-offers",
          label: "Bloqueio de Ofertas",
          icon: "pi pi-ban",
          route: "/app/ordens-de-servico/bloqueio-ofertas",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_TOWER"],
          exactMatch: true,
        },
        {
          id: "offers-automation",
          label: "Automação de Ofertas",
          icon: "pi pi-lightbulb",
          route: "/app/ordens-de-servico/automacao",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_TOWER"],
          exactMatch: true,
        },
        {
          id: "wired-address",
          label: "Endereços Cabeados",
          icon: "pi pi-map-marker",
          route: "/app/ordens-de-servico/endereco-cabeado",
          allowedRoles: [
            "ROLE_ADMIN",
            "ROLE_STORE_MANAGER",
            "ROLE_ANALYST",
            "ROLE_CDS",
            "ROLE_TOWER"
          ],
        },
      ],
    },
    {
      id: "olt",
      label: "Olt",
      icon: "pi pi-server",
      allowedRoles: [
        "ROLE_ADMIN",
        "ROLE_STORE_MANAGER",
        "ROLE_ANALYST",
        "ROLE_MAINTENANCE",
        "ROLE_CDS",
        "ROLE_CALL_CENTER",
        "ROLE_TOWER"
      ],
      expanded: false,
      children: [
        {
          id: "olt-sn",
          label: "Consultar SN (Pon)",
          icon: "pi pi-list",
          route: "/app/olt/sn",
          exactMatch: true,
        },
        {
          id: "olt-slot",
          label: "Consultar Slot",
          icon: "pi pi-plus-circle",
          route: "/app/olt/slot",
          exactMatch: true,
        },
        {
          id: "olt-users",
          label: "Usuários de OLT",
          icon: "pi pi-users",
          route: "/app/olt/usuarios",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_TOWER"],
          exactMatch: true,
        },
      ],
    },
    {
      id: "onus",
      label: "Onus",
      icon: "pi pi-warehouse",
      route: "/app/onus",
      allowedRoles: [
        "ROLE_ADMIN",
        "ROLE_MAINTENANCE",
        "ROLE_ANALYST",
        "ROLE_CDS",
        "ROLE_TOWER"
      ],
    },
    {
      id: "tickets",
      label: "Chamados",
      icon: "pi pi-clipboard",
      expanded: false,
      children: [
        {
          id: "ticket-create",
          label: "Novo Chamado",
          icon: "pi pi-plus-circle",
          route: "/app/chamados/criar-chamado",
          exactMatch: true,
        },
        {
          id: "ticket-manage",
          label: "Gerenciar Chamados",
          icon: "pi pi-sliders-h",
          route: "/app/chamados/gerenciar",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_MAINTENANCE", "ROLE_TOWER"],
          exactMatch: true,
        },
      ],
    },
    {
      id: "financial",
      label: "Financeiro",
      icon: "pi pi-wallet",
      allowedRoles: [
        "ROLE_ADMIN",
        "ROLE_STORE_MANAGER",
        "ROLE_STORE_EMPLOYEE"
      ],
      expanded: false,
      children: [
        {
          id: "ticket-create",
          label: "Imprimir carne",
          icon: "pi pi-receipt",
          route: "/app/financeiro/gerar-carne",
          exactMatch: true,
        }
      ],
    },

    // {
    //   id: "avaliations",
    //   label: "Avaliações",
    //   icon: "pi pi-star",
    //   route: "/app/avaliacoes",
    //   allowedRoles: ["ROLE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ANALYST"],
    // },
    {
      id: "system-warnings",
      label: "Atualizações do Sistema",
      icon: "pi pi-exclamation-triangle",
      route: "/app/avisos",
      allowedRoles: ["ROLE_ADMIN"],
    },
    // Diagnósticos
    {
      id: "diagnostics",
      label: "Diagnósticos",
      icon: "pi pi-chart-bar",
      route: "/app/diagnosticos",
      allowedRoles: ["ROLE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ANALYST", "ROLE_TOWER"],
    },
    {
      id: "settings",
      label: "Configurações",
      icon: "pi pi-cog",
      route: "/app/configuracoes",
    },
  ];

  ngOnDestroy(): void {
    // Limpa a inscrição para evitar memory leaks
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  handleSettingsClick(event?: MouseEvent): void {
    if (event) event.preventDefault();
  }

  logoutAction(): void {
    this.authService.logout();
  }
}
