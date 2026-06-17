import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { SeedService } from './seed.service';

// Entities
import { UserEntity } from './users/user.entity';
import { SpaceEntity } from './spaces/space.entity';
import { GuestEntity } from './bookings/guest.entity';
import { Booking } from './bookings/booking.entity';
import { AnnouncementEntity } from './announcements/announcement.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'enap_booking'),
        entities: [UserEntity, SpaceEntity, GuestEntity, Booking, AnnouncementEntity],
        synchronize: config.get<boolean>('DB_SYNCHRONIZE', false), // False by default for safety
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: config.get<boolean>('DB_MIGRATIONS_RUN', true), // Run migrations on startup
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      SpaceEntity,
      GuestEntity,
      Booking,
      AnnouncementEntity,
    ]),
  ],
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
    SeedService,
  ],
})
export class AppModule {}

