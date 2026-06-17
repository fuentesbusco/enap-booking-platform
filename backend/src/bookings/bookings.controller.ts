import { Controller, Get, Post, Patch, Body, Headers, Param, UnauthorizedException, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthService } from '../auth/auth.service';
import { Guest } from '../models';
import { UserEntity } from '../users/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from '../aws/aws.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly authService: AuthService,
    private readonly awsService: AwsService,
  ) {}

  @Get()
  @Roles('admin')
  async getAll(@Headers() headers: Record<string, string>) {
    await this.getAdminUser(headers);
    return this.bookingsService.getAll();
  }

  @Get('me')
  async getMyBookings(@Headers() headers: Record<string, string>) {
    const user = await this.getAuthenticatedUser(headers);
    return this.bookingsService.getByUser(user.id);
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(
    @Headers() headers: Record<string, string>,
    @Body() body: { spaceId: number; checkIn: string; checkOut: string; guests: Guest[] },
  ) {
    const user = await this.getAuthenticatedUser(headers);
    return this.bookingsService.createBooking(
      user,
      body.spaceId,
      body.checkIn,
      body.checkOut,
      body.guests,
    );
  }

  @Post('upload-receipt')
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async uploadReceipt(
    @Headers() headers: Record<string, string>,
    @Body() body: { bookingId: any },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.getAuthenticatedUser(headers);
    
    const bookingId = Number(body.bookingId);
    if (!body.bookingId || isNaN(bookingId)) {
      throw new BadRequestException('El ID de la reserva debe ser un número válido.');
    }

    let receiptUrl = '';
    if (file) {
      receiptUrl = await this.awsService.uploadFile(
        file.buffer,
        'receipts',
        file.originalname,
        file.mimetype,
      );
    } else {
      receiptUrl = `https://atelier-busco-s3.amazonaws.com/receipts/receipt-${bookingId}-${Date.now()}.pdf`;
    }

    const booking = await this.bookingsService.uploadReceipt(bookingId, receiptUrl);
    return {
      success: true,
      receiptUrl,
      booking,
    };
  }

  @Patch(':id/approve')
  @Roles('admin')
  async approve(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    await this.getAdminUser(headers);
    return this.bookingsService.approveBooking(Number(id));
  }

  @Patch(':id/reject')
  @Roles('admin')
  async reject(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: { notes: string },
  ) {
    await this.getAdminUser(headers);
    return this.bookingsService.rejectBooking(Number(id), body.notes);
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
