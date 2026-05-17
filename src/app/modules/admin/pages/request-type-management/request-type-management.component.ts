import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RequestTypeService, RequestTypeDTO } from '../../../../core/services/request-type.service';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-request-type-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, CheckboxModule, ToastModule, ConfirmDialogModule, TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './request-type-management.component.html',
  styleUrls: ['./request-type-management.component.scss']
})
export class RequestTypeManagementComponent implements OnInit {

  private requestTypeService = inject(RequestTypeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  requestTypes: RequestTypeDTO[] = [];
  isLoading = true;

  displayDialog = false;
  isEditing = false;
  currentType: RequestTypeDTO = this.getEmptyType();

  ngOnInit(): void {
    this.loadRequestTypes();
  }

  getEmptyType(): RequestTypeDTO {
    return {
      name: '',
      basePriority: 1,
      slaDays: 7,
      requiresSignature: false,
      requiresAttachment: false
    };
  }

  loadRequestTypes(): void {
    this.isLoading = true;
    this.requestTypeService.getAll().subscribe({
      next: (data) => {
        this.requestTypes = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tipos de solicitudes.' });
        this.isLoading = false;
      }
    });
  }

  openNew(): void {
    this.currentType = this.getEmptyType();
    this.isEditing = false;
    this.displayDialog = true;
  }

  openEdit(type: RequestTypeDTO): void {
    this.currentType = { ...type };
    this.isEditing = true;
    this.displayDialog = true;
  }

  saveType(): void {
    if (!this.currentType.name || this.currentType.name.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es obligatorio.' });
      return;
    }

    if (this.isEditing && this.currentType.id) {
      this.requestTypeService.update(this.currentType.id, this.currentType).subscribe({
        next: (updated) => {
          const index = this.requestTypes.findIndex(t => t.id === updated.id);
          if (index !== -1) {
            this.requestTypes[index] = updated;
          }
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo actualizado correctamente.' });
          this.displayDialog = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar.' });
        }
      });
    } else {
      this.requestTypeService.create(this.currentType).subscribe({
        next: (created) => {
          this.requestTypes.push(created);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo creado correctamente.' });
          this.displayDialog = false;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear.' });
        }
      });
    }
  }

  deleteType(type: RequestTypeDTO): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar el tipo "${type.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (type.id) {
          this.requestTypeService.delete(type.id).subscribe({
            next: () => {
              this.requestTypes = this.requestTypes.filter(t => t.id !== type.id);
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo eliminado correctamente.' });
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar. Puede estar en uso.' });
            }
          });
        }
      }
    });
  }

  getPriorityLabel(priority: number): string {
    switch(priority) {
      case 1: return 'Baja';
      case 2: return 'Media';
      case 3: return 'Alta';
      case 4: return 'Crítica';
      default: return 'Desconocida';
    }
  }

  getPrioritySeverity(priority: number): 'success' | 'info' | 'warning' | 'danger' {
    switch(priority) {
      case 1: return 'success';
      case 2: return 'info';
      case 3: return 'warning';
      case 4: return 'danger';
      default: return 'info';
    }
  }
}
