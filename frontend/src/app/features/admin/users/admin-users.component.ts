import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, UserRole } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private toastService = inject(ToastService);

  users: User[] = [];
  loading = false;

  // Modal State
  showModal = false;

  // Form Fields
  formFullName = '';
  formRut = '';
  formEmail = '';
  formRole: UserRole = 'socio';
  formFichaNumber = '';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.getAll().subscribe((list) => {
      this.users = list;
    });
  }

  openCreateModal() {
    this.formFullName = '';
    this.formRut = '';
    this.formEmail = '';
    this.formRole = 'socio';
    this.formFichaNumber = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveUser() {
    if (!this.formFullName.trim() || !this.formRut.trim() || !this.formEmail.trim()) {
      this.toastService.warning('Por favor complete todos los campos obligatorios.');
      return;
    }
    if (this.loading) return;
    this.loading = true;

    const userData = {
      full_name: this.formFullName,
      rut: this.formRut,
      email: this.formEmail,
      role: this.formRole,
      ficha_number: this.formRole === 'socio' ? this.formFichaNumber : undefined,
      is_active: true,
    };

    this.usersService.create(userData).subscribe({
      next: () => {
        this.toastService.success('Usuario registrado exitosamente.');
        this.loadUsers();
        this.closeModal();
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Error al registrar el usuario.');
        this.loading = false;
      }
    });
  }

  toggleStatus(id: number) {
    if (this.loading) return;
    this.loading = true;
    this.usersService.toggleStatus(id).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.toastService.success('Estado del usuario actualizado con éxito.');
          this.loadUsers();
        }
      },
      error: () => {
        this.toastService.error('Error al actualizar el estado del usuario.');
        this.loading = false;
      }
    });
  }
}
