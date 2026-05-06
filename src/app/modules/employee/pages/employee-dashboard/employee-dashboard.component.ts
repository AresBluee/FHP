
import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../../../core/services/employee.service';
import { EmployeeProfileDTO } from '../../../../core/models/employee.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent implements OnInit {
  employeeProfile: EmployeeProfileDTO | null = null;
  error: string | null = null;
  loading: boolean = true;

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    this.loading = true;
    this.employeeService.getEmployeeProfile().subscribe({
      next: (data) => {
        this.employeeProfile = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el perfil del empleado.';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
