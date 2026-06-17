import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../models';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
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
