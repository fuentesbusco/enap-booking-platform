import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models';
import { MOCK_USER_SOCIO, MOCK_USER_ADMIN } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  constructor(private router: Router) {
    // En el mock arrancamos como socio por defecto para facilitar la demo
    const saved = sessionStorage.getItem('mock_user');
    if (saved) this.currentUser.set(JSON.parse(saved));
  }

  loginAsSocio() {
    this.currentUser.set(MOCK_USER_SOCIO);
    sessionStorage.setItem('mock_user', JSON.stringify(MOCK_USER_SOCIO));
    this.router.navigate(['/']);
  }

  loginAsAdmin() {
    this.currentUser.set(MOCK_USER_ADMIN);
    sessionStorage.setItem('mock_user', JSON.stringify(MOCK_USER_ADMIN));
    this.router.navigate(['/admin/reservas']);
  }

  logout() {
    this.currentUser.set(null);
    sessionStorage.removeItem('mock_user');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean { return !!this.currentUser(); }
  isAdmin(): boolean    { return this.currentUser()?.role === 'admin'; }
  isSocio(): boolean    { return this.currentUser()?.role === 'socio'; }
}
