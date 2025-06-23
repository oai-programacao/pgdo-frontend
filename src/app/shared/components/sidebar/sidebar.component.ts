// src/app/shared/components/sidebar/sidebar.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
  AuthService,
} from "../../../core/auth/auth.service";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations"; // Para animações
import { MenuItem } from "../../../interfaces/menu-item.model";
import { AuthenticatedUser } from "../../../core/auth/auth.model";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  animations: [
    // Animação para expandir/recolher submenu
    trigger("submenuToggle", [
      state(
        "collapsed",
        style({
          height: "0px",
          opacity: 0,
          marginTop: "0",
          marginBottom: "0",
        })
      ),
      state(
        "expanded",
        style({
          height: "*",
          opacity: 1,
          marginTop: "0.25rem",
          marginBottom: "0.25rem",
        })
      ), // Equivalente a space-y-1
      transition("collapsed <=> expanded", animate("200ms ease-in-out")),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush, // Melhora a performance ao evitar detecções desnecessárias
})
export class SidebarComponent implements OnInit {
  @Input() allMenuItems: MenuItem[] = [];
  @Input() isCollapsed: boolean = false;
  @Input() appName: string = "Sua Aplicação";

  @Output() toggleCollapse = new EventEmitter<void>();

  public authService = inject(AuthService);
  public visibleMenuItems$!: Observable<MenuItem[]>;

  // Rastreia o estado de expansão dos submenus pelo ID do item pai
  public submenuExpandedState: { [itemId: string]: boolean } = {};

  ngOnInit(): void {
    this.visibleMenuItems$ = this.authService.currentUser$.pipe(
      startWith(this.authService.currentUserSubject.getValue()),
      map((user) => {
        const filtered = this.filterAndPrepareMenuItems(
          this.allMenuItems,
          user
        );
        // Inicializa o estado de expansão para os itens filtrados que são pais
        this.initializeSubmenuState(filtered);
        return filtered;
      })
    );
  }

  trackById(index: number, item: MenuItem) { return item.id; }


  private initializeSubmenuState(items: MenuItem[]): void {
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        if (this.submenuExpandedState[item.id] === undefined) {
          // Só inicializa se não existir
          this.submenuExpandedState[item.id] = !!item.expanded; // Usa o valor de 'expanded' do MenuItem ou false
        }
        // Recursivamente para sub-submenus, se houver
        this.initializeSubmenuState(item.children);
      }
    });
  }

  private filterAndPrepareMenuItems(
    items: MenuItem[],
    user: AuthenticatedUser | null
  ): MenuItem[] {
    if (!items) return [];
    return items
      .map((item) => {
        // Cria uma cópia para não modificar o array original e poder adicionar/modificar 'children'
        const newItem = { ...item };
        if (item.children) {
          newItem.children = this.filterAndPrepareMenuItems(
            item.children,
            user
          );
        }
        return newItem;
      })
      .filter((item) => {
        const hasItemPermission = this.hasPermission(item, user);
        if (!hasItemPermission) {
          return false;
        }
        // Um item pai só é visível se ele mesmo tiver uma rota/ação OU se tiver filhos visíveis
        if (
          item.children &&
          item.children.length === 0 &&
          !item.route &&
          !item.action
        ) {
          return false; // Pai sem filhos visíveis e sem ação/rota própria
        }
        return true;
      });
  }

  private hasPermission(
    item: MenuItem,
    user: AuthenticatedUser | null
  ): boolean {
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true; // Item público
    }
    if (!user || !user.roles || user.roles.length === 0) {
      return false; // Usuário sem papéis não pode acessar item com restrição
    }
    return item.allowedRoles.some((role) => user.roles.includes(role));
  }

  toggleSubmenu(item: MenuItem, event: MouseEvent): void {
    // Se o item tem filhos, o clique primariamente alterna o submenu
    if (item.children && item.children.length > 0) {
      // Se o item pai também tem uma rota própria e o usuário não quer apenas alternar,
      // essa lógica pode precisar ser mais complexa (ex: clique no ícone de seta alterna, clique no texto navega)
      // Por simplicidade, aqui o clique no item pai com filhos alterna o submenu.
      if (!item.route && !item.action) {
        // Só previne e propaga se não for um link/ação clicável
        event.preventDefault();
        event.stopPropagation();
      }
      this.submenuExpandedState[item.id] = !this.submenuExpandedState[item.id];
    } else if (item.action) {
      // Se for um item final com ação
      this.handleItemClick(item, event);
    }
    // Se for um item final com item.route, o routerLink cuidará da navegação.
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
    // Quando o sidebar principal colapsa, idealmente todos os submenus deveriam fechar
    if (this.isCollapsed) {
      // Se vai colapsar
      Object.keys(this.submenuExpandedState).forEach((key) => {
        this.submenuExpandedState[key] = false;
      });
    }
  }

  handleItemClick(item: MenuItem, event: MouseEvent): void {
    if (item.action) {
      // Se for um item de submenu e o sidebar principal estiver colapsado,
      // pode ser interessante expandir o sidebar principal.
      // if (this.isCollapsed) {
      //   this.onToggleCollapse(); // Expande o sidebar principal
      // }
      item.action(event);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
