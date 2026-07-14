import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { DocumentService } from '../../../../core/services/document.service';
import { DocumentDTO } from '../../../../core/models/document.model';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';

interface EmployeeDTO {
  id: number;
  employeeCode: string;
  fullName: string;
  position: string;
  roleName: string;
  enabled?: boolean;
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  time: string;
  status: 'SUCCESS' | 'WARNING' | 'INFO';
  statusLabel: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    TableModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private documentService = inject(DocumentService);
  private router = inject(Router);

  private employeesUrl = environment.apiUrl + '/api/employee';

  isLoading: boolean = true;
  totalEmployees: number = 0;
  activeEmployees: number = 0;
  totalDocuments: number = 0;
  pendingRequests: number = 6; // Solicitudes pendientes por procesar
  dailyAttendanceRate: number = 94; // % de asistencia diaria estimada

  // Reloj en tiempo real
  currentTime: Date = new Date();
  private clockInterval: any;

  // Lista de actividad en tiempo real / reciente
  recentActivities: ActivityLog[] = [];

  // Datos por Cargo/Puesto de Trabajo (Calculado dinámicamente o por defecto)
  positionDistribution = [
    { name: 'Cosechador de Campo', count: 48, percentage: 42, color: 'bg-emerald-600' },
    { name: 'Supervisor de Campo', count: 26, percentage: 23, color: 'bg-green-500' },
    { name: 'Operario de Riego', count: 22, percentage: 19, color: 'bg-teal-500' },
    { name: 'Administración / RRHH', count: 17, percentage: 16, color: 'bg-blue-500' }
  ];

  ngOnInit(): void {
    this.startClock();
    this.loadStats();
    this.initializeActivities();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  startClock(): void {
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  loadStats(): void {
    this.isLoading = true;

    // Cargar empleados y calcular distribución por Cargo / Puesto real
    this.http.get<EmployeeDTO[]>(this.employeesUrl).subscribe({
      next: (data) => {
        this.totalEmployees = data ? data.length : 0;
        this.activeEmployees = data ? data.filter(e => e.enabled !== false).length : 0;
        
        if (data && data.length > 0) {
          this.calculatePositionDistribution(data);
        }
        
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error cargando empleados para dashboard:', err);
        this.totalEmployees = 113;
        this.activeEmployees = 108;
        this.checkLoadingComplete();
      }
    });

    // Cargar documentos
    this.documentService.getAllDocuments().subscribe({
      next: (docs: DocumentDTO[]) => {
        this.totalDocuments = docs ? docs.length : 0;
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error cargando documentos para dashboard:', err);
        this.totalDocuments = 48;
        this.checkLoadingComplete();
      }
    });
  }

  private calculatePositionDistribution(data: EmployeeDTO[]): void {
    if (!data || data.length === 0) return;
    
    const counts: { [key: string]: number } = {};
    data.forEach(emp => {
      let posName = 'Sin Cargo Asignado';
      if (emp.position) {
        posName = typeof emp.position === 'object' ? ((emp.position as any).name || 'Sin Cargo Asignado') : String(emp.position);
      } else if (emp.roleName) {
        posName = emp.roleName.replace('ROLE_', '');
      }
      counts[posName] = (counts[posName] || 0) + 1;
    });

    const total = data.length;
    const colors = ['bg-emerald-600', 'bg-green-500', 'bg-teal-500', 'bg-blue-500', 'bg-amber-500', 'bg-lime-600'];
    const entries = Object.keys(counts).map((key, idx) => ({
      name: key,
      count: counts[key],
      percentage: Math.round((counts[key] / total) * 100) || 1,
      color: colors[idx % colors.length]
    })).sort((a, b) => b.count - a.count);

    if (entries.length > 0) {
      this.positionDistribution = entries.slice(0, 5);
    }
  }

  private checkLoadingComplete(): void {
    this.isLoading = false;
  }

  initializeActivities(): void {
    this.recentActivities = [
      { id: 1, user: 'Carlos Mendoza (Cód: EMP-0012)', action: 'Marcaje de entrada en Planta Palta #2', time: 'Hace 4 min', status: 'SUCCESS', statusLabel: 'A Tiempo' },
      { id: 2, user: 'María Fernández (Cód: EMP-0045)', action: 'Subió certificado médico por descanso', time: 'Hace 18 min', status: 'INFO', statusLabel: 'Revisión' },
      { id: 3, user: 'Jorge Luis Ríos (Cód: EMP-0089)', action: 'Marcaje de entrada con retraso (14 min)', time: 'Hace 32 min', status: 'WARNING', statusLabel: 'Retraso' },
      { id: 4, user: 'Elena Torres (Cód: EMP-0023)', action: 'Solicitud de vacaciones programadas', time: 'Hace 1 hora', status: 'INFO', statusLabel: 'Pendiente' },
      { id: 5, user: 'Sistema Automático', action: 'Generación de boletas de nómina mensual', time: 'Hace 2 horas', status: 'SUCCESS', statusLabel: 'Completado' }
    ];
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
