import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BookingsService } from '../../../core/services/bookings.service';
import { ToastService } from '../../../core/services/toast.service';
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
  private http = inject(HttpClient);

  bookings: Booking[] = [];
  filtered: Booking[] = [];
  activeFilter = 'all';
  loading = false;

  // Clima Limache
  weatherData: any = null;
  weatherLoading = false;
  weatherError = false;

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
    this.weatherError = false;
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=-33.0153&longitude=-71.2675&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Santiago';
    
    this.http.get(url).subscribe({
      next: (res: any) => {
        this.weatherData = {
          temp: Math.round(res.current.temperature_2m),
          humidity: res.current.relative_humidity_2m,
          wind: res.current.wind_speed_10m,
          code: res.current.weather_code,
          text: this.getWeatherText(res.current.weather_code),
          icon: this.getWeatherEmoji(res.current.weather_code),
          forecast: res.daily.time.slice(1, 4).map((time: string, idx: number) => ({
            date: time,
            max: Math.round(res.daily.temperature_2m_max[idx + 1]),
            min: Math.round(res.daily.temperature_2m_min[idx + 1]),
            icon: this.getWeatherEmoji(res.daily.weather_code[idx + 1]),
            text: this.getWeatherText(res.daily.weather_code[idx + 1]),
          }))
        };
        this.weatherLoading = false;
      },
      error: (err) => {
        console.error('Weather API failed, using fallback mock data:', err);
        this.setMockWeather();
      }
    });
  }

  setMockWeather() {
    this.weatherData = {
      temp: 18,
      humidity: 65,
      wind: 12,
      code: 3,
      text: 'Parcialmente Nublado',
      icon: '⛅',
      forecast: [
        { date: 'Mañana', max: 20, min: 9, icon: '☀️', text: 'Despejado' },
        { date: 'Pasado Mañana', max: 21, min: 10, icon: '☀️', text: 'Despejado' },
        { date: 'Siguiente Día', max: 17, min: 11, icon: '☁️', text: 'Nublado' },
      ]
    };
    this.weatherLoading = false;
  }

  getWeatherEmoji(code: number): string {
    if (code === 0) return '☀️'; 
    if (code >= 1 && code <= 3) return '⛅'; 
    if (code >= 45 && code <= 48) return '🌫️'; 
    if (code >= 51 && code <= 67) return '🌧️'; 
    if (code >= 71 && code <= 77) return '❄️'; 
    if (code >= 80 && code <= 82) return '🌦️'; 
    if (code >= 95 && code <= 99) return '⛈️'; 
    return '☀️';
  }

  getWeatherText(code: number): string {
    if (code === 0) return 'Despejado';
    if (code === 1) return 'Mayormente Despejado';
    if (code === 2) return 'Parcialmente Nublado';
    if (code === 3) return 'Nublado';
    if (code >= 45 && code <= 48) return 'Niebla';
    if (code >= 51 && code <= 55) return 'Llovizna';
    if (code >= 61 && code <= 65) return 'Lluvia';
    if (code >= 80 && code <= 82) return 'Chubascos';
    if (code >= 95 && code <= 99) return 'Tormenta';
    return 'Templado';
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
