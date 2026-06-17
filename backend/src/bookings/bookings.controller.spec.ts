import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AuthService } from '../auth/auth.service';
import { AwsService } from '../aws/aws.service';
import { UserEntity } from '../users/user.entity';
import { Booking } from './booking.entity';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('BookingsController', () => {
  let controller: BookingsController;
  let bookingsService: jest.Mocked<BookingsService>;
  let authService: jest.Mocked<AuthService>;
  let awsService: jest.Mocked<AwsService>;

  const mockUser: UserEntity = {
    id: 1,
    fullName: 'Carlos Muñoz Rojas',
    rut: '12.345.678-9',
    email: 'carlos.munoz@enap.cl',
    role: 'socio',
    fichaNumber: 'ENP-0042',
    isActive: true,
    bookings: [],
  };

  const mockBooking: Booking = {
    id: 1,
    bookingCode: 'ENP-2025-00001',
    user: mockUser,
    space: null as any,
    checkIn: '2025-12-15',
    checkOut: '2025-12-18',
    status: 'pending_approval',
    totalAmount: 100000,
    guests: [],
    createdAt: new Date(),
    priceBreakdown: {} as any,
    receiptUrl: 'https://test-bucket.s3.amazonaws.com/receipts/test.pdf',
  };

  beforeEach(async () => {
    const mockBookingsService = {
      getAll: jest.fn(),
      getByUser: jest.fn(),
      createBooking: jest.fn(),
      uploadReceipt: jest.fn(),
      approveBooking: jest.fn(),
      rejectBooking: jest.fn(),
    };

    const mockAuthService = {
      verifyToken: jest.fn(),
    };

    const mockAwsService = {
      uploadFile: jest.fn(),
      getS3Client: jest.fn(),
      getBucketName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AwsService, useValue: mockAwsService },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    bookingsService = module.get(BookingsService) as any;
    authService = module.get(AuthService) as any;
    awsService = module.get(AwsService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadReceipt', () => {
    const headers = { authorization: 'Bearer valid-token' };

    it('should throw BadRequestException if bookingId is invalid', async () => {
      authService.verifyToken.mockResolvedValue(mockUser);

      await expect(
        controller.uploadReceipt(headers, { bookingId: 'invalid' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if bookingId is missing', async () => {
      authService.verifyToken.mockResolvedValue(mockUser);

      await expect(
        controller.uploadReceipt(headers, { bookingId: undefined }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload file to S3 and save URL if a file is provided', async () => {
      authService.verifyToken.mockResolvedValue(mockUser);
      const fileUrl = 'https://test-bucket.s3.amazonaws.com/receipts/123-receipt.pdf';
      awsService.uploadFile.mockResolvedValue(fileUrl);
      bookingsService.uploadReceipt.mockResolvedValue(mockBooking);

      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'receipt.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('dummy file content'),
        size: 18,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await controller.uploadReceipt(headers, { bookingId: 1 }, mockFile);

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(awsService.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        'receipts',
        mockFile.originalname,
        mockFile.mimetype,
      );
      expect(bookingsService.uploadReceipt).toHaveBeenCalledWith(1, fileUrl);
      expect(result).toEqual({
        success: true,
        receiptUrl: fileUrl,
        booking: mockBooking,
      });
    });

    it('should fallback to mock receipt URL if no file is provided', async () => {
      authService.verifyToken.mockResolvedValue(mockUser);
      bookingsService.uploadReceipt.mockResolvedValue(mockBooking);

      const result = await controller.uploadReceipt(headers, { bookingId: 1 });

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(awsService.uploadFile).not.toHaveBeenCalled();
      expect(bookingsService.uploadReceipt).toHaveBeenCalledWith(
        1,
        expect.stringContaining('https://atelier-busco-s3.amazonaws.com/receipts/receipt-1-'),
      );
      expect(result.success).toBe(true);
      expect(result.receiptUrl).toContain('https://atelier-busco-s3.amazonaws.com/receipts/receipt-1-');
      expect(result.booking).toEqual(mockBooking);
    });
  });
});
