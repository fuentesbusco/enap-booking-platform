import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqService } from '../../../core/services/faq.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-faqs.component.html',
})
export class AdminFaqsComponent implements OnInit {
  private faqService = inject(FaqService);
  private toastService = inject(ToastService);

  faqs: any[] = [];
  loading = false;

  // Modal form state
  showModal = false;
  isEditMode = false;
  editingId: number | null = null;

  formQuestion = '';
  formAnswer = '';
  formOrder = 0;

  ngOnInit() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.loading = true;
    this.faqService.getAll().subscribe({
      next: (list) => {
        this.faqs = (list || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Error al cargar preguntas frecuentes.');
        this.loading = false;
        console.error(err);
      }
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingId = null;
    this.formQuestion = '';
    this.formAnswer = '';
    this.formOrder = this.faqs.length;
    this.showModal = true;
  }

  openEditModal(faq: any) {
    this.isEditMode = true;
    this.editingId = faq.id;
    this.formQuestion = faq.question;
    this.formAnswer = faq.answer;
    this.formOrder = faq.order || 0;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveFaq() {
    if (!this.formQuestion.trim() || !this.formAnswer.trim()) {
      this.toastService.warning('Complete todos los campos obligatorios.');
      return;
    }

    this.loading = true;
    const data = {
      question: this.formQuestion.trim(),
      answer: this.formAnswer.trim(),
      order: Number(this.formOrder),
    };

    if (this.isEditMode && this.editingId !== null) {
      this.faqService.update(this.editingId, data).subscribe({
        next: () => {
          this.toastService.success('Pregunta actualizada correctamente.');
          this.loadFaqs();
          this.closeModal();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al actualizar la pregunta.');
          this.loading = false;
        }
      });
    } else {
      this.faqService.create(data).subscribe({
        next: () => {
          this.toastService.success('Pregunta creada correctamente.');
          this.loadFaqs();
          this.closeModal();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al crear la pregunta.');
          this.loading = false;
        }
      });
    }
  }

  deleteFaq(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      this.loading = true;
      this.faqService.delete(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Pregunta eliminada.');
            this.loadFaqs();
          } else {
            this.toastService.error('No se pudo eliminar la pregunta.');
            this.loading = false;
          }
        },
        error: (err) => {
          this.toastService.error('Error al conectar con el servidor.');
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
}
