import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; 
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy{


  private authService = inject(AuthService);
  private authSubscription!: Subscription;
  
  // Variable de control para el template
  showPublicFooter: boolean = true; 

  constructor() {
    // Forzar la visibilidad del navbar al inicio si hay sesión
    const token = localStorage.getItem('authToken');
    if (token) {
      this.showPublicFooter = false;
    }
  }

  ngOnInit(): void {
    // 💡 Suscribirse al estado reactivo del login
    this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      // El Footer Público solo se muestra si el usuario NO está logueado.
      this.showPublicFooter = !isLoggedIn; 
    });
  }

  ngOnDestroy(): void {
    // Limpieza al destruir el componente principal
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
