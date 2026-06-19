import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab: 'login' | 'register' | 'guest' = 'login';
  errorMessage = '';
  loading = false;
  redirectTo = '';

  // Form fields
  loginEmail = '';
  loginPassword = '';

  // Register fields
  regFullName = '';
  regRut = '';
  regEmail = '';
  regPassword = '';
  regFichaNumber = '';

  // Guest fields
  guestFullName = '';
  guestRut = '';
  guestEmail = '';
  guestFichaNumber = '';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.redirectTo = params['redirectTo'] || '';
    });
  }

  setTab(tab: 'login' | 'register' | 'guest') {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Por favor complete todos los campos.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res) => {
        this.loading = false;
        this.navigateAfterAuth(res.user.role);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Credenciales incorrectas.';
      },
    });
  }

  onRegister() {
    if (!this.regFullName || !this.regRut || !this.regEmail || !this.regPassword || !this.regFichaNumber) {
      this.errorMessage = 'Todos los campos son obligatorios para el registro de socios.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.register({
      fullName: this.regFullName,
      rut: this.regRut,
      email: this.regEmail,
      password: this.regPassword,
      role: 'socio',
      fichaNumber: this.regFichaNumber,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.navigateAfterAuth('socio');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error en el registro. Verifique sus datos.';
      },
    });
  }

  onGuestSubmit() {
    if (!this.guestFullName || !this.guestRut || !this.guestEmail) {
      this.errorMessage = 'Por favor complete todos sus datos personales (Nombre, RUT y Correo).';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const role = this.guestFichaNumber ? 'socio' : 'external';

    this.auth.register({
      fullName: this.guestFullName,
      rut: this.guestRut,
      email: this.guestEmail,
      role,
      fichaNumber: this.guestFichaNumber || undefined,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.navigateAfterAuth(role);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar invitado. Verifique sus datos.';
      },
    });
  }

  quickLoginSocio() {
    this.loading = true;
    this.errorMessage = '';
    this.auth.login('carlos.munoz@enap.cl', 'password123').subscribe({
      next: () => {
        this.loading = false;
        this.navigateAfterAuth('socio');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Fallo en quick login.';
      }
    });
  }

  quickLoginAdmin() {
    this.loading = true;
    this.errorMessage = '';
    this.auth.login('admin@sindicatoenap.cl', 'password123').subscribe({
      next: () => {
        this.loading = false;
        this.navigateAfterAuth('admin');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Fallo en quick login.';
      }
    });
  }

  private navigateAfterAuth(role: string) {
    if (this.redirectTo) {
      this.router.navigateByUrl(this.redirectTo);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/reservas']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
