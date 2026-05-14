
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../Environment/environment';
import { EmployeeProfileDTO, EmployeeRequestDTO } from '../../../../core/models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe, ButtonModule,
    InputTextModule, AvatarModule,
    CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private employeeService = inject(EmployeeService);
  private apiUrl = environment.apiUrl + '/api/employee/me';

  // 1. Variables de Estado
  profileForm!: FormGroup; // El formulario reactivo
  employeeData: EmployeeProfileDTO | null = null;

  isEditing = false;
  loading = true; // Controla el estado de carga

  // Variables complejas (simulación de backend)
  emailDaysLeft: number | null = null; // Simulación del contador de tiempo para cambio de email
  usernameDaysLeft: number | null = null;
  user: any = { fullName: '', username: '', provider: 'LOCAL', hasPassword: true }; // Simulación de datos de usuario

  private profileSubscription!: Subscription;

  ngOnInit(): void {
    // Inicializar un formulario vacío al principio
    this.profileForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [{ value: '', disabled: true }, Validators.required], // Usamos 'phone' para simplificar
      username: [{ value: '', disabled: true }, Validators.required],
    });
    this.loadProfile();
  }

  // --------------------------------------------------
  // 2. LÓGICA DE CARGA Y BINDING DE DATOS
  // --------------------------------------------------
  loadProfile(): void {
    this.loading = true;
    this.profileSubscription = this.employeeService.getEmployeeProfile().subscribe({
      next: (data) => {
        this.employeeData = data;

        // 💡 CRÍTICO: Establecer los valores en el formulario al cargar los datos
        this.profileForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phoneNumber,
          username: data.username,
        });
        this.user = { fullName: data.firstName + ' ' + data.lastName, username: data.username }; // Llenar datos de avatar
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error cargando perfil:', err);
      }
    });
  }
  
  // --------------------------------------------------
  // 3. CONTROL DE EDICIÓN Y BOTONES
  // --------------------------------------------------
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    
    // Habilitar/Deshabilitar los controles editables
    const editableFields = ['firstName', 'lastName', 'email', 'phone', 'username'];
    
    if (this.isEditing) {
        // Habilitar la edición de los campos editables
        editableFields.forEach(field => this.profileForm.get(field)?.enable());
    } else {
        // Deshabilitar y revertir valores si el usuario cancela
        editableFields.forEach(field => this.profileForm.get(field)?.disable());
        this.profileForm.patchValue(this.employeeData!); // Revertir a los valores originales
    }
  }

  // --------------------------------------------------
  // 4. GUARDAR CAMBIOS (onSubmit)
  // --------------------------------------------------
  saveChanges(): void {
    if (this.profileForm.invalid) {
        this.profileForm.markAllAsTouched();
        return;
    }
    
    this.loading = true;
    
    // Crear el DTO de actualización que el backend espera
    const updateDTO: EmployeeRequestDTO = {
        // Usar los valores del formulario reactivo
        firstName: this.profileForm.get('firstName')?.value,
        lastName: this.profileForm.get('lastName')?.value,
        email: this.profileForm.get('email')?.value,
        phoneNumber: this.profileForm.get('phone')?.value,
        
        // Campos de solo lectura/seguridad que Spring espera
        position: this.employeeData!.position,
        username: this.profileForm.get('username')?.value,
        password: 'NO_PASSWORD_CHANGE', // No se permite cambio de contraseña desde el perfil
        roleName: 'ROLE_EMPLOYEE'
    };

    this.http.put<EmployeeProfileDTO>(this.apiUrl, updateDTO).subscribe({
        next: (updatedData) => {
            this.employeeData = updatedData;
            this.loading = false;
            this.toggleEdit();
            this.messageService.add({severity:'success', summary:'Éxito', detail:'Perfil actualizado con éxito.'});
            this.loadProfile(); // Recargar para actualizar el estado del formulario
        },
        error: (err) => {
             this.loading = false;
             this.messageService.add({severity:'error', summary:'Error', detail:'Error al guardar cambios: ' + (err.error.message || 'Error desconocido')});
        }
    });
  }

  // Helper para el avatar
  getInitial(name: string): string {
    return name.trim().charAt(0).toUpperCase();
  }

  ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }
}
