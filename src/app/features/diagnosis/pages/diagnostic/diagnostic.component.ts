import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import { DashboardChartComponent } from "../../../../shared/chart/dashboard-chart/dashboard-chart.component";
import { DatePickerModule } from "primeng/datepicker";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FloatLabelModule } from "primeng/floatlabel";
import { ButtonModule } from "primeng/button";
import { ChartService } from "../../service/chart.service";
import {
  DashboardCharts,
  DashboardSummary,
  ServiceOrderTypeData,
  TechnicianServiceCount,
} from "../../../../interfaces/dashboard-charts.interface";
import { ChartData, ChartOptions } from "chart.js";

@Component({
  selector: "app-diagnostic",
  imports: [
    DashboardChartComponent,
    DatePickerModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FloatLabelModule,
    ButtonModule,
  ],
  templateUrl: "./diagnostic.component.html",
  styleUrl: "./diagnostic.component.scss",
})
export class DiagnosticComponent {
  rangeDates: Date[] = [];
  form!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly chartService = inject(ChartService);
  @ViewChild("dashboardContent") dashboardContent!: ElementRef;

  // Variaveis para armazenar os dados dos gráficos
  unproductiveVisitData?: DashboardCharts;
  unproductiveVisitsCount?: ChartData<"pie">;
  unproductiveVisitsTotal?: number;

  technicianServiceCountData?: TechnicianServiceCount;
  technicianServiceCount?: ChartData<"bar">;
  technicianServiceCountOptions?: ChartOptions;
  technicianGrandTotal?: number;
  technicianList: { name: string; count: number }[] = [];

  serviceOrderData?: ServiceOrderTypeData[];
  serviceOrderCount?: ChartData<"bar">;
  serviceOrderCountOptions?: ChartOptions;
  serviceOrderTotal?: number;
  serviceOrderList: { name: string; atual: number; anterior: number }[] = [];

  mainSummaryData?: DashboardSummary;
  mainSummaryCount?: ChartData<"bar">;
  mainSummaryCountOptions?: ChartOptions;

  technologySummaryData?: DashboardSummary;
  technologyChartData?: ChartData<"pie">;
  technologyTotal?: number;

  // Mapeamentos para os tipos de OS e áreas demandantes
  private readonly osTypesMap: Record<string, string> = {
    CHANGE_OF_ADDRESS: "Mudança de Endereço",
    CHANGE_OF_TECHNOLOGY: "Mudança de Tecnologia",
    INSTALLATION: "Instalação",
    INTERNAL: "Interna",
    KIT_REMOVAL: "Remoção de Kit",
    MAINTENANCE: "Manutenção",
    PROJECTS: "Projetos",
    TECHNICAL_VIABILITY: "Viabilidade Técnica",
    TECHNICAL_VISIT: "Visita Técnica",
  };

  private readonly demandingAreasMap: Record<string, string> = {
    CALL_CENTER: "Call Center",
    CONTROL_TOWER: "Torre de Controle",
    NOC: "NOC",
    PDVA: "PDVA",
    RETENTION_RECUPERATION: "Retenção/Recuperação",
    SALES: "Vendas",
  };

  constructor() {
    this.form = this.fb.group({
      rangeDates: [null, Validators.required],
    });
  }

  clearFilter() {
    this.form.reset();
    this.unproductiveVisitsCount = undefined;
    this.unproductiveVisitsTotal = undefined;
    this.unproductiveVisitData = undefined;

    this.technicianServiceCount = undefined;
    this.technicianServiceCountOptions = undefined;
    this.technicianGrandTotal = undefined;
    this.technicianList = [];
    this.technicianServiceCountData = undefined;

    this.serviceOrderCount = undefined;
    this.serviceOrderCountOptions = undefined;
    this.serviceOrderTotal = undefined;
    this.serviceOrderData = undefined;

    this.mainSummaryCount = undefined;
    this.mainSummaryCountOptions = undefined;
    this.mainSummaryData = undefined;

    this.technologyChartData = undefined;
    this.technologyTotal = undefined;
    this.technologySummaryData = undefined;
  }
  onSubmit() {
    this.showUnproductiveVisitsCount();
    this.showTechnicianCount();
    this.showServiceOrder();
    this.showMainSummary();
    this.showTechnologyChart();
  }

