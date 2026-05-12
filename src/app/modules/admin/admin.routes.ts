import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { MenuAdminComponent } from './pages/menu-admin/menu-admin.component';
import { ProfileComponent } from '../info/pages/profile/profile.component';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/employee-form/employee-form.component';
import { ScheduleManagementComponent } from './pages/schedule-management/schedule-management.component';
import { AttendanceControlComponent } from './pages/attendance-control/attendance-control.component';
import { RequestManagementComponent } from './pages/request-management/request-management.component';
import { DocumentListComponent } from './pages/document-list/document-list.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { DocumentDownloaderComponent } from './components/document-downloader/document-downloader.component';
import { PayslipManagementComponent } from './pages/payslip-management/payslip-management.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',       
        canActivate: [authGuard], 
        component: MenuAdminComponent, 
        data: { roles: ['ADMIN', 'RRHH', 'SUPERVISOR'] },
        children: [
            { path: 'profile', component: ProfileComponent },
            { path: '', redirectTo: 'lista-empleados', pathMatch: 'full' },
            { path: 'documentUp', component: DocumentUploadComponent },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'lista-empleados', component: EmployeeListComponent },
            { path: 'registrar-nuevo', component: EmployeeFormComponent },
            { path: 'employee/edit/:id', component: EmployeeFormComponent },
            { path: 'asignar-horarios', component: ScheduleManagementComponent },
            { path: 'control-diario', component: AttendanceControlComponent },
            { path: 'Generar-Boletas/Documentos', component: PayslipManagementComponent },
            /* { path: 'historial-documentos', component: DocumentDownloaderComponent }, */
            { path: 'mis-solicitudes', loadComponent: () => import('../employee/pages/my-requests/my-requests.component').then(m => m.MyRequestsComponent) },
            { path: 'configuracion-solicitudes', loadComponent: () => import('./pages/request-type-management/request-type-management.component').then(m => m.RequestTypeManagementComponent) },
            { path: 'solicitudes-pendientes', component: RequestManagementComponent },
            { path: 'archivos-documentos', component: DocumentListComponent },
        ]
    }
];
