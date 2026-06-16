import { Injectable } from '@nestjs/common';
import { Space, MOCK_SPACES } from '../models';

@Injectable()
export class SpacesService {
  private readonly spaces: Space[] = MOCK_SPACES;

  getAll(): Space[] {
    return this.spaces;
  }

  getById(id: number): Space | undefined {
    return this.spaces.find((s) => s.id === id);
  }
}
