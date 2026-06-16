import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Announcement } from '../models';
import { MOCK_ANNOUNCEMENTS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private items = [...MOCK_ANNOUNCEMENTS];

  getPublic(): Observable<Announcement[]> {
    return of([...this.items].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0)));
  }

  getAll(): Observable<Announcement[]> {
    return of(this.items);
  }
}
