import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../Environment/environment';
import { catchError, Observable, of } from 'rxjs';
import { MessageService } from 'primeng/api';

// Módulos de PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface EmployeeListDTO { 
    id: number; fullName: string; employeeCode: string; }


export interface PayslipDTO {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  payPeriodStart: string; // Las fechas vienen como string en formato ISO
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
    CommonModule, FormsModule, DropdownModule, ButtonModule, TableModule, CardModule, DatePipe, CurrencyPipe, ToastModule, CalendarModule, FloatLabelModule, PanelModule, TooltipModule, IconFieldModule, InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './payslip-management.component.html',
  styleUrls: ['./payslip-management.component.scss']
})
    export class PayslipManagementComponent implements OnInit {
        
        private http = inject(HttpClient);
        private messageService = inject(MessageService);
    
        // URLs de la API
        private documentsApiUrl = `${environment.apiUrl}/api/documents`;
        private payslipsApiUrl = `${environment.apiUrl}/api/documents/payslips`;
        private employeesApiUrl = `${environment.apiUrl}/api/employee`;
    
        // Observables y estado del componente
        employees$!: Observable<EmployeeListDTO[]>;
        generationForm: PayslipGenerationDTO = { employeeId: null, startDate: null, endDate: null };
        generatedPayslips: PayslipDTO[] = [];
        isLoading = false;
        isLoadingList = false;
    
        ngOnInit(): void {
            this.loadEmployees();
            this.loadGeneratedPayslips();
        }
    
        loadEmployees(): void {
            this.employees$ = this.http.get<EmployeeListDTO[]>(this.employeesApiUrl);
        }
    
        loadGeneratedPayslips(): void {
            this.isLoadingList = true;
            this.http.get<PayslipDTO[]>(`${this.documentsApiUrl}/payslips/all`).subscribe({
                next: (data) => {
                    this.generatedPayslips = data;
                    this.isLoadingList = false;
                },
                error: (err) => {
                    this.isLoadingList = false;
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial de boletas.' });
                }
            });
        }
    
        generatePayslip(): void {
            if (!this.generationForm.employeeId || !this.generationForm.startDate || !this.generationForm.endDate) {
                this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Complete todos los campos del formulario.' });
                return;
            }
    
            this.isLoading = true;
            this.http.post<PayslipDTO>(`${this.documentsApiUrl}/payslips/generate`, this.generationForm).subscribe({
                next: (newPayslip) => {
                    this.isLoading = false;
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Boleta para ${newPayslip.employeeName} generada correctamente.` });
                    this.loadGeneratedPayslips(); // Recarga la lista para mostrar la nueva boleta
                },
                error: (err) => {
                    this.isLoading = false;
                    this.messageService.add({ severity: 'error', summary: 'Error de Generación', detail: err.error?.message || 'Ocurrió un error en el servidor.' });
                }
            });
        }
    
        /**
         * Inicia la descarga de un archivo PDF de forma asíncrona.
         * No abre nuevas ventanas y funciona con autenticación JWT.
         */
        downloadPayslip(payslipId: number, fileName: string): void {
            const downloadUrl = `${this.documentsApiUrl}/${payslipId}/download`;
    
            this.http.get(downloadUrl, {
                responseType: 'blob' // MUY IMPORTANTE: Le decimos a Angular que esperamos un archivo
            }).subscribe({
                next: (blob) => {
                    // Crea un objeto URL temporal para el archivo recibido
                    const url = window.URL.createObjectURL(blob);
    
                    // Crea un enlace <a> invisible
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName; // Asigna el nombre del archivo para la descarga
                    document.body.appendChild(a);
    
                    // Simula un clic en el enlace para iniciar la descarga
                    a.click();
    
                    // Limpia los recursos después de la descarga
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Error de Descarga', detail: 'No se pudo descargar el archivo. Verifique sus permisos e inténtelo de nuevo.' });
                }
            });
        }
    
        /**
         * Función de ayuda para generar un nombre de archivo descriptivo.
         * Usado por el botón de descarga en el HTML.
         */
        getFileNameForPayslip(payslip: PayslipDTO): string {
            return `Boleta_${payslip.employeeCode}_${payslip.payPeriodStart}_a_${payslip.payPeriodEnd}.pdf`;
        }
    }
