import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { EmployeeService } from '../../../../core/services/employee.service';

interface PriorityStats {
  level: number;
  label: string;
  total: number;
  managed: number;
  pending: number;
  progress: number;
  colorClass: string;
  iconClass: string;
}


interface RequestResponseDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  requestType: string;
  details: string;
  requestedDate: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'AWAITING_SIGNATURE' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  managerComment: string;
  managerName: string;
  calculatedPriority: number;
  remainingSlaHours: number;
  isSigned: boolean;
  documentPath: string;
  requiresSignature: boolean;
}

@Component({
  selector: 'app-request-management',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule, DatePipe, FormsModule, ToastModule, ConfirmDialogModule, InputTextModule, DialogModule, IconFieldModule, InputIconModule,
    ProgressBarModule, TooltipModule, DropdownModule
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
  private sanitizer = inject(DomSanitizer);
  private employeeService = inject(EmployeeService);
  private requestApiUrl = environment.apiUrl + '/api/requests';

  requests: RequestResponseDTO[] = [];
  filteredRequests: RequestResponseDTO[] = [];
  isLoading = true;

  priorityStats: PriorityStats[] = [
    { level: 4, label: 'Prioridad Crítica', total: 0, managed: 0, pending: 0, progress: 0, colorClass: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100', iconClass: 'pi pi-bolt text-red-600' },
    { level: 3, label: 'Prioridad Alta', total: 0, managed: 0, pending: 0, progress: 0, colorClass: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100', iconClass: 'pi pi-angle-double-up text-orange-500' },
    { level: 2, label: 'Prioridad Media', total: 0, managed: 0, pending: 0, progress: 0, colorClass: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100', iconClass: 'pi pi-angle-up text-blue-500' },
    { level: 1, label: 'Prioridad Baja', total: 0, managed: 0, pending: 0, progress: 0, colorClass: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100', iconClass: 'pi pi-minus text-green-500' }
  ];

  activePriorityFilter: number | null = null;
  activeStatusFilter: 'ALL' | 'PENDING' | 'AWAITING_SIGNATURE' | 'MANAGED' = 'PENDING';

  // Dialog State
  displayDialog = false;
  selectedRequest: RequestResponseDTO | null = null;
  observationComment = '';
  documentUrl = '';
  safeDocumentUrl: SafeResourceUrl | null = null;
  rawBlobUrl = '';
  isLoadingDoc = false;
  supervisors: any[] = [];
  selectedSupervisorId: number | null = null;

  ngOnInit(): void {
    this.loadRequests();
    this.loadSupervisors();
  }

  loadSupervisors(): void {
    this.employeeService.getSupervisors().subscribe(data => {
      this.supervisors = data.map(s => ({
        label: `${s.fullName} - ${s.position}`,
        value: s.id
      }));
    });
  }

  loadRequests(): void {
    this.isLoading = true;
    // Asumimos que el backend GET /api/requests devuelve todo (o podemos llamar getPriorityQueue)
    this.http.get<RequestResponseDTO[]>(this.requestApiUrl).pipe(
      catchError(error => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las solicitudes.' });
        return of([]);
      })
    ).subscribe(data => {
      this.requests = data.sort((a, b) => {
          if (b.calculatedPriority !== a.calculatedPriority) return b.calculatedPriority - a.calculatedPriority;
          return a.remainingSlaHours - b.remainingSlaHours;
      });
      this.calculateStats();
      this.applyFilters();
      this.isLoading = false;
    });
  }

  calculateStats(): void {
    this.priorityStats.forEach(stat => {
      const reqsOfPriority = this.requests.filter(r => r.calculatedPriority === stat.level);
      stat.total = reqsOfPriority.length;
      stat.pending = reqsOfPriority.filter(r => r.status === 'PENDING' || r.status === 'AWAITING_SIGNATURE').length;
      stat.managed = stat.total - stat.pending;
      stat.progress = stat.total === 0 ? 100 : Math.round((stat.managed / stat.total) * 100);
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(r => {
      let matchesStatus = true;
      if (this.activeStatusFilter === 'PENDING') {
        matchesStatus = (r.status === 'PENDING');
      } else if (this.activeStatusFilter === 'AWAITING_SIGNATURE') {
        matchesStatus = (r.status === 'AWAITING_SIGNATURE');
      } else if (this.activeStatusFilter === 'MANAGED') {
        matchesStatus = (r.status !== 'PENDING' && r.status !== 'AWAITING_SIGNATURE');
      }
      
      let matchesPriority = true;
      if (this.activePriorityFilter !== null) {
        matchesPriority = (r.calculatedPriority === this.activePriorityFilter);
      }
      
      return matchesStatus && matchesPriority;
    });
  }

  togglePriorityFilter(level: number): void {
    if (this.activePriorityFilter === level) {
      this.activePriorityFilter = null; // Toggle off
    } else {
      this.activePriorityFilter = level;
    }
    this.applyFilters();
  }

  setStatusFilter(status: 'ALL' | 'PENDING' | 'AWAITING_SIGNATURE' | 'MANAGED'): void {
    this.activeStatusFilter = status;
    this.applyFilters();
  }

  openRequestDialog(req: RequestResponseDTO): void {
      this.selectedRequest = req;
      this.observationComment = req.managerComment || '';
      this.selectedSupervisorId = null; // Reset selection
      
      this.cleanupDocUrl();
      
      if (req.documentPath) {
          let path = req.documentPath.replace(/\\/g, '/');
          if (path.startsWith('/')) {
              path = path.substring(1);
          }
          this.documentUrl = environment.apiUrl + '/' + path;
          this.isLoadingDoc = true;
          
          this.http.get(this.documentUrl, { responseType: 'blob' }).subscribe({
              next: (blob) => {
                  const blobUrl = URL.createObjectURL(blob);
                  this.rawBlobUrl = blobUrl;
                  this.safeDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
                  this.isLoadingDoc = false;
              },
              error: (err) => {
                  console.error('Error al descargar el PDF:', err);
                  this.isLoadingDoc = false;
                  this.safeDocumentUrl = null;
              }
          });
      } else {
          this.documentUrl = '';
      }
      this.displayDialog = true;
  }

  cleanupDocUrl(): void {
      if (this.rawBlobUrl) {
          URL.revokeObjectURL(this.rawBlobUrl);
          this.rawBlobUrl = '';
      }
      this.safeDocumentUrl = null;
  }

  updateStatusFromDialog(status: 'APPROVED' | 'REJECTED' | 'AWAITING_SIGNATURE'): void {
      if (!this.selectedRequest) return;

      if (status === 'AWAITING_SIGNATURE' && !this.selectedSupervisorId) {
          this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe seleccionar un supervisor al cual derivar el documento.' });
          return;
      }
      
      const reqId = this.selectedRequest.id;
      const statusDTO: any = { status: status, comment: this.observationComment };

      if (status === 'AWAITING_SIGNATURE') {
          statusDTO.managerId = this.selectedSupervisorId;
      }

      this.http.put<RequestResponseDTO>(`${this.requestApiUrl}/${reqId}/status`, statusDTO).subscribe({
          next: (updatedRequest) => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Solicitud #${reqId} actualizada.` });
            const index = this.requests.findIndex(r => r.id === reqId);
            if (index !== -1) {
              this.requests[index] = updatedRequest;
            }
            this.calculateStats();
            this.applyFilters();
            this.displayDialog = false;
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: `Fallo al actualizar: ${err.error?.message || 'Error desconocido'}` });
          }
      });
  }
  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
