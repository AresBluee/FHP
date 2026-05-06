import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { environment } from '../../../../Environment/environment';
import { MessageService } from 'primeng/api';

interface AttendanceDTO {
  checkInTime: string;
  checkOutTime: string | null;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
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
  private messageService = inject(MessageService); // Si usas PrimeNG Toast

  currentUserStatus: 'CHECKED_IN' | 'CHECKED_OUT' | 'UNKNOWN' = 'UNKNOWN';
  isLoading = false;
  userAttendanceHistory: AttendanceDTO[] = [];

  ngOnInit(): void {
    this.loadUserStatus();
    this.loadUserHistory();
  }

  loadUserStatus(): void {
    // 💡 Puedes usar /api/attendance/user y ver el último registro
    // Por simplicidad, asumiremos que si hay un registro sin checkOut, está dentro.
    this.http.get<any[]>(`${this.apiUrl}/user`).subscribe(history => {
        const lastRecord = history[0]; // Asume que la lista está ordenada desc
        if (lastRecord && !lastRecord.checkOutTime) {
            this.currentUserStatus = 'CHECKED_IN';
        } else {
            this.currentUserStatus = 'CHECKED_OUT';
        }
    });
  }

  loadUserHistory(): void {
    this.http.get<AttendanceDTO[]>(`${this.apiUrl}/user`).subscribe(history => {
        this.userAttendanceHistory = history;
    });
  }

  checkInOrOut(): void {
    this.isLoading = true;
    const action = this.currentUserStatus === 'CHECKED_OUT' || this.currentUserStatus === 'UNKNOWN' ? 'checkin' : 'checkout';
    
    this.http.post(`${this.apiUrl}/${action}`, {}).subscribe({
      next: () => {
        const msg = action === 'checkin' ? '¡Entrada registrada con éxito!' : '¡Salida registrada con éxito!';
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: msg });
        this.loadUserStatus();
        this.loadUserHistory();
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al registrar marcaje.' });
        this.isLoading = false;
      }
    });
  }

  getButtonLabel(): string {
    if (this.currentUserStatus === 'CHECKED_IN') return 'Registrar Salida (Check-Out)';
    if (this.currentUserStatus === 'CHECKED_OUT' || this.currentUserStatus === 'UNKNOWN') return 'Registrar Entrada (Check-In)';
    return 'Cargando...';
  }
}
