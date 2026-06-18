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
        id: 'DESC',
      },
    });
  }

  async create(data: {
    title: string;
    body: string;
    imageUrl?: string;
    isPinned?: boolean;
    is_pinned?: boolean;
  }): Promise<AnnouncementEntity> {
    const newAnn = this.announcementRepository.create({
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      isPinned: data.isPinned ?? data.is_pinned ?? false,
      publishedAt: new Date().toISOString().split('T')[0],
    });
    return this.announcementRepository.save(newAnn);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.announcementRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
