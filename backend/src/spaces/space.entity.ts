import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { SpaceType } from '../models';
import { Booking } from '../bookings/booking.entity';

@Entity('spaces')
export class SpaceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: SpaceType;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'max_capacity' })
  maxCapacity: number;

  @Column({ name: 'base_price' })
  basePrice: number;

  @Column({ name: 'socio_price' })
  socioPrice: number;

  @Column({ name: 'guest_price' })
  guestPrice: number;

  @Column({ name: 'free_guests_for_socio', default: 0 })
  freeGuestsForSocio: number;

  @Column({ type: 'simple-json' })
  images: string[];

  @Column({ type: 'simple-json' })
  amenities: string[];

  @OneToMany(() => Booking, (booking) => booking.space)
  bookings: Booking[];
}
