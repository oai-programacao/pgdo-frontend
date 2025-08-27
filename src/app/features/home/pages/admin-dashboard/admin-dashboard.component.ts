import { Component, inject, OnInit } from '@angular/core';
import { WidgetTrend, CardWidgetComponent } from '../../../../shared/components/card-widget/card-widget.component';
import { ContentPanelComponent } from "../../../../shared/components/content-panel/content-panel.component";
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { DashboardChartComponent } from '../../../../shared/chart/dashboard-chart/dashboard-chart.component';
import { DashboardService } from '../../services/dashboard.service';
import { TypeOfOs } from '../../../../interfaces/enums.model';
import { HomeBodyComponent } from "../../components/home-body/home-body.component";
import { ToastModule } from 'primeng/toast';
interface DashboardData {
  actualMonthValue: number;
  previousMonthValue: number;
  serviceOrderType: string;
  differenceBetweenMonths: number;
  differencePercentage: number;
  trendDirection: "up" | "down" | "neutral";
}

@Component({
  selector: "app-admin-dashboard",
  imports: [
    CardWidgetComponent,
    ContentPanelComponent,
    CommonModule,
    DashboardChartComponent,
    HomeBodyComponent,
    
],
  templateUrl: "./admin-dashboard.component.html",
  styleUrl: "./admin-dashboard.component.scss",
})
export class AdminDashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  widgetDataMap: Map<string, DashboardData | null> = new Map();
  widgetLoadingMap: Map<string, boolean> = new Map();


  // Definir chaves para os widgets para facilitar o acesso no template e no TS
  readonly WIDGET_KEYS = {
    INSTALLATIONS: "INSTALLATIONS_MONTH",
    CHANGE_OF_ADDRESS: "CHANGE_OF_ADDRESS_MONTH",
    TECHNICAL_VISIT: "TECHNICAL_VISIT_MONTH",
    CANCELLATIONS: "CANCELLATIONS_MONTH", // Exemplo para o widget de cancelamentos
  };

  technicianOsData?: ChartData;
  technicianOsOptions?: ChartOptions;
  isLoadingTechnicianData: boolean = false;

  acessosDispositivoData?: ChartData;
  opcoesGraficoRosca?: ChartOptions;
  loadingAcessos = true;

  receitaData?: ChartData;
  opcoesGraficoLinha?: ChartOptions;

  ngOnInit(): void {
    this.loadWidgetData(
      this.WIDGET_KEYS.INSTALLATIONS,
      TypeOfOs.INSTALLATION
    );
    this.loadWidgetData(
      this.WIDGET_KEYS.CHANGE_OF_ADDRESS,
      TypeOfOs.CHANGE_OF_ADDRESS
    );
    this.loadWidgetData(
      this.WIDGET_KEYS.TECHNICAL_VISIT,
      TypeOfOs.TECHNICAL_VISIT
    );

    this.loadTechnicianOsData();
    this.loadAcessosData();
    this.loadReceitaData();
  }

  private loadWidgetData(widgetKey: string, type: TypeOfOs): void {
    this.widgetLoadingMap.set(widgetKey, true);
    this.widgetDataMap.set(widgetKey, null); // Limpa dados anteriores ou define estado inicial

    // Supondo que seu dashboardService.getServiceOrderCountForCurrentMonth
    // retorna o DashboardData (ou DashboardWidgetDto do backend)
    this.dashboardService
      .getServiceOrderActualMonthData(type) // Passa o status também
      .subscribe({
        next: (data: DashboardData) => {
          this.widgetDataMap.set(widgetKey, data);
          this.widgetLoadingMap.set(widgetKey, false);
        },
        error: (err) => {
          console.error(
            `Erro ao carregar dados para ${widgetKey} (Tipo: ${type}, Status: ${status}):`,
            err
          );
          // Define um estado de erro para o widget específico
          this.widgetDataMap.set(widgetKey, {
            actualMonthValue: 0,
            previousMonthValue: 0,
            serviceOrderType: type,
            differenceBetweenMonths: 0,
            differencePercentage: 0,
            trendDirection: "neutral",
          });
          this.widgetLoadingMap.set(widgetKey, false);
        },
      });
  }

  // Helper para transformar os dados do serviço no formato esperado pelo app-card-widget [trend]
  getTrendForWidget(widgetKey: string): WidgetTrend | undefined {
    const data = this.widgetDataMap.get(widgetKey);
    if (
      data &&
      data.trendDirection &&
      data.differencePercentage !== undefined
    ) {
      const diffText =
        data.differencePercentage !== undefined &&
        data.differencePercentage !== 0
          ? ` (${data.differencePercentage > 0 ? "+" : ""}${
              data.differencePercentage
            })`
          : "";
      return {
        value: `${data.differenceBetweenMonths}${diffText}`,
        direction: data.trendDirection,
      };
    }
    return undefined;
  }

  loadTechnicianOsData(): void {
    this.isLoadingTechnicianData = true;

    this.dashboardService.getTechnicianActualMonthData().subscribe({
      next: (data) => {
        const rawData: any[] = data;
        

        // Transformação dos dados
        const labels = rawData.map((item) => item.technicianName);
        const dataCounts = rawData.map((item) => item.serviceOrderCount);

        this.technicianOsData = {
          labels: labels,
          datasets: [
            {
              label: "Contagem de OS",
              data: dataCounts,
              backgroundColor: [
                // Você pode definir um array de cores ou uma única cor
                "rgba(255, 99, 132, 0.6)", // Vermelho
                "rgba(54, 162, 235, 0.6)", // Azul
                "rgba(255, 206, 86, 0.6)", // Amarelo
                "rgba(75, 192, 192, 0.6)", // Verde Água
                "rgba(153, 102, 255, 0.6)", // Roxo
                "rgba(255, 159, 64, 0.6)", // Laranja
              ],
              borderColor: [
                // Cores das bordas correspondentes
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        };

        // Você pode usar as opções padrão do seu DashboardChartComponent
        // ou definir opções específicas aqui se necessário.
        // Usando as cores dos eixos do seu DashboardChartComponent como exemplo:
        const isDarkMode = document.documentElement.classList.contains("dark");
        const axisTicksColor = isDarkMode ? "#94a3b8" : "#64748b"; // slate-400 / slate-500
        const gridColor = isDarkMode
          ? "rgba(255,255,255,0.1)"
          : "rgba(0,0,0,0.1)";

        this.technicianOsOptions = {
          // Se precisar sobrescrever ou adicionar opções específicas para este gráfico
          plugins: {
            legend: {
              position: "top", // Posição da legenda
              labels: {
                color: isDarkMode ? "#cbd5e1" : "#4b5563",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Número de Ordens de Serviço",
                color: axisTicksColor,
              },
              ticks: { color: axisTicksColor },
              grid: { color: gridColor },
            },
            x: {
              title: {
                display: true,
                text: "Técnicos",
                color: axisTicksColor,
              },
              ticks: { color: axisTicksColor },
              grid: { color: gridColor },
            },
          },
          // Se você quiser que as barras tenham um tamanho máximo
          // barThickness: 50, // ou 'flex'
          // maxBarThickness: 70,
        };

        this.isLoadingTechnicianData = false;
      },
      error: (err) => {
        console.error("Erro ao carregar dados dos técnicos:", err);
        this.isLoadingTechnicianData = false;
      }
    })
  }


  loadAcessosData(): void {
    this.loadingAcessos = true;
    setTimeout(() => {
      this.acessosDispositivoData = {
        labels: ["Desktop", "Mobile", "Tablet"],
        datasets: [
          {
            data: [300, 150, 50],
            backgroundColor: [
              "rgba(75, 192, 192, 0.7)", // Verde-água
              "rgba(255, 205, 86, 0.7)", // Amarelo
              "rgba(255, 159, 64, 0.7)", // Laranja
            ],
            hoverBackgroundColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(255, 205, 86, 1)",
              "rgba(255, 159, 64, 1)",
            ],
          },
        ],
      };
      this.opcoesGraficoRosca = {
        plugins: { legend: { position: "right" } },
      };
      this.loadingAcessos = false;
    }, 2000);
  }

  loadReceitaData(): void {
    // Simular busca de dados
    this.receitaData = {
      labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
      datasets: [
        {
          label: "Receita Mensal",
          data: [12000, 19000, 15000, 22000, 18000, 25000],
          fill: true, // Para preencher a área sob a linha
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)", // Cor do preenchimento
          tension: 0.3, // Para curvas suaves
        },
      ],
    };
    this.opcoesGraficoLinha = {
      scales: {
        y: {
          beginAtZero: false, // Receita pode não começar em zero
          ticks: {
            callback: function (value) {
              return "R$ " + value.toLocaleString("pt-BR");
            },
          },
        },
      },
    };
  }
}
