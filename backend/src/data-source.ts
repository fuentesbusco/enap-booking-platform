import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from './users/user.entity';
import { SpaceEntity } from './spaces/space.entity';
import { GuestEntity } from './bookings/guest.entity';
import { Booking } from './bookings/booking.entity';
import { AnnouncementEntity } from './announcements/announcement.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'enap_booking',
  entities: [UserEntity, SpaceEntity, GuestEntity, Booking, AnnouncementEntity],
  synchronize: false, // Sincronización desactivada para manejo por migraciones
  logging: true,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
