import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementEntity } from './announcement.entity';
import { AuthService } from '../auth/auth.service';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;
  let service: jest.Mocked<AnnouncementsService>;

  const mockAnnouncement: AnnouncementEntity = {
    id: 1,
    title: 'Aviso',
    body: 'Contenido',
    publishedAt: '2025-11-15',
    isPinned: false,
  };

  beforeEach(async () => {
    const mockService = {
      getAll: jest.fn(),
    };

    const mockAuthService = {
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        { provide: AnnouncementsService, useValue: mockService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
    service = module.get(AnnouncementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return service.getAll() results', async () => {
      service.getAll.mockResolvedValue([mockAnnouncement]);
      const result = await controller.getAll();
      expect(service.getAll).toHaveBeenCalled();
      expect(result).toEqual([mockAnnouncement]);
    });
  });
});
