import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingsService } from '../../../core/services/bookings.service';
import { Booking, BookingStatus } from '../../../core/models';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-bookings.component.html',
})
export class AdminBookingsComponent implements OnInit {
  private bookingsService = inject(BookingsService);

  bookings: Booking[] = [];
  filtered: Booking[] = [];
  activeFilter = 'all';

  filters = [
    { label: 'Todas', value: 'all' },
    { label: 'Por aprobar', value: 'pending_approval' },
    { label: 'Sin pago', value: 'pending_payment' },
    { label: 'Confirmadas', value: 'confirmed' },
    { label: 'Canceladas', value: 'cancelled' },
  ];

  ngOnInit() {
    this.bookingsService.getAll().subscribe((d) => {
      this.bookings = d;
      this.applyFilter();
    });
  }

  applyFilter() {
    this.filtered =
      this.activeFilter === 'all'
        ? this.bookings
        : this.bookings.filter((b) => b.status === this.activeFilter);
  }

  count(status: string) {
    return this.bookings.filter((b) => b.status === status).length;
  }

  approve(b: Booking) {
    this.bookingsService.approveBooking(b.id).subscribe(() => {
      this.bookingsService.getAll().subscribe((d) => {
        this.bookings = d;
        this.applyFilter();
      });
    });
  }

  reject(b: Booking) {
    const notes = prompt('Ingrese observaciones para el rechazo del comprobante (opcional):') || 'Comprobante no válido o ilegible.';
    this.bookingsService.rejectBooking(b.id, notes).subscribe(() => {
      this.bookingsService.getAll().subscribe((d) => {
        this.bookings = d;
        this.applyFilter();
      });
    });
  }

  statusLabel(s: BookingStatus) {
    const m: Record<BookingStatus, string> = {
      pending_payment: 'Sin pago',
      pending_approval: 'Por aprobar',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      rejected: 'Rechazada',
      expired: 'Caducada',
    };
    return m[s];
  }

  badgeClass(s: BookingStatus) {
    const m: Record<BookingStatus, string> = {
      pending_payment: 'badge badge-yellow',
      pending_approval: 'badge badge-blue',
      confirmed: 'badge badge-green',
      cancelled: 'badge badge-red',
      rejected: 'badge badge-red',
      expired: 'badge badge-gray',
    };
    return m[s];
  }
}
