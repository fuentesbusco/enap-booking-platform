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
    this.logger.log(`[MP Service] Creando preferencia: "${title}" x${quantity} ($${unitPrice}). URLs retorno: ${JSON.stringify(backUrls)}`);
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

        back_urls: {
          success: backUrls?.success,
          failure: backUrls?.failure,
          pending: backUrls?.pending
        },
        auto_return: "approved",
      };

      const response = await preference.create({ body });
      this.logger.log(`[MP Service] Preferencia creada en Mercado Pago con éxito. ID: ${response.id}, SandboxPoint: ${response.sandbox_init_point}`);
      return response;
    } catch (error) {
      this.logger.error('[MP Service] Error al crear preferencia en Mercado Pago:', error);
      throw error;
    }
  }
}
