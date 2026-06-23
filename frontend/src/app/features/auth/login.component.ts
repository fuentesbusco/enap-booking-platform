import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { AuthService } from '../../core/services/auth.service';
import { BookingsService } from '../../core/services/bookings.service';

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
  private bookingsService = inject(BookingsService);

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

  // External request fields
  extFullName = '';
  extEmail = '';
  extPhone = '';
  extSpaceName = 'Cabaña';
  extCheckIn = '';
  extCheckOut = '';
  extGuestsCount = 1;
  extMessage = '';
  extSuccess = false;

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

    const emailLower = this.loginEmail.toLowerCase().trim();
    const isValidDomain = emailLower.endsWith('@enap.cl') || emailLower.endsWith('@enaprefinerias.cl');
    if (!isValidDomain && emailLower !== 'admin@sindicatoenap.cl') {
      this.errorMessage = 'El inicio de sesión está restringido a correos con dominio @enap.cl o @enaprefinerias.cl.';
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

    const emailLower = this.regEmail.toLowerCase().trim();
    const isValidDomain = emailLower.endsWith('@enap.cl') || emailLower.endsWith('@enaprefinerias.cl');
    if (!isValidDomain) {
      this.errorMessage = 'El correo electrónico de registro debe pertenecer al dominio @enap.cl o @enaprefinerias.cl.';
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

    const emailLower = this.guestEmail.toLowerCase().trim();
    const isValidDomain = emailLower.endsWith('@enap.cl') || emailLower.endsWith('@enaprefinerias.cl');
    if (!isValidDomain) {
      this.errorMessage = 'El correo electrónico de registro debe pertenecer al dominio @enap.cl o @enaprefinerias.cl.';
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

  onExternalSubmit() {
    if (!this.extFullName || !this.extEmail || !this.extPhone || !this.extSpaceName || !this.extCheckIn || !this.extCheckOut) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios del formulario.';
      return;
    }

    if (this.extGuestsCount < 1) {
      this.errorMessage = 'La cantidad de personas debe ser al menos 1.';
      return;
    }

    const emailLower = this.extEmail.toLowerCase().trim();
    if (!emailLower.includes('@')) {
      this.errorMessage = 'Por favor ingrese un correo electrónico válido.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.bookingsService.sendExternalRequest({
      fullName: this.extFullName,
      email: this.extEmail,
      phone: this.extPhone,
      spaceName: this.extSpaceName,
      checkIn: this.extCheckIn,
      checkOut: this.extCheckOut,
      guestsCount: this.extGuestsCount,
      message: this.extMessage || undefined,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.extSuccess = true;
        this.resetExternalForm();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al enviar la solicitud. Intente nuevamente.';
      },
    });
  }

  resetExternalForm() {
    this.extFullName = '';
    this.extEmail = '';
    this.extPhone = '';
    this.extSpaceName = 'Cabaña';
    this.extCheckIn = '';
    this.extCheckOut = '';
    this.extGuestsCount = 1;
    this.extMessage = '';
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
