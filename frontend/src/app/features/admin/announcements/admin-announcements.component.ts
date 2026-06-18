import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementsService } from '../../../core/services/announcements.service';
import { ToastService } from '../../../core/services/toast.service';
import { Announcement } from '../../../core/models';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-announcements.component.html',
})
export class AdminAnnouncementsComponent implements OnInit {
  private service = inject(AnnouncementsService);
  private toastService = inject(ToastService);
  
  announcements: Announcement[] = [];
  loading = false;

  // Modal State
  showModal = false;

  // Form Fields
  formTitle = '';
  formBody = '';
  formImageUrl = '';
  formIsPinned = false;

  ngOnInit() {
    this.loadAnnouncements();
  }

  loadAnnouncements() {
    this.service.getAll().subscribe((d) => (this.announcements = d));
  }

  openCreateModal() {
    this.formTitle = '';
    this.formBody = '';
    this.formImageUrl = '';
    this.formIsPinned = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveAnnouncement() {
    if (!this.formTitle.trim() || !this.formBody.trim()) {
      this.toastService.warning('Por favor complete todos los campos obligatorios.');
      return;
    }
    if (this.loading) return;
    this.loading = true;

    const annData = {
      title: this.formTitle,
      body: this.formBody,
      image_url: this.formImageUrl.trim() || undefined,
      is_pinned: this.formIsPinned,
    };

    this.service.create(annData).subscribe({
      next: () => {
        this.toastService.success('Aviso publicado con éxito.');
        this.loadAnnouncements();
        this.closeModal();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Error al publicar el aviso.');
        this.loading = false;
      }
    });
  }

  deleteAnnouncement(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este aviso?')) {
      if (this.loading) return;
      this.loading = true;
      this.service.delete(id).subscribe({
        next: (success) => {
          this.loading = false;
          if (success) {
            this.toastService.success('Aviso eliminado correctamente.');
            this.loadAnnouncements();
          } else {
            this.toastService.error('No se pudo eliminar el aviso.');
          }
        },
        error: () => {
          this.toastService.error('Error al eliminar el aviso.');
          this.loading = false;
        }
      });
    }
  }
}
