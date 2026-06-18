import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryEntity } from './gallery.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryEntity)
    private readonly galleryRepository: Repository<GalleryEntity>,
  ) {}

  async getAll(): Promise<GalleryEntity[]> {
    return this.galleryRepository.find({
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    imageUrl: string;
    image_url?: string;
  }): Promise<GalleryEntity> {
    const newItem = this.galleryRepository.create({
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl ?? data.image_url,
    });
    return this.galleryRepository.save(newItem);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.galleryRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
