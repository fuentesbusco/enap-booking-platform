import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserRole } from '../models';
import { hashPassword } from '../auth/hash.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly notificationsService: NotificationsService,
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

    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let pass = '';
      for (let i = 0; i < 6; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pass;
    };

    let plainPassword = userData.password;
    let isCreatedByAdmin = false;
    if (!plainPassword) {
      plainPassword = generatePassword();
      isCreatedByAdmin = true;
    }

    const passwordHash = hashPassword(plainPassword);

    const newUser = this.userRepository.create({
      fullName: userData.full_name ?? userData.fullName,
      rut: userData.rut,
      email: userData.email,
      role: userData.role,
      fichaNumber: userData.ficha_number ?? userData.fichaNumber,
      isActive: userData.is_active ?? userData.isActive ?? true,
      passwordHash,
    });
    
    const savedUser = await this.userRepository.save(newUser);
    const resultUser = savedUser as any;

    if (isCreatedByAdmin) {
      resultUser.tempPassword = plainPassword;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1b4332;">Bienvenido a la Plataforma de Reservas ENAP</h2>
          <p>Hola <strong>${savedUser.fullName}</strong>,</p>
          <p>Se ha creado una cuenta para ti en el portal de reservas del Centro Vacacional Sindicato ENAP.</p>
          <p>Tus credenciales de acceso son las siguientes:</p>
          <div style="background-color: #f4f6f5; padding: 15px; border-radius: 8px; font-family: monospace; margin: 15px 0; font-size: 14px; border: 1px solid #e1e4e2;">
            <strong>Email:</strong> ${savedUser.email}<br>
            <strong>Contraseña Temporal:</strong> ${plainPassword}
          </div>
          <p style="color: #666; font-size: 13px;">Te recomendamos ingresar e iniciar sesión para reservar recintos y modificar tu contraseña en tu perfil.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #999; text-align: center;">Centro Vacacional Sindicato ENAP - Refinería Bío Bío</p>
        </div>
      `;
      this.notificationsService.sendEmail(
        savedUser.email,
        'Credenciales de acceso - Portal de Reservas Sindicato ENAP',
        emailHtml
      ).catch((err) => {
        this.logger.error('Error al enviar correo de credenciales a usuario nuevo:', err);
      });
    }

    return resultUser;
  }

  async toggleStatus(id: number): Promise<boolean> {
    const user = await this.getById(id);
    user.isActive = !user.isActive;
    await this.userRepository.save(user);
    return true;
  }
}
