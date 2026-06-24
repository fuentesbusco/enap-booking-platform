import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingsService } from '../../../core/services/bookings.service';
import { ToastService } from '../../../core/services/toast.service';
import { WeatherService } from '../../../core/services/weather.service';
import { SpacesService } from '../../../core/services/spaces.service';
import { Booking, BookingStatus, Space } from '../../../core/models';

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
  private spacesService = inject(SpacesService);

  bookings: Booking[] = [];
  filtered: Booking[] = [];
  cabins: Space[] = [];
  quinchos: Space[] = [];
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
    this.spacesService.getAll().subscribe((all) => {
      this.cabins = all.filter((s) => s.type === 'cabin');
      this.quinchos = all.filter((s) => s.type === 'quincho' && s.name !== 'Club House');
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

  changeUnit(b: Booking, newUnit: string) {
    if (!newUnit) return;

    this.loading = true;
    this.bookingsService.assignSpace(b.id, b.space.id, newUnit).subscribe({
      next: (updatedBooking) => {
        this.toastService.success(`Unidad de la reserva ${b.booking_code} cambiada a ${newUnit} con éxito.`);
        this.bookingsService.getAll().subscribe((d) => {
          this.bookings = d;
          this.applyFilter();
          this.loading = false;
        });
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Error al cambiar la asignación de la unidad.');
        this.loading = false;
        this.bookingsService.getAll().subscribe((d) => {
          this.bookings = d;
          this.applyFilter();
        });
      }
    });
  }

  getUnitsList(space: Space): string[] {
    const total = space.total_units || 1;
    if (total <= 1) {
      return [space.name];
    }
    
    let prefix = space.name;
    if (space.type === 'cabin') {
      prefix = 'Cabaña';
    } else if (space.type === 'quincho') {
      if (space.name.toLowerCase().includes('club house')) {
        return ['Club House'];
      }
      prefix = 'Quincho';
    }
    
    const list: string[] = [];
    for (let i = 1; i <= total; i++) {
      list.push(`${prefix} ${i}`);
    }
    return list;
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
