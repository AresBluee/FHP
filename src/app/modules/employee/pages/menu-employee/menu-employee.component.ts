import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from "primeng/menu";
import { TieredMenuModule } from "primeng/tieredmenu";
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { Subscription, filter } from 'rxjs';
import { LayoutService } from '../../../../core/services/layout.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-menu-employee',
  imports: [
    MenuModule,
    TieredMenuModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './menu-employee.component.html',
  styleUrl: './menu-employee.component.scss'
})
export class MenuEmployeeComponent implements OnInit, OnDestroy {

  seccionActiva: string = 'employee';
  menuItems: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];
  private routerSubscription: Subscription;
  private layoutSubscription!: Subscription;
  isSidebarOpen: boolean = false;

  constructor(private router: Router, private layoutService: LayoutService, public authService: AuthService) {
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
    this.initializeUserMenuItems();
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
      { label: 'Mi Perfil', icon: 'person', routerLink: ['profile'], id: 'profile' },
      { label: 'Mis Horarios', icon: 'schedule', routerLink: ['my-schedule'], id: 'my-schedule' },
      { label: 'Mis Certificados', icon: 'workspace_premium', routerLink: ['my-certificates'], id: 'my-certificates' },
      { label: 'Mi Asistencia', icon: 'how_to_reg', routerLink: ['my-attendance-history'], id: 'my-attendance-history' },
      { label: 'Mis Solicitudes', icon: 'description', routerLink: ['my-requests'], id: 'my-requests' },
      { label: 'Boletas de Pago', icon: 'receipt_long', routerLink: ['my-payslips'], id: 'my-payslips' },
    ];
  }

  initializeUserMenuItems(): void {
    this.userMenuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        routerLink: ['/employee/profile'],
        command: () => this.router.navigate(['/employee/profile'])
      },
      {
        label: 'Ir a Inicio (/home)',
        icon: 'pi pi-home',
        routerLink: ['/home'],
        command: () => this.router.navigate(['/home'])
      },
      { separator: true },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-power-off',
        command: () => this.cerrarSesion()
      }
    ];
  }

  cerrarSesion() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al revocar token en backend.', err);
        this.router.navigate(['/login']);
      }
    });
  }

}
