import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RequestTypeDTO {
  id?: number;
  name: string;
  basePriority: number;
  slaDays: number;
  requiresSignature: boolean;
  requiresAttachment: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RequestTypeService {
  private apiUrl = environment.apiUrl + '/api/request-types';
  private http = inject(HttpClient);

  getAll(): Observable<RequestTypeDTO[]> {
    return this.http.get<RequestTypeDTO[]>(this.apiUrl);
  }

  create(data: RequestTypeDTO): Observable<RequestTypeDTO> {
    return this.http.post<RequestTypeDTO>(this.apiUrl, data);
  }

  update(id: number, data: RequestTypeDTO): Observable<RequestTypeDTO> {
    return this.http.put<RequestTypeDTO>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
