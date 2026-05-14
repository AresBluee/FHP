import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { environment } from '../../../../Environment/environment';
import { MessageService } from 'primeng/api';

import { AuthService } from '../../../../core/services/auth.service';

interface AttendanceHistoryDTO {
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  totalMinutes: number | null;
}

@Component({
  selector: 'app-attendance-user',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule],
  templateUrl: './attendance-user.component.html',
  styleUrl: './attendance-user.component.scss'
})
export class AttendanceUserComponent implements OnInit{

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/attendance';
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  currentUserStatus: 'CHECKED_IN' | 'CHECKED_OUT' | 'UNKNOWN' = 'UNKNOWN';
  isLoading = false;
  userAttendanceHistory: AttendanceHistoryDTO[] = [];

  ngOnInit(): void {
    this.loadUserStatus();
    this.loadUserHistory();
  }

  loadUserStatus(): void {
    // Llamamos a /api/attendance/me para ver el estado del día de hoy
    this.http.get<AttendanceHistoryDTO[]>(`${this.apiUrl}/me`).subscribe(history => {
        if (history && history.length > 0) {
            const lastRecord = history[0]; // Suponiendo que el primer registro es el de hoy
            const isToday = lastRecord.date === new Date().toISOString().split('T')[0];
            if (isToday && lastRecord.checkIn && !lastRecord.checkOut) {
                this.currentUserStatus = 'CHECKED_IN';
            } else {
                this.currentUserStatus = 'CHECKED_OUT';
            }
        } else {
            this.currentUserStatus = 'CHECKED_OUT';
        }
    });
  }

  loadUserHistory(): void {
    this.http.get<AttendanceHistoryDTO[]>(`${this.apiUrl}/me`).subscribe(history => {
        this.userAttendanceHistory = history;
    });
  }

  checkInOrOut(): void {
    this.isLoading = true;
    const actionStr = this.currentUserStatus === 'CHECKED_OUT' || this.currentUserStatus === 'UNKNOWN' ? 'Entrada' : 'Salida';
    
    if (!navigator.geolocation) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Geolocalización no soportada por su navegador.' });
      this.isLoading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const payload = {
          employeeCode: this.authService.getUsername(),
          deviceTimestamp: new Date().toISOString(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        this.http.post(`${this.apiUrl}/register`, payload).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `¡${actionStr} registrada con éxito!` });
            this.loadUserStatus();
            this.loadUserHistory();
            this.isLoading = false;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al registrar marcaje.' });
            this.isLoading = false;
          }
        });
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Se requiere permiso de ubicación para marcar asistencia.' });
        this.isLoading = false;
      }
    );
  }

  getButtonLabel(): string {
    if (this.currentUserStatus === 'CHECKED_IN') return 'Registrar Salida (Check-Out)';
    if (this.currentUserStatus === 'CHECKED_OUT' || this.currentUserStatus === 'UNKNOWN') return 'Registrar Entrada (Check-In)';
    return 'Cargando...';
  }
}
