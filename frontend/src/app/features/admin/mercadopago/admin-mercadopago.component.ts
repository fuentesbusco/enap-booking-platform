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

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.testStatus = params['status'] || null;
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

    // Retorno a la misma página administrativa con queryParams para simular flujo
    const backUrls = {
      success: `https://enap-front-web.vercel.app/admin/mercadopago?status=success`,
      failure: `https://enap-front-web.vercel.app/admin/mercadopago?status=failure`,
      pending: `https://enap-front-web.vercel.app/admin/mercadopago?status=pending`
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
