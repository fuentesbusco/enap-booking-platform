import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let authService: jest.Mocked<AuthService>;

  const mockUser: UserEntity = {
    id: 1,
    fullName: 'Carlos Muñoz Rojas',
    rut: '12.345.678-9',
    email: 'carlos.munoz@enap.cl',
    role: 'socio',
    fichaNumber: 'ENP-0042',
    isActive: true,
    passwordHash: 'hash',
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
    const mockUsersService = {
      getAll: jest.fn(),
      create: jest.fn(),
      toggleStatus: jest.fn(),
    };

    const mockAuthService = {
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should throw UnauthorizedException if non-admin tries to list all', async () => {
      authService.verifyToken.mockResolvedValue(mockUser);
      await expect(controller.getAll({ authorization: 'Bearer token' })).rejects.toThrow(
        new UnauthorizedException('Restricted access for admins only'),
      );
    });

    it('should return users list if admin', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      usersService.getAll.mockResolvedValue([mockUser]);

      const result = await controller.getAll({ authorization: 'Bearer token' });
      expect(usersService.getAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('create', () => {
    it('should create user if admin', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      usersService.create.mockResolvedValue(mockUser);

      const createData = {
        full_name: 'Carlos',
        rut: '12-3',
        email: 'carlos@enap.cl',
        role: 'socio' as const,
      };

      const result = await controller.create({ authorization: 'Bearer token' }, createData);
      expect(usersService.create).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle status if admin', async () => {
      authService.verifyToken.mockResolvedValue(mockAdminUser);
      usersService.toggleStatus.mockResolvedValue(true);

      const result = await controller.toggleStatus({ authorization: 'Bearer token' }, '1');
      expect(usersService.toggleStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });
  });

  describe('getProfile', () => {
    it('should return profile of the authenticated user', async () => {
      authService.verifyToken.mockResolvedValue(mockUser);

      const result = await controller.getProfile({ authorization: 'Bearer token' });
      expect(result).toEqual(mockUser);
    });
  });
});
