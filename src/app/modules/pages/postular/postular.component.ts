import { Component, HostListener, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-postular',
  imports: [],
  templateUrl: './postular.component.html',
  styleUrl: './postular.component.scss'
})
export class PostularComponent implements AfterViewInit {
  @ViewChild('timelineContainer') timelineContainer!: ElementRef;
  @ViewChildren('timelineItem') timelineItems!: QueryList<ElementRef>;
  
  lineHeight: number = 0;

  ngAfterViewInit() {
    // Pequeño delay para asegurar que el DOM está renderizado antes de calcular
    setTimeout(() => {
      this.updateTimeline();
      this.setupIntersectionObserver();
    }, 100);
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Se activa cuando el 15% del elemento es visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-12');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          // Dejar de observar una vez que ya apareció
          observer.unobserve(entry.target);
        }
      });
    }, options);

    this.timelineItems.forEach(item => {
      observer.observe(item.nativeElement);
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.updateTimeline();
  }

  updateTimeline() {
    if (!this.timelineContainer) return;
    
    const element = this.timelineContainer.nativeElement;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Queremos que la línea empiece a llenarse cuando el tope del contenedor llega al centro de la pantalla
    const triggerPoint = windowHeight * 0.5; 
    
    // Cuánto hemos scrolleado más allá del trigger point
    const distance = triggerPoint - rect.top;
    
    if (distance < 0) {
      // Si aún no llegamos al contenedor
      this.lineHeight = 0;
    } else {
      // Porcentaje de avance de la línea
      const percentage = (distance / rect.height) * 100;
      this.lineHeight = Math.min(Math.max(percentage, 0), 100);
    }
  }
}
