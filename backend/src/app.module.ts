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
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    HealthController,
    AuthController,
    SpacesController,
    AnnouncementsController,
    BookingsController,
    UsersController,
  ],
  providers: [
    AppService,
    AuthService,
    SpacesService,
    AnnouncementsService,
    BookingsService,
    UsersService,
  ],
})
export class AppModule {}
