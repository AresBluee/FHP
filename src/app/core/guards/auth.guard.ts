// src/app/core/guards/auth.guard.ts

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    const requiredRoles = route.data['roles'] as Array<string>;
    const userRole = authService.getUserRole();
    
    // Verifica si el rol del usuario logueado está entre los permitidos
    if (requiredRoles && userRole && requiredRoles.includes(userRole)) {
        return true; 
    } 
    
    // Si no tiene el rol, redirigir al panel correspondiente según su rol real
    if (userRole === 'ADMIN' || userRole === 'RRHH' || userRole === 'SUPERVISOR') {
        router.navigate(['/admin']);
    } else {
        router.navigate(['/employee']);
    }
    return false;
  }
  
  // Si no está logueado, redirigir al login
  router.navigate(['/login']);
  return false;
};