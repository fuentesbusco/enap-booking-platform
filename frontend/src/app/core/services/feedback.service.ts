import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private http = inject(HttpClient);

  submitFeedback(bookingId: number, rating: number, comment: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/feedback`, { bookingId, rating, comment });
  }

  getApprovedBySpace(spaceId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/feedback/space/${spaceId}`);
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/feedback`);
  }

  moderate(id: number, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/feedback/${id}/moderate`, { status });
  }
}
