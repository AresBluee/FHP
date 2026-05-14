import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {  MenuModule } from "primeng/menu";
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { Subscription, filter } from 'rxjs';
import { LayoutService } from '../../../../core/services/layout.service';

@Component({
  selector: 'app-menu-employee',
  imports: [
    MenuModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './menu-employee.component.html',
  styleUrl: './menu-employee.component.scss'
})
export class MenuEmployeeComponent implements OnInit, OnDestroy {

  seccionActiva: string = 'employee';
  menuItems: MenuItem[] = [];
  private routerSubscription: Subscription;
  private layoutSubscription!: Subscription;
  isSidebarOpen: boolean = false;

  constructor(private router: Router, private layoutService: LayoutService) {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Obtenemos la última parte de la ruta ignorando parámetros si los hay
      const urlParts = event.url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      // Si la última parte es un número (ID), tomamos la penúltima (ej: edit)
      if (!isNaN(Number(lastPart))) {
        this.seccionActiva = urlParts[urlParts.length - 2];
      } else {
        this.seccionActiva = lastPart || 'employee';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.layoutSubscription) {
      this.layoutSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.initializeMenuItems();
    this.layoutSubscription = this.layoutService.sidebarOpen$.subscribe(
      (isOpen: boolean) => {
        this.isSidebarOpen = isOpen;
      }
    );
  }

  closeSidebar(): void {
    this.layoutService.setSidebarState(false);
  }

  initializeMenuItems(): void {
    this.menuItems = [
      { label: 'Mi Perfil', icon: 'pi pi-user', routerLink: ['profile'], id: 'profile' },
      { label: 'Horarios', icon: 'pi pi-calendar', routerLink: ['my-schedule'], id: 'my-schedule' },
      { label: 'Certificados', icon: 'pi pi-file-word', routerLink: ['my-certificates'], id: 'my-certificates' },
      { label: 'Asistencias', icon: 'pi pi-calendar-clock', routerLink: ['my-attendance-history'], id: 'my-attendance-history' },
      { label: 'Solicitudes', icon: 'pi pi-envelope', routerLink: ['my-requests'], id: 'my-requests' },
      { label: 'Boletas de Pago', icon: 'pi pi-dollar', routerLink: ['my-payslips'], id: 'my-payslips' },
    ];
  }

}
