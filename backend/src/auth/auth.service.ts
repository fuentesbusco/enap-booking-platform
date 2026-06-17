import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../models';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  validateUser(email: string): User {
    const user = this.usersService.getByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not registered');
    }
    if (user.is_active === false) {
      throw new UnauthorizedException('User account is deactivated');
    }
    return user;
  }

  generateToken(user: User): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    // Encode user payload in Base64 to simulate a JWT
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  verifyToken(token: string): User | null {
    try {
      const decodedStr = Buffer.from(token, 'base64').toString('utf8');
      const payload = JSON.parse(decodedStr);
      const user = this.usersService.getByEmail(payload.email);
      if (!user || user.is_active === false) {
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}
