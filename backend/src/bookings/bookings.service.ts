import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Booking, Guest, Space, PriceBreakdown, MOCK_BOOKINGS, BLOCKED_DATES, MOCK_SPACES, User } from '../models';

@Injectable()
export class BookingsService {
  private bookings: Booking[] = [...MOCK_BOOKINGS];
  private blockedDates: Record<number, string[]> = { ...BLOCKED_DATES };

  getAll(): Booking[] {
    return this.bookings;
  }

  getByUser(userId: number): Booking[] {
    return this.bookings.filter((b) => b.user.id === userId);
  }

  getById(id: number): Booking {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  calculatePriceBreakdown(space: Space, checkIn: string, checkOut: string, guestCount: number, role: string): PriceBreakdown {
    const isSocio = role === 'socio';
    const days = this.daysDiff(checkIn, checkOut) || 1;
    const unitPrice = isSocio ? space.socio_price : space.base_price;
    const base = unitPrice * days;
    const freeGuests = isSocio ? space.free_guests_for_socio : 0;
    const payable = Math.max(0, guestCount - freeGuests);
    const guestsTotal = payable * space.guest_price;
    const discount = (guestCount - payable) * space.guest_price;
    return {
      base,
      days,
      guests_count: guestCount,
      guests_total: guestsTotal,
      free_guests_applied: guestCount - payable,
      discount,
      total: base + guestsTotal,
    };
  }

  createBooking(
    user: User,
    spaceId: number,
    checkIn: string,
    checkOut: string,
    guests: Guest[],
  ): Booking {
    const space = MOCK_SPACES.find((s) => s.id === spaceId);
    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (guests.length > space.max_capacity) {
      throw new BadRequestException(`El espacio supera la capacidad máxima permitida de ${space.max_capacity} personas.`);
    }

    if (this.isBlocked(spaceId, checkIn, checkOut)) {
      throw new BadRequestException('Las fechas seleccionadas no están disponibles.');
    }

    const breakdown = this.calculatePriceBreakdown(space, checkIn, checkOut, guests.length, user.role);
    const nextId = this.bookings.length > 0 ? Math.max(...this.bookings.map((b) => b.id)) + 1 : 1;

    const booking: Booking = {
      id: nextId,
      booking_code: `ENP-2025-${String(nextId).padStart(5, '0')}`,
      user,
      space,
      check_in: checkIn,
      check_out: checkOut,
      status: 'pending_payment',
      total_amount: breakdown.total,
      guests: guests.map((g, idx) => ({ ...g, id: idx + 1 })),
      created_at: new Date().toISOString(),
      price_breakdown: breakdown,
    };

    this.bookings.push(booking);
    return booking;
  }

  approveBooking(id: number): Booking {
    const booking = this.getById(id);
    booking.status = 'confirmed';
    return booking;
  }

  rejectBooking(id: number, notes: string): Booking {
    const booking = this.getById(id);
    booking.status = 'rejected';
    booking.admin_notes = notes;
    return booking;
  }

  uploadReceipt(id: number, receiptUrl: string): Booking {
    const booking = this.getById(id);
    booking.status = 'pending_approval';
    booking.receipt_url = receiptUrl;
    return booking;
  }

  private isBlocked(spaceId: number, checkIn: string, checkOut: string): boolean {
    const datesToCheck = this.getDatesInRange(checkIn, checkOut);
    
    // 1. Check static blocked dates
    const staticBlocks = this.blockedDates[spaceId] || [];
    const hasStaticBlock = datesToCheck.some((d) => staticBlocks.includes(d));
    if (hasStaticBlock) return true;

    // 2. Check overlap with active bookings (confirmed / pending_approval)
    const spaceBookings = this.bookings.filter(
      (b) => b.space.id === spaceId && (b.status === 'confirmed' || b.status === 'pending_approval'),
    );

    for (const b of spaceBookings) {
      const existingDates = this.getDatesInRange(b.check_in, b.check_out);
      const collision = datesToCheck.some((d) => existingDates.includes(d));
      if (collision) return true;
    }

    return false;
  }

  private getDatesInRange(startStr: string, endStr: string): string[] {
    const dates: string[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    const current = new Date(start);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  private daysDiff(a: string, b: string): number {
    return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  }
}
