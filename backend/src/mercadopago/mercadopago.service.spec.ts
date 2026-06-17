import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from './mercadopago.service';

const mockCreatePreference = jest.fn().mockResolvedValue({
  id: 'test-preference-id',
  init_point: 'https://sandbox.mercadopago.com/init',
  sandbox_init_point: 'https://sandbox.mercadopago.com/sandbox-init',
});

jest.mock('mercadopago', () => {
  return {
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn().mockImplementation(() => {
      return {
        create: mockCreatePreference,
      };
    }),
  };
});

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'MP_ACCESS_TOKEN') {
          return 'TEST_ACCESS_TOKEN_12345';
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
    configService = module.get(ConfigService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize MercadoPagoConfig with access token from ConfigService', () => {
    const client = service.getMpClient();
    expect(client).toBeDefined();
    expect(configService.get).toHaveBeenCalledWith('MP_ACCESS_TOKEN');
  });

  it('should create preference successfully', async () => {
    const result = await service.createPreference('Test cabin', 1, 50000);
    expect(result).toBeDefined();
    expect(result.id).toBe('test-preference-id');
    expect(result.init_point).toBe('https://sandbox.mercadopago.com/init');
    expect(mockCreatePreference).toHaveBeenCalledWith({
      body: {
        items: [
          {
            title: 'Test cabin',
            quantity: 1,
            unit_price: 50000,
          },
        ],
      },
    });
  });
});
