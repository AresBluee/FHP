import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../Environment/environment';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = environment.apiUrl + '/api/auth/forgot-password';

  forgotPasswordForm: FormGroup;
  message: { type: 'success' | 'error', text: string } | null = null;
  isLoading = false;

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {

      const email = this.forgotPasswordForm.get('email')?.value;

      this.forgotPasswordForm.markAllAsTouched();
      this.message = { type: 'error', text: 'Ingrese un correo electrónico válido.' };
      return;
    }

    this.isLoading = true;
    this.message = null;

    const email = this.forgotPasswordForm.get('email')?.value;
    const payload = {
      email: email
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = {
          type: 'success',
          text: 'Instrucciones y código de reseteo enviados a tu correo. ¡Revísalo!'
        };
      },
      error: (err) => {
        this.isLoading = false;
        this.message = {
          type: 'error',
          text: 'Error al enviar correo. Verifique su dirección.'
        };
        console.error('Error al solicitar reseteo:', err);
      }
    });
  }
}
