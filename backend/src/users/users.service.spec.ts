import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<UserEntity>>;

  const mockUser: UserEntity = {
    id: 1,
    fullName: 'Carlos Muñoz Rojas',
    rut: '12.345.678-9',
    email: 'carlos.munoz@enap.cl',
    role: 'socio',
    fichaNumber: 'ENP-0042',
    isActive: true,
    passwordHash: 'salt:hash',
    bookings: [],
  };

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      repository.find.mockResolvedValue([mockUser]);
      const result = await service.getAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('getById', () => {
    it('should return user if found', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      const result = await service.getById(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.getById(999)).rejects.toThrow(new NotFoundException('User not found'));
    });
  });

  describe('getByEmail', () => {
    it('should return user when looking up email', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      const result = await service.getByEmail('carlos.munoz@enap.cl');
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should throw ConflictException if email already exists', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      const createData = {
        full_name: 'Carlos Muñoz Rojas',
        rut: '12.345.678-9',
        email: 'carlos.munoz@enap.cl',
        role: 'socio' as const,
      };
      await expect(service.create(createData)).rejects.toThrow(new ConflictException('Email already registered'));
    });

    it('should create and save a new user if email is unique', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      const createData = {
        full_name: 'Carlos Muñoz Rojas',
        rut: '12.345.678-9',
        email: 'newemail@enap.cl',
        role: 'socio' as const,
        password: 'mypassword',
      };

      const result = await service.create(createData);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle status and save changes', async () => {
      const userInstance = { ...mockUser, isActive: true };
      repository.findOne.mockResolvedValue(userInstance);
      repository.save.mockImplementation(async (u: any) => u);

      const result = await service.toggleStatus(1);
      expect(result).toBe(true);
      expect(userInstance.isActive).toBe(false);
    });
  });
});
