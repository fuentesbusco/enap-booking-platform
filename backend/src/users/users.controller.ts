import { Controller, Get, Post, Patch, Param, Body, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../models';
import { UserEntity } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @Roles('admin')
  async getAll(@Headers() headers: Record<string, string>) {
    await this.getAdminUser(headers);
    return this.usersService.getAll();
  }

  @Post()
  @Roles('admin')
  async create(
    @Headers() headers: Record<string, string>,
    @Body() body: Omit<User, 'id'>,
  ) {
    await this.getAdminUser(headers);
    return this.usersService.create(body);
  }

  @Patch(':id/toggle-status')
  @Roles('admin')
  async toggleStatus(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    await this.getAdminUser(headers);
    return { success: await this.usersService.toggleStatus(Number(id)) };
  }

  @Get('profile')
  async getProfile(@Headers() headers: Record<string, string>) {
    const user = await this.getAuthenticatedUser(headers);
    return user;
  }

  private async getAuthenticatedUser(headers: Record<string, string>): Promise<UserEntity> {
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
    return user;
  }

  private async getAdminUser(headers: Record<string, string>): Promise<UserEntity> {
    const user = await this.getAuthenticatedUser(headers);
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Restricted access for admins only');
    }
    return user;
  }
}
