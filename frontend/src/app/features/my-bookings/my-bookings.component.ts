import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { BookingsService } from '../../core/services/bookings.service';
import { MercadoPagoService } from '../../core/services/mercadopago.service';
import { ToastService } from '../../core/services/toast.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { Booking, BookingStatus } from '../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './my-bookings.component.html',
})
export class MyBookingsComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  private mpService = inject(MercadoPagoService);
  private toastService = inject(ToastService);
  private feedbackService = inject(FeedbackService);
  private route = inject(ActivatedRoute);
  
  bookings: Booking[] = [];
  paymentStatus: string | null = null;
  paymentCode: string | null = null;
  loading = false;

  expandedBookingId: number | null = null;
  activePaymentMethods: Record<number, 'transfer' | 'mercadopago'> = {};
  selectedFiles: Record<number, File> = {};
  uploading: Record<number, boolean> = {};
  paying: Record<number, boolean> = {};

  // Feedback Modal state
  showFeedbackModal = false;
  selectedBookingForFeedback: Booking | null = null;
  feedbackRating = 5;
  feedbackComment = '';
  submittingFeedback = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.paymentStatus = params['payment'] || null;
      this.paymentCode = params['code'] || null;
      
      const mpStatus = params['status'];
      const paymentId = params['payment_id'] || params['collection_id'];

      if (this.paymentStatus === 'success' && this.paymentCode && paymentId && mpStatus === 'approved') {
        this.loading = true;
        this.bookingsService.confirmPayment(this.paymentCode, paymentId, mpStatus).subscribe({
          next: () => {
            this.toastService.success('¡Pago verificado y reserva confirmada!');
            this.loadBookings();
          },
          error: (err) => {
            console.error('Error confirming payment with backend:', err);
            this.loadBookings();
          }
        });
      } else {
        this.loadBookings();
      }
    });
  }

  loadBookings() {
    this.loading = true;
    this.bookingsService.getMyBookings().subscribe({
      next: (d) => {
        // Ordenar desde las reservas más nuevas (por id) a las más antiguas
        this.bookings = d.sort((a, b) => b.id - a.id);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  isEligibleForFeedback(b: Booking): boolean {
    if (b.status !== 'confirmed') return false;
    if (b.feedback) return false;
    const today = new Date().toISOString().split('T')[0];
    return b.check_out <= today;
  }

  openFeedbackModal(b: Booking) {
    this.selectedBookingForFeedback = b;
    this.feedbackRating = 5;
    this.feedbackComment = '';
    this.showFeedbackModal = true;
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
    this.selectedBookingForFeedback = null;
  }

  setFeedbackRating(rating: number) {
    this.feedbackRating = rating;
  }

  submitFeedback() {
    if (!this.selectedBookingForFeedback) return;
    if (!this.feedbackComment.trim()) {
      this.toastService.warning('Por favor escribe un comentario.');
      return;
    }

    this.submittingFeedback = true;
    this.feedbackService.submitFeedback(
      this.selectedBookingForFeedback.id,
      this.feedbackRating,
      this.feedbackComment.trim()
    ).subscribe({
      next: (res) => {
        this.submittingFeedback = false;
        this.toastService.success('¡Gracias por tu opinión! Quedará publicada una vez sea moderada.');
        this.closeFeedbackModal();
        this.loadBookings();
      },
      error: (err) => {
        this.submittingFeedback = false;
        this.toastService.error(err.error?.message || 'Error al enviar la opinión.');
        console.error(err);
      }
    });
  }

  togglePaymentSection(bookingId: number) {
    if (this.expandedBookingId === bookingId) {
      this.expandedBookingId = null;
    } else {
      this.expandedBookingId = bookingId;
      if (!this.activePaymentMethods[bookingId]) {
        this.activePaymentMethods[bookingId] = 'transfer';
      }
    }
  }

  setPaymentMethod(bookingId: number, method: 'transfer' | 'mercadopago') {
    this.activePaymentMethods[bookingId] = method;
  }

  onFileSelected(event: any, bookingId: number) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFiles[bookingId] = file;
    }
  }

  uploadReceipt(bookingId: number) {
    const file = this.selectedFiles[bookingId];
    if (!file) {
      this.toastService.warning('Por favor seleccione el comprobante primero.');
      return;
    }

    this.uploading[bookingId] = true;
    this.bookingsService.uploadReceipt(bookingId, file).subscribe({
      next: () => {
        this.uploading[bookingId] = false;
        this.toastService.success('¡Comprobante subido! Tu reserva pasará a revisión.');
        delete this.selectedFiles[bookingId];
        this.expandedBookingId = null;
        this.loadBookings();
      },
      error: (err) => {
        this.uploading[bookingId] = false;
        this.toastService.error('Error al subir el comprobante. Intente nuevamente.');
        console.error(err);
      }
    });
  }

  payWithMercadoPago(booking: Booking) {
    this.paying[booking.id] = true;
    const backUrls = {
      success: `${window.location.origin}/mercadopago/success?external_reference=${booking.booking_code}`,
      failure: `${window.location.origin}/mercadopago/failure?external_reference=${booking.booking_code}`,
      pending: `${window.location.origin}/mercadopago/pending?external_reference=${booking.booking_code}`
    };

    const description = `Reserva ${booking.space.name} - Código ${booking.booking_code}`;
    this.mpService.createPreference(description, 1, booking.total_amount, backUrls).subscribe({
      next: (res) => {
        this.paying[booking.id] = false;
        if (res.success) {
          window.location.href = res.sandbox_init_point || res.init_point;
        } else {
          this.toastService.error('Error al iniciar Mercado Pago. Intente con transferencia.');
        }
      },
      error: (err) => {
        this.paying[booking.id] = false;
        this.toastService.error('Error de conexión con Mercado Pago.');
        console.error(err);
      }
    });
  }

  statusLabel(s: BookingStatus) {
    const map: Record<BookingStatus, string> = {
      pending_payment: 'Sin pago',
      pending_approval: 'En revisión',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      rejected: 'Rechazada',
      expired: 'Caducada',
    };
    return map[s];
  }

  badgeClass(s: BookingStatus) {
    const map: Record<BookingStatus, string> = {
      pending_payment: 'badge badge-yellow',
      pending_approval: 'badge badge-blue',
      confirmed: 'badge badge-green',
      cancelled: 'badge badge-red',
      rejected: 'badge badge-red',
      expired: 'badge badge-gray',
    };
    return map[s];
  }
}
