import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeProfileDTO } from '../models/employee.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private apiUrl = `${environment.apiUrl}/api/employee`;

  constructor(private http: HttpClient) { }

  getEmployeeProfile(): Observable<EmployeeProfileDTO> {
    return this.http.get<EmployeeProfileDTO>(`${this.apiUrl}/me`);
  }

  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/managers?roles=ADMIN,RRHH`);
  }
}
