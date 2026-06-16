import { Controller, Get } from '@nestjs/common';
import { SpacesService } from './spaces.service';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  getAll() {
    return this.spacesService.getAll();
  }
}
