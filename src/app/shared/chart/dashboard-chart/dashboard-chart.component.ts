import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChartModule } from "primeng/chart"; // Importar o ChartModule do PrimeNG

// Tipos básicos do Chart.js para melhor tipagem (opcional, mas recomendado)
// Você pode precisar instalar @types/chart.js: npm install -D @types/chart.js
import type { ChartData, ChartOptions, ChartType } from "chart.js";

@Component({
  selector: "app-dashboard-chart",
  standalone: true,
  imports: [CommonModule, ChartModule], // Adicionar ChartModule aqui
  templateUrl: "./dashboard-chart.component.html",
  // styleUrls: ['./dashboard-chart.component.scss'], // Opcional
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardChartComponent implements OnChanges {
  @Input() title?: string;
  @Input() chartType: ChartType = "bar"; // Tipo do gráfico (ex: 'bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea')
  @Input() chartData?: ChartData; // Dados do gráfico no formato do Chart.js
  @Input() chartOptions?: ChartOptions; // Opções de customização do Chart.js
  @Input() isLoading: boolean = false;
  @Input() height: string = "300px"; // Altura padrão do gráfico
  @Input() showGrid: boolean = true; // Nova @Input para controlar o grid, padrão true
  // A largura geralmente será 100% do container, controlada pelo CSS do container do p-chart

  // Para forçar a recriação do gráfico se os dados ou opções mudarem de forma que o p-chart não detecte automaticamente
  // (às vezes necessário para atualizações profundas de objetos)
  protected chartKey: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    // Se chartData ou chartOptions forem objetos e mudarem de referência, o p-chart deve atualizar.
    // Se você estiver mutando o objeto chartData internamente (ex: adicionando a um array datasets[0].data),
    // o Angular e o p-chart podem não detectar a mudança. Nesse caso, você precisaria ou passar uma nova
    // referência do objeto, ou usar o truque do chartKey abaixo para forçar o redrawing.
    if (changes["chartData"] || changes["chartOptions"] || changes["showGrid"]) {
      // Se você enfrentar problemas com o gráfico não atualizando após mudanças nos dados/opções:
      // this.chartKey++; // Descomente para forçar o p-chart a se recriar
    }
  }

  // Opções padrão para garantir responsividade e uma boa aparência base
  get effectiveChartOptions(): ChartOptions {
    const defaultOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false, // Importante para que a altura customizada funcione bem
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: document.documentElement.classList.contains("dark")
              ? "#cbd5e1"
              : "#4b5563", // slate-300 / slate-600
          },
        },
        title: {
          // Se quiser um título dentro do canvas do gráfico
          display: false, // Vamos usar o @Input() title para o card
          // text: this.title,
          // color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563',
        },
      },
      scales: {
        // Cores padrão para os eixos
        x: {
          ticks: {
            display: this.showGrid,
            color: document.documentElement.classList.contains("dark")
              ? "#94a3b8"
              : "#64748b",
          }, // slate-400 / slate-500
          grid: {
            display: this.showGrid, // Controla a exibição do grid
            color: document.documentElement.classList.contains("dark")
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          },
        },
        y: {
          ticks: {
            display: this.showGrid,
            color: document.documentElement.classList.contains("dark")
              ? "#94a3b8"
              : "#64748b",
          },
          grid: {
            display: this.showGrid, // Controla a exibição do grid
            color: document.documentElement.classList.contains("dark")
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          },
          beginAtZero: true,
        },
      },
    };
    // Faz merge das opções padrão com as opções passadas, dando prioridade às passadas
    return { ...defaultOptions, ...this.chartOptions };
  }
}
