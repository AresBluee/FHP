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

@Component({
  selector: 'app-my-payslips',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './my-payslips.component.html',
  styleUrls: ['./my-payslips.component.scss']
})
export class MyPayslipsComponent implements OnInit {
  payslips: DocumentDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(private documentService: DocumentService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPayslips();
  }

  loadPayslips(): void {
    this.loading = true;
    const employeeId = this.authService.getEmployeeId();
    if (employeeId) {
      this.documentService.getDocumentsByEmployeeId(employeeId).subscribe({
        next: (data) => {
          this.payslips = data.filter(doc => doc.documentType === 'PAYSLIP');
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar las boletas de pago.';
          console.error(err);
          this.loading = false;
        },
      });
    } else {
      this.error = 'No se pudo obtener el ID del empleado.';
      this.loading = false;
    }
  }

  downloadPayslip(documentId: number): void {
    // Lógica para descargar la boleta
    console.log('Descargando boleta con ID:', documentId);
  }
}
