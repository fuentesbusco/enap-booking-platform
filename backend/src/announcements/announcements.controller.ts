import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async getAll() {
    return this.announcementsService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Body() body: { 
      title: string; 
      body: string; 
      imageUrl?: string; 
      image_url?: string; 
      isPinned?: boolean; 
      is_pinned?: boolean 
    },
  ) {
    const payload = {
      title: body.title,
      body: body.body,
      imageUrl: body.imageUrl ?? body.image_url,
      isPinned: body.isPinned ?? body.is_pinned ?? false,
    };
    return this.announcementsService.create(payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    const success = await this.announcementsService.delete(Number(id));
    return { success };
  }
}
