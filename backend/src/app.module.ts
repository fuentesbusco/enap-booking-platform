import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
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
import { NotificationsModule } from './notifications/notifications.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AwsModule } from './aws/aws.module';
import { MulterModule } from '@nestjs/platform-express';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';
import { MercadoPagoController } from './mercadopago/mercadopago.controller';
import { GalleryController } from './gallery/gallery.controller';
import { GalleryService } from './gallery/gallery.service';

// Feedback & FAQ
import { FeedbackEntity } from './feedback/feedback.entity';
import { FaqEntity } from './faq/faq.entity';
import { FeedbackController } from './feedback/feedback.controller';
import { FeedbackService } from './feedback/feedback.service';
import { FaqController } from './faq/faq.controller';
import { FaqService } from './faq/faq.service';

// Entities
import { UserEntity } from './users/user.entity';
import { SpaceEntity } from './spaces/space.entity';
import { GuestEntity } from './bookings/guest.entity';
import { Booking } from './bookings/booking.entity';
import { AnnouncementEntity } from './announcements/announcement.entity';
import { GalleryEntity } from './gallery/gallery.entity';

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
        port: Number(config.get<string | number>('DB_PORT', 3306)),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'enap_booking'),
        entities: [UserEntity, SpaceEntity, GuestEntity, Booking, AnnouncementEntity, GalleryEntity, FeedbackEntity, FaqEntity],
        synchronize: String(config.get('DB_SYNCHRONIZE', 'false')) === 'true',
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: String(config.get('DB_MIGRATIONS_RUN', 'true')) === 'true',
        extra: {
          connectionLimit: Number(config.get<string | number>('DB_CONNECTION_LIMIT', 2)),
        },
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      SpaceEntity,
      GuestEntity,
      Booking,
      AnnouncementEntity,
      GalleryEntity,
      FeedbackEntity,
      FaqEntity,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'super_secret_key_12345'),
        signOptions: {
          expiresIn: config.get<any>('JWT_EXPIRATION', '24h'),
        },
      }),
    }),
    AwsModule,
    NotificationsModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    MercadoPagoModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
  controllers: [
    AppController,
    HealthController,
    AuthController,
    SpacesController,
    AnnouncementsController,
    BookingsController,
    UsersController,
    MercadoPagoController,
    GalleryController,
    FeedbackController,
    FaqController,
  ],
  providers: [
    AppService,
    AuthService,
    SpacesService,
    AnnouncementsService,
    BookingsService,
    UsersService,
    SeedService,
    GalleryService,
    FeedbackService,
    FaqService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

