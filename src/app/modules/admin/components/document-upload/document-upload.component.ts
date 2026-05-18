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

  @ViewChild('fileUpload') fileUpload!: FileUpload;

  employees: EmployeeListDTO[] = [];

  selectedEmployeeId: number | null = null;
  documentType: string = '';
  selectedFile: File | null = null;

  isLoading = false;
  submitted = false;

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.http.get<EmployeeListDTO[]>(this.employeesUrl).subscribe({
      next: (data) => this.employees = data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error cargando empleados.' })
    });
  }

  onFileSelect(event: { files: File[] | null }): void {
    if (event.files && event.files.length > 0) {
      this.selectedFile = event.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  /**
   * Se dispara cuando se envía el formulario: valida y envía manualmente vía HttpClient.
   */
  submitUpload(): void {
    this.submitted = true;

    if (!this.selectedEmployeeId || !this.documentType || !this.selectedFile) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos requeridos.' });
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('metadata', JSON.stringify({
      employeeId: this.selectedEmployeeId,
      documentType: this.documentType
    }));

    this.http.post<any>(this.apiUrl, formData).subscribe({
      next: (response) => {
        this.onUploadSuccess();
      },
      error: (err) => {
        this.onUploadError(err);
      }
    });
  }

  onUploadSuccess(): void {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento subido y asociado con éxito.' });
    this.resetForm();
  }

  onUploadError(err: any): void {
    this.isLoading = false;
    const errorMsg = err.error?.message || 'Error al procesar la subida del documento.';
    this.messageService.add({ severity: 'error', summary: 'Fallo', detail: errorMsg });
  }

  resetForm(): void {
    this.selectedEmployeeId = null;
    this.documentType = '';
    this.selectedFile = null;
    this.isLoading = false;
    this.submitted = false;
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }
}
