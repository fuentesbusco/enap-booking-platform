import { Controller, Get, Post, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '../aws/aws.service';

@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly awsService: AwsService,
  ) {}

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
        'gallery',
        file.originalname,
        file.mimetype,
      );
    } else {
      photoUrl = `https://atelier-busco-s3.amazonaws.com/gallery/gallery-photo-${Date.now()}.jpg`;
    }
    return {
      success: true,
      photoUrl,
    };
  }

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
