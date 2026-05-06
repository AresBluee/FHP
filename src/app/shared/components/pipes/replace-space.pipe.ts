import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceSpace', // <-- Nombre usado en el HTML: {{ item | replaceSpace }}
  standalone: true // ¡CRÍTICO! Debe ser standalone para la importación
})
export class ReplaceSpacePipe implements PipeTransform {

  /**
   * Transforma cadenas internas (como 'asistencia-diaria') en formato legible.
   * Por ejemplo: 'asistencia-diaria' -> 'Asistencia Diaria'
   */
  transform(value: string): string {
    if (!value) return '';
    
    // 1. Reemplaza guiones y guiones bajos por espacios
    const result = value.replace(/[-_]/g, ' '); 
    
    // 2. Capitaliza la primera letra de cada palabra
    return result.split(' ')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                 .join(' ');
  }
}