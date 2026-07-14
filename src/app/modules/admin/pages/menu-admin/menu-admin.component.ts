import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from "primeng/menu";
import { TieredMenuModule } from "primeng/tieredmenu";
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
    TieredMenuModule,
    RouterModule
], 
  templateUrl: './menu-admin.component.html',
  styleUrl: './menu-admin.component.scss'
})
export class MenuAdminComponent implements OnInit, OnDestroy {

  seccionActiva: string = 'lista-empleados';
  profileLink: string = '/home';
  
  menuItems: MenuItem[] = []; 
  userMenuItems: MenuItem[] = []; 
  private routerSubscription: Subscription;
  private layoutSubscription!: Subscription;
  private authSubscription!: Subscription;
  isSidebarOpen: boolean = false;
  public authService = inject(AuthService);

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
      if (role === 'ADMIN' || role === 'RRHH' || role === 'SUPERVISOR') {
        this.profileLink = '/admin/profile';
      } else if (role === 'EMPLOYEE' || role === 'USER') {
        this.profileLink = '/employee/profile';
      } else {
        this.profileLink = '/home';
      }
      this.initializeUserMenuItems(role);
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
    const items: MenuItem[] = [
      { label: 'Dashboard', icon: 'dashboard', routerLink: ['dashboard'], id: 'dashboard' },
      { label: 'Mis Solicitudes', icon: 'description', routerLink: ['mis-solicitudes'], id: 'mis-solicitudes' },
      { label: 'Lista de Empleados', icon: 'group', routerLink: ['lista-empleados'], id: 'lista-empleados' },
      { label: 'Registrar Nuevo', icon: 'person_add', routerLink: ['registrar-nuevo'], id: 'registrar-nuevo' },
      { label: 'Asignar Horarios', icon: 'calendar_month', routerLink: ['asignar-horarios'], id: 'asignar-horarios' },
      { label: 'Control Diario', icon: 'schedule', routerLink: ['control-diario'], id: 'control-diario' },
      { label: 'Gestión de Boletas', icon: 'receipt_long', routerLink: ['gestion-boletas'], id: 'gestion-boletas' },
      { label: 'Archivos', icon: 'folder_open', routerLink: ['archivos-documentos'], id: 'archivos-documentos' },
      { label: 'Solicitudes Pendientes', icon: 'pending_actions', routerLink: ['solicitudes-pendientes'], id: 'solicitudes-pendientes' }
    ];

    if (role === 'ADMIN') {
      items.push({ label: 'Configurar Solicitudes', icon: 'settings', routerLink: ['configuracion-solicitudes'], id: 'configuracion-solicitudes' });
    }

    this.menuItems = items;
  }

  initializeUserMenuItems(role: string | null): void {
    const opts: MenuItem[] = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        routerLink: [this.profileLink],
        command: () => this.router.navigate([this.profileLink])
      },
      {
        label: 'Ir a Inicio (/home)',
        icon: 'pi pi-home',
        routerLink: ['/home'],
        command: () => this.router.navigate(['/home'])
      }
    ];

    if (role === 'ADMIN') {
      opts.push({
        label: 'Configurar Solicitudes',
        icon: 'pi pi-cog',
        routerLink: ['configuracion-solicitudes'],
        command: () => this.router.navigate(['/admin/configuracion-solicitudes'])
      });
    }

    opts.push(
      { separator: true },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-power-off',
        command: () => this.cerrarSesion()
      }
    );

    this.userMenuItems = opts;
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
 