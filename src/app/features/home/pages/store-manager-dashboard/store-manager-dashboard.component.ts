import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { CardWidgetComponent, WidgetTrend } from '../../../../shared/components/card-widget/card-widget.component';
import { CommonModule } from '@angular/common';
import { DashboardChartComponent } from '../../../../shared/chart/dashboard-chart/dashboard-chart.component';
import { ContentPanelComponent } from '../../../../shared/components/content-panel/content-panel.component';
import { HomeBodyComponent } from "../../components/home-body/home-body.component";

@Component({
  selector: "app-store-manager-dashboard",
  imports: [
    CardWidgetComponent,
    ContentPanelComponent,
    CommonModule,
    DashboardChartComponent,
    HomeBodyComponent
],
  templateUrl: "./store-manager-dashboard.component.html",
  styleUrl: "./store-manager-dashboard.component.scss",
})
export class StoreManagerDashboardComponent implements OnInit {
  totalUsers = 150;
  totalSalesLastMonth = { value: "R$ 250k", direction: "up" } as WidgetTrend;

  loadingTasks = false;

  vendasMensaisData?: ChartData;
  opcoesGraficoBarra?: ChartOptions;
  loadingVendas = true;

  acessosDispositivoData?: ChartData;
  opcoesGraficoRosca?: ChartOptions;
  loadingAcessos = true;

  receitaData?: ChartData;
  opcoesGraficoLinha?: ChartOptions;

  ngOnInit(): void {
    this.loadVendasData();
    this.loadAcessosData();
    this.loadReceitaData();
  }

  loadVendasData(): void {
    this.loadingVendas = true;
    // Simular busca de dados
    setTimeout(() => {
      this.vendasMensaisData = {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        datasets: [
          {
            label: "Vendas 2024",
            backgroundColor: "rgba(54, 162, 235, 0.6)", // Azul
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
            data: [65, 59, 80, 81, 56, 55],
          },
          {
            label: "Vendas 2023",
            backgroundColor: "rgba(255, 99, 132, 0.6)", // Vermelho
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
            data: [28, 48, 40, 19, 86, 27],
          },
        ],
      };
      this.opcoesGraficoBarra = {
        plugins: { legend: { position: "bottom" } },
        scales: {
          y: { beginAtZero: true, ticks: { color: "#94a3b8" } },
          x: { ticks: { color: "#94a3b8" } },
        }, // Exemplo de cor de ticks para tema escuro
      };
      this.loadingVendas = false;
    }, 1500);
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
