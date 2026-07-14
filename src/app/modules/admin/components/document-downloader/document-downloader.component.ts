import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DocumentService } from '../../../../core/services/document.service';

@Component({
  selector: 'app-document-downloader',
  imports: [
    CardModule, 
    ButtonModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './document-downloader.component.html',
  styleUrl: './document-downloader.component.scss'
})
export class DocumentDownloaderComponent {

  private documentService = inject(DocumentService);
  private messageService = inject(MessageService);
  
  documentId: number = 1; 
  isLoading: boolean = false;

  downloadDocument(): void {
    if (!this.documentId || this.documentId <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, ingrese un ID de documento válido.' });
      return;
    }

    this.isLoading = true;
    this.documentService.getDocumentBlob(this.documentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Documento_${this.documentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documento descargado con éxito.' });
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error al descargar documento:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento. Verifique si el ID existe o si tiene permisos.' });
      }
    });
  }
}
