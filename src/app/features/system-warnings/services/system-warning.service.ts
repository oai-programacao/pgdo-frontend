import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateSystemWarningDto, UpdateSystemWarningDto, ViewSystemWarningDto } from '../../../interfaces/system-warnings.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SystemWarningService {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/system-warnings`;

  createWarning(body: CreateSystemWarningDto): Observable<ViewSystemWarningDto> {
    return this.http.post<ViewSystemWarningDto>(`${this.apiUrl}`, body);
  }

  getWarnings(): Observable<ViewSystemWarningDto[]> {
    return this.http.get<ViewSystemWarningDto[]>(`${this.apiUrl}`);
  }

  getWarningById(id: string): Observable<ViewSystemWarningDto> {
    return this.http.get<ViewSystemWarningDto>(`${this.apiUrl}/${id}`);
  }

  updateWarning(id: string, body: UpdateSystemWarningDto): Observable<ViewSystemWarningDto> {
    return this.http.patch<ViewSystemWarningDto>(`${this.apiUrl}/${id}`, body);
  }
   
}
