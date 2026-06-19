import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private http = inject(HttpClient);

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/faqs`);
  }

  create(faq: { question: string; answer: string; order?: number }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/faqs`, faq);
  }

  update(id: number, faq: Partial<{ question: string; answer: string; order: number }>): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/faqs/${id}`, faq);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/faqs/${id}`);
  }
}
