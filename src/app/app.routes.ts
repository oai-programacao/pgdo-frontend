import { Routes } from "@angular/router";
import { loginGuard } from "./core/auth/login.guard";
import { authGuard } from "./core/auth/auth.guard";
import { MainLayoutComponent } from "./layouts/main-layout/main-layout.component";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.component").then((m) => m.LoginComponent),
    canActivate: [loginGuard],
    title: "Login", // Título da página, pode ser usado para SEO ou breadcrumbs
  },
  {
    path: "app", // Um prefixo para todas as rotas autenticadas
    component: MainLayoutComponent, // O MainLayoutComponent é carregado aqui
    // canActivate: [authGuard],       // Protege todo o layout e seus filhos
    children: [
      // Rotas filhas que serão renderizadas DENTRO do router-outlet do MainLayoutComponent
      {
        path: "home", // A URL final será /app/home
        loadComponent: () =>
          import("./pages/home/home.component").then((m) => m.HomeComponent),
        title: "Home", // Título da página, pode ser usado para SEO ou breadcrumbs
        // Não precisa de authGuard aqui de novo, pois a rota pai 'app' já está protegida
      },

      {
        path: "clientes/cliente-cadastrados",
        loadComponent: () =>
          import(
            "./features/register-new-client/pages/list-client-register/list-client-register.component"
          ).then((m) => m.ListClientRegisterComponent),
        title: "Clientes Cadastrados",
      },

      {
        path: "clientes/cliente-cadastrar",
        loadComponent: () =>
          import(
            "./features/register-new-client/pages/register-new-client/register-new-client.component"
          ).then((m) => m.RegisterNewClientComponent),
        title: "Cadastrar Novo Cliente",

      },
      {
        path: "clientes/pesquisar-cliente",
        loadComponent: () =>
          import(
            "./features/register-new-client/pages/search-client/search-client.component"
          ).then((m) => m.SearchClientComponent),
        title: "Pesquisar Cliente",
      },
      {
        path: "clientes/confirmar-instalacao",
        loadComponent: () =>
          import(
            "./features/register-new-client/pages/confirm-installation/confirm-installation.component"
          ).then((m) => m.ConfirmInstalationComponent),
        title: "Confirmar Instalação",
      },

      {
        path: "clientes/procurar",
        loadComponent: () =>
          import(
            "./features/client-financial/pages/search-client-financial/search-client-financial.component"
          ).then((m) => m.SearchClientFinancialComponent),
        title: "Clientes",
      },
      {
        path: "colaboradores",
        loadComponent: () =>
          import(
            "./features/employees/pages/employee-list/employee-list.component"
          ).then((m) => m.EmployeeListComponent),
        title: "Colaboradores",
      },
      {
        path: "tecnicos",
        loadComponent: () =>
          import(
            "./features/technicians/pages/technician-list/technician-list.component"
          ).then((m) => m.TechnicianListComponent),
        title: "Técnicos",
      },
      {
        path: "anotacoes",
        loadComponent: () =>
          import(
            "./features/annotations/pages/manage-annotations/manage-annotations.component"
          ).then((m) => m.ManageAnnotationsComponent),
        title: "Anotações",
      },
      {
        path: "ordens-de-servico",
        loadComponent: () =>
          import(
            "./features/service-orders/pages/list-service-order/list-service-order.component"
          ).then((m) => m.ListServiceOrderComponent),
        title: "Ordens de Serviço",
      },
      {
        path: "ordens-de-servico/nova",
        loadComponent: () =>
          import(
            "./features/service-orders/pages/create-service-order/create-service-order.component"
          ).then((m) => m.CreateServiceOrderComponent),
        title: "Nova Ordem de Serviço",
      },
      {
        path: "ordens-de-servico/gerenciar",
        loadComponent: () =>
          import(
            "./features/service-orders/pages/admin-service-orders/admin-service-orders.component"
          ).then((m) => m.AdminServiceOrdersComponent),
        title: "Gerenciar Ordens de Serviço",
      },
      {
        path: "ordens-de-servico/ofertas",
        loadComponent: () =>
          import(
            "./features/offers/pages/offers-list/offers-list.component"
          ).then((m) => m.OffersListComponent),
        title: "Ofertas",
      },
      {
        path: "ordens-de-servico/bloqueio-ofertas",
        loadComponent: () =>
          import(
            "./features/offers/pages/block-offers-request/block-offers-request.component"
          ).then((m) => m.BlockOffersRequestComponent),
        title: "Bloqueio de Ofertas",
      },
      {
        path: "ordens-de-servico/automacao",
        loadComponent: () =>
          import(
            "./features/offers-automations/pages/manage-offers-automations/manage-offers-automations.component"
          ).then((m) => m.ManageOffersAutomationsComponent),
        title: "Gerenciar Automação de Ofertas",
      },
      {
        path: "ordens-de-servico/endereco-cabeado",
        loadComponent: () =>
          import(
            "./features/wired-address/pages/list-wired-address/list-wired-address.component"
          ).then((m) => m.ListWiredAddressComponent),
        title: "Endereços Cabeados",
      },
      {
        path: "minhas-vendas",
        loadComponent: () =>
          import(
            "./features/sales/pages/seller-manage-sales/seller-manage-sales.component"
          ).then((m) => m.SellerManageSalesComponent),
        title: "Minhas Vendas",
      },
      {
        path: "vendas",
        loadComponent: () =>
          import(
            "./features/sales/pages/admin-manage-sales/admin-manage-sales.component"
          ).then((m) => m.AdminManageSalesComponent),
        title: "Gerenciar Vendas",
      },
      {
        path: "pos-vendas",
        loadComponent: () =>
          import(
            "./features/after-sales/pages/manage-after-sales/manage-after-sales.component"
          ).then((m) => m.ManageAfterSalesComponent),
        title: "Pós Vendas",
      },
      {
        path: "onus",
        loadComponent: () =>
          import("./features/onu/pages/manage-onu/manage-onu.component").then(
            (m) => m.ManageOnuComponent
          ),
        title: "Gerenciar ONUs",
      },
      {
        path: "olt/slot",
        loadComponent: () =>
          import(
            "./features/olt/pages/olt-query-by-slot/olt-query-by-slot.component"
          ).then((m) => m.OltQueryBySlotComponent),
        title: "Consulta por Slot",
      },
      {
        path: "olt/usuarios",
        loadComponent: () =>
          import("./features/olt/pages/olt-users/olt-users.component").then(
            (m) => m.OltUsersComponent
          ),
        title: "Usuários de OLT",
      },
      {
        path: "chamados/criar-chamado",
        loadComponent: () =>
          import(
            "./features/tickets/pages/create-ticket/create-ticket.component"
          ).then((m) => m.CreateTicketComponent),
        title: "Criar Chamado",
      },
      {
        path: "chamados/gerenciar",
        loadComponent: () =>
          import(
            "./features/tickets/pages/manage-tickets/manage-tickets.component"
          ).then((m) => m.ManageTicketsComponent),
        title: "Gerenciar Chamados",
      },
      {
        path: "troca-titularidade",
        loadComponent: () =>
          import(
            "./features/change-owner/pages/change-owner/change-owner.component"
          ).then((m) => m.ChangeOwnerComponent),
        title: "Troca de Titularidade",
      },
      {
        path: "avisos",
        loadComponent: () =>
          import(
            "./features/system-warnings/pages/system-warning-list/system-warning-list.component"
          ).then((m) => m.SystemWarningListComponent),
        title: "Avisos do Sistema",
      },
      {
        path: 'diagnosticos',
        loadComponent: () => import('./features/diagnosis/pages/diagnostic/diagnostic.component').then(m => m.DiagnosticComponent),
        title: 'Diagnósticos'
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./features/update-user/pages/update-user/update-user.component').then(m => m.UpdateUserComponent),
        title: 'Configurações'
      },

      { path: "", redirectTo: "home", pathMatch: "full" }, // Rota padrão dentro de /app
    ],
  },
  // Rota padrão da aplicação:
  // Se o usuário não estiver logado, o authGuard em '/app' o redirecionará para '/login'.
  // Se o usuário estiver logado e tentar ir para '/login', o loginGuard o redirecionará para '/app/home'.
  { path: "", redirectTo: "/login", pathMatch: "full" },

  // Rota curinga para caminhos não encontrados
  { path: "**", redirectTo: "/login" }, // Ou para uma página NotFoundComponent
];
