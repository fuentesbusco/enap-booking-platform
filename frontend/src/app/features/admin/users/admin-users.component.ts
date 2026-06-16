import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent {
  users = [
    {
      name: 'Carlos Muñoz Rojas',
      rut: '12.345.678-9',
      email: 'carlos.munoz@enap.cl',
      role: 'socio',
    },
    {
      name: 'Ana González',
      rut: '15.678.901-2',
      email: 'ana@gmail.com',
      role: 'external',
    },
    {
      name: 'Roberto Pérez',
      rut: '16.789.012-3',
      email: 'roberto@enap.cl',
      role: 'socio',
    },
    {
      name: 'Valentina Torres',
      rut: '17.890.123-4',
      email: 'vtorres@enap.cl',
      role: 'socio',
    },
    {
      name: 'Marcos Fuentes',
      rut: '18.901.234-5',
      email: 'marcos@hotmail.com',
      role: 'external',
    },
  ];
}
