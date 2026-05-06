import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScheduleResponseDTO } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = `${environment.apiUrl}/api/schedules`;

  constructor(private http: HttpClient) { }

  getMyWeeklySchedule(date: string): Observable<ScheduleResponseDTO> {
    return this.http.get<ScheduleResponseDTO>(`${this.apiUrl}/me`, { params: { date } });
  }
}
