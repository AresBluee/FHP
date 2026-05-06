import { Component } from '@angular/core';
import { environment } from '../../../../Environment/environment';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';



@Component({
  selector: 'app-document-downloader',
  imports: [
    CardModule, 
    ButtonModule,
    FormsModule,
    CommonModule,
    InputTextModule,
  ],
  templateUrl: './document-downloader.component.html',
  styleUrl: './document-downloader.component.scss'
})
export class DocumentDownloaderComponent {

  private apiUrl = environment.apiUrl + '/api/documents';
  
  // Variable para el ID del documento a descargar (se inicializa con 1 para la prueba)
  documentId: number = 1; 

  // Método que se llama al hacer clic en el botón
  downloadDocument(): void {
    if (!this.documentId || this.documentId <= 0) {
      alert("Por favor, ingrese un ID de documento válido.");
      return;
    }

    // 💡 URL CRÍTICA: Construcción del endpoint de descarga segura
    const downloadUrl = `${this.apiUrl}/${this.documentId}/download`;
    
    // Usamos window.open. El Auth Interceptor adjuntará el Token.
    console.log(`Disparando descarga para URL: ${downloadUrl}`);
    window.open(downloadUrl, '_blank'); 
  }
}
