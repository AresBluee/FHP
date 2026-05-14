import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../core/services/document.service';
import { DocumentDTO } from '../../../../core/models/document.model';
import { AuthService } from '../../../../core/services/auth.service';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';

export interface PayslipDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  periodStartDate: string;
  periodEndDate: string;
  netSalary: number;
  generationDate: string;
}

@Component({
  selector: 'app-my-payslips',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './my-payslips.component.html',
  styleUrls: ['./my-payslips.component.scss']
})
export class MyPayslipsComponent implements OnInit {
  payslips: PayslipDTO[] = [];
  loading = true;
  error: string | null = null;
  private payslipsApiUrl = environment.apiUrl + '/api/payslips';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPayslips();
  }

  loadPayslips(): void {
    this.loading = true;
    this.http.get<PayslipDTO[]>(`${this.payslipsApiUrl}/me`).subscribe({
      next: (data) => {
        this.payslips = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las boletas de pago.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  downloadPayslip(payslipId: number): void {
    // Para descargar usamos la URL del documento
    const downloadUrl = `${environment.apiUrl}/api/documents/${payslipId}/download`;
    this.http.get(downloadUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Boleta_de_Pago_${payslipId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Error al descargar la boleta', err);
      }
    });
  }
}
