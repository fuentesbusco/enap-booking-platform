import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpacesService } from '../../../core/services/spaces.service';
import { ToastService } from '../../../core/services/toast.service';
import { Space, SpaceType } from '../../../core/models';

@Component({
  selector: 'app-admin-spaces',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-spaces.component.html',
})
export class AdminSpacesComponent implements OnInit {
  private spacesService = inject(SpacesService);
  private toastService = inject(ToastService);

  spaces: Space[] = [];
  loading = false;
  
  // Modal State
  showModal = false;
  isEditMode = false;
  editingId: number | null = null;

  // Form Fields
  formName = '';
  formType: SpaceType = 'cabin';
  formDescription = '';
  formMaxCapacity = 4;
  formBasePrice = 30000;
  formSocioPrice = 20000;
  formGuestPrice = 3500;
  formFreeGuestsForSocio = 0;
  formImages: string[] = [];
  formAmenities = '';
  formTotalUnits = 1;

  uploadingImage = false;

  ngOnInit() {
    this.loadSpaces();
  }

  loadSpaces() {
    this.spacesService.getAll().subscribe((list) => {
      this.spaces = list;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.uploadingImage = true;
    this.spacesService.uploadPhoto(file).subscribe({
      next: (res) => {
        this.uploadingImage = false;
        if (res.success) {
          this.formImages.push(res.photoUrl);
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

  removeImage(index: number) {
    this.formImages.splice(index, 1);
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingId = null;
    
    this.formName = '';
    this.formType = 'cabin';
    this.formDescription = '';
    this.formMaxCapacity = 4;
    this.formBasePrice = 30000;
    this.formSocioPrice = 20000;
    this.formGuestPrice = 3500;
    this.formFreeGuestsForSocio = 0;
    this.formImages = ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80'];
    this.formAmenities = 'Cocina equipada, TV, Parrilla, Estacionamiento';
    this.formTotalUnits = 1;
    
    this.showModal = true;
  }

  openEditModal(space: Space) {
    this.isEditMode = true;
    this.editingId = space.id;
    
    this.formName = space.name;
    this.formType = space.type;
    this.formDescription = space.description;
    this.formMaxCapacity = space.max_capacity;
    this.formBasePrice = space.base_price;
    this.formSocioPrice = space.socio_price;
    this.formGuestPrice = space.guest_price;
    this.formFreeGuestsForSocio = space.free_guests_for_socio;
    this.formImages = space.images ? [...space.images] : [];
    this.formAmenities = space.amenities.join(', ');
    this.formTotalUnits = space.total_units || 1;
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSpace() {
    if (!this.formName.trim() || !this.formDescription.trim()) {
      this.toastService.warning('Por favor complete los campos obligatorios.');
      return;
    }
    if (this.loading) return;
    this.loading = true;

    const amenitiesList = this.formAmenities
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const spaceData = {
      name: this.formName,
      type: this.formType,
      description: this.formDescription,
      max_capacity: Number(this.formMaxCapacity),
      base_price: Number(this.formBasePrice),
      socio_price: Number(this.formSocioPrice),
      guest_price: Number(this.formGuestPrice),
      free_guests_for_socio: Number(this.formFreeGuestsForSocio),
      images: this.formImages.length > 0 ? this.formImages : ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80'],
      amenities: amenitiesList,
      total_units: Number(this.formTotalUnits),
    };

    if (this.isEditMode && this.editingId !== null) {
      this.spacesService.update(this.editingId, spaceData).subscribe({
        next: () => {
          this.toastService.success('Espacio actualizado con éxito.');
          this.loadSpaces();
          this.closeModal();
          this.loading = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al actualizar el espacio.');
          this.loading = false;
        }
      });
    } else {
      this.spacesService.create(spaceData).subscribe({
        next: () => {
          this.toastService.success('Espacio creado con éxito.');
          this.loadSpaces();
          this.closeModal();
          this.loading = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al crear el espacio.');
          this.loading = false;
        }
      });
    }
  }

  deleteSpace(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este espacio? Esta acción no se puede deshacer.')) {
      if (this.loading) return;
      this.loading = true;
      this.spacesService.delete(id).subscribe({
        next: (success) => {
          this.loading = false;
          if (success) {
            this.toastService.success('Espacio eliminado correctamente.');
            this.loadSpaces();
          } else {
            this.toastService.error('No se pudo eliminar el espacio.');
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al eliminar el espacio. Verifique que no tenga reservas asociadas.');
          this.loading = false;
        }
      });
    }
  }
}
