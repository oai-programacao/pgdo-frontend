import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import {
  DashboardCharts,
  DashboardSummary,
  ServiceOrderTypeData,
  TechnicianServiceCount,
} from "../../../interfaces/dashboard-charts.interface";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChartService {
  constructor() {}

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;


  // Método para obter a contagem de visitas improdutivas
  getUnproductiveVisitsCount(
    startDate: string,
    endDate: string
  ): Observable<DashboardCharts> {
    return this.http.get<DashboardCharts>(
      `${this.apiUrl}/dashboard/unproductive-visits-count`,
      { params: { startDate, endDate } }
    );
  }

getTechnology(startDate: string, endDate: string, status?: string[]): Observable<DashboardSummary> {
  const params: any = { startDate, endDate };
  if (status && status.length > 0) {
    params.status = status;
  }
  return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/tecnology`, {
    params
  });
}

 // Método para obter a contagem de serviços por técnico
  getTechnicianCount(
    startDate: string,
    endDate: string
  ): Observable<TechnicianServiceCount> {
    return this.http.get<TechnicianServiceCount>(
      `${this.apiUrl}/dashboard/technician-count`,
      { params: { startDate, endDate } }
    );
  }
 // Método para obter a contagem de ordens de serviço
 getServiceOrder(
  startDate: string,
  endDate: string
): Observable<ServiceOrderTypeData[]> {
  return this.http.get<ServiceOrderTypeData[]>(`${this.apiUrl}/dashboard/service-orders/summary`, {
    params: { startDate, endDate },
  });
}


  getMainSummary(startDate: string, endDate: string, status?: string[] ): Observable<DashboardSummary>{
    const params: any = { startDate, endDate };
    if (status && status.length > 0) {
      params.status = status;
    }
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/main-summary`, {
      params
    });
  }

  

}
