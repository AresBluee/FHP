import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-uva',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule],
  templateUrl: './uva.component.html',
  styleUrl: './uva.component.scss'
})
export class UvaComponent {
  exportaciones = [
    { anio: '2015', volumen: 3100, altura: '40%' },
    { anio: '2016', volumen: 3500, altura: '45%' },
    { anio: '2017', volumen: 4200, altura: '52%' },
    { anio: '2018', volumen: 4800, altura: '60%' },
    { anio: '2019', volumen: 4600, altura: '58%' },
    { anio: '2020', volumen: 5200, altura: '65%' },
    { anio: '2021', volumen: 6100, altura: '75%' },
    { anio: '2022', volumen: 7000, altura: '82%' },
    { anio: '2023', volumen: 7500, altura: '88%' },
    { anio: '2024', volumen: 8200, altura: '95%' }
  ];

  presentaciones = [
    { nombre: 'Red Globe', caja: 'Caja 8.2 kg' },
    { nombre: 'Crimson Seedless', caja: 'Caja 4.5 kg' },
    { nombre: 'Sweet Globe', caja: 'Caja 4.5 kg' },
    { nombre: 'Autumn Crisp', caja: 'Caja 8.2 kg' },
    { nombre: 'Red Globe Export', caja: 'Caja 8.2 kg' },
    { nombre: 'Crimson Premium', caja: 'Caja 4.5 kg' },
    { nombre: 'Sweet Globe Large', caja: 'Caja 4.5 kg' },
    { nombre: 'Autumn Select', caja: 'Caja 8.2 kg' }
  ];

  responsiveOptions = [
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '991px', numVisible: 2, numScroll: 1 },
    { breakpoint: '767px', numVisible: 1, numScroll: 1 }
  ];

  disponibilidad = [
    { mes: 'Ene', activo: true },
    { mes: 'Feb', activo: true },
    { mes: 'Mar', activo: true },
    { mes: 'Oct', activo: true },
    { mes: 'Nov', activo: true },
    { mes: 'Dic', activo: true }
  ];
}
