import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../../../../core/services/schedule.service';
import { ScheduleResponseDTO } from '../../../../core/models/schedule.model';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card'; // Para el contenedor
import { SkeletonModule } from 'primeng/skeleton'; // Para el estado de carga

import { of, catchError } from 'rxjs';

// Interfaz para la tabla (Array de 7 días)
interface Shift {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    breakDuration: string; // Simulación
    taskDescription: string;
}

@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule, SkeletonModule],
  templateUrl: './my-schedule.component.html',
  styleUrl: './my-schedule.component.scss'
})
export class MyScheduleComponent implements OnInit{

    private scheduleService = inject(ScheduleService);

    currentScheduleDTO: ScheduleResponseDTO | null = null;
    shiftsForTable: Shift[] = []; // Array que alimenta la tabla (solución al error)

    isLoading = false;

    // Variables de navegación semanal
    currentWeekStart: string = this.getStartOfWeek(new Date());

    ngOnInit(): void {
        this.loadWeeklySchedule();
    }

    // ---------------------------------------------------------------------
    // 1. Lógica de Navegación Semanal (No cambia)
    // ---------------------------------------------------------------------
    private getStartOfWeek(date: Date): string {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    }

    changeWeek(days: number): void {
        const current = new Date(this.currentWeekStart);
        current.setDate(current.getDate() + days);
        this.currentWeekStart = this.getStartOfWeek(current);
        this.loadWeeklySchedule();
    }

    // ---------------------------------------------------------------------
    // 2. Cargar Horario (GET /me)
    // ---------------------------------------------------------------------
    loadWeeklySchedule(): void {
        this.isLoading = true;

        this.scheduleService.getMyWeeklySchedule(this.currentWeekStart).pipe(
            catchError(error => {
                console.error('Error al cargar horario:', error);
                this.isLoading = false;
                // Devolver null para manejar el 404/error como horario no asignado
                return of(null);
            })
        ).subscribe(data => {
            this.currentScheduleDTO = data;
            this.isLoading = false;

            // 💡 CRÍTICO: Transformar el DTO en el array de 7 días
            if (data) {
                this.shiftsForTable = this.mapScheduleToWeeklyView(data);
            } else {
                this.shiftsForTable = this.mapScheduleToWeeklyView(null); // Generar array vacío si es null
            }
        });
    }

    // ---------------------------------------------------------------------
    // 3. FUNCIÓN DE MAPEO: Transforma el DTO único en Array de 7 días
    // ---------------------------------------------------------------------
    private mapScheduleToWeeklyView(dto: ScheduleResponseDTO | null): Shift[] {
        if (!dto) {
            // Devuelve el array de 7 días con "No Asignado" si no hay asignación
            const days = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
            return days.map(dayName => ({
                dayOfWeek: dayName, startTime: '--', endTime: '--', breakDuration: '--', taskDescription: 'No Asignado'
            }));
        }

        // 1. Obtener los códigos de días laborables del DTO (Ej: "LUN,MAR,MIE,JUE,VIE")
        // Se divide la cadena por comas para obtener un array y se limpia/convierte a mayúsculas
        const workingDaysCodes = dto.workingDays.split(',').map((d: string) => d.trim().toUpperCase());

        // 2. Nombres de días sin acentos conflictivos (Ej: MIE)
        // 💡 CORRECCIÓN: Usar la palabra 'MIERCOLES' sin acento para evitar errores de substring
        const dayNames = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];

        // 3. Generar el array de 7 turnos
        return dayNames.map(dayName => {
            // Obtenemos los primeros 3 caracteres (LUN, MAR, MIE, JUE, VIE, SÁB, DOM)
            // Usamos .substring(0, 3) para obtener el código que debe coincidir con el workingDaysCodes
            const dayCode = dayName.substring(0, 3);

            // Comprueba si el código del día está en la lista de días laborables
            const isWorking = workingDaysCodes.includes(dayCode);

            return {
                dayOfWeek: dayName,
                startTime: isWorking ? dto.startTime : '--',
                endTime: isWorking ? dto.endTime : '--',
                // Asumimos un descanso fijo para los días laborables
                breakDuration: isWorking ? '1h 00m' : '--',
                taskDescription: isWorking ? dto.scheduleName : 'Día Libre'
            } as Shift;
        });
    }
}
