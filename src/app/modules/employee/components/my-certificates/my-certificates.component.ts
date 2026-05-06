import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../../core/services/document.service';
import { DocumentDTO } from '../../../../core/models/document.model';
import { AuthService } from '../../../../core/services/auth.service';

// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-my-certificates',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, SkeletonModule],
  templateUrl: './my-certificates.component.html',
  styleUrls: ['./my-certificates.component.scss']
})
export class MyCertificatesComponent implements OnInit {
  certificates: DocumentDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    this.documentService.getMyDocuments().subscribe({
      next: (data) => {
        this.certificates = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los certificados.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  downloadCertificate(doc: DocumentDTO): void {
    this.documentService.getDocumentBlob(doc.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }
}
