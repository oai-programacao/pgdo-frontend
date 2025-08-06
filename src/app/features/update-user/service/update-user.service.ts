import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ViewEmployeeDto } from '../../../interfaces/employee.model';

@Injectable({
  providedIn: 'root'
})
export class UpdateUserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;


  constructor() { }

update(id: string, data: any) {
  return this.http.patch(
    `${this.apiUrl}/employees/${id}`,
    data,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
  getEmployeeByEmail(email: string): Observable<ViewEmployeeDto | null> {
    return this.http.get<ViewEmployeeDto | null>(`${this.apiUrl}/employees/email/${email}`);
  }
}
