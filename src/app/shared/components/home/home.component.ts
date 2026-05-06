import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private router = inject(Router);

  // Método que maneja la acción del botón "Descubra quiénes somos"
  descubrirNosotros() {
    this.router.navigate(['/nosotros']); // Navega a la ruta 'nosotros'
  }
}
