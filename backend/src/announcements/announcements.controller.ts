import { Controller, Get, Post, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '../aws/aws.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly awsService: AwsService,
  ) {}

  @Get()
  async getAll() {
    return this.announcementsService.getAll();
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let photoUrl = '';
    if (file) {
      photoUrl = await this.awsService.uploadFile(
        file.buffer,
        'announcements',
        file.originalname,
        file.mimetype,
      );
    } else {
      photoUrl = `https://atelier-busco-s3.amazonaws.com/announcements/announcement-photo-${Date.now()}.jpg`;
    }
    return {
      success: true,
      photoUrl,
    };
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
