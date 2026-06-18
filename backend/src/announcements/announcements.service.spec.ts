import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AnnouncementEntity } from './announcement.entity';
import { Repository } from 'typeorm';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let repository: jest.Mocked<Repository<AnnouncementEntity>>;

  const mockAnnouncement: AnnouncementEntity = {
    id: 1,
    title: 'Aviso',
    body: 'Contenido del aviso',
    publishedAt: '2025-11-15',
    isPinned: false,
  };

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: getRepositoryToken(AnnouncementEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    repository = module.get(getRepositoryToken(AnnouncementEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all announcements sorted', async () => {
      repository.find.mockResolvedValue([mockAnnouncement]);
      const result = await service.getAll();
      expect(repository.find).toHaveBeenCalledWith({
        order: {
          isPinned: 'DESC',
          publishedAt: 'DESC',
          id: 'DESC',
        },
      });
      expect(result).toEqual([mockAnnouncement]);
    });
  });
});
