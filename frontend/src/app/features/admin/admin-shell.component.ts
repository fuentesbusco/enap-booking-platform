import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  auth = inject(AuthService);
  nav = [
    { path: 'reservas', icon: '📋', label: 'Reservas' },
    { path: 'espacios', icon: '🏡', label: 'Espacios' },
    { path: 'usuarios', icon: '👥', label: 'Usuarios' },
    { path: 'avisos', icon: '📢', label: 'Avisos' },
    { path: 'tesoreria', icon: '💰', label: 'Tesorería' },
  ];
}
