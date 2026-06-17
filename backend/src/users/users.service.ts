import { Injectable, NotFoundException } from '@nestjs/common';
import { User, MOCK_USER_SOCIO, MOCK_USER_ADMIN, MOCK_USER_EXTERNAL } from '../models';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      ...MOCK_USER_SOCIO,
      is_active: true,
    },
    {
      ...MOCK_USER_ADMIN,
      is_active: true,
    },
    {
      ...MOCK_USER_EXTERNAL,
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
  ];

  getAll(): User[] {
    return this.users;
  }

  getById(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  getByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  create(userData: Omit<User, 'id'>): User {
    const nextId = this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      id: nextId,
      is_active: userData.is_active ?? true,
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  toggleStatus(id: number): boolean {
    const user = this.getById(id);
    user.is_active = !user.is_active;
    return true;
  }
}
