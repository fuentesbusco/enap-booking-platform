import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from './mercadopago.service';

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
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
});
