import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UnauthorizedException, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { AuthService } from '../auth/auth.service';
import { Space } from '../models';
import { UserEntity } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '../aws/aws.service';

@Controller('spaces')
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly authService: AuthService,
    private readonly awsService: AwsService,
  ) {}

  @Get()
  async getAll() {
    return this.spacesService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Headers() headers: Record<string, string>,
    @Body() body: Omit<Space, 'id'>,
  ) {
    await this.getAdminUser(headers);
    return this.spacesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: Partial<Space>,
  ) {
    await this.getAdminUser(headers);
    return this.spacesService.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    await this.getAdminUser(headers);
    return { success: await this.spacesService.delete(Number(id)) };
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.getAdminUser(headers);

    let photoUrl = '';
    if (file) {
      photoUrl = await this.awsService.uploadFile(
        file.buffer,
        'spaces',
        file.originalname,
        file.mimetype,
      );
    } else {
      photoUrl = `https://atelier-busco-s3.amazonaws.com/spaces/space-photo-${Date.now()}.jpg`;
    }

    return {
      success: true,
      photoUrl,
    };
  }

  private async getAdminUser(headers: Record<string, string>): Promise<UserEntity> {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }
    const user = await this.authService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired authorization token');
    }
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Restricted access for admins only');
    }
    return user;
  }
}
