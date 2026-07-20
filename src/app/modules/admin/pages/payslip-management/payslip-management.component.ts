import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../Environment/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, Subscription, interval, firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Módulos de PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';

import { PdfGeneratorService, PayslipData } from '../../../../core/services/pdf-generator.service';

interface EmployeeListDTO { 
    id: number; fullName: string; employeeCode: string; }

export interface PayslipDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  netSalary: number;
}

export interface PayslipGenerationDTO {
    employeeId: number | null;
    startDate: string | null;
    endDate: string | null;
}

@Component({
  selector: 'app-payslip-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DropdownModule, ButtonModule, TableModule, CardModule, DatePipe, CurrencyPipe, ToastModule, CalendarModule, FloatLabelModule, PanelModule, TooltipModule, IconFieldModule, InputIconModule, DialogModule, ProgressBarModule, RadioButtonModule
  ],
  providers: [MessageService],
  templateUrl: './payslip-management.component.html',
  styleUrls: ['./payslip-management.component.scss']
})
export class PayslipManagementComponent implements OnInit, OnDestroy {
    
    private http = inject(HttpClient);
    private messageService = inject(MessageService);
    private sanitizer = inject(DomSanitizer);
    private pdfGenerator = inject(PdfGeneratorService);

    // URLs de la API
    private payslipsApiUrl = `${environment.apiUrl}/api/payslips`;
    private employeesApiUrl = `${environment.apiUrl}/api/employee`;

    // Observables y estado del componente
    employees: EmployeeListDTO[] = [];
    generationForm: PayslipGenerationDTO = { employeeId: null, startDate: null, endDate: null };
    generatedPayslips: PayslipDTO[] = [];
    
    isLoading = false;
    isLoadingList = false;
    private refreshSubscription?: Subscription;
    
    showViewer = false;
    documentViewerUrl: SafeResourceUrl | undefined;

    // Batch Generation Mode
    generationMode: 'batch' | 'individual' = 'batch';
    isGeneratingBatch = false;
    batchProgress = 0;

    ngOnInit(): void {
        this.loadEmployees();
        this.loadGeneratedPayslips();
        
        // Auto-refresh every 15 seconds
        this.refreshSubscription = interval(15000).subscribe(() => {
            this.loadGeneratedPayslips(true);
        });
    }

    ngOnDestroy(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    loadEmployees(): void {
        this.http.get<EmployeeListDTO[]>(this.employeesApiUrl).subscribe(data => {
            this.employees = data;
        });
    }

    loadGeneratedPayslips(silent: boolean = false): void {
        if (!silent) this.isLoadingList = true;
        this.http.get<PayslipDTO[]>(`${this.payslipsApiUrl}/all`).subscribe({
            next: (data) => {
                this.generatedPayslips = data;
                if (!silent) this.isLoadingList = false;
            },
            error: (err) => {
                if (!silent) {
                    this.isLoadingList = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial de boletas.' });
                }
            }
        });
    }

    async generatePayslips(): Promise<void> {
        if (!this.generationForm.startDate || !this.generationForm.endDate) {
            this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar las fechas de inicio y fin del período.' });
            return;
        }

        if (this.generationMode === 'individual') {
            if (!this.generationForm.employeeId) {
                this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar un trabajador.' });
                return;
            }
            this.generateIndividual();
        } else {
            await this.generateBatch();
        }
    }

    generateIndividual(): void {
        this.isLoading = true;
        this.http.post<PayslipDTO>(`${this.payslipsApiUrl}/generate`, this.generationForm).subscribe({
            next: (newPayslip) => {
                this.isLoading = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Boleta para ${newPayslip.employeeName} generada correctamente.` });
                this.loadGeneratedPayslips();
            },
            error: (err) => {
                this.isLoading = false;
                this.messageService.add({ severity: 'error', summary: 'Error de Generación', detail: err.error?.message || 'Ocurrió un error en el servidor.' });
            }
        });
    }

    async generateBatch(): Promise<void> {
        if (this.employees.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No hay empleados activos para procesar.' });
            return;
        }

        this.isGeneratingBatch = true;
        this.batchProgress = 0;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < this.employees.length; i++) {
            const emp = this.employees[i];
            const form = {
                employeeId: emp.id,
                startDate: this.generationForm.startDate,
                endDate: this.generationForm.endDate
            };

            try {
                await firstValueFrom(this.http.post(`${this.payslipsApiUrl}/generate`, form));
                successCount++;
            } catch (error) {
                console.error(`Error generando boleta para ${emp.fullName}`, error);
                errorCount++;
            }

            this.batchProgress = Math.round(((i + 1) / this.employees.length) * 100);
        }

        this.isGeneratingBatch = false;
        this.batchProgress = 100;
        
        if (errorCount === 0) {
            this.messageService.add({ severity: 'success', summary: 'Generación Masiva Completa', detail: `Se generaron exitosamente las boletas de ${successCount} empleados.` });
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Generación Incompleta', detail: `Se generaron ${successCount} boletas, pero fallaron ${errorCount}. Revise los datos.` });
        }

        setTimeout(() => {
            this.batchProgress = 0;
            this.loadGeneratedPayslips();
        }, 1500);
    }

    downloadPayslip(payslipId: number, payslipInfo: PayslipDTO, fileName: string): void {
        const payslipData: PayslipData = {
            id: payslipInfo.id,
            employeeName: payslipInfo.employeeName,
            employeeCode: payslipInfo.employeeCode,
            payPeriodStart: payslipInfo.payPeriodStart,
            payPeriodEnd: payslipInfo.payPeriodEnd,
            netSalary: payslipInfo.netSalary
        };
        this.pdfGenerator.downloadPayslip(payslipData, fileName);
    }
    
    viewPayslip(payslipId: number, payslipInfo: PayslipDTO): void {
        const payslipData: PayslipData = {
            id: payslipInfo.id,
            employeeName: payslipInfo.employeeName,
            employeeCode: payslipInfo.employeeCode,
            payPeriodStart: payslipInfo.payPeriodStart,
            payPeriodEnd: payslipInfo.payPeriodEnd,
            netSalary: payslipInfo.netSalary
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

    getFileNameForPayslip(payslip: PayslipDTO): string {
        const code = payslip.employeeCode || `Emp_${payslip.employeeId}`;
        const start = payslip.payPeriodStart ? payslip.payPeriodStart.substring(0,10) : '';
        return `Boleta_${code}_${start}.pdf`;
    }

    onGlobalFilter(table: any, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
