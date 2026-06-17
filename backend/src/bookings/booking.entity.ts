import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import type { BookingStatus, PriceBreakdown } from '../models';
import { UserEntity } from '../users/user.entity';
import { SpaceEntity } from '../spaces/space.entity';
import { GuestEntity } from './guest.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_code', unique: true })
  bookingCode: string;

  @ManyToOne(() => UserEntity, (user) => user.bookings, { eager: true, onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => SpaceEntity, (space) => space.bookings, { eager: true, onDelete: 'CASCADE' })
  space: SpaceEntity;

  @Column({ name: 'check_in', type: 'varchar' })
  checkIn: string;

  @Column({ name: 'check_out', type: 'varchar' })
  checkOut: string;

  @Column({ type: 'varchar' })
  status: BookingStatus;

  @Column({ name: 'total_amount' })
  totalAmount: number;

  @OneToMany(() => GuestEntity, (guest) => guest.booking, { cascade: true, eager: true })
  guests: GuestEntity[];

  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl?: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'simple-json', name: 'price_breakdown' })
  priceBreakdown: PriceBreakdown;
}
