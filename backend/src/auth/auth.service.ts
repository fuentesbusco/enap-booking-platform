import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, MOCK_USER_SOCIO, MOCK_USER_ADMIN, MOCK_USER_EXTERNAL } from '../models';

@Injectable()
export class AuthService {
  private readonly mockUsers: Record<string, User> = {
    'carlos.munoz@enap.cl': MOCK_USER_SOCIO,
    'admin@sindicatoenap.cl': MOCK_USER_ADMIN,
    'ana@gmail.com': MOCK_USER_EXTERNAL,
  };

  validateUser(email: string): User {
    const user = this.mockUsers[email.toLowerCase()];
    if (!user) {
      throw new UnauthorizedException('User not registered');
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
      return this.mockUsers[payload.email.toLowerCase()] || null;
    } catch {
      return null;
    }
  }
}
