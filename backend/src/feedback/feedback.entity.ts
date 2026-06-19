import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { SpaceEntity } from '../spaces/space.entity';
import { Booking } from '../bookings/booking.entity';

@Entity('feedbacks')
export class FeedbackEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'varchar', default: 'pending_approval' })
  status: 'pending_approval' | 'approved' | 'rejected';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn()
  booking: Booking;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', eager: true })
  user: UserEntity;

  @ManyToOne(() => SpaceEntity, { onDelete: 'CASCADE', eager: true })
  space: SpaceEntity;
}
