import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnouncementEntity } from './announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(AnnouncementEntity)
    private readonly announcementRepository: Repository<AnnouncementEntity>,
  ) {}

  async getAll(): Promise<AnnouncementEntity[]> {
    return this.announcementRepository.find({
      order: {
        isPinned: 'DESC',
        publishedAt: 'DESC',
      },
    });
  }
}
