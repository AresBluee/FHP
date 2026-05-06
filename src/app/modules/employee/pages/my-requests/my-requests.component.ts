import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { EmployeeService } from '../../../../core/services/employee.service';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Interfaces necesarias
interface RequestCreationDTO {
    requestTypeId: number; details: string; startDate: string; endDate: string;
    managerId: number;
}
interface RequestResponseDTO {
    id: number; requestType: string; employeeName: string; details: string;
    startDate: string; endDate: string; status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}
interface ManagerContactDTO {
    id: number; fullName: string; position: string; roleName: string;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, TableModule, ButtonModule, TagModule],  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss'
})
export class MyRequestsComponent implements OnInit{

  private http = inject(HttpClient);
  private employeeService = inject(EmployeeService);
  private apiUrl = environment.apiUrl + '/api/requests';

  requests: RequestResponseDTO[] = [];
  managersList: ManagerContactDTO[] = [];

  isLoadingHistory = false;
  isSendingRequest = false;

  newRequest: RequestCreationDTO = {
    requestTypeId: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    details: '',
    managerId: 0
  };

  requestTypes = [
    { value: 1, label: 'Permiso Personal' },
    { value: 2, label: 'Solicitud de Vacaciones' },
    { value: 3, label: 'Adelanto de Sueldo' },
    { value: 4, label: 'Constancia de Trabajo' }
  ];

  ngOnInit(): void {
    this.loadRequestsHistory();
    this.loadManagers();
  }

  // -----------------------------------------------------------
  // LÓGICA DE CARGA DE DATOS
  // -----------------------------------------------------------

  loadManagers(): void {
    this.employeeService.getManagers().subscribe({
        next: (data) => { this.managersList = data; },
        error: (err) => console.error('Fallo al cargar la lista de managers:', err)
    });
  }

  loadRequestsHistory(): void {
    this.isLoadingHistory = true;
    
    // GET /api/requests/me (Endpoint para el empleado logueado)
    this.http.get<RequestResponseDTO[]>(`${this.apiUrl}/me`).subscribe({
      next: (data) => {
        this.requests = data;
        this.isLoadingHistory = false;
      },
      error: (err) => {
        console.error('Error cargando historial de solicitudes:', err);
        this.isLoadingHistory = false;
      }
    });
  }

  // -----------------------------------------------------------
  // LÓGICA DE ENVÍO DE SOLICITUD
  // -----------------------------------------------------------

  submitRequest(): void {
    this.isSendingRequest = true;

    if (!this.newRequest.details || this.newRequest.managerId === 0) {
        alert('Debe completar la justificación y seleccionar un destinatario.');
        this.isSendingRequest = false;
        return;
    }

    // POST /api/requests
    this.http.post<RequestResponseDTO>(this.apiUrl, this.newRequest).subscribe({
      next: (createdRequest) => {
        alert('Solicitud enviada con éxito.');
        this.requests.unshift(createdRequest); // Añade al principio de la lista
        this.resetForm();
        this.isSendingRequest = false;
      },
      error: (err) => {
        console.error('Error al enviar solicitud:', err);
        this.isSendingRequest = false;
        alert('Error al enviar la solicitud. Inténtelo de nuevo.');
      }
    });
  }

  resetForm(): void {
    this.newRequest = {
      requestTypeId: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      details: '',
      managerId: 0 
    };
  }
}
