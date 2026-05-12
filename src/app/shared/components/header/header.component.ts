import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, combineLatest } from 'rxjs'; // Necesario para reactividad
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import { Button } from "primeng/button";
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TieredMenuModule, AvatarModule, AvatarGroupModule],
  templateUrl: './header.component.html',

})
export class HeaderComponent implements OnInit, OnDestroy {

  public authService = inject(AuthService);
  private router = inject(Router);
  public layoutService = inject(LayoutService);

  isNavbarCollapsed = true;

  isLoggedIn: boolean = false;
  isEmployeePanel: boolean = false;
  userRole: string | null = null;
  userInitial: string = '';
  menuItems: MenuItem[] = [];
  profileLink: string = '/home';

  private authSubscription!: Subscription;

  ngOnInit(): void {

    this.authSubscription = combineLatest([
      this.authService.isLoggedIn$,
      this.authService.userRole$,
      this.authService.userUsername$
    ]).subscribe(([isLoggedIn, role, username]) => {

      this.isLoggedIn = isLoggedIn;
      this.userRole = role;


      this.isEmployeePanel = !!isLoggedIn &&
        (role === 'EMPLOYEE' || role === 'ADMIN' || role === 'RRHH' || role === 'USER' || role === 'SUPERVISOR');


      this.userInitial = this.getInitial(username);


      this.initializePanelMenu(role);


      if (isLoggedIn && this.isEmployeePanel && (this.router.url === '/login' || this.router.url === '/home')) {
        this.checkRedirection(role);
      }
    });
  }
  initializePanelMenu(role: string | null): void {
    if (!role) {
      this.menuItems = [];
      return;
    }

    const accessOptions: MenuItem[] = [];

    if (role === 'ADMIN' || role === 'RRHH' || role === 'SUPERVISOR') {
      this.profileLink = '/admin/profile';
    } else if (role === 'EMPLOYEE' || role === 'USER') {
      this.profileLink = '/employee/profile';
    } else {
      this.profileLink = '/home'; // Default or error case
    }

    accessOptions.push({
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      routerLink: this.profileLink 
    });

    if (role === 'ADMIN' || role === 'RRHH' || role === 'SUPERVISOR') {
      accessOptions.push({
        label: 'Configuración',
        icon: 'pi pi-cog',
        routerLink: '/admin'
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

  // Función para obtener la inicial del nombre
  getInitial(name: string | null): string {
    if (name) {
      return name.trim().charAt(0).toUpperCase();
    }
    return '?';
  }

  // Lógica de redirección (usada después del login exitoso)
  checkRedirection(role: string | null): void {
    const targetUrl = role === 'ADMIN' || role === 'RRHH' || role === 'SUPERVISOR' ? '/admin' : '/employee';
    this.router.navigate([targetUrl]);
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

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
