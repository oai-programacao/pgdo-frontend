import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { EmployeeRole, ViewEmployeeDto, CreateEmployeeDto, UpdateEmployeeDto } from "../../../interfaces/employee.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/employees`;

  findAll(
    isActive?: boolean,
    role?: EmployeeRole
  ): Observable<ViewEmployeeDto[]> {
    let params = new HttpParams();
    if (isActive !== undefined && isActive !== null) {
      params = params.set("isActive", isActive.toString());
    }
    if (role) {
      params = params.set("role", role);
    }
    return this.http.get<ViewEmployeeDto[]>(this.apiUrl, { params });
  }

  findById(id: string): Observable<ViewEmployeeDto> {
    return this.http.get<ViewEmployeeDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateEmployeeDto): Observable<ViewEmployeeDto> {
    return this.http.post<ViewEmployeeDto>(this.apiUrl, dto);
  }

  activate(id: string): Observable<ViewEmployeeDto> {
    return this.http.post<ViewEmployeeDto>(`${this.apiUrl}/${id}/activate`, {});
  }

  inactivate(id: string): Observable<ViewEmployeeDto> {
    return this.http.post<ViewEmployeeDto>(
      `${this.apiUrl}/${id}/inactivate`,
      {}
    );
  }

  update(id: string, dto: UpdateEmployeeDto): Observable<ViewEmployeeDto> {
    return this.http.patch<ViewEmployeeDto>(`${this.apiUrl}/${id}`, dto);
  }



  }

