import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private users = signal<User[]>([
    {
      id: 1,
      full_name: 'Carlos Muñoz Rojas',
      rut: '12.345.678-9',
      email: 'carlos.munoz@enap.cl',
      role: 'socio',
      ficha_number: 'ENP-0042',
      is_active: true,
    },
    {
      id: 2,
      full_name: 'Ana González',
      rut: '15.678.901-2',
      email: 'ana@gmail.com',
      role: 'external',
      is_active: true,
    },
    {
      id: 3,
      full_name: 'Roberto Pérez',
      rut: '16.789.012-3',
      email: 'roberto@enap.cl',
      role: 'socio',
      ficha_number: 'ENP-0078',
      is_active: true,
    },
    {
      id: 4,
      full_name: 'Valentina Torres',
      rut: '17.890.123-4',
      email: 'vtorres@enap.cl',
      role: 'socio',
      ficha_number: 'ENP-0112',
      is_active: false,
    },
    {
      id: 5,
      full_name: 'Marcos Fuentes',
      rut: '18.901.234-5',
      email: 'marcos@hotmail.com',
      role: 'external',
      is_active: true,
    },
  ]);

  getAll(): Observable<User[]> {
    return of(this.users());
  }

  create(user: Omit<User, 'id'>): Observable<User> {
    const nextId = this.users().length > 0 ? Math.max(...this.users().map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      id: nextId,
      is_active: user.is_active ?? true,
      ...user,
    };
    this.users.update((list) => [...list, newUser]);
    return of(newUser);
  }

  toggleStatus(id: number): Observable<boolean> {
    let toggled = false;
    this.users.update((list) =>
      list.map((u) => {
        if (u.id === id) {
          toggled = true;
          return { ...u, is_active: !u.is_active };
        }
        return u;
      }),
    );
    return of(toggled);
  }
}
