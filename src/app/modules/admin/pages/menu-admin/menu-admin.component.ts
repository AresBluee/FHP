import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {  MenuModule } from "primeng/menu";
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { Subscription, filter } from 'rxjs';
import { LayoutService } from '../../../../core/services/layout.service';
import { AuthService } from '../../../../core/services/auth.service';


@Component({
  selector: 'app-menu-admin',
  imports: [

    CommonModule,
    MenuModule,
    RouterModule
], 
  templateUrl: './menu-admin.component.html',
  styleUrl: './menu-admin.component.scss'
})
export class MenuAdminComponent implements OnInit, OnDestroy {

  seccionActiva: string = 'lista-empleados';
  
  menuItems: MenuItem[] = []; 
  private routerSubscription: Subscription;
  private layoutSubscription!: Subscription;
  private authSubscription!: Subscription;
  isSidebarOpen: boolean = false;
  private authService = inject(AuthService);

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
        this.seccionActiva = lastPart || 'lista-empleados';
      }
    });
  }

  ngOnDestroy(): void {
    // Buena práctica: cancelar la suscripción para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.layoutSubscription) {
      this.layoutSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.userRole$.subscribe(role => {
      this.initializeMenuItems(role);
    });

    this.layoutSubscription = this.layoutService.sidebarOpen$.subscribe(
      (isOpen: boolean) => {
        this.isSidebarOpen = isOpen;
      }
    );
  }

  closeSidebar(): void {
    this.layoutService.setSidebarState(false);
  }

  initializeMenuItems(role: string | null): void {
    // Usamos 'routerLink' para la navegación y 'id' para el estilo activo
    const items: MenuItem[] = [
      { label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: ['dashboard'], id: 'dashboard' },
      { label: 'Mis Solicitudes', icon: 'pi pi-calendar-plus', routerLink: ['mis-solicitudes'], id: 'mis-solicitudes' },
      { label: 'Lista de Empleados', icon: 'pi pi-users', routerLink: ['lista-empleados'], id: 'lista-empleados' },
      { label: 'Registrar Nuevo', icon: 'pi pi-user-plus', routerLink: ['registrar-nuevo'], id: 'registrar-nuevo' },
      { label: 'Asignar Horarios', icon: 'pi pi-calendar-clock', routerLink: ['asignar-horarios'], id: 'asignar-horarios' },
      { label: 'Control Diario', icon: 'pi pi-clock', routerLink: ['control-diario'], id: 'control-diario' },
      { label: 'Gestión de Boletas', icon: 'pi pi-dollar', routerLink: ['gestion-boletas'], id: 'gestion-boletas' },
      { label: 'Archivos de Documentos', icon: 'pi pi-file-pdf', routerLink: ['archivos-documentos'], id: 'archivos-documentos' },
      { label: 'Solicitudes Pendientes', icon: 'pi pi-exclamation-triangle', routerLink: ['solicitudes-pendientes'], id: 'solicitudes-pendientes' }
    ];

    // Solo el administrador puede crear tipos de solicitudes
    if (role === 'ADMIN') {
      items.push({ label: 'Configurar Solicitudes', icon: 'pi pi-cog', routerLink: ['configuracion-solicitudes'], id: 'configuracion-solicitudes' });
    }

    this.menuItems = items;
  }
}
 