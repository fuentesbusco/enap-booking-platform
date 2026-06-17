import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import { hashPassword } from './hash.util';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: UserEntity = {
    id: 1,
    fullName: 'Carlos Muñoz Rojas',
    rut: '12.345.678-9',
    email: 'carlos.munoz@enap.cl',
    role: 'socio',
    fichaNumber: 'ENP-0042',
    isActive: true,
    passwordHash: hashPassword('password123'),
    bookings: [],
  };

  beforeEach(async () => {
    const mockUsersService = {
      getByEmail: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.getByEmail.mockResolvedValue(null);
      await expect(service.validateUser('notfound@enap.cl', 'password123')).rejects.toThrow(
        new UnauthorizedException('User not registered'),
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.getByEmail.mockResolvedValue(inactiveUser);
      await expect(service.validateUser(mockUser.email, 'password123')).rejects.toThrow(
        new UnauthorizedException('User account is deactivated'),
      );
    });

    it('should return user if password matches', async () => {
      usersService.getByEmail.mockResolvedValue(mockUser);
      const result = await service.validateUser(mockUser.email, 'password123');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      usersService.getByEmail.mockResolvedValue(mockUser);
      await expect(service.validateUser(mockUser.email, 'wrongPassword')).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('generateToken', () => {
    it('should call jwtService.sign and return a token', () => {
      const mockToken = 'signed_jwt_token';
      jwtService.sign.mockReturnValue(mockToken);
      const result = service.generateToken(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should return user if token is valid and user is active', async () => {
      jwtService.verify.mockReturnValue({ email: mockUser.email });
      usersService.getByEmail.mockResolvedValue(mockUser);

      const result = await service.verifyToken('valid_token');
      expect(jwtService.verify).toHaveBeenCalledWith('valid_token');
      expect(usersService.getByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);
    });

    it('should return null if jwtService.verify throws an error', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      const result = await service.verifyToken('invalid_token');
      expect(result).toBeNull();
    });

    it('should return null if user is not found in DB', async () => {
      jwtService.verify.mockReturnValue({ email: mockUser.email });
      usersService.getByEmail.mockResolvedValue(null);

      const result = await service.verifyToken('valid_token');
      expect(result).toBeNull();
    });

    it('should return null if user is inactive in DB', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jwtService.verify.mockReturnValue({ email: mockUser.email });
      usersService.getByEmail.mockResolvedValue(inactiveUser);

      const result = await service.verifyToken('valid_token');
      expect(result).toBeNull();
    });
  });
});
