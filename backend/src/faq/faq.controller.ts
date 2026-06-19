import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { FaqService } from './faq.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('faqs')
export class FaqController {
  constructor(
    private readonly faqService: FaqService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getAll() {
    return this.faqService.getAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Headers() headers: Record<string, string>,
    @Body() body: { question: string; answer: string; order?: number },
  ) {
    await this.getAdminUser(headers);
    return this.faqService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: { question?: string; answer?: string; order?: number },
  ) {
    await this.getAdminUser(headers);
    return this.faqService.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    await this.getAdminUser(headers);
    const success = await this.faqService.delete(Number(id));
    return { success };
  }

  private async getAuthenticatedUser(headers: Record<string, string>) {
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

  private async getAdminUser(headers: Record<string, string>) {
    const user = await this.getAuthenticatedUser(headers);
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Restricted access for admins only');
    }
    return user;
  }
}
