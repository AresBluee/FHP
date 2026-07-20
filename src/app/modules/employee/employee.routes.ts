import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { EmployeeDashboardComponent } from './pages/employee-dashboard/employee-dashboard.component'; 
import { ProfileComponent } from '../info/pages/profile/profile.component';  
import { MyScheduleComponent } from './components/my-schedule/my-schedule.component'; 
import { MyAttendanceHistoryComponent } from './components/my-attendance-history/my-attendance-history.component'; 
import { MyRequestsComponent } from './pages/my-requests/my-requests.component'; 
import { MyPayslipsComponent } from './pages/my-payslips/my-payslips.component'; 
import { MyCertificatesComponent } from './components/my-certificates/my-certificates.component'; 
import { MenuEmployeeComponent } from './pages/menu-employee/menu-employee.component';
export const EMPLOYEE_ROUTES: Routes = [
    { 
        path: '', 
        canActivate: [authGuard], 
        component: MenuEmployeeComponent, 
        data: { roles: ['EMPLOYEE', 'ADMIN', 'RRHH', 'USER'] }, 
        children: [
           
            { path: 'profile', component: ProfileComponent },
            { path: '', component: EmployeeDashboardComponent },
            { path: 'my-schedule', component: MyScheduleComponent },
            { path: 'my-attendance-history', component: MyAttendanceHistoryComponent },
            { path: 'my-requests', component: MyRequestsComponent },
            { path: 'my-payslips', component: MyPayslipsComponent },
            { path: 'my-certificates', component: MyCertificatesComponent },
            { path: 'policies', loadComponent: () => import('./pages/policies/policies.component').then(m => m.PoliciesComponent) },
        ]
    }
];
