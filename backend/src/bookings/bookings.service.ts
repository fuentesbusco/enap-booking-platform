import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { GuestEntity } from './guest.entity';
import { SpaceEntity } from '../spaces/space.entity';
import { UserEntity } from '../users/user.entity';
import { PriceBreakdown, BookingStatus, BLOCKED_DATES } from '../models';
import { SpacesService } from '../spaces/spaces.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getBookingConfirmationEmailTemplate } from '../notifications/templates/booking-confirmation.template';
import { getBookingPaymentConfirmedEmailTemplate } from '../notifications/templates/booking-payment-confirmed.template';
import { getBookingPaymentRejectedEmailTemplate } from '../notifications/templates/booking-payment-rejected.template';
import { getAdminNewBookingEmailTemplate } from '../notifications/templates/admin-new-booking.template';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private blockedDates: Record<number, string[]> = { ...BLOCKED_DATES };

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(GuestEntity)
    private readonly guestRepository: Repository<GuestEntity>,
    private readonly spacesService: SpacesService,
    private readonly notificationsService: NotificationsService,
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

  calculatePriceBreakdown(
    space: SpaceEntity,
    checkIn: string,
    checkOut: string,
    guestCount: number,
    role: string,
    isForThirdParty: boolean = false,
  ): PriceBreakdown {
    const resolvedRole = isForThirdParty ? 'external' : role;
    const isSocio = resolvedRole === 'socio';
    const days = this.daysDiff(checkIn, checkOut) || 1;
    const unitPrice = isSocio ? space.socioPrice : space.basePrice;
    const base = unitPrice * days;
    const freeGuests = isSocio ? space.freeGuestsForSocio : 0;
    const payable = Math.max(0, guestCount - freeGuests);
    const guestsTotal = payable * space.guestPrice;
    const freeGuestsApplied = Math.min(guestCount, freeGuests);
    const discount = freeGuestsApplied * space.guestPrice;
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

  async createBooking(
    user: UserEntity,
    spaceId: number,
    checkIn: string,
    checkOut: string,
    guests: { full_name: string; rut: string; phone?: string }[],
    options?: {
      isForThirdParty?: boolean;
      thirdPartyName?: string;
      thirdPartyRut?: string;
      thirdPartyPhone?: string;
      adminCreatedForExternal?: boolean;
    },
  ): Promise<Booking> {
    const space = await this.spacesService.getById(spaceId);

    if (guests.length > space.maxCapacity) {
      throw new BadRequestException(`El espacio supera la capacidad máxima permitida de ${space.maxCapacity} personas.`);
    }

    const isBlocked = await this.isBlocked(spaceId, checkIn, checkOut, guests.length);
    if (isBlocked) {
      throw new BadRequestException('Las fechas seleccionadas no están disponibles.');
    }

    const resolvedRole = (options?.adminCreatedForExternal || options?.isForThirdParty) ? 'external' : user.role;
    const breakdown = this.calculatePriceBreakdown(
      space,
      checkIn,
      checkOut,
      guests.length,
      resolvedRole,
      options?.isForThirdParty
    );
    
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
      isForThirdParty: !!options?.isForThirdParty,
      thirdPartyName: options?.thirdPartyName,
      thirdPartyRut: options?.thirdPartyRut,
      thirdPartyPhone: options?.thirdPartyPhone,
      adminCreatedForExternal: !!options?.adminCreatedForExternal,
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
    const fullBooking = await this.getById(savedBooking.id);

    // Send confirmation email in the background to prevent SMTP latency or failures from blocking the API response
    if (fullBooking.user?.email) {
      const emailHtml = getBookingConfirmationEmailTemplate(fullBooking);
      this.notificationsService
        .sendEmail(
          fullBooking.user.email,
          `Confirmación de reserva realizada - Código: ${fullBooking.bookingCode}`,
          emailHtml,
        )
        .catch((error) => {
          this.logger.error(`Error al enviar correo de confirmación de reserva ${fullBooking.bookingCode}:`, error);
        });
    }

    // Send admin notification in the background
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sindicatoenap.cl';
    const adminEmailHtml = getAdminNewBookingEmailTemplate(fullBooking);
    this.notificationsService
      .sendEmail(
        adminEmail,
        `[Nueva Reserva] Código: ${fullBooking.bookingCode} - Recinto: ${fullBooking.space.name}`,
        adminEmailHtml,
      )
      .catch((error) => {
        this.logger.error(`Error al enviar correo de notificación de nueva reserva al administrador:`, error);
      });

    return fullBooking;
  }

  async approveBooking(id: number): Promise<Booking> {
    const booking = await this.getById(id);
    booking.status = 'confirmed';
    const savedBooking = await this.bookingRepository.save(booking);

    if (savedBooking.user?.email) {
      const emailHtml = getBookingPaymentConfirmedEmailTemplate(savedBooking);
      this.notificationsService
        .sendEmail(
          savedBooking.user.email,
          `Reserva Confirmada y Pago Aprobado - Código: ${savedBooking.bookingCode}`,
          emailHtml,
        )
        .catch((error) => {
          this.logger.error(`Error al enviar correo de aprobación de pago para reserva ${savedBooking.bookingCode}:`, error);
        });
    }

    return savedBooking;
  }

  async rejectBooking(id: number, notes: string): Promise<Booking> {
    const booking = await this.getById(id);
    booking.status = 'rejected';
    booking.adminNotes = notes;
    const savedBooking = await this.bookingRepository.save(booking);

    if (savedBooking.user?.email) {
      const emailHtml = getBookingPaymentRejectedEmailTemplate(savedBooking);
      this.notificationsService
        .sendEmail(
          savedBooking.user.email,
          `Observaciones en comprobante de pago - Código: ${savedBooking.bookingCode}`,
          emailHtml,
        )
        .catch((error) => {
          this.logger.error(`Error al enviar correo de rechazo de pago para reserva ${savedBooking.bookingCode}:`, error);
        });
    }

    return savedBooking;
  }

  async uploadReceipt(id: number, receiptUrl: string): Promise<Booking> {
    const booking = await this.getById(id);
    booking.status = 'pending_approval';
    booking.receiptUrl = receiptUrl;
    return this.bookingRepository.save(booking);
  }

  async confirmPayment(bookingCode: string, paymentId: string, status: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingCode },
      relations: { user: true, space: true },
    });

    if (!booking) {
      throw new Error(`Reserva no encontrada con el código ${bookingCode}`);
    }

    if (status === 'approved') {
      booking.status = 'confirmed';
      booking.adminNotes = `Pagado vía Mercado Pago. ID Pago: ${paymentId}`;
      const savedBooking = await this.bookingRepository.save(booking);

      if (savedBooking.user?.email) {
        const emailHtml = getBookingPaymentConfirmedEmailTemplate(savedBooking);
        this.notificationsService
          .sendEmail(
            savedBooking.user.email,
            `Reserva Confirmada y Pago Aprobado - Código: ${savedBooking.bookingCode}`,
            emailHtml,
          )
          .catch((error) => {
            this.logger.error(`Error al enviar correo de aprobación de pago para reserva ${savedBooking.bookingCode}:`, error);
          });
      }

      return savedBooking;
    }

    return booking;
  }

  async getBlockedDatesForSpace(spaceId: number): Promise<string[]> {
    const space = await this.spacesService.getById(spaceId);
    const bookings = await this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.guests', 'guest')
      .where('booking.spaceId = :spaceId', { spaceId })
      .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
      .getMany();

    const dates = new Set<string>();
    const staticBlocks = this.blockedDates[spaceId] || [];
    staticBlocks.forEach((d) => dates.add(d));

    if (space.type === 'pool') {
      const dailyOccupancy: { [date: string]: number } = {};
      for (const b of bookings) {
        const datesInRange = this.getDatesInRange(b.checkIn, b.checkOut);
        const bookingOccupants = 1 + (b.guests?.length || 0);
        for (const d of datesInRange) {
          dailyOccupancy[d] = (dailyOccupancy[d] || 0) + bookingOccupants;
        }
      }
      for (const [date, count] of Object.entries(dailyOccupancy)) {
        if (count >= space.maxCapacity) {
          dates.add(date);
        }
      }
    } else {
      for (const b of bookings) {
        const datesInRange = this.getDatesInRange(b.checkIn, b.checkOut);
        datesInRange.forEach((d) => dates.add(d));
      }
    }

    return Array.from(dates).sort();
  }

  private async isBlocked(
    spaceId: number,
    checkIn: string,
    checkOut: string,
    newGuestsCount = 0,
  ): Promise<boolean> {
    const space = await this.spacesService.getById(spaceId);
    const datesToCheck = this.getDatesInRange(checkIn, checkOut);
    
    // 1. Static check
    const staticBlocks = this.blockedDates[spaceId] || [];
    const hasStaticBlock = datesToCheck.some((d) => staticBlocks.includes(d));
    if (hasStaticBlock) return true;

    // 2. Overlapping check in DB
    if (space.type === 'pool') {
      const overlappingBookings = await this.bookingRepository.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.guests', 'guest')
        .where('booking.spaceId = :spaceId', { spaceId })
        .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
        .getMany();

      const newBookingOccupants = 1 + newGuestsCount;

      for (const date of datesToCheck) {
        let dailyOccupancy = 0;
        for (const b of overlappingBookings) {
          const datesInRange = this.getDatesInRange(b.checkIn, b.checkOut);
          if (datesInRange.includes(date)) {
            dailyOccupancy += 1 + (b.guests?.length || 0);
          }
        }
        if (dailyOccupancy + newBookingOccupants > space.maxCapacity) {
          throw new BadRequestException(
            `El recinto de Piscina no tiene suficientes cupos disponibles para este día. Cupos restantes: ${
              space.maxCapacity - dailyOccupancy
            }, requeridos: ${newBookingOccupants}.`
          );
        }
      }
      return false;
    } else {
      const overlapping = await this.bookingRepository.createQueryBuilder('booking')
        .where('booking.spaceId = :spaceId', { spaceId })
        .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
        .andWhere('booking.check_in <= :checkOut', { checkOut })
        .andWhere('booking.check_out >= :checkIn', { checkIn })
        .getMany();

      return overlapping.length > 0;
    }
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
