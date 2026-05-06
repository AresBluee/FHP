import { Component, OnInit, inject } from '@angular/core';
import { environment } from '../../../../Environment/environment';
import { DocumentDTO } from '../../../../core/models/document.model';
import { DocumentService } from '../../../../core/services/document.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';

// Módulos de PrimeNG
import { TableModule } from "primeng/table";
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from "primeng/dialog";
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DocumentUploadComponent } from '../../components/document-upload/document-upload.component';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DatePipe, TableModule, ButtonModule, TagModule, InputTextModule, DialogModule, ToastModule, TooltipModule, IconFieldModule, InputIconModule, DocumentUploadComponent, FloatLabelModule
  ],
  providers: [MessageService],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {

  private documentService = inject(DocumentService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);
  private apiUrl = environment.apiUrl + '/api/documents';

  documents: DocumentDTO[] = [];
  isLoading = false;

  showViewer = false;
  documentViewerUrl: SafeResourceUrl | undefined;

  showUploadModal = false;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (data) => {
        this.documents = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los documentos.' });
        console.error('Error al cargar documentos:', err);
      }
    });
  }

  viewDocument(documentId: number): void {
    this.documentService.getDocumentBlob(documentId).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.showViewer = true;
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el documento para visualización.' });
        console.error('Error al visualizar el documento:', err);
      }
    });
  }

  downloadDocument(doc: DocumentDTO): void {
    this.documentService.getDocumentBlob(doc.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento.' });
        console.error('Error al descargar el documento:', err);
      }
    });
  }

  onUploadSuccess(): void {
    this.showUploadModal = false;
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento subido correctamente.' });
    this.loadDocuments(); // Recargar la lista de documentos
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
