import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './booking.entity';
import { GuestEntity } from './guest.entity';
import { SpaceEntity } from '../spaces/space.entity';
import { UserEntity } from '../users/user.entity';
import { PriceBreakdown, BookingStatus } from '../models';
import { SpacesService } from '../spaces/spaces.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getBookingConfirmationEmailTemplate } from '../notifications/templates/booking-confirmation.template';
import { getBookingPaymentConfirmedEmailTemplate } from '../notifications/templates/booking-payment-confirmed.template';
import { getBookingPaymentRejectedEmailTemplate } from '../notifications/templates/booking-payment-rejected.template';
import { getAdminNewBookingEmailTemplate } from '../notifications/templates/admin-new-booking.template';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  // No static blocked dates

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(GuestEntity)
    private readonly guestRepository: Repository<GuestEntity>,
    private readonly spacesService: SpacesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAll(): Promise<Booking[]> {
    await this.expireOldBookings();
    return this.bookingRepository.find({
      order: { id: 'DESC' },
    });
  }

  async getByUser(userId: number): Promise<Booking[]> {
    await this.expireOldBookings();
    return this.bookingRepository.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
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
    guestsOrCount: number | any[],
    role: string,
    isForThirdParty: boolean = false,
    visitType?: string,
  ): PriceBreakdown {
    const resolvedRole = isForThirdParty ? 'external' : role;
    const isSocio = resolvedRole === 'socio';
    const days = this.daysDiff(checkIn, checkOut) || 1;

    // Check if the space is a generic quincho
    const isGenericQuincho = space.type === 'quincho' && space.name !== 'Club House';

    if (isGenericQuincho) {
      if (visitType === 'group') {
        const guestCount = typeof guestsOrCount === 'number' ? guestsOrCount : guestsOrCount.length;
        const guestsTotal = guestCount * space.guestPrice;
        return {
          base: 0,
          days,
          guests_count: guestCount,
          guests_total: guestsTotal,
          free_guests_applied: 0,
          discount: 0,
          total: guestsTotal,
        };
      } else {
        const limit = isSocio ? 15 : 10;
        const unitPrice = isSocio ? space.socioPrice : space.basePrice;
        const base = unitPrice * days;
        
        let payable = 0;
        const guestCount = typeof guestsOrCount === 'number' ? guestsOrCount : guestsOrCount.length;
        if (typeof guestsOrCount === 'number') {
          payable = Math.max(0, guestsOrCount - limit);
        } else {
          // Additional guest fee starts from 12 years old (or undefined/null)
          const chargeableGuests = guestsOrCount.filter(
            (g) => g.age === undefined || g.age === null || g.age >= 12
          ).length;
          payable = Math.max(0, chargeableGuests - limit);
        }
        
        const guestsTotal = payable * space.guestPrice;
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
    guests: { full_name: string; rut: string; phone?: string; age?: number }[],
    options?: {
      isForThirdParty?: boolean;
      thirdPartyName?: string;
      thirdPartyRut?: string;
      thirdPartyPhone?: string;
      adminCreatedForExternal?: boolean;
      visitType?: string;
      additionalEmail?: string;
    },
  ): Promise<Booking> {
    await this.expireOldBookings();
    this.logger.log(`[Reserva] Creando intento para usuario ${user.email} (ID: ${user.id}) en espacio ID ${spaceId} (${checkIn} a ${checkOut}) con ${guests.length} invitados.`);
    const space = await this.spacesService.getById(spaceId);

    if ((space.name.toLowerCase().includes('club house') || space.id === 4) && space.basePrice === 0) {
      throw new BadRequestException('El espacio Club House se encuentra temporalmente no disponible para reservas (Pronto disponible).');
    }

    if (space.type !== 'pool' && guests.length > space.maxCapacity) {
      this.logger.warn(`[Reserva] Creación fallida: ${guests.length} invitados supera capacidad máxima de ${space.maxCapacity} para ${space.name}.`);
      throw new BadRequestException(`El espacio supera la capacidad máxima permitida de ${space.maxCapacity} personas.`);
    }

    const isBlocked = await this.isBlocked(spaceId, checkIn, checkOut, guests.length);
    if (isBlocked) {
      this.logger.warn(`[Reserva] Creación fallida: conflicto de disponibilidad para ${space.name} en rango ${checkIn} a ${checkOut}.`);
      throw new BadRequestException('Las fechas seleccionadas no están disponibles.');
    }

    const resolvedSpace = space;
    const resolvedRole = (options?.adminCreatedForExternal || options?.isForThirdParty) ? 'external' : user.role;
    const breakdown = this.calculatePriceBreakdown(
      resolvedSpace,
      checkIn,
      checkOut,
      guests,
      resolvedRole,
      options?.isForThirdParty,
      options?.visitType
    );
    
    // Generate Booking Code based on database count
    const totalCount = await this.bookingRepository.count();
    const nextId = totalCount + 1;
    const bookingCode = `ENP-2025-${String(nextId).padStart(5, '0')}`;

    const assignedUnit = await this.getAvailableUnit(resolvedSpace, checkIn, checkOut);

    const newBooking = this.bookingRepository.create({
      bookingCode,
      user,
      space: resolvedSpace,
      checkIn,
      checkOut,
      status: breakdown.total === 0 ? 'confirmed' : 'pending_payment',
      totalAmount: breakdown.total,
      priceBreakdown: breakdown,
      isForThirdParty: !!options?.isForThirdParty,
      thirdPartyName: options?.thirdPartyName,
      thirdPartyRut: options?.thirdPartyRut,
      thirdPartyPhone: options?.thirdPartyPhone,
      adminCreatedForExternal: !!options?.adminCreatedForExternal,
      termsAccepted: true,
      visitType: options?.visitType,
      additionalEmail: options?.additionalEmail,
      assignedUnit,
    });

    const savedBooking = await this.bookingRepository.save(newBooking);
    this.logger.log(`[Reserva] Registro guardado con éxito. ID: ${savedBooking.id}, Código: ${savedBooking.bookingCode}, Estado inicial: ${savedBooking.status}, Total: ${savedBooking.totalAmount}`);

    // Create guests referencing saved booking
    const guestEntities = guests.map((g) =>
      this.guestRepository.create({
        fullName: g.full_name,
        rut: g.rut,
        phone: g.phone,
        age: g.age,
        booking: savedBooking,
      }),
    );
    await this.guestRepository.save(guestEntities);

    // Return the full populated booking entity
    const fullBooking = await this.getById(savedBooking.id);

    // Send confirmation email in the background to prevent SMTP latency or failures from blocking the API response
    if (fullBooking.user?.email) {
      const isConfirmed = fullBooking.status === 'confirmed';
      const emailHtml = isConfirmed
        ? getBookingPaymentConfirmedEmailTemplate(fullBooking)
        : getBookingConfirmationEmailTemplate(fullBooking);
      const emailSubject = isConfirmed
        ? `Reserva Confirmada - Código: ${fullBooking.bookingCode}`
        : `Confirmación de reserva realizada - Código: ${fullBooking.bookingCode}`;

      this.notificationsService
        .sendEmail(
          fullBooking.user.email,
          emailSubject,
          emailHtml,
        )
        .catch((error) => {
          this.logger.error(`Error al enviar correo de confirmación de reserva ${fullBooking.bookingCode}:`, error);
        });

      if (fullBooking.additionalEmail) {
        this.notificationsService
          .sendEmail(
            fullBooking.additionalEmail,
            emailSubject,
            emailHtml,
          )
          .catch((error) => {
            this.logger.error(`Error al enviar copia de confirmación de reserva ${fullBooking.bookingCode} al correo adicional:`, error);
          });
      }
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
    this.logger.log(`[Aprobar Reserva] Solicitud de aprobación manual para reserva ID: ${id}`);
    const booking = await this.getById(id);
    booking.status = 'confirmed';
    const savedBooking = await this.bookingRepository.save(booking);
    this.logger.log(`[Aprobar Reserva] Reserva ID: ${id} aprobada con éxito. Código: ${savedBooking.bookingCode}`);

    if (savedBooking.user?.email) {
      const emailHtml = getBookingPaymentConfirmedEmailTemplate(savedBooking);
      const emailSubject = `Reserva Confirmada y Pago Aprobado - Código: ${savedBooking.bookingCode}`;
      this.notificationsService
        .sendEmail(
          savedBooking.user.email,
          emailSubject,
          emailHtml,
        )
        .catch((error) => {
          this.logger.error(`Error al enviar correo de aprobación de pago para reserva ${savedBooking.bookingCode}:`, error);
        });

      if (savedBooking.additionalEmail) {
        this.notificationsService
          .sendEmail(
            savedBooking.additionalEmail,
            emailSubject,
            emailHtml,
          )
          .catch((error) => {
            this.logger.error(`Error al enviar copia de aprobación de pago para reserva ${savedBooking.bookingCode} al correo adicional:`, error);
          });
      }
    }

    return savedBooking;
  }

  async rejectBooking(id: number, notes: string): Promise<Booking> {
    this.logger.log(`[Rechazar Reserva] Solicitud de rechazo manual para reserva ID: ${id}. Notas admin: "${notes}"`);
    const booking = await this.getById(id);
    booking.status = 'rejected';
    booking.adminNotes = notes;
    const savedBooking = await this.bookingRepository.save(booking);
    this.logger.log(`[Rechazar Reserva] Reserva ID: ${id} rechazada con éxito. Código: ${savedBooking.bookingCode}`);

    if (savedBooking.user?.email) {
      const emailHtml = getBookingPaymentRejectedEmailTemplate(savedBooking);
      const emailSubject = `Observaciones en comprobante de pago - Código: ${savedBooking.bookingCode}`;
      this.notificationsService
        .sendEmail(
          savedBooking.user.email,
          emailSubject,
          emailHtml,
        )
        .catch((error) => {
          this.logger.error(`Error al enviar correo de rechazo de pago para reserva ${savedBooking.bookingCode}:`, error);
        });

      if (savedBooking.additionalEmail) {
        this.notificationsService
          .sendEmail(
            savedBooking.additionalEmail,
            emailSubject,
            emailHtml,
          )
          .catch((error) => {
            this.logger.error(`Error al enviar copia de rechazo de pago para reserva ${savedBooking.bookingCode} al correo adicional:`, error);
          });
      }
    }

    return savedBooking;
  }

  async uploadReceipt(id: number, receiptUrl: string): Promise<Booking> {
    this.logger.log(`[Subir Comprobante] Recibido comprobante para reserva ID: ${id}. URL: ${receiptUrl}`);
    const booking = await this.getById(id);
    booking.status = 'pending_approval';
    booking.receiptUrl = receiptUrl;
    return this.bookingRepository.save(booking);
  }

  async confirmPayment(bookingCode: string, paymentId: string, status: string): Promise<Booking> {
    this.logger.log(`[Confirmar Pago MP] Recibido webhook de Mercado Pago para reserva ${bookingCode}. ID Pago: ${paymentId}, Estado recibido: ${status}`);
    const booking = await this.bookingRepository.findOne({
      where: { bookingCode },
      relations: { user: true, space: true },
    });

    if (!booking) {
      this.logger.error(`[Confirmar Pago MP] Error: No se encontró la reserva con código ${bookingCode}`);
      throw new Error(`Reserva no encontrada con el código ${bookingCode}`);
    }

    if (status === 'approved') {
      booking.status = 'confirmed';
      booking.adminNotes = `Pagado vía Mercado Pago. ID Pago: ${paymentId}`;
      const savedBooking = await this.bookingRepository.save(booking);
      this.logger.log(`[Confirmar Pago MP] Reserva ${bookingCode} confirmada exitosamente tras aprobación de pago.`);

      if (savedBooking.user?.email) {
        const emailHtml = getBookingPaymentConfirmedEmailTemplate(savedBooking);
        const emailSubject = `Reserva Confirmada y Pago Aprobado - Código: ${savedBooking.bookingCode}`;
        this.notificationsService
          .sendEmail(
            savedBooking.user.email,
            emailSubject,
            emailHtml,
          )
          .catch((error) => {
            this.logger.error(`Error al enviar correo de aprobación de pago para reserva ${savedBooking.bookingCode}:`, error);
          });

        if (savedBooking.additionalEmail) {
          this.notificationsService
            .sendEmail(
              savedBooking.additionalEmail,
              emailSubject,
              emailHtml,
            )
            .catch((error) => {
              this.logger.error(`Error al enviar copia de aprobación de pago para reserva ${savedBooking.bookingCode} al correo adicional:`, error);
            });
        }
      }

      return savedBooking;
    }

    this.logger.warn(`[Confirmar Pago MP] Estado del pago no aprobado para reserva ${bookingCode}: ${status}`);
    return booking;
  }



  async getAvailableUnit(
    space: SpaceEntity,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: number,
  ): Promise<string> {
    if ((space.totalUnits || 1) <= 1) {
      return space.name;
    }

    // Find all overlapping bookings for this space category
    let query = this.bookingRepository.createQueryBuilder('booking')
      .where('booking.spaceId = :spaceId', { spaceId: space.id })
      .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
      .andWhere('booking.check_in <= :checkOut', { checkOut })
      .andWhere('booking.check_out >= :checkIn', { checkIn });

    if (excludeBookingId) {
      query = query.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const overlapping = await query.getMany();
    const assignedUnits = new Set(overlapping.map((b) => b.assignedUnit).filter(Boolean));

    // Determine unit name prefix
    let prefix = space.name;
    if (space.type === 'cabin') {
      prefix = 'Cabaña';
    } else if (space.type === 'quincho') {
      if (space.name.toLowerCase().includes('club house')) {
        prefix = 'Club House';
      } else {
        prefix = 'Quincho';
      }
    }

    for (let i = 1; i <= space.totalUnits; i++) {
      const unitName = `${prefix} ${i}`;
      if (!assignedUnits.has(unitName)) {
        return unitName;
      }
    }

    return `${prefix} 1`;
  }

  async getBlockedDatesForSpace(spaceId: number): Promise<string[]> {
    await this.expireOldBookings();
    const space = await this.spacesService.getById(spaceId);

    const dates = new Set<string>();
    
    // Cierre automático los lunes (mantención general)
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const current = new Date(start);
    while (current <= end) {
      if (current.getDay() === 1) {
        dates.add(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    // 1. Fetch ALL active bookings in the resort (any space)
    const allBookings = await this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.guests', 'guest')
      .leftJoinAndSelect('booking.space', 'space')
      .where('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
      .getMany();

    // 2. Calculate global resort daily occupants (total 1000 limit)
    const globalLimit = 1000;
    const globalDailyOccupancy: { [date: string]: number } = {};
    for (const b of allBookings) {
      const datesInRange = this.getDatesInRange(b.checkIn, b.checkOut);
      const bookingOccupants = 1 + (b.guests?.length || 0);
      for (const d of datesInRange) {
        globalDailyOccupancy[d] = (globalDailyOccupancy[d] || 0) + bookingOccupants;
      }
    }

    // Block dates where the entire resort is at maximum capacity (1000 people)
    for (const [date, count] of Object.entries(globalDailyOccupancy)) {
      if (count >= globalLimit) {
        dates.add(date);
      }
    }

    // 3. For non-pool spaces, block dates where the category units are fully occupied
    if (space.type !== 'pool') {
      const spaceBookings = allBookings.filter((b) => b.space && b.space.id === spaceId);
      const dailySpaceOccupancy: { [date: string]: number } = {};
      for (const b of spaceBookings) {
        const datesInRange = this.getDatesInRange(b.checkIn, b.checkOut);
        for (const d of datesInRange) {
          dailySpaceOccupancy[d] = (dailySpaceOccupancy[d] || 0) + 1;
        }
      }
      for (const [date, count] of Object.entries(dailySpaceOccupancy)) {
        if (count >= (space.totalUnits || 1)) {
          dates.add(date);
        }
      }
    }

    return Array.from(dates).sort();
  }

  private async isBlocked(
    spaceId: number,
    checkIn: string,
    checkOut: string,
    newGuestsCount = 0,
    excludeBookingId?: number,
  ): Promise<boolean> {
    const space = await this.spacesService.getById(spaceId);
    const datesToCheck = this.getDatesInRange(checkIn, checkOut);
    
    // Cierre automático los lunes
    const hasMonday = datesToCheck.some((d) => {
      const day = new Date(d + 'T00:00:00').getDay();
      return day === 1; // 1 = Lunes
    });
    if (hasMonday) {
      this.logger.warn(`[Bloqueo Lunes] Intento de reserva en día de mantención (Lunes) en espacio ID ${spaceId}.`);
      throw new BadRequestException('El Centro Vacacional se encuentra cerrado los días lunes por mantención general.');
    }

    // 1. Validar aforo global de 1.000 personas al día en todo el recinto (piscina, cabañas, quinchos, club house)
    const globalLimit = 1000;
    const newBookingOccupants = 1 + newGuestsCount;

    let globalQuery = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.guests', 'guest')
      .leftJoinAndSelect('booking.space', 'space')
      .where('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] });

    if (excludeBookingId) {
      globalQuery = globalQuery.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const allOverlapping = await globalQuery.getMany();

    for (const date of datesToCheck) {
      let totalDailyOccupancy = 0;
      for (const b of allOverlapping) {
        const datesInRange = this.getDatesInRange(b.checkIn, b.checkOut);
        if (datesInRange.includes(date)) {
          totalDailyOccupancy += 1 + (b.guests?.length || 0);
        }
      }
      if (totalDailyOccupancy + newBookingOccupants > globalLimit) {
        this.logger.warn(`[Bloqueo Capacidad Global] Supera aforo total del recinto el ${date}. Ocupación actual: ${totalDailyOccupancy}, Nuevos ocupantes: ${newBookingOccupants}, Máximo: ${globalLimit}`);
        throw new BadRequestException(
          `El Centro Vacacional ha alcanzado su aforo máximo diario de 1.000 personas para el día ${date}. Cupos disponibles: ${
            globalLimit - totalDailyOccupancy
          }, requeridos: ${newBookingOccupants}.`
        );
      }
    }

    // 2. Si es piscina, no hay límite de unidades físicas
    if (space.type === 'pool') {
      return false;
    }

    // 3. Para otros espacios (cabañas, quinchos, club house), validar disponibilidad de unidad física
    let query = this.bookingRepository.createQueryBuilder('booking')
      .where('booking.spaceId = :spaceId', { spaceId })
      .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
      .andWhere('booking.check_in <= :checkOut', { checkOut })
      .andWhere('booking.check_out >= :checkIn', { checkIn });

    if (excludeBookingId) {
      query = query.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const overlapping = await query.getMany();
    const assignedUnits = new Set(overlapping.map((b) => b.assignedUnit).filter(Boolean));

    let prefix = space.name;
    if (space.type === 'cabin') {
      prefix = 'Cabaña';
    } else if (space.type === 'quincho') {
      if (space.name.toLowerCase().includes('club house')) {
        prefix = 'Club House';
      } else {
        prefix = 'Quincho';
      }
    }

    let availableUnitExists = false;
    if ((space.totalUnits || 1) <= 1) {
      availableUnitExists = !assignedUnits.has(space.name);
    } else {
      for (let i = 1; i <= space.totalUnits; i++) {
        const unitName = `${prefix} ${i}`;
        if (!assignedUnits.has(unitName)) {
          availableUnitExists = true;
          break;
        }
      }
    }
    return !availableUnitExists;
  }

  async expireOldBookings(): Promise<void> {
    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const oldBookings = await this.bookingRepository.createQueryBuilder('booking')
        .where('booking.status = :status', { status: 'pending_payment' })
        .andWhere('booking.createdAt <= :fortyEightHoursAgo', { fortyEightHoursAgo })
        .getMany();

      if (oldBookings.length > 0) {
        this.logger.log(`[Expiración] Expirando ${oldBookings.length} reservas pendientes de pago sin actividad.`);
        for (const b of oldBookings) {
          b.status = 'expired';
          b.adminNotes = (b.adminNotes || '') + ' Expirado automáticamente por falta de pago (límite 48 horas).';
          await this.bookingRepository.save(b);
        }
      }
    } catch (e) {
      this.logger.error('Error expiring old bookings:', e);
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

  async assignSpace(bookingId: number, spaceId: number, assignedUnit?: string): Promise<Booking> {
    this.logger.log(`[Asignar Espacio] Cambiando cabaña/recinto para reserva ID ${bookingId} a espacio ID ${spaceId}, unidad: ${assignedUnit}`);
    const booking = await this.getById(bookingId);
    if (!booking) {
      throw new BadRequestException('Reserva no encontrada.');
    }
    const newSpace = await this.spacesService.getById(spaceId);
    if (!newSpace) {
      throw new BadRequestException('El espacio solicitado no existe.');
    }

    if (assignedUnit) {
      let query = this.bookingRepository.createQueryBuilder('booking')
        .where('booking.spaceId = :spaceId', { spaceId })
        .andWhere('booking.assigned_unit = :assignedUnit', { assignedUnit })
        .andWhere('booking.status IN (:...statuses)', { statuses: ['confirmed', 'pending_approval'] })
        .andWhere('booking.check_in <= :checkOut', { checkOut: booking.checkOut })
        .andWhere('booking.check_out >= :checkIn', { checkIn: booking.checkIn })
        .andWhere('booking.id != :bookingId', { bookingId });

      const overlappingCount = await query.getCount();
      if (overlappingCount > 0) {
        throw new BadRequestException(`La unidad ${assignedUnit} ya se encuentra ocupada en las fechas solicitadas.`);
      }
      booking.assignedUnit = assignedUnit;
    } else {
      const blocked = await this.isBlocked(spaceId, booking.checkIn, booking.checkOut, booking.guests?.length || 0, booking.id);
      if (blocked) {
        throw new BadRequestException(`El espacio ${newSpace.name} no tiene unidades disponibles en las fechas de la reserva.`);
      }
      booking.assignedUnit = await this.getAvailableUnit(newSpace, booking.checkIn, booking.checkOut, booking.id);
    }

    booking.space = newSpace;
    
    const resolvedRole = (booking.adminCreatedForExternal || booking.isForThirdParty) ? 'external' : booking.user.role;
    booking.priceBreakdown = this.calculatePriceBreakdown(
      newSpace,
      booking.checkIn,
      booking.checkOut,
      booking.guests || [],
      resolvedRole,
      booking.isForThirdParty,
      booking.visitType
    );
    booking.totalAmount = booking.priceBreakdown.total;

    const savedBooking = await this.bookingRepository.save(booking);
    this.logger.log(`[Asignar Espacio] Reserva ID ${bookingId} reasignada con éxito a ${newSpace.name} (${booking.assignedUnit}). Nuevo total: ${savedBooking.totalAmount}`);
    
    return this.getById(savedBooking.id);
  }

  private daysDiff(a: string, b: string): number {
    return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  }

  async sendExternalRequestEmail(data: {
    fullName: string;
    email: string;
    phone: string;
    spaceName: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    message?: string;
  }): Promise<void> {
    this.logger.log(`[Solicitud Externa] Recibida solicitud de ${data.fullName} para ${data.spaceName} (${data.checkIn} a ${data.checkOut})`);
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sindicatoenap.cl';
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #1b4332; border-bottom: 2px solid #1b4332; padding-bottom: 8px;">Nueva Solicitud de Reserva (Público General)</h2>
        <p>Se ha recibido una nueva solicitud de reserva desde el formulario web de público externo:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #666; font-weight: bold; width: 180px;">Nombre Solicitante:</td>
            <td style="padding: 6px 0; color: #111;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-weight: bold;">Correo Electrónico:</td>
            <td style="padding: 6px 0; color: #111;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-weight: bold;">Teléfono de Contacto:</td>
            <td style="padding: 6px 0; color: #111;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-weight: bold;">Recinto de Interés:</td>
            <td style="padding: 6px 0; color: #111;"><strong>${data.spaceName}</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-weight: bold;">Fecha de Check-in:</td>
            <td style="padding: 6px 0; color: #111; font-family: monospace;">${data.checkIn}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-weight: bold;">Fecha de Check-out:</td>
            <td style="padding: 6px 0; color: #111; font-family: monospace;">${data.checkOut}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-weight: bold;">Cantidad de Huéspedes:</td>
            <td style="padding: 6px 0; color: #111;">${data.guestsCount} personas</td>
          </tr>
        </table>
        
        ${data.message ? `
          <div style="background-color: #f4f6f5; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 13px; border-left: 4px solid #1b4332;">
            <strong style="color: #1b4332; display: block; margin-bottom: 5px;">Mensaje o Comentarios del Cliente:</strong>
            <p style="margin: 0; color: #444; font-style: italic; line-height: 1.5;">"${data.message}"</p>
          </div>
        ` : ''}
        
        <p style="color: #666; font-size: 12px; margin-top: 25px;">Puedes responder a este correo para coordinar directamente con el solicitante, o ingresar su reserva de forma manual en el panel de administración si hay disponibilidad.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 10px; color: #999; text-align: center;">Centro Vacacional Sindicato ENAP - Refinería Bío Bío</p>
      </div>
    `;

    await this.notificationsService.sendEmail(
      adminEmail,
      `[Solicitud Reserva] ${data.fullName} - Recinto: ${data.spaceName}`,
      emailHtml,
      data.email
    );
  }
}
