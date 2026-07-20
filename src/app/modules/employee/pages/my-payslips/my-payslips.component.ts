import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../core/services/document.service';
import { DocumentDTO } from '../../../../core/models/document.model';
import { AuthService } from '../../../../core/services/auth.service';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription, interval } from 'rxjs';
import { environment } from '../../../../Environment/environment';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { PdfGeneratorService, PayslipData } from '../../../../core/services/pdf-generator.service';

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
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule, DialogModule, ToastModule, InputTextModule, IconFieldModule, InputIconModule],
  providers: [MessageService],
  templateUrl: './my-payslips.component.html',
  styleUrls: ['./my-payslips.component.scss']
})
export class MyPayslipsComponent implements OnInit {
  payslips: PayslipDTO[] = [];
  loading = true;
  error: string | null = null;
  private payslipsApiUrl = environment.apiUrl + '/api/payslips';
  private refreshSubscription?: Subscription;

  showViewer = false;
  documentViewerUrl: SafeResourceUrl | undefined;
  
  private sanitizer = inject(DomSanitizer);

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private messageService: MessageService,
    private pdfGenerator: PdfGeneratorService
  ) {}

  ngOnInit(): void {
    this.loadPayslips();
    
    // Auto-refresh every 15 seconds
    this.refreshSubscription = interval(15000).subscribe(() => {
        this.loadPayslips(true);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
    }
  }

  loadPayslips(silent: boolean = false): void {
    if (!silent) this.loading = true;
    this.http.get<PayslipDTO[]>(`${this.payslipsApiUrl}/me`).subscribe({
      next: (data) => {
        this.payslips = data;
        if (!silent) this.loading = false;
      },
      error: (err) => {
        if (!silent) {
            this.error = 'Error al cargar las boletas de pago.';
            this.loading = false;
        }
        console.error(err);
      },
    });
  }

  downloadPayslip(payslipId: number, payslip: PayslipDTO): void {
    const payslipData: PayslipData = {
        id: payslip.id,
        employeeName: payslip.employeeName,
        employeeCode: payslip.employeeCode,
        payPeriodStart: payslip.periodStartDate,
        payPeriodEnd: payslip.periodEndDate,
        netSalary: payslip.netSalary
    };
    const code = payslip.employeeCode || `Emp_${payslip.employeeId}`;
    const start = payslip.periodStartDate ? payslip.periodStartDate.substring(0,10) : '';
    const fileName = `Boleta_${code}_${start}.pdf`;
    this.pdfGenerator.downloadPayslip(payslipData, fileName);
  }

  viewPayslip(payslipId: number, payslip: PayslipDTO): void {
    const payslipData: PayslipData = {
        id: payslip.id,
        employeeName: payslip.employeeName,
        employeeCode: payslip.employeeCode,
        payPeriodStart: payslip.periodStartDate,
        payPeriodEnd: payslip.periodEndDate,
        netSalary: payslip.netSalary
    };
    
    this.pdfGenerator.getPayslipBlobUrl(payslipData)
        .then(url => {
            this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.showViewer = true;
        })
        .catch(err => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el documento para visualización.' });
        });
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
