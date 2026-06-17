import { Test, TestingModule } from '@nestjs/testing';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { AuthService } from '../auth/auth.service';
import { AwsService } from '../aws/aws.service';
import { SpaceEntity } from './space.entity';
import { UserEntity } from '../users/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('SpacesController', () => {
  let controller: SpacesController;
  let spacesService: jest.Mocked<SpacesService>;
  let authService: jest.Mocked<AuthService>;
  let awsService: jest.Mocked<AwsService>;

  const mockSpace: SpaceEntity = {
    id: 1,
    name: 'Cabaña Los Boldos',
    type: 'cabin',
    description: 'Cabaña familiar',
    maxCapacity: 6,
    basePrice: 50000,
    socioPrice: 35000,
    guestPrice: 3500,
    freeGuestsForSocio: 0,
    images: [],
    amenities: [],
    bookings: [],
  };

  const mockSpaceDto = {
    name: 'Cabaña Los Boldos',
    type: 'cabin' as const,
    description: 'Cabaña familiar',
    max_capacity: 6,
    base_price: 50000,
    socio_price: 35000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: [],
    amenities: [],
  };

  const mockAdminUser: UserEntity = {
    id: 99,
    fullName: 'Admin',
    rut: '1-1',
    email: 'admin@enap.cl',
    role: 'admin',
    isActive: true,
    bookings: [],
  };

  beforeEach(async () => {
    const mockSpacesService = {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockAuthService = {
      verifyToken: jest.fn(),
    };

    const mockAwsService = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacesController],
      providers: [
        { provide: SpacesService, useValue: mockSpacesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: AwsService, useValue: mockAwsService },
      ],
    }).compile();

    controller = module.get<SpacesController>(SpacesController);
    spacesService = module.get(SpacesService);
    authService = module.get(AuthService);
    awsService = module.get(AwsService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all spaces without authentication', async () => {
      spacesService.getAll.mockResolvedValue([mockSpace]);
      const result = await controller.getAll();
      expect(spacesService.getAll).toHaveBeenCalled();
      expect(result).toEqual([mockSpace]);
    });
  });

  describe('create', () => {
    it('should throw UnauthorizedException if authorization header is missing', async () => {
      await expect(controller.create({}, mockSpaceDto)).rejects.toThrow(
        new UnauthorizedException('No authorization token provided'),
      );
    });

    it('should throw UnauthorizedException if token format is invalid', async () => {
      await expect(controller.create({ authorization: 'invalid-format' }, mockSpaceDto)).rejects.toThrow(
        new UnauthorizedException('Invalid token format'),
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      authService.verifyToken.mockResolvedValue(null);
      await expect(controller.create({ authorization: 'Bearer bad_token' }, mockSpaceDto)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired authorization token'),
      );
    });

    it('should throw UnauthorizedException if user is not an admin', async () => {
      const nonAdminUser = { ...mockAdminUser, role: 'socio' as const };
      authService.verifyToken.mockResolvedValue(nonAdminUser);
      await expect(controller.create({ authorization: 'Bearer valid_token' }, mockSpaceDto)).rejects.toThrow(
        new UnauthorizedException('Restricted access for admins only'),
      );
    });

    it('should create space if user is admin', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      spacesService.create.mockResolvedValue(mockSpace);

      const result = await controller.create({ authorization: 'Bearer valid_token' }, mockSpaceDto);
      expect(spacesService.create).toHaveBeenCalledWith(mockSpaceDto);
      expect(result).toEqual(mockSpace);
    });
  });

  describe('update', () => {
    it('should update space if user is admin', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      spacesService.update.mockResolvedValue(mockSpace);

      const result = await controller.update({ authorization: 'Bearer valid_token' }, '1', { name: 'New Name' });
      expect(spacesService.update).toHaveBeenCalledWith(1, { name: 'New Name' });
      expect(result).toEqual(mockSpace);
    });
  });

  describe('delete', () => {
    it('should delete space if user is admin', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      spacesService.delete.mockResolvedValue(true);

      const result = await controller.delete({ authorization: 'Bearer valid_token' }, '1');
      expect(spacesService.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });

  describe('uploadPhoto', () => {
    const headers = { authorization: 'Bearer admin-token' };

    it('should throw UnauthorizedException if non-admin tries to upload photo', async () => {
      const nonAdminUser = { ...mockAdminUser, role: 'socio' as const };
      authService.verifyToken.mockResolvedValue(nonAdminUser);

      await expect(controller.uploadPhoto(headers)).rejects.toThrow(UnauthorizedException);
    });

    it('should upload photo to S3 and return the S3 URL if a file is provided', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      const photoUrl = 'https://test-bucket.s3.amazonaws.com/spaces/image.jpg';
      awsService.uploadFile.mockResolvedValue(photoUrl);

      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'cabin.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('dummy image content'),
        size: 19,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await controller.uploadPhoto(headers, mockFile);

      expect(authService.verifyToken).toHaveBeenCalledWith('admin-token');
      expect(awsService.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        'spaces',
        mockFile.originalname,
        mockFile.mimetype,
      );
      expect(result).toEqual({
        success: true,
        photoUrl,
      });
    });

    it('should return mock photo URL if no file is provided (fallback)', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);

      const result = await controller.uploadPhoto(headers);

      expect(authService.verifyToken).toHaveBeenCalledWith('admin-token');
      expect(awsService.uploadFile).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.photoUrl).toContain('https://atelier-busco-s3.amazonaws.com/spaces/space-photo-');
    });
  });
});
