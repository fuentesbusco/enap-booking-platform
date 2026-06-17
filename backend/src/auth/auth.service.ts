import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { verifyPassword } from './hash.util';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password?: string): Promise<UserEntity> {
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not registered');
    }
    if (user.isActive === false) {
      throw new UnauthorizedException('User account is deactivated');
    }
    
    // Verify password if one is provided
    if (password && user.passwordHash) {
      const isMatch = verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
    } else if (password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return user;
  }

  generateToken(user: UserEntity): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    // Encode user payload in Base64 to simulate a JWT
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async verifyToken(token: string): Promise<UserEntity | null> {
    try {
      const decodedStr = Buffer.from(token, 'base64').toString('utf8');
      const payload = JSON.parse(decodedStr);
      const user = await this.usersService.getByEmail(payload.email);
      if (!user || user.isActive === false) {
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}
