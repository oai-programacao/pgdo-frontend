import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTechnicianDto, UpdateTechnicianDto, ViewTechnicianDto } from '../../../interfaces/technician.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class TechnicianService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/technicians`;

  findAll(isActive?: boolean): Observable<ViewTechnicianDto[]> {
    let params = new HttpParams();
    if (isActive !== undefined && isActive !== null) {
      params = params.set("isActive", isActive.toString());
    }
    return this.http.get<ViewTechnicianDto[]>(this.apiUrl, { params });
  }

  findById(id: string): Observable<ViewTechnicianDto> {
    return this.http.get<ViewTechnicianDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTechnicianDto): Observable<ViewTechnicianDto> {
    return this.http.post<ViewTechnicianDto>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateTechnicianDto): Observable<ViewTechnicianDto> {
    return this.http.patch<ViewTechnicianDto>(`${this.apiUrl}/${id}`, dto);
  }
}
