import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { UserRole } from '../models';
import { Booking } from '../bookings/booking.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  rut: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  @Column({ name: 'ficha_number', nullable: true })
  fichaNumber?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}
