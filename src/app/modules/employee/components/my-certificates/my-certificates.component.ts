import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../core/services/document.service';
import { DocumentDTO } from '../../../../core/models/document.model';
import { AuthService } from '../../../../core/services/auth.service';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { Subscription, interval } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule, DialogModule, InputTextModule, IconFieldModule, InputIconModule],
  templateUrl: './my-certificates.component.html',
  styleUrls: ['./my-certificates.component.scss']
})
export class MyCertificatesComponent implements OnInit {
  certificates: DocumentDTO[] = [];
  loading = true;
  error: string | null = null;
  private refreshSubscription?: Subscription;

  showViewer = false;
  documentViewerUrl: SafeResourceUrl | undefined;
  
  private sanitizer = inject(DomSanitizer);

  constructor(private documentService: DocumentService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadCertificates();

    // Auto-refresh every 15 seconds
    this.refreshSubscription = interval(15000).subscribe(() => {
        this.loadCertificates(true);
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
        this.refreshSubscription.unsubscribe();
    }
  }

  loadCertificates(silent: boolean = false): void {
    if (!silent) this.loading = true;
    
    this.documentService.getMyDocuments().subscribe({
      next: (data) => {
        this.certificates = data;
        if (!silent) this.loading = false;
      },
      error: (err) => {
        if (!silent) {
            this.error = 'Error al cargar los certificados.';
            this.loading = false;
        }
        console.error(err);
      },
    });
  }

  downloadCertificate(doc: DocumentDTO): void {
    this.documentService.getDocumentBlob(doc.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName || `Certificado_${doc.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  viewCertificate(doc: DocumentDTO): void {
    this.documentService.getDocumentBlob(doc.id).subscribe({
      next: (blob) => {
        const objectUrl = window.URL.createObjectURL(blob);
        this.documentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.showViewer = true;
      },
      error: (err) => {
        console.error('Error al visualizar el certificado', err);
      }
    });
  }

  isRecent(dateStr: string): boolean {
    if (!dateStr) return false;
    const docDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - docDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
