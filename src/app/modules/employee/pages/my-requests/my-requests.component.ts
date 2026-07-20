import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { EmployeeService } from '../../../../core/services/employee.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RequestTypeService, RequestTypeDTO } from '../../../../core/services/request-type.service';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Subscription, interval } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Interfaces necesarias
interface RequestCreationDTO {
    requestTypeId: number; details: string; startDate: string; endDate: string; documentId?: number;
}
interface RequestResponseDTO {
    id: number; requestType: string; employeeName: string; details: string;
    startDate: string; endDate: string; status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedDate: string; documentPath?: string;
}
interface ManagerContactDTO {
    id: number; fullName: string; position: string; roleName: string;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, TableModule, ButtonModule, TagModule, DropdownModule, CalendarModule, ToastModule, TooltipModule, DialogModule],
  providers: [MessageService],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss'
})
export class MyRequestsComponent implements OnInit{

  private http = inject(HttpClient);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  private apiUrl = environment.apiUrl + '/api/requests';

  requests: RequestResponseDTO[] = [];
  managersList: ManagerContactDTO[] = [];

  isLoadingHistory = false;
  private refreshSubscription?: Subscription;
  
  showViewer = false;
  documentViewerUrl: SafeResourceUrl | undefined;
  isSendingRequest = false;
  selectedFile: File | null = null;

  newRequest: RequestCreationDTO = {
    requestTypeId: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    details: ''
  };

  private requestTypeService = inject(RequestTypeService);

  requestTypes: RequestTypeDTO[] = [];

  get requiresSignature(): boolean {
    const selectedType = this.requestTypes.find(t => t.id === this.newRequest.requestTypeId);
    return selectedType ? selectedType.requiresSignature : false;
  }

  get requiresAttachment(): boolean {
    const selectedType = this.requestTypes.find(t => t.id === this.newRequest.requestTypeId);
    return selectedType ? selectedType.requiresAttachment : false;
  }

  ngOnInit(): void {
    this.loadRequestTypes();
    this.loadRequestsHistory();
    this.loadManagers();
    
    this.refreshSubscription = interval(15000).subscribe(() => {
        this.loadRequestsHistory(true);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
    }
  }

  loadRequestTypes(): void {
    this.requestTypeService.getAll().subscribe({
      next: (data) => {
        this.requestTypes = data;
        const currentTypeExists = data.some(type => type.id === this.newRequest.requestTypeId);
        if (data.length > 0 && !currentTypeExists) {
          this.newRequest.requestTypeId = data[0].id!;
        } else if (data.length === 0) {
          this.newRequest.requestTypeId = 0;
        }
      },
      error: (err) => console.error('Error cargando tipos de solicitud:', err)
    });
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

  loadRequestsHistory(silent: boolean = false): void {
    if (!silent) this.isLoadingHistory = true;
    
    // GET /api/requests/me (Endpoint para el empleado logueado)
    this.http.get<RequestResponseDTO[]>(`${this.apiUrl}/me`).subscribe({
      next: (data) => {
        this.requests = data;
        if (!silent) this.isLoadingHistory = false;
      },
      error: (err) => {
        console.error('Error cargando historial de solicitudes:', err);
        if (!silent) this.isLoadingHistory = false;
      }
    });
  }

  // -----------------------------------------------------------
  // LÓGICA DE ENVÍO DE SOLICITUD
  // -----------------------------------------------------------

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  submitRequest(): void {
    this.isSendingRequest = true;

    const selectedType = this.requestTypes.find(type => type.id === this.newRequest.requestTypeId);
    if (!selectedType) {
        this.messageService.add({severity:'warn', summary:'Validación', detail:'Debe seleccionar un tipo de solicitud válido.'});
        this.isSendingRequest = false;
        return;
    }

    if (!this.newRequest.details) {
        this.messageService.add({severity:'warn', summary:'Validación', detail:'Debe completar la justificación.'});
        this.isSendingRequest = false;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (this.newRequest.startDate < todayStr) {
        this.messageService.add({severity:'warn', summary:'Validación', detail:'La fecha de inicio no puede ser una fecha pasada.'});
        this.isSendingRequest = false;
        return;
    }

    if (this.requiresAttachment && !this.selectedFile) {
        this.messageService.add({severity:'warn', summary:'Validación', detail:'Este tipo de solicitud requiere obligatoriamente un archivo adjunto (ej. Certificado Médico).'});
        this.isSendingRequest = false;
        return;
    }

    if (this.selectedFile) {
        const formData = new FormData();
        const employeeId = this.authService.getEmployeeId();
        
        if (!employeeId) {
            this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo obtener el ID del empleado.'});
            this.isSendingRequest = false;
            return;
        }

        const metadata = {
            employeeId: employeeId,
            documentType: 'CERTIFICADO_MEDICO'
        };
        
        formData.append('metadata', JSON.stringify(metadata));
        formData.append('file', this.selectedFile);

        this.http.post<any>(`${environment.apiUrl}/api/documents/upload`, formData).subscribe({
            next: (docResponse) => {
                this.newRequest.documentId = docResponse.id;
                this.sendRequestData();
            },
            error: (err) => {
                console.error('Error al subir el documento:', err);
                this.messageService.add({severity:'error', summary:'Error', detail:'Hubo un error al subir el archivo adjunto.'});
                this.isSendingRequest = false;
            }
        });
    } else {
        this.sendRequestData();
    }
  }

  private sendRequestData(): void {
    this.http.post<RequestResponseDTO>(this.apiUrl, this.newRequest).subscribe({
      next: (createdRequest) => {
        this.messageService.add({severity:'success', summary:'Éxito', detail:'Solicitud enviada con éxito.'});
        this.requests.unshift(createdRequest); // Añade al principio de la lista
        this.resetForm();
        this.isSendingRequest = false;
      },
      error: (err) => {
        console.error('Error al enviar solicitud:', err);
        this.isSendingRequest = false;
        this.messageService.add({severity:'error', summary:'Error', detail:'Error al enviar la solicitud. Inténtelo de nuevo.'});
      }
    });
  }

  resetForm(): void {
    this.newRequest = {
      requestTypeId: this.requestTypes.length > 0 ? this.requestTypes[0].id! : 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      details: ''
    };
    this.selectedFile = null;
    // Resetea el input de archivo si es posible a través del DOM o binding
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  viewDocument(docPath: string): void {
    const url = docPath.startsWith('http') ? docPath : `${environment.apiUrl}${docPath}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.showViewer = true;
      },
      error: (err) => {
        console.error('Error al visualizar el documento', err);
        this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo visualizar el documento.'});
      }
    });
  }

  downloadDocument(docPath: string, reqId: number): void {
    const url = docPath.startsWith('http') ? docPath : `${environment.apiUrl}${docPath}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `Documento_Solicitud_${reqId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(objectUrl);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error al descargar el documento', err);
        this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo descargar el documento.'});
      }
    });
  }
}
