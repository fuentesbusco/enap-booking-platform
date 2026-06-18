import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  async getAll() {
    return this.galleryService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Body() body: { title: string; description?: string; imageUrl?: string; image_url?: string },
  ) {
    return this.galleryService.create({
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl ?? body.image_url ?? '',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const success = await this.galleryService.delete(Number(id));
    return { success };
  }
}
