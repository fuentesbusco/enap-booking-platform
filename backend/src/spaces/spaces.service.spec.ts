import { Test, TestingModule } from '@nestjs/testing';
import { SpacesService } from './spaces.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpaceEntity } from './space.entity';
import { FeedbackEntity } from '../feedback/feedback.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('SpacesService', () => {
  let service: SpacesService;
  let repository: jest.Mocked<Repository<SpaceEntity>>;
  let feedbackRepository: jest.Mocked<Repository<FeedbackEntity>>;

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

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockFeedbackRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpacesService,
        { provide: getRepositoryToken(SpaceEntity), useValue: mockRepository },
        { provide: getRepositoryToken(FeedbackEntity), useValue: mockFeedbackRepository },
      ],
    }).compile();

    service = module.get<SpacesService>(SpacesService);
    repository = module.get(getRepositoryToken(SpaceEntity));
    feedbackRepository = module.get(getRepositoryToken(FeedbackEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all spaces', async () => {
      repository.find.mockResolvedValue([mockSpace]);
      const result = await service.getAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([{ ...mockSpace, ratingAverage: 0, ratingCount: 0 }]);
    });
  });

  describe('getById', () => {
    it('should return a space if found', async () => {
      repository.findOne.mockResolvedValue(mockSpace);
      const result = await service.getById(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ ...mockSpace, ratingAverage: 0, ratingCount: 0 });
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.getById(999)).rejects.toThrow(new NotFoundException('Space not found'));
    });
  });

  describe('create', () => {
    it('should create and save a new space', async () => {
      const createData = {
        name: 'Nuevo Quincho',
        type: 'quincho' as const,
        description: 'Quincho familiar',
        max_capacity: 15,
        base_price: 30000,
        socio_price: 20000,
        guest_price: 3000,
        free_guests_for_socio: 0,
        images: [],
        amenities: [],
      };
      const spaceDataEntity = {
        name: createData.name,
        type: createData.type,
        description: createData.description,
        maxCapacity: createData.max_capacity,
        basePrice: createData.base_price,
        socioPrice: createData.socio_price,
        guestPrice: createData.guest_price,
        freeGuestsForSocio: createData.free_guests_for_socio,
        images: createData.images,
        amenities: createData.amenities,
      };

      repository.create.mockReturnValue(spaceDataEntity as any);
      repository.save.mockResolvedValue(spaceDataEntity as any);

      const result = await service.create(createData);
      expect(repository.create).toHaveBeenCalledWith(createData);
      expect(repository.save).toHaveBeenCalledWith(spaceDataEntity);
      expect(result).toEqual(spaceDataEntity);
    });
  });

  describe('update', () => {
    it('should update and save the space', async () => {
      repository.findOne.mockResolvedValue({ ...mockSpace });
      repository.save.mockImplementation(async (s: any) => s);

      const result = await service.update(1, { name: 'Cabaña Modificada' });
      expect(result.name).toBe('Cabaña Modificada');
    });
  });

  describe('delete', () => {
    it('should delete and return true if space exists', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);
      const result = await service.delete(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if space does not exist', async () => {
      repository.delete.mockResolvedValue({ affected: 0 } as any);
      await expect(service.delete(999)).rejects.toThrow(new NotFoundException('Space not found'));
    });
  });
});
