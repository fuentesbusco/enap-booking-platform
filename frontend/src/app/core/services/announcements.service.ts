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

  create(ann: Omit<Announcement, 'id' | 'published_at'>): Observable<Announcement> {
    return this.http.post<any>(`${environment.apiUrl}/announcements`, ann).pipe(
      map(mapAnnouncementToFrontend)
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/announcements/${id}`).pipe(
      map((res) => res.success)
    );
  }

  uploadPhoto(file: File): Observable<{ success: boolean; photoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; photoUrl: string }>(
      `${environment.apiUrl}/announcements/upload-photo`,
      formData
    );
  }
}
