import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking, Guest, Space, PriceBreakdown } from '../models';
import { MOCK_BOOKINGS } from '../mock-data';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private bookings = signal<Booking[]>([...MOCK_BOOKINGS]);

  constructor(private auth: AuthService) {}

  getAll(): Observable<Booking[]> {
    return of(this.bookings());
  }

  getMyBookings(): Observable<Booking[]> {
    const uid = this.auth.currentUser()?.id;
    return of(this.bookings().filter((b) => b.user.id === uid));
  }

  getById(id: number): Observable<Booking | undefined> {
    return of(this.bookings().find((b) => b.id === id));
  }

  calculatePrice(space: Space, checkIn: string, checkOut: string, guestCount: number): PriceBreakdown {
    const role = this.auth.currentUser()?.role ?? 'external';
    const isSocio = role === 'socio';
    const days = this.daysDiff(checkIn, checkOut) || 1;
    const unitPrice = isSocio ? space.socio_price : space.base_price;
    const base = unitPrice * days;
    const freeGuests = isSocio ? space.free_guests_for_socio : 0;
    const payable = Math.max(0, guestCount - freeGuests);
    const guestsTotal = payable * space.guest_price;
    const discount = (guestCount - payable) * space.guest_price;
    return {
      base, days,
      guests_count: guestCount,
      guests_total: guestsTotal,
      free_guests_applied: guestCount - payable,
      discount,
      total: base + guestsTotal,
    };
  }

  createBooking(data: {
    space: Space;
    check_in: string;
    check_out: string;
    guests: Guest[];
    receipt_url?: string;
  }): Observable<Booking> {
    const user = this.auth.currentUser()!;
    const breakdown = this.calculatePrice(data.space, data.check_in, data.check_out, data.guests.length);
    const next = this.bookings().length + 1;
    const booking: Booking = {
      id: next,
      booking_code: `ENP-2025-${String(next).padStart(5, '0')}`,
      user,
      space: data.space,
      check_in: data.check_in,
      check_out: data.check_out,
      status: data.receipt_url ? 'pending_approval' : 'pending_payment',
      total_amount: breakdown.total,
      guests: data.guests,
      receipt_url: data.receipt_url,
      created_at: new Date().toISOString(),
      price_breakdown: breakdown,
    };
    this.bookings.update((list) => [...list, booking]);
    return of(booking);
  }

  approveBooking(id: number): void {
    this.bookings.update((list) =>
      list.map((b) => b.id === id ? { ...b, status: 'confirmed' as const } : b),
    );
  }

  rejectBooking(id: number): void {
    this.bookings.update((list) =>
      list.map((b) => b.id === id ? { ...b, status: 'rejected' as const } : b),
    );
  }

  private daysDiff(a: string, b: string): number {
    return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  }
}
