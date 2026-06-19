import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryService } from '../../../core/services/gallery.service';
import { ToastService } from '../../../core/services/toast.service';
import { GalleryItem } from '../../../core/models';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-gallery.component.html',
})
export class AdminGalleryComponent implements OnInit {
  private service = inject(GalleryService);
  private toastService = inject(ToastService);

  items: GalleryItem[] = [];
  loading = false;

  // Modal State
  showModal = false;

  // Form Fields
  formTitle = '';
  formDescription = '';
  formImageUrl = '';

  uploadingImage = false;

  ngOnInit() {
    this.loadGallery();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.uploadingImage = true;
    this.service.uploadPhoto(file).subscribe({
      next: (res) => {
        this.uploadingImage = false;
        if (res.success) {
          this.formImageUrl = res.photoUrl;
          this.toastService.success('Imagen subida correctamente.');
        } else {
          this.toastService.error('Error al subir la imagen.');
        }
      },
      error: (err) => {
        this.uploadingImage = false;
        this.toastService.error(err.error?.message || 'Error al conectar con el servidor.');
        console.error(err);
      }
    });
  }

  loadGallery() {
    this.service.getAll().subscribe((d) => (this.items = d));
  }

  openCreateModal() {
    this.formTitle = '';
    this.formDescription = '';
    this.formImageUrl = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveGalleryItem() {
    if (!this.formTitle.trim() || !this.formImageUrl.trim()) {
      this.toastService.warning('Por favor complete todos los campos obligatorios.');
      return;
    }
    if (this.loading) return;
    this.loading = true;

    const itemData = {
      title: this.formTitle,
      description: this.formDescription,
      image_url: this.formImageUrl,
    };

    this.service.create(itemData).subscribe({
      next: () => {
        this.toastService.success('Imagen guardada con éxito en la galería.');
        this.loadGallery();
        this.closeModal();
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Error al guardar la imagen en la galería.');
        this.loading = false;
      }
    });
  }

  deleteGalleryItem(id: number) {
    if (confirm('¿Está seguro de que desea eliminar esta imagen de la galería?')) {
      if (this.loading) return;
      this.loading = true;
      this.service.delete(id).subscribe({
        next: (success) => {
          this.loading = false;
          if (success) {
            this.toastService.success('Imagen eliminada correctamente.');
            this.loadGallery();
          } else {
            this.toastService.error('No se pudo eliminar la imagen.');
          }
        },
        error: () => {
          this.toastService.error('Error al eliminar la imagen.');
          this.loading = false;
        }
      });
    }
  }
}
