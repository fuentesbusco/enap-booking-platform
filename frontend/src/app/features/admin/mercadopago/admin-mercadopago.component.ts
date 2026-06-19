import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MercadoPagoService } from '../../../core/services/mercadopago.service';

@Component({
  selector: 'app-admin-mercadopago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mercadopago.component.html',
})
export class AdminMercadoPagoComponent implements OnInit {
  private mpService = inject(MercadoPagoService);
  private route = inject(ActivatedRoute);

  title = 'Reserva de Prueba Sandbox';
  quantity = 1;
  unitPrice = 1000;

  loading = false;
  preferenceId = '';
  initPoint = '';
  sandboxInitPoint = '';
  errorMessage = '';
  testStatus: string | null = null;

  // Parámetros devueltos por Mercado Pago
  paymentId: string | null = null;
  statusParam: string | null = null;
  externalReference: string | null = null;
  merchantOrderId: string | null = null;
  preferenceIdParam: string | null = null;
  paymentType: string | null = null;

  ngOnInit() {
    const url = window.location.pathname;
    if (url.includes('/mercadopago/success')) {
      this.testStatus = 'success';
    } else if (url.includes('/mercadopago/failure')) {
      this.testStatus = 'failure';
    } else if (url.includes('/mercadopago/pending')) {
      this.testStatus = 'pending';
    } else {
      this.route.queryParams.subscribe((params) => {
        this.testStatus = params['status'] || null;
      });
    }

    this.route.queryParams.subscribe((params) => {
      this.paymentId = params['payment_id'] || params['collection_id'] || null;
      this.statusParam = params['status'] || params['collection_status'] || null;
      this.externalReference = params['external_reference'] || null;
      this.merchantOrderId = params['merchant_order_id'] || null;
      this.preferenceIdParam = params['preference_id'] || null;
      this.paymentType = params['payment_type'] || null;
    });
  }

  generatePreference() {
    if (!this.title || this.quantity <= 0 || this.unitPrice <= 0) {
      this.errorMessage = 'Por favor complete todos los campos con valores válidos.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.preferenceId = '';
    this.initPoint = '';
    this.sandboxInitPoint = '';

    // Retorno a la misma página administrativa con rutas limpias para simular flujo
    const backUrls = {
      success: `${window.location.origin}/admin/mercadopago/success`,
      failure: `${window.location.origin}/admin/mercadopago/failure`,
      pending: `${window.location.origin}/admin/mercadopago/pending`
    };

    this.mpService.createPreference(this.title, this.quantity, this.unitPrice, backUrls).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.preferenceId = res.id;
          this.initPoint = res.init_point;
          this.sandboxInitPoint = res.sandbox_init_point;
        } else {
          this.errorMessage = 'El backend no pudo generar el ID de preferencia de pago.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al conectar con la API de Mercado Pago. Verifica tus credenciales (MP_ACCESS_TOKEN) en el archivo .env del backend.';
        console.error(err);
      }
    });
  }

  paySandbox() {
    if (this.sandboxInitPoint) {
      window.open(this.sandboxInitPoint, '_blank');
    }
  }
}