  showUnproductiveVisitsCount() {
    const [startDate, endDate] = this.form.value.rangeDates;

    this.chartService.getUnproductiveVisitsCount(startDate, endDate).subscribe({
      next: (response) => {
        this.unproductiveVisitData = response;
        this.unproductiveVisitsTotal =
          response.actualMonthValue + response.previousMonthValue;
        this.unproductiveVisitsCount = {
          labels: ["Mês Atual", "Mês Anterior"],
          datasets: [
            {
              label: "Visitas Improdutivas",
              data: [response.actualMonthValue, response.previousMonthValue],
              backgroundColor: ["#42A5F5", "#FFA726"],
            },
          ],
        };
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  showTechnicianCount() {
    const [startDate, endDate] = this.form.value.rangeDates;

    this.chartService.getTechnicianCount(startDate, endDate).subscribe(
      (response: TechnicianServiceCount) => {
        const labels = response.technicianCounts.map(
          (item) => item.technicianName
        );
        const dataCounts = response.technicianCounts.map(
          (item) => item.serviceOrderCount
        );

        // Lista de técnicos com quantidade
        this.technicianList = response.technicianCounts.map((item) => ({
          name: item.technicianName,
          count: item.serviceOrderCount,
        }));

        this.technicianServiceCount = {
          labels: labels,
          datasets: [
            {
              label: "Contagem de OS",
              data: dataCounts,
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)",
                "rgba(100, 181, 246, 0.6)",
                "rgba(255, 138, 101, 0.6)",
                "rgba(174, 213, 129, 0.6)",
                "rgba(244, 143, 177, 0.6)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(100, 181, 246, 1)",
                "rgba(255, 138, 101, 1)",
                "rgba(174, 213, 129, 1)",
                "rgba(244, 143, 177, 1)",
              ],
              borderWidth: 1,
            },
          ],
        };

        const maxValue = Math.max(...dataCounts, 1);
        const suggestedMax = maxValue < 20 ? 20 : maxValue + 1;

        this.technicianServiceCountOptions = {
          scales: {
            y: {
              beginAtZero: true,
              max: suggestedMax,
              ticks: {
                stepSize: 1,
                callback: function (
                  tickValue: string | number,
                  index: number,
                  ticks: any[]
                ) {
                  if (
                    typeof tickValue === "number" &&
                    Number.isInteger(tickValue)
                  ) {
                    return tickValue;
                  }
                  return "";
                },
              },
            },
          },
        };

        this.technicianGrandTotal = response.grandTotal;
      },
      (e) => {
        console.log(e);
      }
    );
  }

  showServiceOrder() {
    const [startDate, endDate] = this.form.value.rangeDates;
    const formattedStartDate = this.formatDateToBackend(startDate);
    const formattedEndDate = this.formatDateToBackend(endDate);

    this.chartService
      .getServiceOrder(formattedStartDate, formattedEndDate)
      .subscribe(
        (response: ServiceOrderTypeData[]) => {
          this.serviceOrderData = response;

          // Calcular o total das ordens de serviço
          this.serviceOrderTotal = response.reduce(
            (total, item) =>
              total + item.actualMonthValue + item.previousMonthValue,
            0
          );

          const labels = response.map(
            (item) =>
              this.osTypesMap[item.serviceOrderType] || item.serviceOrderType
          );
          const actualMonthData = response.map((item) => item.actualMonthValue);
          const previousMonthData = response.map(
            (item) => item.previousMonthValue
          );

          // Lista para exibir no HTML
          this.serviceOrderList = response.map((item) => ({
            name:
              this.osTypesMap[item.serviceOrderType] || item.serviceOrderType,
            atual: item.actualMonthValue,
            anterior: item.previousMonthValue,
          }));

          // Apenas dados
          this.serviceOrderCount = {
            labels: labels,
            datasets: [
              {
                label: "Mês Atual",
                data: actualMonthData,
                backgroundColor: "#42A5F5",
              },
              {
                label: "Mês Anterior",
                data: previousMonthData,
                backgroundColor: "#FFA726",
              },
            ],
          };

          // Opções separadas
          const isDarkMode =
            document.documentElement.classList.contains("dark");
          const axisTicksColor = isDarkMode ? "#94a3b8" : "#64748b";
          const gridColor = isDarkMode
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.1)";

          this.serviceOrderCountOptions = {
            plugins: {
              legend: {
                position: "top",
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
                  text: "Quantidade de Ordens de Serviço",
                  color: axisTicksColor,
                },
                ticks: { color: axisTicksColor },
                grid: { color: gridColor },
              },
              x: {
                title: {
                  display: true,
                  text: "Tipo de OS",
                  color: axisTicksColor,
                },
                ticks: {
                  color: axisTicksColor,
                  maxRotation: 45,
                  minRotation: 0,
                  autoSkip: false,
                },
                grid: { color: gridColor },
              },
            },
          };
        },
        (e) => {
          console.log(e);
        }
      );
  }

