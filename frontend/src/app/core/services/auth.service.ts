import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, mapUserToFrontend } from '../models';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  
  currentUser = signal<User | null>(null);

  constructor() {
    const savedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(email: string, password?: string): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: any }>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(({ token, user }) => {
        const mappedUser = mapUserToFrontend(user);
        this.currentUser.set(mappedUser);
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(mappedUser));
        this.toastService.success(`¡Bienvenido, ${mappedUser.full_name}!`);
      }),
      map(({ token, user }) => ({ token, user: mapUserToFrontend(user) }))
    );
  }

  register(data: {
    fullName: string;
    rut: string;
    email: string;
    password?: string;
    role?: string;
    fichaNumber?: string;
  }): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: any }>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(({ token, user }) => {
        const mappedUser = mapUserToFrontend(user);
        this.currentUser.set(mappedUser);
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(mappedUser));
        this.toastService.success(`¡Registro exitoso! Bienvenido, ${mappedUser.full_name}.`);
      }),
      map(({ token, user }) => ({ token, user: mapUserToFrontend(user) }))
    );
  }

  logout() {
    this.currentUser.set(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.toastService.info('Sesión cerrada correctamente.');
    this.router.navigate(['/']);
  }

  loginAsSocio() {
    this.login('carlos.munoz@enap.cl', 'password123').subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => console.error('Bypass login failed', err)
    });
  }

  loginAsAdmin() {
    this.login('admin@sindicatoenap.cl', 'password123').subscribe({
      next: () => this.router.navigate(['/admin/reservas']),
      error: (err) => console.error('Bypass login failed', err)
    });
  }

  isLoggedIn(): boolean { return !!this.currentUser(); }
  isAdmin(): boolean    { return this.currentUser()?.role === 'admin'; }
  isSocio(): boolean    { return this.currentUser()?.role === 'socio'; }
}
