import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { BookingsService } from '../../core/services/bookings.service';
import { MercadoPagoService } from '../../core/services/mercadopago.service';
import { ToastService } from '../../core/services/toast.service';
import { Booking, BookingStatus } from '../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './my-bookings.component.html',
})
export class MyBookingsComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  private mpService = inject(MercadoPagoService);
  private toastService = inject(ToastService);
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
        this.bookings = d;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
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
      success: `${window.location.origin}/mis-reservas?payment=success&code=${booking.booking_code}`,
      failure: `${window.location.origin}/mis-reservas?payment=failure&code=${booking.booking_code}`,
      pending: `${window.location.origin}/mis-reservas?payment=pending&code=${booking.booking_code}`
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
