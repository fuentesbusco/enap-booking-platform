import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpaceEntity } from './space.entity';
import { Space } from '../models';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(SpaceEntity)
    private readonly spaceRepository: Repository<SpaceEntity>,
  ) {}

  async getAll(): Promise<SpaceEntity[]> {
    return this.spaceRepository.find();
  }

  async getById(id: number): Promise<SpaceEntity> {
    const space = await this.spaceRepository.findOne({ where: { id } });
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    return space;
  }

  async create(spaceData: Omit<Space, 'id'>): Promise<SpaceEntity> {
    const newSpace = this.spaceRepository.create(spaceData);
    return this.spaceRepository.save(newSpace);
  }

  async update(id: number, spaceData: Partial<Space>): Promise<SpaceEntity> {
    const space = await this.getById(id);
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
