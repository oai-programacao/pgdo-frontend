// Crie em um arquivo, ex: src/app/core/models/menu-item.model.ts
export interface MenuItem {
  id: string; // Identificador único para o item (útil para keys em *ngFor)
  label: string; // Texto exibido quando o menu está expandido
  icon: string; // Classe do ícone (ex: 'pi pi-home' para PrimeIcons, ou classes do FontAwesome, etc.)
  route?: string; // Rota do Angular Router para navegação
  action?: (event?: MouseEvent) => void; // Função a ser executada ao clicar (se não for rota)
  children?: MenuItem[]; // Para futuros submenus, se necessário
  expanded?: boolean; // Opcional: para controlar se o submenu está expandido
  allowedRoles?: string[]; // Lista de roles permitidos para acessar este item
  exactMatch?: boolean;
}

