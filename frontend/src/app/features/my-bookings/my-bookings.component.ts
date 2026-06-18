import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { BookingsService } from '../../core/services/bookings.service';
import { Booking, BookingStatus } from '../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './my-bookings.component.html',
})
export class MyBookingsComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  private route = inject(ActivatedRoute);
  
  bookings: Booking[] = [];
  paymentStatus: string | null = null;
  paymentCode: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.paymentStatus = params['payment'] || null;
      this.paymentCode = params['code'] || null;
      
      const mpStatus = params['status'];
      const paymentId = params['payment_id'] || params['collection_id'];

      if (this.paymentStatus === 'success' && this.paymentCode && paymentId && mpStatus === 'approved') {
        this.bookingsService.confirmPayment(this.paymentCode, paymentId, mpStatus).subscribe({
          next: () => {
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
    this.bookingsService.getMyBookings().subscribe((d) => (this.bookings = d));
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
