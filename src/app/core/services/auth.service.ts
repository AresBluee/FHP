// src/app/core/services/auth.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { environment } from '../../Environment/environment';
import { Router } from '@angular/router';
import { LoginRequest, JwtResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/api/auth';

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_ID_KEY = 'userId';
  private readonly USER_ROLE_KEY = 'userRole';
  private readonly USERNAME_KEY = 'username';

  // Sujetos reactivos (Inicializados leyendo el localStorage)
  private _isLoggedIn = new BehaviorSubject<boolean>(this.checkToken());
  private _userRole = new BehaviorSubject<string | null>(this.getUserRoleFromStorage());
  private _userUsername = new BehaviorSubject<string | null>(this.getUsernameFromStorage());

  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable();
  userRole$: Observable<string | null> = this._userRole.asObservable();
  userUsername$: Observable<string | null> = this._userUsername.asObservable();

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // 1. Limpiar el rol (quitar prefijo ROLE_ si existe)
        const cleanRole = response.role.replace('ROLE_', '');

        // 2. Almacenamiento seguro
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_ROLE_KEY, cleanRole);
        localStorage.setItem(this.USER_ID_KEY, response.id.toString());
        localStorage.setItem(this.USERNAME_KEY, response.username);

        // 3. Emitir el nuevo estado
        this._isLoggedIn.next(true);
        this._userRole.next(cleanRole);
        this._userUsername.next(response.username);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap({
        next: () => this.setLoggedOutState(),
        error: () => this.setLoggedOutState()
      }),
      map(() => null)
    );
  }

  private setLoggedOutState(): void {
    // Limpieza de localStorage y emisión
    localStorage.clear();
    this._isLoggedIn.next(false);
    this._userRole.next(null);
    this._userUsername.next(null);
    this.router.navigate(['/login']);
  }

  getUsername(): string | null {
    return this._userUsername.value;
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  getUserRole(): string | null { return this._userRole.value; }
  getUserId(): number | null {
    const id = localStorage.getItem(this.USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  }

  getEmployeeId(): number | null {
    const id = localStorage.getItem(this.USER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  }
  isLoggedIn(): boolean { return this._isLoggedIn.value; }
  isManager(): boolean {
    const role = this._userRole.value;
    return role === 'ADMIN' || role === 'RRHH';
  }

  isEmployee(): boolean {
    const role = this._userRole.value;
    return role === 'EMPLOYEE' || role === 'USER';
  }
  // Métodos de inicialización
  private checkToken(): boolean { return !!this.getToken(); }
  private getUserRoleFromStorage(): string | null { return localStorage.getItem(this.USER_ROLE_KEY); }
  private getUsernameFromStorage(): string | null { return localStorage.getItem(this.USERNAME_KEY); }


}
