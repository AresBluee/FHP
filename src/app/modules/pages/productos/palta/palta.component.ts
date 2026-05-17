import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-palta',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule],
  templateUrl: './palta.component.html',
  styleUrl: './palta.component.scss'
})
export class PaltaComponent {
  // Datos de exportaciones
  exportaciones = [
    { anio: '2015', volumen: 4613, altura: '45%' },
    { anio: '2016', volumen: 6716, altura: '65%' },
    { anio: '2017', volumen: 5674, altura: '55%' },
    { anio: '2018', volumen: 7779, altura: '75%' },
    { anio: '2019', volumen: 5183, altura: '50%' },
    { anio: '2020', volumen: 4331, altura: '42%' },
    { anio: '2021', volumen: 6900, altura: '68%' },
    { anio: '2022', volumen: 7936, altura: '78%' },
    { anio: '2023', volumen: 6097, altura: '60%' },
    { anio: '2024', volumen: 9236, altura: '95%' }
  ];

  // Datos de presentaciones (duplicados para efecto carrusel)
  presentaciones = [
    { nombre: 'La Catalina', caja: 'Caja 11kg' },
    { nombre: 'Santa Rita', caja: 'Caja 11kg' },
    { nombre: 'Suavo Avocado', caja: 'Caja 11kg' },
    { nombre: 'La Catalina', caja: 'Caja 4kg' },
    { nombre: 'Santa Rita', caja: 'Caja 4kg' },
    { nombre: 'Suavo Avocado Premium', caja: 'Caja 11kg' },
    { nombre: 'La Catalina Export', caja: 'Caja 11kg' },
    { nombre: 'Agrokasa Selected', caja: 'Caja 4kg' }
  ];

  // Opciones de responsividad para el carrusel
  responsiveOptions = [
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '991px', numVisible: 2, numScroll: 1 },
    { breakpoint: '767px', numVisible: 1, numScroll: 1 }
  ];

  // Datos de disponibilidad
  disponibilidad = [
    { mes: 'Abr', activo: true },
    { mes: 'May', activo: true },
    { mes: 'Jun', activo: true },
    { mes: 'Jul', activo: true },
    { mes: 'Ago', activo: true },
    { mes: 'Sep', activo: true }
  ];
}
