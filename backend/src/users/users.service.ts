import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User, MOCK_USER_SOCIO, MOCK_USER_ADMIN, MOCK_USER_EXTERNAL } from '../models';
import { hashPassword } from '../auth/hash.util';

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

  constructor() {
    // Automatically initialize default users with 'password123' hashed
    this.users.forEach((u) => {
      if (!u.passwordHash) {
        u.passwordHash = hashPassword('password123');
      }
    });
  }

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

  create(userData: Omit<User, 'id'> & { password?: string }): User {
    const existing = this.getByEmail(userData.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const nextId = this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;
    
    // Hash password if provided
    let passwordHash: string | undefined;
    if (userData.password) {
      passwordHash = hashPassword(userData.password);
    } else {
      passwordHash = hashPassword('password123'); // Default fallback password
    }

    const cleanUserData = { ...userData };
    delete cleanUserData.password;

    const newUser: User = {
      id: nextId,
      is_active: userData.is_active ?? true,
      passwordHash,
      ...cleanUserData,
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
