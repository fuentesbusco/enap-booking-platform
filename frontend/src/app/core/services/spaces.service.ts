import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Space } from '../models';
import { MOCK_SPACES, BLOCKED_DATES } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class SpacesService {
  getAll(): Observable<Space[]> {
    return of(MOCK_SPACES);
  }

  getById(id: number): Observable<Space | undefined> {
    return of(MOCK_SPACES.find((s) => s.id === id));
  }

  getBlockedDates(spaceId: number): Observable<string[]> {
    return of(BLOCKED_DATES[spaceId] ?? []);
  }

  // Cuando se conecte el backend, solo se reemplaza el body de cada método
  // con this.http.get<Space[]>(`${env.apiUrl}/spaces`) etc.
}
