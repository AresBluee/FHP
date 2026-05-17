import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-esparrago',
  standalone: true,
  imports: [CommonModule, RouterModule, CarouselModule],
  templateUrl: './esparrago.component.html',
  styleUrl: './esparrago.component.scss'
})
export class EsparragoComponent {
  // Datos de exportaciones (Ejemplo ficticio adaptado)
  exportaciones = [
    { anio: '2015', volumen: 2100, altura: '50%' },
    { anio: '2016', volumen: 2300, altura: '55%' },
    { anio: '2017', volumen: 2500, altura: '60%' },
    { anio: '2018', volumen: 2400, altura: '58%' },
    { anio: '2019', volumen: 2700, altura: '65%' },
    { anio: '2020', volumen: 2600, altura: '62%' },
    { anio: '2021', volumen: 2900, altura: '70%' },
    { anio: '2022', volumen: 3100, altura: '75%' },
    { anio: '2023', volumen: 3400, altura: '82%' },
    { anio: '2024', volumen: 3900, altura: '95%' }
  ];

  // Datos de presentaciones
  presentaciones = [
    { nombre: 'Fresco Atado', caja: 'Caja 3 kg (7.3 lb)' },
    { nombre: 'Puntas de Espárrago', caja: 'Caja 2.5 kg' },
    { nombre: 'Fresco Atado Premium', caja: 'Caja 5 kg' },
    { nombre: 'Jumbo', caja: 'Caja 3 kg' },
    { nombre: 'Fresco Atado L', caja: 'Caja 3 kg' },
    { nombre: 'Puntas Selected', caja: 'Caja 2.5 kg' },
    { nombre: 'Espárrago Standard', caja: 'Caja 5 kg' },
    { nombre: 'Jumbo Export', caja: 'Caja 3 kg' }
  ];

  responsiveOptions = [
    { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
    { breakpoint: '991px', numVisible: 2, numScroll: 1 },
    { breakpoint: '767px', numVisible: 1, numScroll: 1 }
  ];

  // Datos de disponibilidad (Todo el año)
  disponibilidad = [
    { mes: 'Ene', activo: true },
    { mes: 'Feb', activo: true },
    { mes: 'Mar', activo: true },
    { mes: 'Abr', activo: true },
    { mes: 'May', activo: true },
    { mes: 'Jun', activo: true },
    { mes: 'Jul', activo: true },
    { mes: 'Ago', activo: true },
    { mes: 'Sep', activo: true },
    { mes: 'Oct', activo: true },
    { mes: 'Nov', activo: true },
    { mes: 'Dic', activo: true }
  ];
}
