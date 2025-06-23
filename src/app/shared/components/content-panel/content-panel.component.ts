import {
  Component,
  Input,
  ContentChildren,
  QueryList,
  ElementRef,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  ContentChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-content-panel",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./content-panel.component.html",
  styleUrls: ["./content-panel.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentPanelComponent implements AfterContentInit {
  // Inputs para configuração básica do painel
  @Input() title?: string;
  @Input() icon?: string; // Classe do ícone, ex: 'pi pi-users'
  @Input() isLoading: boolean = false;
  @Input() noBodyPadding: boolean = false; // Remove o padding padrão do corpo do painel

  // Inputs para classes CSS customizadas adicionais
  @Input() cardClass?: string; // Classes para o elemento raiz do painel
  @Input() headerClass?: string; // Classes para a seção do cabeçalho
  @Input() bodyClass?: string; // Classes para a seção do corpo
  @Input() footerClass?: string; // Classes para a seção do rodapé

  // Para verificar se os slots de conteúdo nomeados foram preenchidos
  @ContentChild("customHeaderTpl") customHeaderTemplate?: TemplateRef<any>;
  @ContentChildren("headerActionsMarker")
  headerActionsMarkers!: QueryList<ElementRef>;
  @ContentChildren("footerMarker") footerMarkers!: QueryList<ElementRef>;

  hasCustomHeader: boolean = false;
  hasHeaderActions: boolean = false;
  hasFooter: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    this.hasCustomHeader = !!this.customHeaderTemplate;
    this.hasHeaderActions = this._checkSlotForContent(
      this.headerActionsMarkers
    );
    this.hasFooter = this._checkSlotForContent(this.footerMarkers);
    this.cdr.detectChanges();
  }

  // Método corrigido para verificar o conteúdo do slot
  private _checkSlotForContent(queryList: QueryList<ElementRef>): boolean {
    if (!queryList || queryList.length === 0) {
      return false;
    }

    // O queryList encontra o ElementRef do nosso elemento marcador (ex: <div #headerActionsMarker></div>)
    // Precisamos verificar o conteúdo DENTRO do elemento PAI do marcador, que é onde o ng-content está.
    const markerElement = queryList.first.nativeElement as HTMLElement;
    const containerElement = markerElement.parentElement as HTMLElement | null;

    if (!containerElement) {
      return false;
    }

    // Itera sobre os childNodes do container do slot
    for (let i = 0; i < containerElement.childNodes.length; i++) {
      const node = containerElement.childNodes[i];

      // Ignora o próprio elemento marcador da contagem de conteúdo
      if (node === markerElement) {
        continue;
      }

      // Se encontrar um nó de elemento, então há conteúdo projetado
      if (node.nodeType === Node.ELEMENT_NODE) {
        return true;
      }
      // Se encontrar um nó de texto que não seja apenas espaços em branco, também considera como conteúdo
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== "") {
        return true;
      }
    }
    return false; // Nenhum conteúdo significativo foi encontrado além do marcador
  }

  // Getter para classes do container principal do card
  get baseCardClasses(): string {
    return `relative bg-white dark:bg-slate-800 shadow-lg rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col ${
      this.cardClass || ""
    }`;
  }

  get effectiveHeaderClasses(): string {
    return `flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 ${
      this.headerClass || ""
    }`;
  }

  get effectiveBodyClasses(): string {
    let classes = "flex-grow"; // Permite que o corpo cresça para preencher o espaço
    if (!this.noBodyPadding) {
      classes += " p-4 sm:p-6";
    }
    if (this.bodyClass) {
      classes += ` ${this.bodyClass}`;
    }
    return classes;
  }

  get effectiveFooterClasses(): string {
    return `p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 rounded-b-xl ${
      this.footerClass || ""
    }`;
  }
}
