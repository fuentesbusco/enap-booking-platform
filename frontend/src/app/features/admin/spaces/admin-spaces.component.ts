import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpacesService } from '../../../core/services/spaces.service';
import { Space, SpaceType } from '../../../core/models';

@Component({
  selector: 'app-admin-spaces',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-spaces.component.html',
})
export class AdminSpacesComponent implements OnInit {
  spaces: Space[] = [];
  
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
  formImage = '';
  formAmenities = '';

  constructor(private spacesService: SpacesService) {}

  ngOnInit() {
    this.loadSpaces();
  }

  loadSpaces() {
    this.spacesService.getAll().subscribe((list) => {
      this.spaces = list;
    });
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
    this.formImage = 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80';
    this.formAmenities = 'Cocina equipada, TV, Parrilla, Estacionamiento';
    
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
    this.formImage = space.images[0] || '';
    this.formAmenities = space.amenities.join(', ');
    
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSpace() {
    if (!this.formName.trim() || !this.formDescription.trim()) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

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
      images: [this.formImage || 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80'],
      amenities: amenitiesList,
    };

    if (this.isEditMode && this.editingId !== null) {
      this.spacesService.update(this.editingId, spaceData).subscribe(() => {
        this.loadSpaces();
        this.closeModal();
      });
    } else {
      this.spacesService.create(spaceData).subscribe(() => {
        this.loadSpaces();
        this.closeModal();
      });
    }
  }

  deleteSpace(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este espacio? Esta acción no se puede deshacer.')) {
      this.spacesService.delete(id).subscribe((success) => {
        if (success) {
          this.loadSpaces();
        }
      });
    }
  }
}
