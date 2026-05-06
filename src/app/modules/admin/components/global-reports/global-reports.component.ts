import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { environment } from '../../../../Environment/environment';

@Component({
  selector: 'app-global-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './global-reports.component.html',
  styleUrl: './global-reports.component.scss'
})
export class GlobalReportsComponent {


  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/reports';
  
  startDate: string = '';
  endDate: string = '';
  isLoading = false;
  message: string | null = null;

  generateGlobalReport(): void {
    if (!this.startDate || !this.endDate) {
      this.message = "Debe seleccionar las fechas de inicio y fin.";
      return;
    }
    
    this.isLoading = true;
    this.message = null;

    // URL COMPLETA DE DESCARGA: GET /api/reports/global/attendance?start=...&end=...
    const url = `${this.apiUrl}/global/attendance?start=${this.startDate}&end=${this.endDate}`;
    
    // 💡 Estrategia de Descarga: Usamos window.open. El Interceptor JWT debe estar configurado 
    // para manejar la respuesta binaria de descarga.
    
    // Abrir una nueva ventana dispara la petición GET, y el Auth Interceptor añade el token.
    window.open(url, '_blank');
    
    this.isLoading = false;
    this.message = 'La descarga comenzará pronto. Si falla, verifique las fechas.';
  }
}
