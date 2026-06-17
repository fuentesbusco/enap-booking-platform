import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { AuthService } from '../auth/auth.service';
import { Space } from '../models';
import { UserEntity } from '../users/user.entity';

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
  async create(
    @Headers() headers: Record<string, string>,
    @Body() body: Omit<Space, 'id'>,
  ) {
    await this.getAdminUser(headers);
    return this.spacesService.create(body);
  }

  @Put(':id')
  async update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: Partial<Space>,
  ) {
    await this.getAdminUser(headers);
    return this.spacesService.update(Number(id), body);
  }

  @Delete(':id')
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
