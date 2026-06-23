import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking, Guest, Space, PriceBreakdown, mapBookingToFrontend } from '../models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  getAll(): Observable<Booking[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/bookings`).pipe(
      map((list) => list.map(mapBookingToFrontend))
    );
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/bookings/me`).pipe(
      map((list) => list.map(mapBookingToFrontend))
    );
  }

  getById(id: number): Observable<Booking | undefined> {
    return this.http.get<any>(`${environment.apiUrl}/bookings/${id}`).pipe(
      map(mapBookingToFrontend)
    );
  }

  calculatePrice(
    space: Space,
    checkIn: string,
    checkOut: string,
    guestsOrCount: number | Guest[],
    isForThirdParty: boolean = false,
    visitType?: string,
  ): PriceBreakdown {
    const role = this.auth.currentUser()?.role ?? 'external';
    const resolvedRole = isForThirdParty ? 'external' : role;
    const isSocio = resolvedRole === 'socio';
    const days = this.daysDiff(checkIn, checkOut) || 1;

    // Check if the space is a generic quincho
    const isGenericQuincho = space.type === 'quincho' && space.name !== 'Club House';

    if (isGenericQuincho) {
      if (visitType === 'group') {
        const guestCount = typeof guestsOrCount === 'number' ? guestsOrCount : guestsOrCount.length;
        const total = guestCount * space.guest_price;
        return {
          base: 0,
          days,
          guests_count: guestCount,
          guests_total: total,
          free_guests_applied: 0,
          discount: 0,
          total,
        };
      } else {
        const limit = isSocio ? 15 : 10;
        const unitPrice = isSocio ? space.socio_price : space.base_price;
        const base = unitPrice * days;
        
        let payable = 0;
        const guestCount = typeof guestsOrCount === 'number' ? guestsOrCount : guestsOrCount.length;
        if (typeof guestsOrCount === 'number') {
          payable = Math.max(0, guestsOrCount - limit);
        } else {
          const chargeableGuests = guestsOrCount.filter(
            (g) => g.age === undefined || g.age === null || g.age >= 12
          ).length;
          payable = Math.max(0, chargeableGuests - limit);
        }
        
        const guestsTotal = payable * space.guest_price;
        return {
          base,
          days,
          guests_count: guestCount,
          guests_total: guestsTotal,
          free_guests_applied: 0,
          discount: 0,
          total: base + guestsTotal,
        };
      }
    }

    const guestCount = typeof guestsOrCount === 'number' ? guestsOrCount : guestsOrCount.length;
    const unitPrice = isSocio ? space.socio_price : space.base_price;
    const base = unitPrice * days;
    const freeGuests = isSocio ? space.free_guests_for_socio : 0;
    const payable = Math.max(0, guestCount - freeGuests);
    const guestsTotal = payable * space.guest_price;
    const freeGuestsApplied = Math.min(guestCount, freeGuests);
    const discount = freeGuestsApplied * space.guest_price;
    return {
      base,
      days,
      guests_count: guestCount,
      guests_total: guestsTotal,
      free_guests_applied: freeGuestsApplied,
      discount,
      total: base + guestsTotal,
    };
  }

  createBooking(data: {
    space: Space;
    check_in: string;
    check_out: string;
    guests: Guest[];
    isForThirdParty?: boolean;
    thirdPartyName?: string;
    thirdPartyRut?: string;
    thirdPartyPhone?: string;
    adminCreatedForExternal?: boolean;
    visitType?: string;
    additional_email?: string;
  }): Observable<Booking> {
    const body = {
      spaceId: data.space.id,
      checkIn: data.check_in,
      checkOut: data.check_out,
      guests: data.guests,
      isForThirdParty: data.isForThirdParty,
      thirdPartyName: data.thirdPartyName,
      thirdPartyRut: data.thirdPartyRut,
      thirdPartyPhone: data.thirdPartyPhone,
      adminCreatedForExternal: data.adminCreatedForExternal,
      visitType: data.visitType,
      additionalEmail: data.additional_email,
    };
    return this.http.post<any>(`${environment.apiUrl}/bookings`, body).pipe(
      map(mapBookingToFrontend)
    );
  }

  approveBooking(id: number): Observable<Booking> {
    return this.http.patch<any>(`${environment.apiUrl}/bookings/${id}/approve`, {}).pipe(
      map(mapBookingToFrontend)
    );
  }

  rejectBooking(id: number, notes: string): Observable<Booking> {
    return this.http.patch<any>(`${environment.apiUrl}/bookings/${id}/reject`, { notes }).pipe(
      map(mapBookingToFrontend)
    );
  }

  uploadReceipt(bookingId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('bookingId', bookingId.toString());
    formData.append('file', file);
    return this.http.post<any>(`${environment.apiUrl}/bookings/upload-receipt`, formData);
  }

  confirmPayment(bookingCode: string, paymentId: string, status: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/bookings/confirm-payment`, {
      bookingCode,
      paymentId,
      status,
    });
  }

  sendExternalRequest(data: {
    fullName: string;
    email: string;
    phone: string;
    spaceName: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    message?: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/bookings/external-request`, data);
  }

  assignSpace(bookingId: number, spaceId: number): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/bookings/${bookingId}/assign-space`, { spaceId }).pipe(
      map(mapBookingToFrontend)
    );
  }

  private daysDiff(a: string, b: string): number {
    return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  }
}
