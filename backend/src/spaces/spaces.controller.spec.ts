import { Test, TestingModule } from '@nestjs/testing';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { AuthService } from '../auth/auth.service';
import { SpaceEntity } from './space.entity';
import { UserEntity } from '../users/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('SpacesController', () => {
  let controller: SpacesController;
  let spacesService: jest.Mocked<SpacesService>;
  let authService: jest.Mocked<AuthService>;

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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpacesController],
      providers: [
        { provide: SpacesService, useValue: mockSpacesService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<SpacesController>(SpacesController);
    spacesService = module.get(SpacesService);
    authService = module.get(AuthService);
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
      await expect(controller.create({}, mockSpace)).rejects.toThrow(
        new UnauthorizedException('No authorization token provided'),
      );
    });

    it('should throw UnauthorizedException if token format is invalid', async () => {
      await expect(controller.create({ authorization: 'invalid-format' }, mockSpace)).rejects.toThrow(
        new UnauthorizedException('Invalid token format'),
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      authService.verifyToken.mockResolvedValue(null);
      await expect(controller.create({ authorization: 'Bearer bad_token' }, mockSpace)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired authorization token'),
      );
    });

    it('should throw UnauthorizedException if user is not an admin', async () => {
      const nonAdminUser = { ...mockAdminUser, role: 'socio' as const };
      authService.verifyToken.mockResolvedValue(nonAdminUser);
      await expect(controller.create({ authorization: 'Bearer valid_token' }, mockSpace)).rejects.toThrow(
        new UnauthorizedException('Restricted access for admins only'),
      );
    });

    it('should create space if user is admin', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      spacesService.create.mockResolvedValue(mockSpace);

      const result = await controller.create({ authorization: 'Bearer valid_token' }, mockSpace);
      expect(spacesService.create).toHaveBeenCalledWith(mockSpace);
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
});
