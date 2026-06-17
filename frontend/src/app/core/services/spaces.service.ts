import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Space } from '../models';
import { MOCK_SPACES, BLOCKED_DATES } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class SpacesService {
  private spaces = signal<Space[]>([...MOCK_SPACES]);

  getAll(): Observable<Space[]> {
    return of(this.spaces());
  }

  getById(id: number): Observable<Space | undefined> {
    return of(this.spaces().find((s) => s.id === id));
  }

  getBlockedDates(spaceId: number): Observable<string[]> {
    return of(BLOCKED_DATES[spaceId] ?? []);
  }

  create(space: Omit<Space, 'id'>): Observable<Space> {
    const nextId = this.spaces().length > 0 ? Math.max(...this.spaces().map((s) => s.id)) + 1 : 1;
    const newSpace: Space = { id: nextId, ...space };
    this.spaces.update((list) => [...list, newSpace]);
    return of(newSpace);
  }

  update(id: number, spaceData: Partial<Space>): Observable<Space | undefined> {
    this.spaces.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...spaceData } : s)),
    );
    return of(this.spaces().find((s) => s.id === id));
  }

  delete(id: number): Observable<boolean> {
    const initial = this.spaces().length;
    this.spaces.update((list) => list.filter((s) => s.id !== id));
    return of(this.spaces().length !== initial);
  }
}
