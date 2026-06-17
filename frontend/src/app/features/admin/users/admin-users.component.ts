import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { User, UserRole } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  // Modal State
  showModal = false;

  // Form Fields
  formFullName = '';
  formRut = '';
  formEmail = '';
  formRole: UserRole = 'socio';
  formFichaNumber = '';

  constructor(private usersService: UsersService) {}

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
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const userData = {
      full_name: this.formFullName,
      rut: this.formRut,
      email: this.formEmail,
      role: this.formRole,
      ficha_number: this.formRole === 'socio' ? this.formFichaNumber : undefined,
      is_active: true,
    };

    this.usersService.create(userData).subscribe(() => {
      this.loadUsers();
      this.closeModal();
    });
  }

  toggleStatus(id: number) {
    this.usersService.toggleStatus(id).subscribe((success) => {
      if (success) {
        this.loadUsers();
      }
    });
  }
}
