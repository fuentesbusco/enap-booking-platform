import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../../core/services/feedback.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-feedback.component.html',
})
export class AdminFeedbackComponent implements OnInit {
  private feedbackService = inject(FeedbackService);
  private toastService = inject(ToastService);

  feedbacks: any[] = [];
  filtered: any[] = [];
  loading = false;
  activeFilter: 'all' | 'pending_approval' | 'approved' | 'rejected' = 'all';

  ngOnInit() {
    this.loadFeedbacks();
  }

  loadFeedbacks() {
    this.loading = true;
    this.feedbackService.getAll().subscribe({
      next: (res) => {
        this.feedbacks = res.feedbacks || [];
        this.filterFeedbacks();
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Error al cargar comentarios de los socios.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  filterFeedbacks() {
    if (this.activeFilter === 'all') {
      this.filtered = this.feedbacks;
    } else {
      this.filtered = this.feedbacks.filter(f => f.status === this.activeFilter);
    }
  }

  changeFilter(filter: 'all' | 'pending_approval' | 'approved' | 'rejected') {
    this.activeFilter = filter;
    this.filterFeedbacks();
  }

  approve(id: number) {
    this.loading = true;
    this.feedbackService.moderate(id, 'approved').subscribe({
      next: () => {
        this.toastService.success('Opinión aprobada. Se mostrará públicamente.');
        this.loadFeedbacks();
      },
      error: (err) => {
        this.toastService.error('Error al moderar la opinión.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  reject(id: number) {
    if (confirm('¿Estás seguro de que deseas rechazar este comentario?')) {
      this.loading = true;
      this.feedbackService.moderate(id, 'rejected').subscribe({
        next: () => {
          this.toastService.success('Opinión rechazada.');
          this.loadFeedbacks();
        },
        error: (err) => {
          this.toastService.error('Error al moderar la opinión.');
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  statusLabel(status: string) {
    const map: Record<string, string> = {
      pending_approval: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };
    return map[status] || status;
  }

  badgeClass(status: string) {
    const map: Record<string, string> = {
      pending_approval: 'badge badge-blue',
      approved: 'badge badge-green',
      rejected: 'badge badge-red'
    };
    return map[status] || 'badge';
  }

  countByStatus(status: 'pending_approval' | 'approved' | 'rejected'): number {
    return this.feedbacks.filter(f => f.status === status).length;
  }
}
