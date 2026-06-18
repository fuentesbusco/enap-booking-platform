import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryService } from '../../core/services/gallery.service';
import { GalleryItem } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './gallery.component.html',
})
export class GalleryComponent implements OnInit {
  private galleryService = inject(GalleryService);

  items: GalleryItem[] = [];
  loading = false;

  // Lightbox State
  selectedIndex: number | null = null;

  ngOnInit() {
    this.loadGallery();
  }

  loadGallery() {
    this.loading = true;
    this.galleryService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading gallery:', err);
        this.loading = false;
      }
    });
  }

  openLightbox(index: number) {
    this.selectedIndex = index;
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.selectedIndex = null;
    document.body.style.overflow = '';
  }

  prevImage(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedIndex !== null && this.items.length > 0) {
      this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
    }
  }

  nextImage(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedIndex !== null && this.items.length > 0) {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.selectedIndex !== null) {
      if (event.key === 'ArrowLeft') {
        this.prevImage();
      } else if (event.key === 'ArrowRight') {
        this.nextImage();
      } else if (event.key === 'Escape') {
        this.closeLightbox();
      }
    }
  }
}
