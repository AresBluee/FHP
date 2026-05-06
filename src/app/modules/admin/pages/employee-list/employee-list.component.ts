import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../Environment/environment';
import { of, catchError, map } from 'rxjs';

import { MessageService, ConfirmationService } from 'primeng/api';  // Necesario para notificaciones Toast y diálogos
// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

interface EmployeeListDTO {
  id: number;
  employeeCode: string;
  fullName: string;
  position: string;
  userId: number;
  username: string;
  roleName: string;
  enabled: boolean; // <-- Añadir el estado de la cuenta
}

interface EmployeeVM extends EmployeeListDTO {
  roleDisplay: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule, InputTextModule, SkeletonModule, IconFieldModule, InputIconModule, FloatLabelModule, ConfirmDialogModule, ToastModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService], // <-- Añadir ConfirmationService
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {

  private http = inject(HttpClient);
  public router = inject(Router);
  private apiUrl = environment.apiUrl + '/api/employee';
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService); // <-- Inyectar ConfirmationService
  employees: EmployeeVM[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http.get<EmployeeListDTO[]>(this.apiUrl).pipe(
      map((employeesDTO: EmployeeListDTO[]) => {
        return employeesDTO.map(emp => ({
          ...emp,
          roleDisplay: emp.roleName ? emp.roleName.replace('ROLE_', '') : 'N/A'
        })) as EmployeeVM[];
      }),
      catchError(error => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar empleados. Por favor, intente de nuevo más tarde.';
        console.error(error);
        return of([]);
      })
    ).subscribe(data => {
      this.employees = data;
      this.isLoading = false;
    });
  }

  // Método para la búsqueda global en la tabla
  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  toggleUserStatus(employee: EmployeeVM): void {
    const isEnabled = employee.enabled;
    const action = isEnabled ? 'Desactivar' : 'Activar';
    const actionPast = isEnabled ? 'desactivada' : 'activada';

    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres ${action.toLowerCase()} la cuenta de ${employee.fullName}?`,
      header: `Confirmar ${action}`,
      icon: isEnabled ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle',
      acceptLabel: action,
      rejectLabel: 'Cancelar',
      accept: () => {
        this.http.put(`${this.apiUrl}/status/${employee.userId}?enable=${!isEnabled}`, {}).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `La cuenta ha sido ${actionPast}.` });
            this.loadEmployees(); // Recargar la tabla
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `No se pudo cambiar el estado: ${err.error?.message || 'Error desconocido'}` });
          }
        });
      }
    });
  }
}
