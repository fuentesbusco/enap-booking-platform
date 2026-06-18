import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRole } from '../models';
import { hashPassword } from '../auth/hash.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  async getById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(userData: {
    full_name?: string;
    fullName?: string;
    rut: string;
    email: string;
    role: UserRole;
    ficha_number?: string;
    fichaNumber?: string;
    is_active?: boolean;
    isActive?: boolean;
    password?: string;
  }): Promise<UserEntity> {
    const existing = await this.getByEmail(userData.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    let passwordHash: string;
    if (userData.password) {
      passwordHash = hashPassword(userData.password);
    } else {
      passwordHash = hashPassword('password123'); // Default fallback password
    }

    const newUser = this.userRepository.create({
      fullName: userData.full_name ?? userData.fullName,
      rut: userData.rut,
      email: userData.email,
      role: userData.role,
      fichaNumber: userData.ficha_number ?? userData.fichaNumber,
      isActive: userData.is_active ?? userData.isActive ?? true,
      passwordHash,
    });
    
    return this.userRepository.save(newUser);
  }

  async toggleStatus(id: number): Promise<boolean> {
    const user = await this.getById(id);
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    return true;
  }
}
