import { Injectable } from '@nestjs/common';
import { Announcement, MOCK_ANNOUNCEMENTS } from '../models';

@Injectable()
export class AnnouncementsService {
  private readonly announcements: Announcement[] = MOCK_ANNOUNCEMENTS;

  getAll(): Announcement[] {
    return this.announcements;
  }
}
