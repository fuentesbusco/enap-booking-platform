import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingsService } from '../../../core/services/bookings.service';
import { ToastService } from '../../../core/services/toast.service';
import { WeatherService } from '../../../core/services/weather.service';
import { Booking, BookingStatus } from '../../../core/models';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-bookings.component.html',
})
export class AdminBookingsComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  private toastService = inject(ToastService);
  private weatherService = inject(WeatherService);

  bookings: Booking[] = [];
  filtered: Booking[] = [];
  activeFilter = 'all';
  loading = false;

  // Clima Limache
  weatherData: any = null;
  weatherLoading = false;

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
    this.getWeather();
  }

  getWeather() {
    this.weatherLoading = true;
    this.weatherService.getLimacheWeather().subscribe({
      next: (data) => {
        this.weatherData = data;
        this.weatherLoading = false;
      },
      error: (err) => {
        this.weatherLoading = false;
        console.error(err);
      }
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
    if (this.loading) return;
    this.loading = true;
    this.bookingsService.approveBooking(b.id).subscribe({
      next: () => {
        this.toastService.success(`Reserva ${b.booking_code} aprobada con éxito.`);
        this.bookingsService.getAll().subscribe((d) => {
          this.bookings = d;
          this.applyFilter();
          this.loading = false;
        });
      },
      error: () => {
        this.toastService.error('Ocurrió un error al aprobar la reserva.');
        this.loading = false;
      }
    });
  }

  reject(b: Booking) {
    if (this.loading) return;
    const notes = prompt('Ingrese observaciones para el rechazo del comprobante (opcional):') || 'Comprobante no válido o ilegible.';
    this.loading = true;
    this.bookingsService.rejectBooking(b.id, notes).subscribe({
      next: () => {
        this.toastService.success(`Reserva ${b.booking_code} rechazada.`);
        this.bookingsService.getAll().subscribe((d) => {
          this.bookings = d;
          this.applyFilter();
          this.loading = false;
        });
      },
      error: () => {
        this.toastService.error('Ocurrió un error al rechazar la reserva.');
        this.loading = false;
      }
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
