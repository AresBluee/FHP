import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../Environment/environment';
import { ButtonModule } from 'primeng/button';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { EmployeeRequestDTO, EmployeeResponseDTO, WorkPosition } from '../../../../core/models/employee.model';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DividerModule } from 'primeng/divider';



@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, FormsModule, DialogModule, DropdownModule, InputTextModule, InputMaskModule, PasswordModule, InputGroupModule, ToastModule, PanelModule, FloatLabelModule, DividerModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  providers: [MessageService]
})
export class EmployeeFormComponent implements OnInit {

  // Inyecciones
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiUrl = environment.apiUrl + '/api/employee';
  private positionsApiUrl = environment.apiUrl + '/api/employee/positions'; // Nuevo endpoint para CRUD de Cargos

  // Output para notificar al componente padre
  @Output() employeeRegistered = new EventEmitter<void>();
  @Output() employeeUpdated = new EventEmitter<void>();

  // Propiedades de la Clase
  employeeForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  employeeId: number | null = null;
  headerTitle = 'Registrar Nuevo Empleado';

  // Variables para la creación de cargos
  newPositionName: string = '';
  isCreatingPosition = false;
  showNewPositionDialog = false;

  // Catálogo de Roles y Posiciones (Data para Dropdowns)
  availableRoles = [
    { label: 'Administrador', value: 'ROLE_ADMIN' },
    { label: 'Recursos Humanos', value: 'ROLE_RRHH' },
    { label: 'Empleado', value: 'ROLE_USER' }
  ];
  workPositions$!: Observable<WorkPosition[]>; // <-- Observable para el dropdown de cargos

  // ---------------------------------------------------------------------

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadWorkPositions();
    this.checkEditMode();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      // 💡 CAMPOS DE IDENTIFICACIÓN Y CONTACTO
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      
      // CRÍTICO: Position ahora es positionId (el ID del cargo)
      positionId: [null, Validators.required], 
      
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.maxLength(15)]], 
      
      // CAMPOS DE USUARIO
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleName: ['ROLE_USER', Validators.required]
    });
  }

  checkEditMode(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.employeeId = +id;
          this.headerTitle = 'Editar Empleado';
          this.employeeForm.get('password')?.clearValidators();
          this.employeeForm.get('password')?.updateValueAndValidity();
          return this.http.get<EmployeeResponseDTO>(`${this.apiUrl}/${this.employeeId}`);
        }
        return of(null);
      })
    ).subscribe(employee => {
      if (employee) {
        // Manejar el caso donde position viene como objeto o como string
        let posId = null;
        if (employee.position && typeof employee.position === 'object') {
          posId = (employee.position as any).id;
        }
        
        this.employeeForm.patchValue({
          ...employee,
          positionId: posId 
        });
      }
    });
  }
  
  // ---------------------------------------------------------------------
  // LÓGICA DE CARGA DE DATOS PARA DROPDOWN (al inicio)
  // ---------------------------------------------------------------------
  loadWorkPositions(): void {
    this.workPositions$ = this.http.get<WorkPosition[]>(this.positionsApiUrl).pipe(
      catchError(err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Carga',
          detail: 'No se pudieron cargar los cargos. Por favor, intente recargar la página.'
        });
        console.error('Error cargando cargos:', err);
        return of([]);
      })
    );
  }

  // ---------------------------------------------------------------------
  // FUNCIÓN 1: CREAR CARGO (Llamada desde el Modal)
  // ---------------------------------------------------------------------
  createWorkPosition(): void {
    if (!this.newPositionName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campo Requerido', detail: 'Debe ingresar un nombre para el cargo.' });
      return;
    }

    this.isCreatingPosition = true;
    const positionDTO: Omit<WorkPosition, 'id'> = { name: this.newPositionName };

    this.http.post<WorkPosition>(this.positionsApiUrl, positionDTO).subscribe({
      next: (newPosition) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Cargo '${newPosition.name}' creado.` });
        this.newPositionName = '';
        this.isCreatingPosition = false;
        this.showNewPositionDialog = false;
        this.loadWorkPositions();
      },
      error: (err) => {
        this.isCreatingPosition = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Fallo al crear el cargo: ${err.error?.message || 'Ya existe.'}` });
      }
    });
  }

  // ---------------------------------------------------------------------
  // FUNCIÓN 2: ENVÍO DEL FORMULARIO PRINCIPAL
  // ---------------------------------------------------------------------
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Error de Validación', detail: 'Por favor, complete todos los campos obligatorios.' });
      return;
    }

    this.isLoading = true;
    const employeeData = this.employeeForm.value as EmployeeRequestDTO;

    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${this.employeeId}`, employeeData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Empleado actualizado correctamente.' });
          this.isLoading = false;
          this.employeeUpdated.emit();
          this.router.navigate(['/admin/lista-empleados']);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Error desconocido al actualizar empleado.';
          this.messageService.add({ severity: 'error', summary: 'Error de Actualización', detail: msg });
        }
      });
    } else {
      this.http.post(this.apiUrl, employeeData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: '¡Empleado y cuenta creados con éxito!' });
          this.employeeForm.reset({ roleName: 'ROLE_USER', positionId: null });
          this.isLoading = false;
          this.employeeRegistered.emit();
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Error desconocido al crear empleado.';
          this.messageService.add({ severity: 'error', summary: 'Error de Registro', detail: msg });
        }
      });
    }
  }
}
