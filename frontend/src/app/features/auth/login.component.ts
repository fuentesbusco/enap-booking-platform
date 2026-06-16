import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <div
      class="pt-16 min-h-screen bg-mist flex items-center justify-center px-4"
    >
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div
            class="w-14 h-14 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-sand font-bold text-xl font-mono">E</span>
          </div>
          <h1 class="font-display text-3xl text-charcoal">Ingresar</h1>
          <p class="text-charcoal/50 text-sm mt-1">
            Centro Vacacional Sindicato ENAP
          </p>
        </div>

        <!-- Demo banner -->
        <div
          class="bg-sand/20 border border-sand/40 rounded-xl p-4 mb-6 text-center"
        >
          <p
            class="text-xs text-charcoal/60 font-mono uppercase tracking-wider mb-3"
          >
            Modo demo - elige un perfil
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button
              (click)="auth.loginAsSocio()"
              class="bg-forest text-white rounded-xl py-3 px-4 text-sm font-medium hover:bg-sage transition-colors"
            >
              <span class="block text-lg mb-0.5">👤</span>
              Ingresar como Socio
            </button>
            <button
              (click)="auth.loginAsAdmin()"
              class="bg-charcoal text-white rounded-xl py-3 px-4 text-sm font-medium hover:bg-charcoal/80 transition-colors"
            >
              <span class="block text-lg mb-0.5">🔐</span>
              Ingresar como Admin
            </button>
          </div>
        </div>

        <p class="text-center text-xs text-charcoal/35 font-mono">
          En producción este formulario conectará con el backend JWT.
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  auth = inject(AuthService);
}
