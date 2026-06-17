import { Injectable, NotFoundException } from '@nestjs/common';
import { Space, MOCK_SPACES } from '../models';

@Injectable()
export class SpacesService {
  private spaces: Space[] = [...MOCK_SPACES];

  getAll(): Space[] {
    return this.spaces;
  }

  getById(id: number): Space {
    const space = this.spaces.find((s) => s.id === id);
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    return space;
  }

  create(spaceData: Omit<Space, 'id'>): Space {
    const nextId = this.spaces.length > 0 ? Math.max(...this.spaces.map((s) => s.id)) + 1 : 1;
    const newSpace: Space = {
      id: nextId,
      ...spaceData,
    };
    this.spaces.push(newSpace);
    return newSpace;
  }

  update(id: number, spaceData: Partial<Space>): Space {
    const space = this.getById(id);
    Object.assign(space, spaceData);
    return space;
  }

  delete(id: number): boolean {
    const initialLength = this.spaces.length;
    this.spaces = this.spaces.filter((s) => s.id !== id);
    if (this.spaces.length === initialLength) {
      throw new NotFoundException('Space not found');
    }
    return true;
  }
}
