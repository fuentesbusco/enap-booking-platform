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
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly authService: AuthService,
    private readonly awsService: AwsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAll(@Headers() headers: Record<string, string>) {
    await this.getAdminUser(headers);
    return this.bookingsService.getAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyBookings(@Headers() headers: Record<string, string>) {
    const user = await this.getAuthenticatedUser(headers);
    return this.bookingsService.getByUser(user.id);
  }

  @Get('blocked-dates/:spaceId')
  async getBlockedDates(@Param('spaceId') spaceId: string) {
    return this.bookingsService.getBlockedDatesForSpace(Number(spaceId));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(
    @Headers() headers: Record<string, string>,
    @Body() body: {
      spaceId: number;
      checkIn: string;
      checkOut: string;
      guests: Guest[];
      isForThirdParty?: boolean;
      thirdPartyName?: string;
      thirdPartyRut?: string;
      thirdPartyPhone?: string;
      adminCreatedForExternal?: boolean;
      visitType?: string;
      additionalEmail?: string;
    },
  ) {
    const user = await this.getAuthenticatedUser(headers);
    return this.bookingsService.createBooking(
      user,
      body.spaceId,
      body.checkIn,
      body.checkOut,
      body.guests,
      {
        isForThirdParty: body.isForThirdParty,
        thirdPartyName: body.thirdPartyName,
        thirdPartyRut: body.thirdPartyRut,
        thirdPartyPhone: body.thirdPartyPhone,
        adminCreatedForExternal: body.adminCreatedForExternal,
        visitType: body.visitType,
        additionalEmail: body.additionalEmail,
      },
    );
  }

  @Post('upload-receipt')
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(
    @Body() body: { bookingCode: string; paymentId: string; status: string },
  ) {
    const booking = await this.bookingsService.confirmPayment(
      body.bookingCode,
      body.paymentId,
      body.status,
    );
    return {
      success: true,
      booking,
    };
  }

  @Post('external-request')
  @HttpCode(HttpStatus.OK)
  async createExternalRequest(
    @Body() body: {
      fullName: string;
      email: string;
      phone: string;
      spaceName: string;
      checkIn: string;
      checkOut: string;
      guestsCount: number;
      message?: string;
    },
  ) {
    await this.bookingsService.sendExternalRequestEmail(body);
    return { success: true };
  }

  @Patch(':id/assign-space')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async assignSpace(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: { spaceId: number },
  ) {
    await this.getAdminUser(headers);
    return this.bookingsService.assignSpace(Number(id), body.spaceId);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    await this.getAdminUser(headers);
    return this.bookingsService.approveBooking(Number(id));
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
