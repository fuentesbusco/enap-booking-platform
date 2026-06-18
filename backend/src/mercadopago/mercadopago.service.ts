import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

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

  async createPreference(
    title: string,
    quantity: number,
    unitPrice: number,
    backUrls?: { success: string; failure: string; pending: string }
  ): Promise<any> {
    this.logger.log(`Creando preferencia de Mercado Pago: ${title} (Cant: ${quantity}, Precio: ${unitPrice})...`);
    try {
      const preference = new Preference(this.mpClient);
      const body: any = {
        items: [
          {
            title,
            quantity,
            unit_price: unitPrice,
          } as any,
        ],
      };

      if (backUrls) {
        body.back_urls = backUrls;
        body.auto_return = 'approved';
      }

      const response = await preference.create({ body });
      return response;
    } catch (error) {
      this.logger.error('Error al crear preferencia de Mercado Pago:', error);
      throw error;
    }
  }
}
