import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../core/auth/auth.service";
import { MenuItem } from "../../interfaces/menu-item.model";
import { SseService } from "../../core/sse/sse.service";
import { distinctUntilChanged, Subscription, tap } from "rxjs";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;

  private authService = inject(AuthService);
  private sseService = inject(SseService);

  private authStateSubscription?: Subscription;

  menuItems: MenuItem[] = [
    {
      id: "home",
      label: "Home",
      icon: "pi pi-home",
      route: "/app/home",
    },
    // Clientes
    {
      id: "clients",
      label: "Clientes",
      icon: "pi pi-users",
      allowedRoles: [
        "ROLE_ADMIN",
        "ROLE_STORE_MANAGER",
        "ROLE_USER",
        "ROLE_STORE_EMPLOYEE",
        "ROLE_CDS",
      ],
      expanded: false, // Estado inicial do submenu (opcional)
      children: [
        // {
        //   id: "client-list",
        //   label: "Buscar Faturas",
        //   icon: "pi pi-receipt",
        //   route: "/app/clientes/procurar",
        //   exactMatch: true,
        // },
        {
          id: "pesquisar-cliente",
          label: "Pesquisar Cliente",
          icon: "pi pi-search",
          route: "/app/clientes/pesquisar-cliente",
          exactMatch: true,
        },
        {
          id: "register-client",
          label: "Cadastrar Novo Cliente",
          icon: "pi pi-user-plus",
          route: "/app/clientes/cliente-cadastrar",
          exactMatch: true,
        },
        {
          id: "client-list",
          label: "Listar Clientes",
          icon: "pi pi-users",
          route: "/app/clientes/cliente-cadastrados",
          exactMatch: true,
        },
        {
          id: "confirm-installation",
          label: "Confirmar Instalação",
          icon: "pi pi-check",
          route: "/app/clientes/confirmar-instalacao",
          exactMatch: true,
        },
        {
          id: "change-owner",
          label: "Troca de Titularidade",
          icon: "pi pi-file-export",
          route: "/app/troca-titularidade",
          allowedRoles: [
            "ROLE_ADMIN",
            "ROLE_STORE_MANAGER",
            "ROLE_STORE_EMPLOYEE",
          ],
        },
      ],
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
      ],
      expanded: false,
      children: [
        {
          id: "colaboradores",
          label: "Colaboradores",
          icon: "pi pi-users",
          route: "/app/colaboradores",
          allowedRoles: ["ROLE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ANALYST"], // Papéis para ver o item "Colaboradores"
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
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_CDS"],
          exactMatch: true,
        },
        {
          id: "so-offers",
          label: "Gerenciar Ofertas",
          icon: "pi pi-envelope",
          route: "/app/ordens-de-servico/ofertas",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST"],
          exactMatch: true,
        },
        {
          id: "so-block-offers",
          label: "Bloqueio de Ofertas",
          icon: "pi pi-ban",
          route: "/app/ordens-de-servico/bloqueio-ofertas",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST"],
          exactMatch: true,
        },
        {
          id: "offers-automation",
          label: "Automação de Ofertas",
          icon: "pi pi-lightbulb",
          route: "/app/ordens-de-servico/automacao",
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST"],
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
          ],
        },
      ],
    },
    // Vendas
    // {
    //   id: "sales",
    //   label: "Vendas",
    //   icon: "pi pi-dollar",
    //   allowedRoles: ["ROLE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_STORE_EMPLOYEE"],
    //   expanded: false,
    //   children: [
    //     {
    //       id: "sales-list",
    //       label: "Minhas Vendas",
    //       icon: "pi pi-list",
    //       route: "/app/minhas-vendas",
    //       exactMatch: true,
    //       allowedRoles: ["ROLE_STORE_EMPLOYEE"],
    //     },
    //     {
    //       id: "sales-manage",
    //       label: "Gerenciar Todas Vendas",
    //       icon: "pi pi-sliders-h",
    //       route: "/app/vendas",
    //       allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST"],
    //       exactMatch: true,
    //     },
    //   ],
    // },
    // Pós Vendas
    // {
    //   id: "after-sales",
    //   label: "Pós-Vendas",
    //   icon: "pi pi-check-circle",
    //   route: "/app/pos-vendas",
    //   allowedRoles: [
    //     "ROLE_ADMIN",
    //     "ROLE_STORE_MANAGER",
    //     "ROLE_ANALYST",
    //     "ROLE_STORE_EMPLOYEE",
    //   ],
    // },
    // ONUs
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
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST"],
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
          allowedRoles: ["ROLE_ADMIN", "ROLE_ANALYST", "ROLE_MAINTENANCE"],
          exactMatch: true,
        },
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
      label: "Avisos do Sistema",
      icon: "pi pi-exclamation-triangle",
      route: "/app/avisos",
      allowedRoles: ["ROLE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ANALYST"],
    },
    // Diagnósticos
    {
      id: "diagnostics",
      label: "Diagnósticos",
      icon: "pi pi-chart-bar",
      route: "/app/diagnosticos",
      allowedRoles: ["ROLE_ADMIN", "ROLE_STORE_MANAGER", "ROLE_ANALYST"],
    },
    {
      id: "settings",
      label: "Configurações",
      icon: "pi pi-cog",
      route: "/app/configuracoes",
    },
  ];

  ngOnInit(): void {
    // Ouve as mudanças no estado do usuário
    this.authStateSubscription = this.authService.currentUser$.subscribe(
      (user) => {
        if (user) {
          // Se há um usuário, conecta o SSE
          console.log("User logged in, connecting to SSE...");
          this.sseService.connect();
        } else {
          // Se não há usuário (logout), desconecta o SSE
          console.log("User logged out, disconnecting from SSE...");
          this.sseService.disconnect();
        }
      }
    );
  }

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
