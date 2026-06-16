import { Controller, Get, Post, Patch, Body, Headers, Param, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AuthService } from '../auth/auth.service';
import { Guest, User } from '../models';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getAll(@Headers() headers: Record<string, string>) {
    this.getAdminUser(headers);
    return this.bookingsService.getAll();
  }

  @Get('me')
  getMyBookings(@Headers() headers: Record<string, string>) {
    const user = this.getAuthenticatedUser(headers);
    return this.bookingsService.getByUser(user.id);
  }

  @Post()
  create(
    @Headers() headers: Record<string, string>,
    @Body() body: { spaceId: number; checkIn: string; checkOut: string; guests: Guest[] },
  ) {
    const user = this.getAuthenticatedUser(headers);
    return this.bookingsService.createBooking(
      user,
      body.spaceId,
      body.checkIn,
      body.checkOut,
      body.guests,
    );
  }

  @Post('upload-receipt')
  @HttpCode(HttpStatus.OK)
  uploadReceipt(
    @Headers() headers: Record<string, string>,
    @Body() body: { bookingId: number },
  ) {
    this.getAuthenticatedUser(headers);
    // Simulate S3 upload by returning a mock URL and associating it with the booking
    const mockReceiptUrl = `https://atelier-busco-s3.amazonaws.com/receipts/receipt-${body.bookingId}-${Date.now()}.pdf`;
    const booking = this.bookingsService.uploadReceipt(body.bookingId, mockReceiptUrl);
    return {
      success: true,
      receiptUrl: mockReceiptUrl,
      booking,
    };
  }

  @Patch(':id/approve')
  approve(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    this.getAdminUser(headers);
    return this.bookingsService.approveBooking(Number(id));
  }

  @Patch(':id/reject')
  reject(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: { notes: string },
  ) {
    this.getAdminUser(headers);
    return this.bookingsService.rejectBooking(Number(id), body.notes);
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
