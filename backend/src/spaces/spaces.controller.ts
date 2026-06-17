import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { AuthService } from '../auth/auth.service';
import { Space, User } from '../models';

@Controller('spaces')
export class SpacesController {
  constructor(
    private readonly spacesService: SpacesService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getAll() {
    return this.spacesService.getAll();
  }

  @Post()
  create(
    @Headers() headers: Record<string, string>,
    @Body() body: Omit<Space, 'id'>,
  ) {
    this.getAdminUser(headers);
    return this.spacesService.create(body);
  }

  @Put(':id')
  update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: Partial<Space>,
  ) {
    this.getAdminUser(headers);
    return this.spacesService.update(Number(id), body);
  }

  @Delete(':id')
  delete(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    this.getAdminUser(headers);
    return { success: this.spacesService.delete(Number(id)) };
  }

  private getAdminUser(headers: Record<string, string>): User {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }
    const user = this.authService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired authorization token');
    }
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Restricted access for admins only');
    }
    return user;
  }
}
