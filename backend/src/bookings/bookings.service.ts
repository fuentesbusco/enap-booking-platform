import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { GuestEntity } from './guest.entity';
import { SpaceEntity } from '../spaces/space.entity';
import { UserEntity } from '../users/user.entity';
import { PriceBreakdown, BookingStatus, BLOCKED_DATES } from '../models';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class BookingsService {
  private blockedDates: Record<number, string[]> = { ...BLOCKED_DATES };

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(GuestEntity)
    private readonly guestRepository: Repository<GuestEntity>,
    private readonly spacesService: SpacesService,
  ) {}

  async getAll(): Promise<Booking[]> {
    return this.bookingRepository.find();
  }

  async getByUser(userId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  calculatePriceBreakdown(space: SpaceEntity, checkIn: string, checkOut: string, guestCount: number, role: string): PriceBreakdown {
    const isSocio = role === 'socio';
    const days = this.daysDiff(checkIn, checkOut) || 1;
    const unitPrice = isSocio ? space.socioPrice : space.basePrice;
    const base = unitPrice * days;
    const freeGuests = isSocio ? space.freeGuestsForSocio : 0;
    const payable = Math.max(0, guestCount - freeGuests);
    const guestsTotal = payable * space.guestPrice;
    const discount = (guestCount - payable) * space.guestPrice;
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

  async createBooking(
    user: UserEntity,
    spaceId: number,
    checkIn: string,
    checkOut: string,
    guests: { full_name: string; rut: string; phone?: string }[],
  ): Promise<Booking> {
    const space = await this.spacesService.getById(spaceId);

    if (guests.length > space.maxCapacity) {
      throw new BadRequestException(`El espacio supera la capacidad máxima permitida de ${space.maxCapacity} personas.`);
    }

    const isBlocked = await this.isBlocked(spaceId, checkIn, checkOut);
    if (isBlocked) {
      throw new BadRequestException('Las fechas seleccionadas no están disponibles.');
    }

    const breakdown = this.calculatePriceBreakdown(space, checkIn, checkOut, guests.length, user.role);
    
    // Generate Booking Code based on database count
    const totalCount = await this.bookingRepository.count();
    const nextId = totalCount + 1;
    const bookingCode = `ENP-2025-${String(nextId).padStart(5, '0')}`;

    const newBooking = this.bookingRepository.create({
      bookingCode,
      user,
      space,
      checkIn,
      checkOut,
      status: 'pending_payment',
      totalAmount: breakdown.total,
      priceBreakdown: breakdown,
    });

    const savedBooking = await this.bookingRepository.save(newBooking);

    // Create guests referencing saved booking
    const guestEntities = guests.map((g) =>
      this.guestRepository.create({
        fullName: g.full_name,
        rut: g.rut,
        phone: g.phone,
        booking: savedBooking,
      }),
    );
    await this.guestRepository.save(guestEntities);

    // Return the full populated booking entity
    return this.getById(savedBooking.id);
  }

  async approveBooking(id: number): Promise<Booking> {
    const booking = await this.getById(id);
    booking.status = 'confirmed';
    return this.bookingRepository.save(booking);
  }

  async rejectBooking(id: number, notes: string): Promise<Booking> {
    const booking = await this.getById(id);
    booking.status = 'rejected';
    booking.adminNotes = notes;
    return this.bookingRepository.save(booking);
  }

  async uploadReceipt(id: number, receiptUrl: string): Promise<Booking> {
    const booking = await this.getById(id);
    booking.status = 'pending_approval';
    booking.receiptUrl = receiptUrl;
    return this.bookingRepository.save(booking);
  }

  private async isBlocked(spaceId: number, checkIn: string, checkOut: string): Promise<boolean> {
    const datesToCheck = this.getDatesInRange(checkIn, checkOut);
    
    // 1. Static check
    const staticBlocks = this.blockedDates[spaceId] || [];
    const hasStaticBlock = datesToCheck.some((d) => staticBlocks.includes(d));
    if (hasStaticBlock) return true;

    // 2. Overlapping check in DB
    const overlapping = await this.bookingRepository.createQueryBuilder('booking')
      .where('booking.spaceId = :spaceId', { spaceId })
      .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
      .andWhere('booking.check_in <= :checkOut', { checkOut })
      .andWhere('booking.check_out >= :checkIn', { checkIn })
      .getMany();

    return overlapping.length > 0;
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
