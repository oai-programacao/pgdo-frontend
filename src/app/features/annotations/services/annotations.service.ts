import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnnotationType, CreateAnnotationDto, ViewAnnotationDto } from '../../../interfaces/annotations.model';
import { CustomPageResponse } from '../../../interfaces/service-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnotationsService {

  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl + '/annotations';

  createAnnotation(data: CreateAnnotationDto): Observable<ViewAnnotationDto> {
    return this.http.post<ViewAnnotationDto>(`${this.apiUrl}`, data);
  }

  getAnnotations(page: number, size: number, employeeId?: string, creatorId?: string, type?: AnnotationType): Observable<CustomPageResponse<ViewAnnotationDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    if (creatorId) {
      params = params.set('creatorId', creatorId);
    }
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<CustomPageResponse<ViewAnnotationDto>>(`${this.apiUrl}`, { params });
  }
}
