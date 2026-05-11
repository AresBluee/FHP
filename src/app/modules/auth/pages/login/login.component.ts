import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


// Módulos de PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FloatLabelModule,
    PasswordModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  // Inyección de servicios (moderna)
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService: MessageService = inject(MessageService);
  isLoading: boolean = false;

  loginForm!: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;
  private authSubscription!: Subscription;

  ngOnInit(): void {
    this.initForm();
    if (this.authService.isLoggedIn()) {
      this.redirectToPanel();
    }
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos Incompletos',
        detail: 'Por favor, ingrese un usuario y una contraseña '
      });
      return;
    }

    this.loading = true;
    this.errorMessage = null;


    const credentials = this.loginForm.value as { username: string; password: string; };

    this.authSubscription = this.authService.login(credentials).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Acceso Exitoso',
          detail: 'Redirigiendo al panel de control.'
        });
        this.redirectToPanel();
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Credenciales inválidas.';
          this.messageService.add({
            severity: 'error',
            summary: 'Fallo de Autenticación',
            detail: 'Usuario o contraseña no coinciden.'
          });
        } if (err.status === 400) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de Conexión',
            detail: 'El usuario no existe.'
          });
        }
        else {
          this.errorMessage = 'Fallo la conexión con el servidor.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error de Conexión',
            detail: 'Fallo la conexión con el servidor.'
          });
        }

        console.error('Error de Login:', err);
      }
    });
  }


  contrasena(): void {
    this.router.navigate(['/forgot-password']);
  }


  redirectToPanel(): void {
    const role = this.authService.getUserRole();

    // Redirección basada en roles
    if (role === 'ADMIN' || role === 'RRHH') {
      this.router.navigate(['/admin']);
    } else if (role === 'EMPLOYEE') {
      this.router.navigate(['/employee']);
    } else if (role === 'USER') {
      this.router.navigate(['/employee']);
    } else {
      this.router.navigate(['/login']);
    }
    this.loading = false;
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
