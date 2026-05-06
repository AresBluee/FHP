import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/pages/login/login.component';
import { HomeComponent } from './shared/components/home/home.component'; 
import { NosotrosComponent } from './modules/pages/nosotros/nosotros.component'; 
/* import { ProductosComponent } from './modules/info/pages/productos/productos.component'; */ 
import { PostularComponent } from './modules/pages/postular/postular.component'; 
import { ForgotPasswordComponent } from './modules/auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/auth/pages/reset-password/reset-password.component';



import { CultivosComponent } from './modules/pages/cultivos/cultivos.component';
export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'nosotros', component: NosotrosComponent },
   { path: 'cultivos', component: CultivosComponent }, 
  { path: 'postular', component: PostularComponent },
  { path: 'login', component: LoginComponent },
  
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'employee',
    loadChildren: () => import('./modules/employee/employee.routes').then(m => m.EMPLOYEE_ROUTES)
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
