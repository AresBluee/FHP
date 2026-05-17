import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-arandanos',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule],
  templateUrl: './arandanos.component.html',
  styleUrl: './arandanos.component.scss'
})
export class ArandanosComponent {
  exportaciones = [
    { anio: '2018', volumen: 450, altura: '20%' },
    { anio: '2019', volumen: 800, altura: '30%' },
    { anio: '2020', volumen: 1500, altura: '45%' },
    { anio: '2021', volumen: 2800, altura: '60%' },
    { anio: '2022', volumen: 4200, altura: '75%' },
    { anio: '2023', volumen: 5800, altura: '85%' },
    { anio: '2024', volumen: 7100, altura: '95%' }
  ];

  presentaciones = [
    { nombre: 'Ventura', caja: 'Clamshell 125g' },
    { nombre: 'Biloxi', caja: 'Clamshell 125g' },
    { nombre: 'Premium Blueberry', caja: 'Pint 510g' },
    { nombre: 'Bulk', caja: 'Caja 1.5 kg' },
    { nombre: 'Ventura Large', caja: 'Clamshell 125g' },
    { nombre: 'Biloxi Export', caja: 'Clamshell 125g' },
    { nombre: 'Super Blueberry', caja: 'Pint 510g' },
    { nombre: 'Bulk Jumbo', caja: 'Caja 1.5 kg' }
  ];

  responsiveOptions = [
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '991px', numVisible: 2, numScroll: 1 },
    { breakpoint: '767px', numVisible: 1, numScroll: 1 }
  ];

  disponibilidad = [
    { mes: 'Jul', activo: true },
    { mes: 'Ago', activo: true },
    { mes: 'Sep', activo: true },
    { mes: 'Oct', activo: true },
    { mes: 'Nov', activo: true },
    { mes: 'Dic', activo: true }
  ];
}
