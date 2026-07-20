import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest, filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service'; // <-- AÑADIDO
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import { Button } from "primeng/button";
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TieredMenuModule, AvatarModule, AvatarGroupModule, SidebarModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  public authService = inject(AuthService);
  private router = inject(Router);
  public layoutService = inject(LayoutService);

  isNavbarCollapsed = true;
  isSidebarNotificationsOpen: boolean = false;

  isLoggedIn: boolean = false;
  isEmployeePanel: boolean = false;
  userRole: string | null = null;
  userInitial: string = '';
  menuItems: MenuItem[] = [];
  profileLink: string = '/home'; // <-- AÑADIDO

  private authSubscription!: Subscription;
  private routerSubscription!: Subscription;

  ngOnInit(): void {
    this.authSubscription = combineLatest([
      this.authService.isLoggedIn$,
      this.authService.userRole$,
      this.authService.userUsername$
    ]).subscribe(([isLoggedIn, role, username]) => {

      this.isLoggedIn = isLoggedIn;
      this.userRole = role;

      this.updatePanelStatus();

      this.userInitial = this.getInitial(username);

      this.initializePanelMenu(role);

      if (isLoggedIn && this.isEmployeePanel && (this.router.url === '/login' || this.router.url === '/home')) {
        this.checkRedirection(role);
      }
    });

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePanelStatus();
    });
  }

  updatePanelStatus() {
    const url = this.router.url;
    // Solo consideramos que estamos en el panel si la ruta empieza por /admin o /employee
    // y el usuario está logueado.
    this.isEmployeePanel = this.isLoggedIn && (url.startsWith('/admin') || url.startsWith('/employee'));
  }

  initializePanelMenu(role: string | null): void {
    if (!role) {
      this.menuItems = [];
      return;
    }

    const accessOptions: MenuItem[] = [];

    // <-- AÑADIDO ROL SUPERVISOR Y USO DE profileLink
    if (role === 'ADMIN' || role === 'RRHH' || role === 'SUPERVISOR') {
      this.profileLink = '/admin/profile';
    } else if (role === 'EMPLOYEE' || role === 'USER') {
      this.profileLink = '/employee/profile';
    } else {
      this.profileLink = '/home';
    }

    accessOptions.push({
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      routerLink: [this.profileLink],
      command: () => this.router.navigate([this.profileLink])
    });

    if (role === 'ADMIN' || role === 'RRHH' || role === 'SUPERVISOR') {
      accessOptions.push({
        label: 'Ir a Panel de Administración',
        icon: 'pi pi-desktop',
        routerLink: ['/admin'],
        command: () => this.router.navigate(['/admin'])
      });
      accessOptions.push({
        label: 'Configuración',
        icon: 'pi pi-cog',
        routerLink: ['/admin'],
        command: () => this.router.navigate(['/admin'])
      });
    } else if (role === 'EMPLOYEE' || role === 'USER') {
      accessOptions.push({
        label: 'Ir a página principal',
        icon: 'pi pi-home',
        routerLink: ['/home'],
        command: () => this.router.navigate(['/home'])
      });
      accessOptions.push({
        label: 'Ir a Portal del Empleado',
        icon: 'pi pi-desktop',
        routerLink: ['/employee'],
        command: () => this.router.navigate(['/employee'])
      });
    }

    this.menuItems = [
      ...accessOptions,
      { separator: true },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-power-off',
        command: () => this.cerrarSesion()
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  getInitial(name: string | null): string {
    if (name) {
      return name.trim().charAt(0).toUpperCase();
    }
    return '?';
  }

  checkRedirection(role: string | null): void {
    // Si ya estamos en una ruta protegida, no redirigimos
    if (this.router.url.startsWith('/admin') || this.router.url.startsWith('/employee')) {
      return;
    }
    const targetUrl = role === 'ADMIN' || role === 'RRHH' || role === 'SUPERVISOR' ? '/admin' : '/employee';
    this.router.navigate([targetUrl]);
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  // <-- AÑADIDO FUNCIÓN PARA EL SIDEBAR
  toggleSidebar() {
    this.layoutService.toggleSidebar();
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

  irAPortalEmpleado() {
    this.router.navigate(['/login']);
  }
}