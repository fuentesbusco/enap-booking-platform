import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoService } from './mercadopago.service';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from '../users/user.entity';

describe('MercadoPagoController', () => {
  let controller: MercadoPagoController;
  let mpService: jest.Mocked<MercadoPagoService>;
  let authService: jest.Mocked<AuthService>;

  const mockUser: UserEntity = {
    id: 1,
    fullName: 'Carlos Muñoz Rojas',
    rut: '12.345.678-9',
    email: 'carlos.munoz@enap.cl',
    role: 'socio',
    fichaNumber: 'ENP-0042',
    isActive: true,
    bookings: [],
  };

  const mockPreferenceResponse = {
    id: 'preference-id-123',
    init_point: 'https://sandbox.mercadopago.com/init',
    sandbox_init_point: 'https://sandbox.mercadopago.com/sandbox-init',
  };

  beforeEach(async () => {
    const mockMpService = {
      createPreference: jest.fn().mockResolvedValue(mockPreferenceResponse),
    };

    const mockAuthService = {
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MercadoPagoController],
      providers: [
        { provide: MercadoPagoService, useValue: mockMpService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<MercadoPagoController>(MercadoPagoController);
    mpService = module.get(MercadoPagoService) as any;
    authService = module.get(AuthService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPreference', () => {
    it('should call mpService.createPreference and return formatted details', async () => {
      authService.verifyToken.mockResolvedValue(mockUser);

      const body = {
        title: 'Cabaña Bosque',
        quantity: 1,
        unitPrice: 150000,
      };

      const result = await controller.createPreference(body);

      expect(mpService.createPreference).toHaveBeenCalledWith('Cabaña Bosque', 1, 150000);
      expect(result).toEqual({
        success: true,
        id: 'preference-id-123',
        init_point: 'https://sandbox.mercadopago.com/init',
        sandbox_init_point: 'https://sandbox.mercadopago.com/sandbox-init',
      });
    });
  });
});
