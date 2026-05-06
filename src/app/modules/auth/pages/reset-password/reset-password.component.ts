import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../Environment/environment';
import { MessageService } from 'primeng/api'; // Para notificaciones rápidas
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password'; // Para el campo de contraseña

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, PasswordModule],  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  private apiUrl = environment.apiUrl + '/api/auth/reset-password'; 
  
  resetForm!: FormGroup;
  resetToken: string | null = null;
  message: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    // 💡 CRÍTICO: Obtener el token de la URL (query parameter)
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || null;
      if (!this.resetToken) {
        this.message = 'Error: No se encontró el token de reseteo.';
      }
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  // Custom Validator para asegurar que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.resetToken) {
      this.resetForm.markAllAsTouched();
      this.message = 'Revise las contraseñas y asegúrese de tener un token válido.';
      return;
    }

    this.isLoading = true;
    const { newPassword } = this.resetForm.value;

    const payload = {
        token: this.resetToken,
        newPassword: newPassword,
        confirmPassword: this.resetForm.get('confirmPassword')?.value // Para la validación del backend
    };
    
    // Llamada POST /api/auth/reset-password
    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Contraseña actualizada con éxito. Serás redirigido al login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.message = `Error: ${err.error?.message || 'Token inválido o expirado.'}`;
        console.error('Error al resetear contraseña:', err);
      }
    });
  }
}
