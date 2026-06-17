import { Controller, Get, Post, Patch, Param, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../models';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getAll(@Headers() headers: Record<string, string>) {
    this.getAdminUser(headers);
    return this.usersService.getAll();
  }

  @Post()
  create(
    @Headers() headers: Record<string, string>,
    @Body() body: Omit<User, 'id'>,
  ) {
    this.getAdminUser(headers);
    return this.usersService.create(body);
  }

  @Patch(':id/toggle-status')
  toggleStatus(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    this.getAdminUser(headers);
    return { success: this.usersService.toggleStatus(Number(id)) };
  }

  @Get('profile')
  getProfile(@Headers() headers: Record<string, string>) {
    const user = this.getAuthenticatedUser(headers);
    return user;
  }

  private getAuthenticatedUser(headers: Record<string, string>): User {
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
    return user;
  }

  private getAdminUser(headers: Record<string, string>): User {
    const user = this.getAuthenticatedUser(headers);
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Restricted access for admins only');
    }
    return user;
  }
}
