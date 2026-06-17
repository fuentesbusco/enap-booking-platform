import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { SpacesService } from '../spaces/spaces.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { GuestEntity } from './guest.entity';
import { SpaceEntity } from '../spaces/space.entity';
import { UserEntity } from '../users/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: jest.Mocked<Repository<Booking>>;
  let guestRepository: jest.Mocked<Repository<GuestEntity>>;
  let spacesService: jest.Mocked<SpacesService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockSpace: SpaceEntity = {
    id: 1,
    name: 'Cabaña Los Boldos',
    type: 'cabin',
    description: 'Cabaña familiar',
    maxCapacity: 6,
    basePrice: 50000,
    socioPrice: 35000,
    guestPrice: 3500,
    freeGuestsForSocio: 2,
    images: [],
    amenities: [],
    bookings: [],
  };

  const mockUser: UserEntity = {
    id: 1,
    fullName: 'Carlos Muñoz',
    rut: '12.345.678-9',
    email: 'carlos@enap.cl',
    role: 'socio',
    fichaNumber: 'ENP-0042',
    isActive: true,
    bookings: [],
  };

  const mockBooking: Booking = {
    id: 1,
    bookingCode: 'ENP-2025-00001',
    user: mockUser,
    space: mockSpace,
    checkIn: '2025-12-15',
    checkOut: '2025-12-18',
    status: 'pending_payment',
    totalAmount: 112000,
    guests: [],
    createdAt: new Date(),
    priceBreakdown: { base: 105000, days: 3, guests_count: 2, guests_total: 7000, free_guests_applied: 0, discount: 0, total: 112000 },
  };

  beforeEach(async () => {
    const mockBookingRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockGuestRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockSpacesService = {
      getById: jest.fn(),
    };

    const mockNotificationsService = {
      sendEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepository },
        { provide: getRepositoryToken(GuestEntity), useValue: mockGuestRepository },
        { provide: SpacesService, useValue: mockSpacesService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingRepository = module.get(getRepositoryToken(Booking));
    guestRepository = module.get(getRepositoryToken(GuestEntity));
    spacesService = module.get(SpacesService);
    notificationsService = module.get(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculatePriceBreakdown', () => {
    it('should calculate breakdown correctly for socio with applied free guests', () => {
      const breakdown = service.calculatePriceBreakdown(mockSpace, '2025-12-15', '2025-12-18', 3, 'socio');
      expect(breakdown.days).toBe(3);
      expect(breakdown.base).toBe(105000); // 35000 * 3
      expect(breakdown.free_guests_applied).toBe(2); // max 2 free guests
      expect(breakdown.guests_total).toBe(3500); // 1 guest * 3500
      expect(breakdown.total).toBe(108500);
    });

    it('should calculate breakdown correctly for external user with zero free guests', () => {
      const breakdown = service.calculatePriceBreakdown(mockSpace, '2025-12-15', '2025-12-18', 3, 'external');
      expect(breakdown.days).toBe(3);
      expect(breakdown.base).toBe(150000); // 50000 * 3
      expect(breakdown.free_guests_applied).toBe(0);
      expect(breakdown.guests_total).toBe(10500); // 3 guests * 3500
      expect(breakdown.total).toBe(160500);
    });
  });

  describe('getById', () => {
    it('should return booking if found', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      const result = await service.getById(1);
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException if not found', async () => {
      bookingRepository.findOne.mockResolvedValue(null);
      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createBooking', () => {
    it('should throw BadRequestException if guests exceed maximum capacity', async () => {
      spacesService.getById.mockResolvedValue(mockSpace);
      const guests = Array(7).fill({ full_name: 'Guest', rut: '1-1' });

      await expect(
        service.createBooking(mockUser, mockSpace.id, '2025-12-15', '2025-12-18', guests),
      ).rejects.toThrow(new BadRequestException(`El espacio supera la capacidad máxima permitida de ${mockSpace.maxCapacity} personas.`));
    });

    it('should throw BadRequestException if date range is blocked statically', async () => {
      spacesService.getById.mockResolvedValue(mockSpace);
      // '2025-12-20' is statically blocked in models.ts BLOCKED_DATES for space 1
      await expect(
        service.createBooking(mockUser, mockSpace.id, '2025-12-20', '2025-12-22', []),
      ).rejects.toThrow(new BadRequestException('Las fechas seleccionadas no están disponibles.'));
    });

    it('should create booking and guest entities if all validations pass', async () => {
      spacesService.getById.mockResolvedValue(mockSpace);
      bookingRepository.count.mockResolvedValue(0);
      bookingRepository.create.mockReturnValue(mockBooking);
      bookingRepository.save.mockResolvedValue(mockBooking);
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      bookingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const guests = [{ full_name: 'Juan Perez', rut: '18.888.888-8' }];
      const result = await service.createBooking(mockUser, mockSpace.id, '2025-12-15', '2025-12-18', guests);

      expect(spacesService.getById).toHaveBeenCalledWith(mockSpace.id);
      expect(bookingRepository.save).toHaveBeenCalled();
      expect(guestRepository.save).toHaveBeenCalled();
      expect(notificationsService.sendEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.stringContaining(mockBooking.bookingCode),
        expect.any(String),
      );
      expect(result).toEqual(mockBooking);
    });

    it('should create booking even if email notification fails', async () => {
      spacesService.getById.mockResolvedValue(mockSpace);
      bookingRepository.count.mockResolvedValue(0);
      bookingRepository.create.mockReturnValue(mockBooking);
      bookingRepository.save.mockResolvedValue(mockBooking);
      bookingRepository.findOne.mockResolvedValue(mockBooking);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      bookingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      notificationsService.sendEmail.mockRejectedValue(new Error('SMTP error'));

      const guests = [{ full_name: 'Juan Perez', rut: '18.888.888-8' }];
      const result = await service.createBooking(mockUser, mockSpace.id, '2025-12-15', '2025-12-18', guests);

      expect(result).toEqual(mockBooking);
      expect(notificationsService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('admin actions', () => {
    it('should approve a booking', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      bookingRepository.save.mockImplementation(async (b: any) => b);

      const result = await service.approveBooking(1);
      expect(result.status).toBe('confirmed');
    });

    it('should reject a booking with notes', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      bookingRepository.save.mockImplementation(async (b: any) => b);

      const result = await service.rejectBooking(1, 'Reject reason');
      expect(result.status).toBe('rejected');
      expect(result.adminNotes).toBe('Reject reason');
    });

    it('should upload a receipt URL', async () => {
      bookingRepository.findOne.mockResolvedValue(mockBooking);
      bookingRepository.save.mockImplementation(async (b: any) => b);

      const result = await service.uploadReceipt(1, 'http://receipt.pdf');
      expect(result.status).toBe('pending_approval');
      expect(result.receiptUrl).toBe('http://receipt.pdf');
    });
  });
});
