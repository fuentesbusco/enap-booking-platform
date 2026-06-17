import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('announcements')
export class AnnouncementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ name: 'published_at', type: 'varchar' })
  publishedAt: string;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;
}
