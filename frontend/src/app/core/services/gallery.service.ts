import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GalleryItem, mapGalleryItemToFrontend } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);

  getAll(): Observable<GalleryItem[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/gallery`).pipe(
      map((list) => list.map(mapGalleryItemToFrontend))
    );
  }

  create(item: Omit<GalleryItem, 'id'>): Observable<GalleryItem> {
    return this.http.post<any>(`${environment.apiUrl}/gallery`, item).pipe(
      map(mapGalleryItemToFrontend)
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/gallery/${id}`).pipe(
      map((res) => res.success)
    );
  }
}
