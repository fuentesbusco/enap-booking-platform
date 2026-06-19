import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceEntity } from './space.entity';
import { Space } from '../models';
import { FeedbackEntity } from '../feedback/feedback.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(SpaceEntity)
    private readonly spaceRepository: Repository<SpaceEntity>,
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
  ) {}

  async getAll(): Promise<any[]> {
    const spaces = await this.spaceRepository.find();
    return Promise.all(
      spaces.map(async (space) => {
        const feedbacks = await this.feedbackRepository.find({
          where: { space: { id: space.id }, status: 'approved' },
        });
        const ratingCount = feedbacks.length;
        const ratingAverage =
          ratingCount > 0
            ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / ratingCount).toFixed(1))
            : 0;
        return {
          ...space,
          ratingAverage,
          ratingCount,
        };
      }),
    );
  }

  async getById(id: number): Promise<any> {
    const space = await this.spaceRepository.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    const feedbacks = await this.feedbackRepository.find({
      where: { space: { id: space.id }, status: 'approved' },
    });
    const ratingCount = feedbacks.length;
    const ratingAverage =
      ratingCount > 0
        ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / ratingCount).toFixed(1))
        : 0;
    return {
      ...space,
      ratingAverage,
      ratingCount,
    };
  }

  async create(spaceData: Omit<Space, 'id'>): Promise<SpaceEntity> {
    const newSpace = this.spaceRepository.create(spaceData);
    return this.spaceRepository.save(newSpace);
  }

  async update(id: number, spaceData: Partial<Space>): Promise<SpaceEntity> {
    const space = await this.spaceRepository.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    Object.assign(space, spaceData);
    return this.spaceRepository.save(space);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.spaceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Space not found');
    }
    return true;
  }
}
