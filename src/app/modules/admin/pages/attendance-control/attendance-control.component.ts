import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { of, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface EmployeeStatus {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  position: string;
  status: 'ASISTIO' | 'NO_REGISTRADO' | 'SALIO';
  lastMarkTime: string | null;
  reportDate: string;
  biometricHash: string;
}

@Component({
  selector: 'app-attendance-control',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule, InputTextModule, DatePipe, CalendarModule, ToastModule, TooltipModule, IconFieldModule, InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './attendance-control.component.html',
  styleUrls: ['./attendance-control.component.scss']
})
export class AttendanceControlComponent implements OnInit {

  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private apiUrl = environment.apiUrl + '/api/attendance';

  selectedDate: Date = new Date();
  employeeStatuses: EmployeeStatus[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadDailyStatus();
  }

  loadDailyStatus(): void {
    this.isLoading = true;
    const dateString = this.formatDate(this.selectedDate);
    this.http.get<EmployeeStatus[]>(`${this.apiUrl}/status/daily?date=${dateString}`).pipe(
      catchError(error => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos de asistencia.' });
        console.error('Error al cargar estado diario:', error);
        return of([]);
      })
    ).subscribe(data => {
      this.employeeStatuses = data;
      this.isLoading = false;
    });
  }

  registerManualMark(employeeStatus: EmployeeStatus): void {
    this.isLoading = true;
    const actionText = employeeStatus.status === 'ASISTIO' ? 'Salida' : 'Entrada';

    const payload = {
      biometricHash: employeeStatus.biometricHash,
      deviceTimestamp: new Date().toISOString(),
      latitude: 0,
      longitude: 0,
    };

    this.http.post(`${this.apiUrl}/register`, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Registro de ${actionText} manual exitoso.` });
        this.loadDailyStatus();
      },
      error: err => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error al registrar ${actionText}: ${err.error?.message || 'Error desconocido'}` });
      }
    });
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getButtonText(status: string): string {
    if (status === 'ASISTIO') return 'Marcar Salida';
    if (status === 'SALIO') return 'Jornada Finalizada';
    return 'Marcar Entrada';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
