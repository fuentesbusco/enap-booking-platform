import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector) as any;
  });

  const createMockContext = (user?: any): ExecutionContext => {
    const req = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should return true if no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = createMockContext({ role: 'socio' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException if user is missing from request', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(
      new UnauthorizedException('No user found in request'),
    );
  });

  it('should throw UnauthorizedException if user does not have the required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = createMockContext({ role: 'socio' });
    expect(() => guard.canActivate(ctx)).toThrow(
      new UnauthorizedException('Restricted access for admins only'),
    );
  });

  it('should return true if user has the required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    const ctx = createMockContext({ role: 'admin' });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
