import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private mpClient: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    this.mpClient = new MercadoPagoConfig({
      accessToken: accessToken || 'TEST_ACCESS_TOKEN',
    });
    this.logger.log('Mercado Pago SDK inicializado con éxito.');
  }

  getMpClient(): MercadoPagoConfig {
    return this.mpClient;
  }
}
