import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { AuthService } from '../auth/auth.service';
import { Space } from '../models';
import { UserEntity } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('spaces')
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly authService: AuthService,
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
