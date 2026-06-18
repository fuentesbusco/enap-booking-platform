import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnouncementsService } from '../../../core/services/announcements.service';
import { Announcement } from '../../../core/models';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-announcements.component.html',
})
export class AdminAnnouncementsComponent implements OnInit {
  private service = inject(AnnouncementsService);
  announcements: Announcement[] = [];

  // Modal State
  showModal = false;

  // Form Fields
  formTitle = '';
  formBody = '';
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
    this.formIsPinned = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveAnnouncement() {
    if (!this.formTitle.trim() || !this.formBody.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const annData = {
      title: this.formTitle,
      body: this.formBody,
      is_pinned: this.formIsPinned,
    };

    this.service.create(annData).subscribe(() => {
      this.loadAnnouncements();
      this.closeModal();
    });
  }

  deleteAnnouncement(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este aviso?')) {
      this.service.delete(id).subscribe((success) => {
        if (success) {
          this.loadAnnouncements();
        }
      });
    }
  }
}
