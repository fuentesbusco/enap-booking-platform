import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { mapUserToFrontend } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // User Profile
  fullName = '';
  rut = '';
  email = '';
  phone = '';
  roleLabel = '';

  // Forms Loading State
  profileLoading = false;
  passwordLoading = false;

  // Change Password Fields
  oldPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user) {
      this.toastService.warning('Debes iniciar sesión para ver tu perfil.');
      this.router.navigate(['/ingresar']);
      return;
    }

    this.fullName = user.full_name;
    this.rut = user.rut;
    this.email = user.email;
    this.phone = user.phone || '';
    this.roleLabel = user.role === 'admin' ? 'Administrador' : user.role === 'socio' ? 'Socio Sindicato' : 'Invitado / Externo';
  }

  validateChileanPhone(phone: string): boolean {
    if (!phone) return true; // Permite estar vacío si es opcional, pero si se escribe debe ser válido
    const cleanPhone = phone.replace(/\s+/g, '');
    const regex = /^(\+56)?9\d{8}$/;
    return regex.test(cleanPhone);
  }

  saveProfile() {
    if (!this.email.trim()) {
      this.toastService.warning('El correo electrónico es obligatorio.');
      return;
    }

    if (this.phone.trim() && !this.validateChileanPhone(this.phone)) {
      this.toastService.error('El formato de teléfono no es válido para Chile. Ejemplo válido: +56 9 1234 5678 o 912345678.');
      return;
    }

    if (this.profileLoading) return;
    this.profileLoading = true;

    this.usersService.updateProfile(this.email.trim(), this.phone.trim()).subscribe({
      next: (res) => {
        this.profileLoading = false;
        if (res.success) {
          this.toastService.success('Datos de contacto actualizados correctamente.');
          // Actualizar señal local
          const mappedUser = mapUserToFrontend(res.user);
          this.authService.currentUser.set(mappedUser);
          
          const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage;
          storage.setItem('user', JSON.stringify(mappedUser));
        } else {
          this.toastService.error('No se pudieron guardar los cambios.');
        }
      },
      error: (err) => {
        this.profileLoading = false;
        this.toastService.error(err.error?.message || 'Error al actualizar el perfil.');
        console.error(err);
      }
    });
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmNewPassword) {
      this.toastService.warning('Todos los campos de contraseña son obligatorios.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastService.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.toastService.error('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    if (this.passwordLoading) return;
    this.passwordLoading = true;

    this.usersService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.passwordLoading = false;
        if (res.success) {
          this.toastService.success('Contraseña actualizada con éxito.');
          this.oldPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
        } else {
          this.toastService.error('No se pudo actualizar la contraseña.');
        }
      },
      error: (err) => {
        this.passwordLoading = false;
        this.toastService.error(err.error?.message || 'Error al actualizar la contraseña. Verifica tu clave actual.');
        console.error(err);
      }
    });
  }
}
