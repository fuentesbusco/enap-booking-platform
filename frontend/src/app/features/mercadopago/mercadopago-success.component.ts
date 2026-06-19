import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { BookingsService } from '../../core/services/bookings.service';

@Component({
  selector: 'app-mercadopago-success',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './mercadopago-success.component.html',
})
export class MercadoPagoSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingsService = inject(BookingsService);

  paymentId: string | null = null;
  status: string | null = null;
  externalReference: string | null = null;
  merchantOrderId: string | null = null;
  paymentType: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.paymentId = params['payment_id'] || params['collection_id'] || null;
      this.status = params['status'] || params['collection_status'] || null;
      this.externalReference = params['external_reference'] || null;
      this.merchantOrderId = params['merchant_order_id'] || null;
      this.paymentType = params['payment_type'] || null;

      if (this.externalReference && this.paymentId && this.status === 'approved') {
        this.bookingsService.confirmPayment(this.externalReference, this.paymentId, this.status).subscribe({
          next: (res) => {
            console.log('[MP Success] Pago verificado y reserva confirmada:', res);
          },
          error: (err) => {
            console.error('[MP Success] Error al confirmar el pago en el backend:', err);
          }
        });
      }
    });
  }
}
