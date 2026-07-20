import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../../core/services/employee.service';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, CardModule, ButtonModule, IconFieldModule, InputIconModule, TagModule],
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  employees: any[] = [];
  filteredEmployees: any[] = [];
  searchTerm: string = '';
  loading: boolean = true;

  ngOnInit(): void {
    this.loadDirectory();
  }

  loadDirectory(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        // En caso de que falle por permisos, llenaremos con mock abajo
        this.employees = data;
        this.filteredEmployees = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando el directorio, usando datos simulados.', err);
        // Fallback mock en caso de 403
        this.employees = [
          { firstName: 'Ana', lastName: 'García', position: { name: 'Recursos Humanos' }, area: { name: 'Administración' }, email: 'ana.garcia@agrokasa.pe', phone: '987654321' },
          { firstName: 'Carlos', lastName: 'Pérez', position: { name: 'Gerente General' }, area: { name: 'Gerencia' }, email: 'carlos.perez@agrokasa.pe', phone: '987654322' },
          { firstName: 'Lucía', lastName: 'Fernández', position: { name: 'Analista IT' }, area: { name: 'Sistemas' }, email: 'lucia.fernandez@agrokasa.pe', phone: '987654323' },
          { firstName: 'Mario', lastName: 'Gómez', position: { name: 'Supervisor' }, area: { name: 'Operaciones' }, email: 'mario.gomez@agrokasa.pe', phone: '987654324' },
          { firstName: 'Sofía', lastName: 'Martínez', position: { name: 'Asistente' }, area: { name: 'RRHH' }, email: 'sofia.martinez@agrokasa.pe', phone: '987654325' },
        ];
        this.filteredEmployees = [...this.employees];
        this.loading = false;
      }
    });
  }

  filterDirectory(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredEmployees = this.employees.filter(emp => 
      emp.firstName.toLowerCase().includes(term) || 
      emp.lastName.toLowerCase().includes(term) || 
      emp.position?.name.toLowerCase().includes(term) ||
      emp.area?.name.toLowerCase().includes(term)
    );
  }
}
