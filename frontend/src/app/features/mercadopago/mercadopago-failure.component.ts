import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';

@Component({
  selector: 'app-mercadopago-failure',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './mercadopago-failure.component.html',
})
export class MercadoPagoFailureComponent implements OnInit {
  private route = inject(ActivatedRoute);

  paymentId: string | null = null;
  status: string | null = null;
  externalReference: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.paymentId = params['payment_id'] || params['collection_id'] || null;
      this.status = params['status'] || params['collection_status'] || null;
      this.externalReference = params['external_reference'] || null;
    });
  }
}
