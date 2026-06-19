import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Space, mapSpaceToFrontend, mapSpaceToBackend } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SpacesService {
  private http = inject(HttpClient);

  getAll(): Observable<Space[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/spaces`).pipe(
      map((list) => list.map(mapSpaceToFrontend))
    );
  }

  getById(id: number): Observable<Space | undefined> {
    return this.http.get<any>(`${environment.apiUrl}/spaces/${id}`).pipe(
      map(mapSpaceToFrontend)
    );
  }

  getBlockedDates(spaceId: number): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/bookings/blocked-dates/${spaceId}`);
  }

  create(space: Omit<Space, 'id'>): Observable<Space> {
    const backendData = mapSpaceToBackend(space);
    return this.http.post<any>(`${environment.apiUrl}/spaces`, backendData).pipe(
      map(mapSpaceToFrontend)
    );
  }

  update(id: number, spaceData: Partial<Space>): Observable<Space | undefined> {
    const backendData = mapSpaceToBackend(spaceData);
    return this.http.put<any>(`${environment.apiUrl}/spaces/${id}`, backendData).pipe(
      map(mapSpaceToFrontend)
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${environment.apiUrl}/spaces/${id}`).pipe(
      map((res) => res.success)
    );
  }

  uploadPhoto(file: File): Observable<{ success: boolean; photoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: boolean; photoUrl: string }>(
      `${environment.apiUrl}/spaces/upload-photo`,
      formData
    );
  }
}
