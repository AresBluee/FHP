
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmployeeService } from '../../../../core/services/employee.service';
import { EmployeeProfileDTO } from '../../../../core/models/employee.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent implements OnInit, OnDestroy {
  employeeProfile: EmployeeProfileDTO | null = null;
  error: string | null = null;
  loading: boolean = true;
  
  // Hub states
  currentTime: Date = new Date();
  clockInterval: any;
  isCheckedIn: boolean = false; // Simulated state
  lastActionTime: string | null = null;

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

    // Real-time clock
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  toggleClock(): void {
    this.isCheckedIn = !this.isCheckedIn;
    this.lastActionTime = this.currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // In a full implementation, this would call an attendance service.
  }
}

