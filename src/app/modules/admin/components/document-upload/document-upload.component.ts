// Archivo: src/app/modules/admin/components/document-upload/document-upload.component.ts

import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';


// PrimeNG Imports
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { FileSizePipe } from '../../../../shared/pipes/file-size.pipe';

interface EmployeeListDTO { id: number; fullName: string; employeeCode: string; }

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, FileUploadModule, ButtonModule, CardModule, ToastModule, FileSizePipe],
  templateUrl: './document-upload.component.html',
  styleUrl: './document-upload.component.scss',
  providers: [MessageService]
})
export class DocumentUploadComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  private apiUrl = environment.apiUrl + '/api/documents/upload';
  private employeesUrl = environment.apiUrl + '/api/employee';

  @ViewChild('fileUpload') fileUpload: any; // Referencia para limpiar el componente de archivo

  employees: EmployeeListDTO[] = [];

  // Modelos de formulario
  selectedEmployeeId: number | null = null;
  documentType: string = '';
  selectedFile: File | null = null; // 🚨 Cambiamos uploadedFiles a single File
  uploadedFiles: any[] = []; // Array temporal para mostrar el nombre del archivo

  isLoading = false;
  submitted = false; // Nueva variable para controlar el envío del formulario

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.http.get<EmployeeListDTO[]>(this.employeesUrl).subscribe({
      next: (data) => this.employees = data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error cargando empleados.' })
    });
  }

  // -------------------------------------------------------------
  // 💡 LÓGICA CLAVE: Capturar el archivo cuando se selecciona
  // -------------------------------------------------------------
  onFileSelect(event: any): void {
    // Al usar multiple=false, solo tomamos el primer archivo
    if (event.files && event.files.length > 0) {
      this.selectedFile = event.files[0];
      this.uploadedFiles = event.files; // Solo para mostrar en el template
      console.log('Archivo Seleccionado:', this.selectedFile);
    } else {
      this.selectedFile = null;
      this.uploadedFiles = [];
    }
  }

  // -------------------------------------------------------------
  // FUNCIÓN CRÍTICA: Subir el Archivo al hacer click en el botón Submit
  // -------------------------------------------------------------
  uploadDocument(): void {
    this.submitted = true; // Marcar el formulario como enviado

    if (!this.selectedEmployeeId || !this.documentType || !this.selectedFile) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos requeridos.' });
      return;
    }

    this.isLoading = true;

    // 1. Crear el objeto FormData
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('employeeId', this.selectedEmployeeId.toString());
    formData.append('documentType', this.documentType);

    // 2. Llamar al endpoint POST /api/documents/upload
    this.http.post(this.apiUrl, formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento subido y asociado con éxito.' });
        this.resetForm();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Fallo', detail: `Error: ${err.error?.message || 'Error desconocido.'}` });
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.selectedEmployeeId = null;
    this.documentType = '';
    this.selectedFile = null;
    this.uploadedFiles = [];
    this.isLoading = false;
    this.submitted = false; // Resetear el estado de envío del formulario

    // Limpiar el componente p-fileupload usando su referencia
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }
}
