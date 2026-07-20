import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, ButtonModule, TagModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent {
  
  performanceScore = 85;
  
  pendingEvaluations = [
    { title: 'Evaluación 360° - Q2 2026', type: 'Autoevaluación', deadline: '25 Jul 2026', status: 'Pendiente' },
    { title: 'Evaluación de Clima Laboral', type: 'Encuesta', deadline: '30 Jul 2026', status: 'Pendiente' }
  ];

  pastEvaluations = [
    { title: 'Evaluación de Desempeño Anual 2025', date: 'Ene 2026', score: 92, label: 'Sobresaliente' },
    { title: 'Evaluación 360° - Q4 2025', date: 'Oct 2025', score: 85, label: 'Bueno' },
    { title: 'Evaluación 360° - Q2 2025', date: 'Jul 2025', score: 78, label: 'Promedio' }
  ];

  startEvaluation(ev: any) {
    alert(`Iniciando ${ev.title}... (MOCK)`);
  }

  getScoreSeverity(score: number): string {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'danger';
  }
}
