import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { verifyPassword } from './hash.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<UserEntity | null> {
    try {
      const payload = this.jwtService.verify(token);
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
