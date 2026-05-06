import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {  MenuModule } from "primeng/menu";
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { Subscription, filter } from 'rxjs';


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

  constructor(private router: Router) {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.seccionActiva = event.url.split('/').pop() || 'lista-empleados';
    });
  } 

  ngOnInit(): void {
    this.initializeMenuItems();
  }

  ngOnDestroy(): void {
    // Buena práctica: cancelar la suscripción para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  initializeMenuItems(): void {
    // Usamos 'routerLink' para la navegación y 'id' para el estilo activo
    this.menuItems = [
     /*  { label: 'Dashboard', icon: 'pi pi-chart-line', routerLink: ['dashboard'], id: 'dashboard' }, */
      { label: 'Lista de Empleados', icon: 'pi pi-users', routerLink: ['lista-empleados'], id: 'lista-empleados' },
      { label: 'Registrar Nuevo', icon: 'pi pi-user-plus', routerLink: ['registrar-nuevo'], id: 'registrar-nuevo' },
      { label: 'Asignar Horarios', icon: 'pi pi-calendar-clock', routerLink: ['asignar-horarios'], id: 'asignar-horarios' },
      { label: 'Control Diario', icon: 'pi pi-clock', routerLink: ['control-diario'], id: 'control-diario' },
     /*  { label: 'Gestion de Documentos', icon: 'pi pi-users', routerLink: ['documentUp'], id: 'documentUp' }, */
      { label: 'Solicitudes Pendientes', icon: 'pi pi-exclamation-triangle', routerLink: ['solicitudes-pendientes'], id: 'solicitudes-pendientes' },
      { label: 'Historial de Archivos y Documentos', icon: 'pi pi-folder-open', routerLink: ['archivos-documentos'], id: 'archivos-documentos' },
     /*  { label: 'Historia de Documentos', icon: 'pi pi-folder-open', routerLink: ['historial-documentos'], id: 'historial-documentos' }, */
     {label: 'Generar Boletas/Documentos', icon: 'pi pi-folder-open',routerLink:['Generar-Boletas/Documentos'], id:'Generar-Boletas/Documentos'}
    ];
  }
}
 