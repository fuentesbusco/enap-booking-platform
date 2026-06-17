import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../auth.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    authService = module.get(AuthService) as any;
  });

  const createMockContext = (headers: Record<string, string>): ExecutionContext => {
    const req = { headers };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;
  };

  it('should throw UnauthorizedException if no authorization header is provided', async () => {
    const ctx = createMockContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('No authorization token provided'),
    );
  });

  it('should throw UnauthorizedException if token format is invalid', async () => {
    const ctx = createMockContext({ authorization: 'invalid-format' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Invalid token format'),
    );
  });

  it('should throw UnauthorizedException if token is invalid or expired', async () => {
    const ctx = createMockContext({ authorization: 'Bearer bad_token' });
    authService.verifyToken.mockResolvedValue(null);
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired authorization token'),
    );
  });

  it('should return true and attach user to request if token is valid', async () => {
    const ctx = createMockContext({ authorization: 'Bearer valid_token' });
    const mockUser = { id: 1, email: 'user@enap.cl', role: 'socio' };
    authService.verifyToken.mockResolvedValue(mockUser as any);

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    const req = ctx.switchToHttp().getRequest();
    expect(req.user).toEqual(mockUser);
  });
});
