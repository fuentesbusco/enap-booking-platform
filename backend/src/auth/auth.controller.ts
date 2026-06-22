import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../models';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password?: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    const token = this.authService.generateToken(user);
    return {
      token,
      user,
    };
  }

  @Post('register')
  async register(
    @Body() body: {
      fullName: string;
      rut: string;
      email: string;
      password?: string;
      role?: UserRole;
      fichaNumber?: string;
    },
  ) {
    const emailLower = body.email.toLowerCase();
    const domainMatch = emailLower.endsWith('@enap.cl') || emailLower.endsWith('@enaprefinerias.cl');
    if (!domainMatch) {
      throw new BadRequestException('El correo electrónico de registro debe pertenecer al dominio @enap.cl o @enaprefinerias.cl.');
    }

    const role = body.role ?? 'external';
    const newUser = await this.usersService.create({
      full_name: body.fullName,
      rut: body.rut,
      email: body.email,
      password: body.password,
      role,
      ficha_number: role === 'socio' ? body.fichaNumber : undefined,
      is_active: true,
    });

    const token = this.authService.generateToken(newUser);
    return {
      token,
      user: newUser,
    };
  }
}
