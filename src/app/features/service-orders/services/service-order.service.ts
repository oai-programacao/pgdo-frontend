import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  CountResponse,
  CreateServiceOrderDto,
  CreateServiceOrderHelperDto,
  CreateServiceOrderUnproductiveVisitDto,
  CustomPageResponse,
  ServiceOrderFilters,
  ServiceOrderPage,
  UpdateServiceOrderDto,
  ViewServiceOrderDto,
  ViewTechnicalHelpDto,
  ViewUnproductiveVisits,
} from "../../../interfaces/service-order.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ServiceOrderService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + "/service-orders";

  create(dto: CreateServiceOrderDto): Observable<ViewServiceOrderDto> {
    return this.http.post<ViewServiceOrderDto>(this.apiUrl, dto);
  }

  getContractDetails(contractNumber: number): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/rbx/consultar-contratos?filtro=Numero=${contractNumber}`,
      null
    );
  }

  findAll(
    filters: ServiceOrderFilters,
    page: number,
    size: number
  ): Observable<CustomPageResponse<ViewServiceOrderDto>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    // Lógica para adicionar filtros aos params (como estava antes)...
    if (
      filters.contractNumber !== undefined &&
      filters.contractNumber !== null
    ) {
      params = params.set("contractNumber", filters.contractNumber.toString());
    }
    if (filters.clientName) {
      params = params.set("clientName", filters.clientName);
    }
    // ... (adicione todos os outros filtros aqui)
    if (filters.responsiblePersonId) {
      params = params.set("responsiblePersonId", filters.responsiblePersonId);
    }

    if (filters.technicianId) {
      params = params.set("technicianId", filters.technicianId);
    }

    if (filters.startDate) {
      params = params.set("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params = params.set("endDate", filters.endDate);
    }
    if (filters.cities && filters.cities.length > 0) {
      filters.cities.forEach(
        (city) => (params = params.append("cities", city))
      );
    }
    if (filters.typesOfOS && filters.typesOfOS.length > 0) {
      filters.typesOfOS.forEach(
        (type) => (params = params.append("typesOfOS", type))
      );
    }
    if (filters.subTypeOs && filters.subTypeOs.length > 0) {
      filters.subTypeOs.forEach(
        (type) => (params = params.append("subTypeOs", type))
      )
    }
    if (filters.periods && filters.periods.length > 0) {
      filters.periods.forEach(
        (period) => (params = params.append("periods", period))
      );
    }
    if (filters.statuses && filters.statuses.length > 0) {
      filters.statuses.forEach(
        (status) => (params = params.append("statuses", status))
      );
    }

    return this.http.get<CustomPageResponse<ViewServiceOrderDto>>(this.apiUrl, {
      params,
    });
  }

  findById(id: string): Observable<ViewServiceOrderDto> {
    return this.http.get<ViewServiceOrderDto>(`${this.apiUrl}/${id}`);
  }

  update(
    id: string,
    dto: UpdateServiceOrderDto
  ): Observable<ViewServiceOrderDto> {
    return this.http.patch<ViewServiceOrderDto>(`${this.apiUrl}/${id}`, dto);
  }

  addHelper(
    serviceOrderId: string,
    dto: CreateServiceOrderHelperDto
  ): Observable<ViewTechnicalHelpDto> {
    return this.http.post<ViewTechnicalHelpDto>(
      `${this.apiUrl}/${serviceOrderId}/helpers`,
      dto
    );
  }

  addUnproductiveVisit(
    serviceOrderId: string,
    dto: CreateServiceOrderUnproductiveVisitDto
  ): Observable<ViewUnproductiveVisits> {
    return this.http.post<ViewUnproductiveVisits>(
      `${this.apiUrl}/${serviceOrderId}/unproductive-visits`,
      dto
    );
  }

  // Supondo um novo endpoint para o dashboard de contagem
  getStatusSummary(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(
      `${this.apiUrl}/summary/by-status`
    );
  }

  patchServiceOrder(
    serviceOrderId: string,
    dto: UpdateServiceOrderDto
  ): Observable<ViewServiceOrderDto> {
    return this.http.patch<ViewServiceOrderDto>(
      `${this.apiUrl}/${serviceOrderId}`,
      dto
    );
  }

  deleteServiceOrderById(
    serviceOrderId: string
  ): Observable<ViewServiceOrderDto> {
    return this.http.delete<ViewServiceOrderDto>(
      `${this.apiUrl}/${serviceOrderId}`
    );
  }

  patchTechnicianHelper(
    helperId: string,
    dto: CreateServiceOrderHelperDto
  ): Observable<ViewTechnicalHelpDto> {
    return this.http.patch<ViewTechnicalHelpDto>(
      `${this.apiUrl}/orderHelper/${helperId}`,
      dto
    );
  }

  deleteTechnicianHelper(helperId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orderHelper/${helperId}`);
  }

  getExpiredCliente(page: number, size: number): Observable<ServiceOrderPage> {
    return this.http.get<ServiceOrderPage>(
      `${this.apiUrl}/status/expired?page=${page}&size=${size}`
    );
  }

  getExpiredCount(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${this.apiUrl}/status/expired/count`);
  }
}
