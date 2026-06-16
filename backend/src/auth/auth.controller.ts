import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: { email: string }) {
    const user = this.authService.validateUser(body.email);
    const token = this.authService.generateToken(user);
    return {
      token,
      user,
    };
  }
}
