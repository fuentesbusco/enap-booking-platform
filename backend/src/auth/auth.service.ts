import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { verifyPassword } from './hash.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password?: string): Promise<UserEntity> {
    this.logger.log(`[Auth] Validando credenciales para: ${email}`);
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      this.logger.warn(`[Auth] Intento de login fallido: correo ${email} no está registrado.`);
      throw new UnauthorizedException('User not registered');
    }
    if (user.isActive === false) {
      this.logger.warn(`[Auth] Intento de login fallido: cuenta inactiva para ${email}.`);
      throw new UnauthorizedException('User account is deactivated');
    }
    
    // Verify password if one is provided
    if (password && user.passwordHash) {
      const isMatch = verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        this.logger.warn(`[Auth] Intento de login fallido para ${email}: contraseña incorrecta.`);
        throw new UnauthorizedException('Invalid credentials');
      }
    } else if (password) {
      this.logger.warn(`[Auth] Intento de login fallido para ${email}: contraseña incorrecta.`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.log(`[Auth] Login exitoso para ${email}. Rol: ${user.role}`);
    return user;
  }

  generateToken(user: UserEntity): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<UserEntity | null> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.getByEmail(payload.email);
      if (!user || user.isActive === false) {
        this.logger.warn(`[Auth] Verificación de token fallida: usuario no encontrado o inactivo.`);
        return null;
      }
      return user;
    } catch (error) {
      this.logger.warn(`[Auth] Token inválido o expirado.`);
      return null;
    }
  }
}
