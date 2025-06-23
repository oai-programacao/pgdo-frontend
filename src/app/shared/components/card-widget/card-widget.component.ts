import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, Input, QueryList } from '@angular/core';
import { RouterModule } from '@angular/router';

// Interface para a informação de tendência
export interface WidgetTrend {
  value: string; // Ex: "+5%", "-10 vendas"
  direction: 'up' | 'down' | 'neutral'; // Para o ícone e cor da tendência
}

@Component({
  selector: "app-card-widget",
  imports: [CommonModule, RouterModule],
  templateUrl: "./card-widget.component.html",
  styleUrl: "./card-widget.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush, // Bom para componentes de UI reutilizáveis
})
export class CardWidgetComponent {
  @Input() title: string = "Título do Widget";
  @Input() value: string | number = "0";
  @Input() icon?: string; // Classe do ícone, ex: 'pi pi-users'
  @Input() trend?: WidgetTrend;
  @Input() detailsLink?: string | any[]; // Rota para o Angular Router
  @Input() footerText?: string; // Texto pequeno no rodapé do widget
  @Input() isLoading: boolean = false;

  // Variante para dar um toque de cor (ex: borda ou fundo do ícone)
  // Pode ser estendido com mais variantes ou cores específicas
  @Input() variant:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral" = "neutral";

  // Classes dinâmicas baseadas na variante para o container do ícone
  get iconContainerClasses(): string {
    switch (this.variant) {
      case "primary":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300";
      case "success":
        return "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300";
      case "warning":
        return "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300";
      case "danger":
        return "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300";
      case "info":
        return "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
    }
  }

  // Classes para o ícone de tendência
  get trendIconClasses(): string {
    if (!this.trend) return "";
    switch (this.trend.direction) {
      case "up":
        return "pi pi-arrow-up text-green-500";
      case "down":
        return "pi pi-arrow-down text-red-500";
      default:
        return "pi pi-minus text-slate-500"; // Ou um ícone de 'igual'
    }
  }

  // Classes para a cor do texto da tendência
  get trendTextColorClass(): string {
    if (!this.trend) return "text-slate-500 dark:text-slate-400";
    switch (this.trend.direction) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-slate-500 dark:text-slate-400";
    }
  }

  // Classe para a borda superior colorida do card, baseada na variante
  get cardBorderClass(): string {
    if (this.isLoading) return "border-slate-200 dark:border-slate-700"; // Borda padrão durante o loading
    switch (this.variant) {
      case "primary":
        return "border-t-4 border-blue-500 dark:border-blue-400";
      case "success":
        return "border-t-4 border-green-500 dark:border-green-400";
      case "warning":
        return "border-t-4 border-amber-500 dark:border-amber-400";
      case "danger":
        return "border-t-4 border-red-500 dark:border-red-400";
      case "info":
        return "border-t-4 border-sky-500 dark:border-sky-400";
      default:
        return "border-slate-200 dark:border-slate-700"; // Borda padrão sutil
    }
  }
}
