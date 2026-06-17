import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, mapUserToFrontend, mapUserToBackend } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  getAll(): Observable<User[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users`).pipe(
      map((list) => list.map(mapUserToFrontend))
    );
  }

  create(user: Omit<User, 'id'>): Observable<User> {
    const backendData = mapUserToBackend(user);
    return this.http.post<any>(`${environment.apiUrl}/users`, backendData).pipe(
      map(mapUserToFrontend)
    );
  }

  toggleStatus(id: number): Observable<boolean> {
    return this.http.patch<{ success: boolean }>(`${environment.apiUrl}/users/${id}/toggle-status`, {}).pipe(
      map((res) => res.success)
    );
  }
}
