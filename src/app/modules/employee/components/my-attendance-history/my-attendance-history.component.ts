import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment'; 

// Módulos de PrimeNG
import { TableModule } from 'primeng/table'; 
import { ButtonModule } from 'primeng/button'; 
import { TagModule } from 'primeng/tag'; 
import { DatePickerModule } from 'primeng/datepicker';

import { of, catchError } from 'rxjs';
import { Router } from '@angular/router';

import { DropdownModule } from 'primeng/dropdown';

interface DailyWorkSummary {
    employeeId: number;
    date: string; // YYYY-MM-DD
    checkInTime: string | null;
    checkOutTime: string | null;
    totalDuration: string; // Ej: "7h 4m" (Este es el campo que debes usar)
    totalMinutes: number;
    overtimeMinutes: number; // Para la lógica de estado
    complete: boolean; // Para verificar jornada completa
}
@Component({
  selector: 'app-my-attendance-history',
  standalone: true,
  
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, DatePickerModule, DropdownModule],
  templateUrl: './my-attendance-history.component.html',
  styleUrl: './my-attendance-history.component.scss'
})
export class MyAttendanceHistoryComponent implements OnInit{
    private http = inject(HttpClient);
    private router = inject(Router); 
    private apiUrl = environment.apiUrl + '/api/reports'; 

    // Variables de filtro y estado
    attendanceRecords: DailyWorkSummary[] = [];
    isLoading = false;
    
    // Variables de filtro
    private currentDate = new Date();
    selectedMonth: number = this.currentDate.getMonth() + 1; // Mes actual
    selectedYear: number = this.currentDate.getFullYear();
    availableYears: number[] = this.generateYearRange();
    
    months = [
        { label: 'Enero', value: 1 },
        { label: 'Febrero', value: 2 },
        { label: 'Marzo', value: 3 },
        { label: 'Abril', value: 4 },
        { label: 'Mayo', value: 5 },
        { label: 'Junio', value: 6 },
        { label: 'Julio', value: 7 },
        { label: 'Agosto', value: 8 },
        { label: 'Septiembre', value: 9 },
        { label: 'Octubre', value: 10 },
        { label: 'Noviembre', value: 11 },
        { label: 'Diciembre', value: 12 }
    ];
    
    // FILTRO POR FECHA ESPECÍFICA (Inicializado en HOY)
    selectedDate: string = this.currentDate.toISOString().split('T')[0]; 

    // Date object for PrimeNG calendar binding
    calendarDate: Date = new Date(this.currentDate);

    onCalendarSelect(date: Date): void {
        this.calendarDate = date;
        this.selectedDate = date.toISOString().split('T')[0];
        this.loadAttendanceHistory(true);
    }

    ngOnInit(): void {
        // ✅ CORRECCIÓN CRÍTICA: Busca por el rango del mes actual (false) para cargar la lista completa.
        this.loadAttendanceHistory(false); 
    }

    // Genera un rango de años (método auxiliar)
    generateYearRange(): number[] {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) { 
            years.push(i);
        }
        return years;
    }

    // ---------------------------------------------------------------------
    // 1. Cargar Historial (Lógica Unificada para Día o Rango)
    // ---------------------------------------------------------------------
    // useDateFilter: true = busca solo el día, false = busca el rango del mes
    loadAttendanceHistory(useDateFilter: boolean = false): void {
        this.isLoading = true;
        
        let start: string;
        let end: string;

        if (useDateFilter && this.selectedDate) {
            // ✅ OPCIÓN 1: Buscar por Fecha Específica (Día)
            start = this.selectedDate;
            end = this.selectedDate;
        } else {
            // ✅ OPCIÓN 2: Buscar por Mes/Año (Rango Mensual)
            const date = new Date(this.selectedYear, this.selectedMonth - 1, 1); 
            start = date.toISOString().split('T')[0];
            end = new Date(this.selectedYear, this.selectedMonth, 0).toISOString().split('T')[0]; 
        }
        
        // 2. Construir la URL con los parámetros START y END
        const url = `${this.apiUrl}/me?start=${start}&end=${end}`;
        
        this.http.get<DailyWorkSummary[]>(url).pipe(
            catchError(error => {
                this.isLoading = false;
                
                if (error.status === 403 || error.status === 401) {
                    alert('Sesión expirada.');
                    this.router.navigate(['/login']);
                }
                console.error('Error al cargar historial:', error);
                return of([]);
            })
        ).subscribe(data => {
            this.attendanceRecords = data;
            this.isLoading = false;
        });
    }

    // Auxiliar: Define el color de la etiqueta según el estado
    getSeverity(status: string): string {
        switch (status) {
            case 'COMPLETA': return 'success';
            case 'INCOMPLETA': return 'danger';
            default: return 'secondary';
        }
    }

    // Auxiliar: Formatea horas
    formatTotalHours(totalMinutes: number | null): string {
        if (totalMinutes === null) return '--';
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h ${m}m`;
    }
}
