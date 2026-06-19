import { Controller, Get, Post, Patch, Body, Param, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Headers() headers: Record<string, string>,
    @Body() body: { bookingId: number; rating: number; comment: string },
  ) {
    const user = await this.getAuthenticatedUser(headers);
    const feedback = await this.feedbackService.create(user.id, body);
    return {
      success: true,
      feedback,
    };
  }

  @Get('space/:spaceId')
  async getApprovedBySpace(@Param('spaceId') spaceId: string) {
    const list = await this.feedbackService.getApprovedBySpace(Number(spaceId));
    return {
      success: true,
      feedbacks: list,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAll(@Headers() headers: Record<string, string>) {
    await this.getAdminUser(headers);
    const list = await this.feedbackService.getAll();
    return {
      success: true,
      feedbacks: list,
    };
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async moderate(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected' },
  ) {
    await this.getAdminUser(headers);
    const updated = await this.feedbackService.moderate(Number(id), body.status);
    return {
      success: true,
      feedback: updated,
    };
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
