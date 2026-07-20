import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PoliciesComponent {
  
  categories = ['Todos', 'Recursos Humanos', 'Seguridad', 'Ética', 'Operaciones'];
  selectedCategory = 'Todos';

  policies = [
    { title: 'Manual del Empleado 2026', category: 'Recursos Humanos', icon: 'pi-book', date: 'Ene 2026', size: '2.4 MB', color: 'bg-blue-500' },
    { title: 'Código de Ética y Conducta', category: 'Ética', icon: 'pi-shield', date: 'Dic 2025', size: '1.1 MB', color: 'bg-purple-500' },
    { title: 'Política de Seguridad y Salud en el Trabajo', category: 'Seguridad', icon: 'pi-heart-fill', date: 'Feb 2026', size: '3.5 MB', color: 'bg-red-500' },
    { title: 'Reglamento Interno de Trabajo', category: 'Recursos Humanos', icon: 'pi-file', date: 'Mar 2026', size: '4.2 MB', color: 'bg-indigo-500' },
    { title: 'Protocolos de Emergencia en Campo', category: 'Seguridad', icon: 'pi-exclamation-triangle', date: 'Abr 2026', size: '1.8 MB', color: 'bg-orange-500' },
    { title: 'Uso de Equipos de Protección (EPP)', category: 'Operaciones', icon: 'pi-cog', date: 'May 2026', size: '2.1 MB', color: 'bg-green-500' },
  ];

  get filteredPolicies() {
    if (this.selectedCategory === 'Todos') return this.policies;
    return this.policies.filter(p => p.category === this.selectedCategory);
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  downloadPolicy(policy: any) {
    // Simulación de descarga
    alert(`Descargando ${policy.title}... (MOCK)`);
  }
}
