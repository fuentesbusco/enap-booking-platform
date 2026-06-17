import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mercadopago')
@UseGuards(JwtAuthGuard)
export class MercadoPagoController {
  constructor(private readonly mpService: MercadoPagoService) {}

  @Post('preference')
  async createPreference(
    @Body() body: { title: string; quantity: number; unitPrice: number },
  ) {
    const preference = await this.mpService.createPreference(
      body.title,
      body.quantity,
      body.unitPrice,
    );

    return {
      success: true,
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    };
  }
}
