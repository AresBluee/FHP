import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { of, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';


interface RequestResponseDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  requestType: string;
  details: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule, DatePipe, FormsModule, ToastModule, ConfirmDialogModule, InputTextModule, DialogModule, IconFieldModule, InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './request-management.component.html',
  styleUrls: ['./request-management.component.scss']
})
export class RequestManagementComponent implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private requestApiUrl = environment.apiUrl + '/api/requests';

  requests: RequestResponseDTO[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.http.get<RequestResponseDTO[]>(this.requestApiUrl).pipe(
      catchError(error => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las solicitudes.' });
        return of([]);
      })
    ).subscribe(data => {
      this.requests = data;
      this.isLoading = false;
    });
  }

  updateStatus(requestId: number, status: 'APPROVED' | 'REJECTED'): void {
    const action = status === 'APPROVED' ? 'Aprobar' : 'Rechazar';
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres ${action.toLowerCase()} esta solicitud?`,
      header: `Confirmar ${action}`,
      icon: status === 'APPROVED' ? 'pi pi-check-circle' : 'pi pi-times-circle',
      acceptLabel: action,
      rejectLabel: 'Cancelar',
      accept: () => {
        // Aquí podrías añadir un diálogo para el comentario si es necesario,
        // por simplicidad, lo dejamos como un comentario genérico por ahora.
        const comment = `Solicitud ${status.toLowerCase()} por el administrador.`;
        const statusDTO = { status: status, comment: comment };

        this.http.put<RequestResponseDTO>(`${this.requestApiUrl}/${requestId}/status`, statusDTO).subscribe({
          next: (updatedRequest) => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Solicitud #${requestId} ha sido actualizada.` });
            const index = this.requests.findIndex(r => r.id === requestId);
            if (index !== -1) {
              this.requests[index] = updatedRequest;
            }
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `Fallo al actualizar: ${err.error?.message || 'Error desconocido'}` });
          }
        });
      }
    });
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
