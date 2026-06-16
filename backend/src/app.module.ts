import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { SpacesController } from './spaces/spaces.controller';
import { SpacesService } from './spaces/spaces.service';
import { AnnouncementsController } from './announcements/announcements.controller';
import { AnnouncementsService } from './announcements/announcements.service';
import { BookingsController } from './bookings/bookings.controller';
import { BookingsService } from './bookings/bookings.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    HealthController,
    AuthController,
    SpacesController,
    AnnouncementsController,
    BookingsController,
  ],
  providers: [
    AppService,
    AuthService,
    SpacesService,
    AnnouncementsService,
    BookingsService,
  ],
})
export class AppModule {}
