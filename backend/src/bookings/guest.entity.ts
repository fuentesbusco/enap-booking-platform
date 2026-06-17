import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('guests')
export class GuestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  rut: string;

  @Column({ nullable: true })
  phone?: string;

  @ManyToOne(() => Booking, (booking) => booking.guests, { onDelete: 'CASCADE' })
  booking: Booking;
}