  showMainSummary() {
    const [startDate, endDate] = this.form.value.rangeDates;
    const formattedStartDate = this.formatDateToBackend(startDate);
    const formattedEndDate = this.formatDateToBackend(endDate);

    this.chartService
      .getMainSummary(formattedStartDate, formattedEndDate)
      .subscribe({
        next: (response) => {
          this.mainSummaryData = response;

          const osTypesLabels = response.osTypes.items.map(
            (item) => this.osTypesMap[item.category] || item.category
          );
          const osTypesData = response.osTypes.items.map((item) => item.count);

          this.mainSummaryCount = {
            labels: osTypesLabels,
            datasets: [
              {
                label: "Ordens de Serviço por Tipo",
                data: osTypesData,
                backgroundColor: [
                  "#42A5F5",
                  "#FFA726",
                  "#66BB6A",
                  "#AB47BC",
                  "#FF7043",
                  "#26A69A",
                  "#7E57C2",
                  "#FFCA28",
                  "#789262",
                ],
                borderColor: [
                  "#1E88E5",
                  "#FB8C00",
                  "#43A047",
                  "#8E24AA",
                  "#D84315",
                  "#00897B",
                  "#5E35B1",
                  "#FFB300",
                  "#33691E",
                ],
                borderWidth: 1,
              },
            ],
          };

          // Opções para garantir labels visíveis e legíveis
          this.mainSummaryCountOptions = {
            scales: {
              x: {
                ticks: {
                  color: "#64748b",
                  maxRotation: 45,
                  minRotation: 0,
                  autoSkip: false, // Mostra todas as labels
                },
                title: {
                  display: true,
                  text: "Tipo de OS",
                  color: "#64748b",
                },
              },
              y: {
                beginAtZero: true,
                ticks: { color: "#64748b" },
                title: {
                  display: true,
                  text: "Quantidade",
                  color: "#64748b",
                },
              },
            },
          };
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  showTechnologyChart() {
    const [startDate, endDate] = this.form.value.rangeDates;
    const formattedStartDate = this.formatDateToBackend(startDate);
    const formattedEndDate = this.formatDateToBackend(endDate);

    this.chartService
      .getTechnology(formattedStartDate, formattedEndDate)
      .subscribe({
        next: (response: DashboardSummary) => {
          this.technologySummaryData = response;
          const technologyMap: Record<string, string> = {
            FIBER_OPTIC: "Fibra Óptica",
            RADIO: "Rádio",
          };
          const labels = response.technologies.items.map(
            (item) => technologyMap[item.category] || item.category
          );
          const data = response.technologies.items.map((item) => item.count);
          this.technologyTotal = response.technologies.total;

          this.technologyChartData = {
            labels,
            datasets: [
              {
                label: "Tecnologias",
                data,
                backgroundColor: [
                  "#42A5F5",
                  "#FFA726",
                  "#66BB6A",
                  "#AB47BC",
                  "#FF7043",
                  "#26A69A",
                  "#7E57C2",
                  "#FFCA28",
                  "#789262",
                  "#8D6E63",
                ],
              },
            ],
          };
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  printDashboard() {
    const dashboard = this.dashboardContent.nativeElement as HTMLElement;
    const canvases = dashboard.querySelectorAll("canvas");
    const canvasImages: { canvas: HTMLCanvasElement; img: HTMLImageElement }[] =
      [];

    canvases.forEach((canvas) => {
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.style.maxWidth = "100%";
      img.style.display = "block";
      img.width = canvas.width;
      img.height = canvas.height;
      canvas.parentNode?.replaceChild(img, canvas);
      canvasImages.push({ canvas, img });
    });

    setTimeout(() => {
      this.printElement(this.dashboardContent);

      setTimeout(() => {
        canvasImages.forEach(({ canvas, img }) => {
          img.parentNode?.replaceChild(canvas, img);
        });
      }, 1000);
    }, 300); 
  }

  printElement(elementRef: ElementRef | undefined): void {
    if (!elementRef) {
      console.error("Elemento inválido para impressão.");
      return;
    }

    const elementHTML = elementRef.nativeElement.outerHTML;

   
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentWindow?.document;

    if (iframeDocument) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join("");
          } catch (error) {
            return "";
          }
        })
        .join("");

      iframeDocument.open();
      iframeDocument.write(`
      <html>
        <head>
          <style>${styles}</style>
        </head>
        <body>${elementHTML}</body>
      </html>
    `);
      iframeDocument.close();

      // Acionar a impressão
      iframe.contentWindow?.print();

      // Remover o iframe após a impressão
      if (iframe.contentWindow) {
        iframe.contentWindow.onafterprint = () => {
          document.body.removeChild(iframe);
        };
      }
    } else {
      console.error("Erro ao acessar o documento do iframe.");
    }
  }
  
  private formatDateToBackend(date: string | Date): string {
    if (!date) return "";
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    }
    return "";
  }
}
