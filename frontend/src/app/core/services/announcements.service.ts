import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Announcement, mapAnnouncementToFrontend } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnnouncementsService {
  private http = inject(HttpClient);

  getPublic(): Observable<Announcement[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/announcements`).pipe(
      map((list) => list.map(mapAnnouncementToFrontend))
    );
  }

  getAll(): Observable<Announcement[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/announcements`).pipe(
      map((list) => list.map(mapAnnouncementToFrontend))
    );
  }
}
