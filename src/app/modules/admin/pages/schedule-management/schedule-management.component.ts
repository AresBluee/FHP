import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

// Módulos de PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AccordionModule } from 'primeng/accordion';

// Interfaces de Datos
interface WorkSchedule {
  id: number;
  name: string;
  startTime: Date | string;
  endTime: Date | string;
  toleranceMinutes: number;
}
interface EmployeeListDTO {
  id: number;
  fullName: string;
}
interface EmployeeScheduleAssignmentDTO {
  employeeId: number | null;
  scheduleId: number | null;
  validFrom: Date | null;
  validTo: Date | null;
  workingDays: string;
}

@Component({
  selector: 'app-schedule-management',
  imports: [
    CommonModule, FormsModule, ButtonModule, DropdownModule, InputTextModule, ToastModule, PanelModule, TableModule, CalendarModule, InputNumberModule, FloatLabelModule, AccordionModule
  ],
  providers: [MessageService],
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss']
})
export class ScheduleManagementComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private apiUrl = environment.apiUrl + '/api/schedules';

  // Modelos para los Formularios
  newSchedule: WorkSchedule = { id: 0, name: '', startTime: '', endTime: '', toleranceMinutes: 15 };
  assignmentForm: EmployeeScheduleAssignmentDTO = { employeeId: null, scheduleId: null, validFrom: null, validTo: null, workingDays: '' };

  // Observables para los datos
  schedules$!: Observable<WorkSchedule[]>;
  employees$!: Observable<EmployeeListDTO[]>;

  isLoading = false;

  weekDays = [
    { name: 'Lunes', code: 'LUN', selected: false },
    { name: 'Martes', code: 'MAR', selected: false },
    { name: 'Miércoles', code: 'MIE', selected: false },
    { name: 'Jueves', code: 'JUE', selected: false },
    { name: 'Viernes', code: 'VIE', selected: false },
    { name: 'Sábado', code: 'SAB', selected: false },
    { name: 'Domingo', code: 'DOM', selected: false },
  ];

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.schedules$ = this.http.get<WorkSchedule[]>(this.apiUrl);
    this.employees$ = this.http.get<EmployeeListDTO[]>(`${environment.apiUrl}/api/employee`);
  }

  toggleDay(day: { name: string, code: string, selected: boolean }): void {
    day.selected = !day.selected;
    this.updateWorkingDaysString();
  }

  updateWorkingDaysString(): void {
    this.assignmentForm.workingDays = this.weekDays
      .filter(day => day.selected)
      .map(day => day.code)
      .join(',');
  }

  createSchedule(): void {
    this.isLoading = true;
    // Formatear las horas a string 'HH:mm' que la API espera
    const payload = {
      ...this.newSchedule,
      startTime: this.formatTime(this.newSchedule.startTime),
      endTime: this.formatTime(this.newSchedule.endTime)
    };

    this.http.post<WorkSchedule>(`${this.apiUrl}/turn`, payload).pipe(
      tap(() => this.loadInitialData())
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Plantilla de turno creada' });
        this.newSchedule = { id: 0, name: '', startTime: '', endTime: '', toleranceMinutes: 15 };
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error desconocido' });
        this.isLoading = false;
      }
    });
  }

  assignSchedule(): void {
    if (!this.assignmentForm.workingDays) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar al menos un día laborable.' });
      return;
    }
    this.isLoading = true;

    const payload = {
      employeeId: this.assignmentForm.employeeId,
      scheduleId: this.assignmentForm.scheduleId,
      validFrom: this.formatDate(this.assignmentForm.validFrom),
      validTo: this.formatDate(this.assignmentForm.validTo),
      workingDays: this.assignmentForm.workingDays
    };

    this.http.post(`${this.apiUrl}/assign`, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Horario asignado correctamente' });
        this.assignmentForm = { employeeId: null, scheduleId: null, validFrom: null, validTo: null, workingDays: '' };
        this.weekDays.forEach(day => day.selected = false);
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Error desconocido' });
        this.isLoading = false;
      }
    });
  }

  // Funciones de ayuda para formatear fechas y horas
  private formatDate(date: Date | null): string | null {
    if (!date) return null;
    // Formato YYYY-MM-DD
    return date.toISOString().split('T')[0];
  }

  private formatTime(time: Date | string): string {
    if (typeof time === 'string') return time;
    if (time instanceof Date) {
      // Formato HH:mm
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '';
  }
}
