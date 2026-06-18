import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mercadopago')
@UseGuards(JwtAuthGuard)
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(private readonly mpService: MercadoPagoService) {}

  @Post('preference')
  async createPreference(
    @Body() body: { 
      title: string; 
      quantity: number; 
      unitPrice: number; 
      backUrls?: { success: string; failure: string; pending: string } 
    },
  ) {
    this.logger.log(`[MP Controller] Recibida solicitud para crear preferencia: "${body.title}" x${body.quantity} ($${body.unitPrice})`);
    
    try {
      const preference = await this.mpService.createPreference(
        body.title,
        body.quantity,
        body.unitPrice,
        body.backUrls,
      );

      this.logger.log(`[MP Controller] Preferencia creada exitosamente. ID: ${preference.id}`);
      return {
        success: true,
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error(`[MP Controller] Error al crear preferencia para "${body.title}":`, error);
      throw error;
    }
  }
}
