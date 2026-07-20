// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../Environment/environment'; 
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authService = inject(AuthService);
  const token = authService.getToken();
  const apiUrl = environment.apiUrl;

  // El token no debe imprimirse en consola por seguridad.

  if (token && req.url.startsWith(apiUrl)) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
