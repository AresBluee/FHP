import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { Subscription, filter } from 'rxjs'; 
import { AuthService } from './core/services/auth.service';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy{

  private router = inject(Router);
  private authService = inject(AuthService);
  private authSubscription!: Subscription;
  private routerSubscription!: Subscription;
  
  // Variable de control para el template
  showPublicFooter: boolean = true; 

  constructor() {
    const path = window.location.pathname;
    this.showPublicFooter = !(path.startsWith('/admin') || path.startsWith('/employee'));
  }

  ngOnInit(): void {
    // 📈 Registrar navegación SPA de Angular en Google Analytics (GA4) y controlar Footer
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      
      // El footer solo se oculta en los paneles de admin y empleado
      this.showPublicFooter = !(url.startsWith('/admin') || url.startsWith('/employee'));

      if (typeof gtag !== 'undefined') {
        gtag('config', 'G-0R3GTLEK01', {
          page_path: event.urlAfterRedirects
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Limpieza al destruir el componente principal
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
