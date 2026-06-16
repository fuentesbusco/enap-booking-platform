import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingsService } from '../../../core/services/bookings.service';
import { Booking } from '../../../core/models';

@Component({
  selector: 'app-admin-treasury',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-treasury.component.html',
})
export class AdminTreasuryComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  bookings: Booking[] = [];

  get confirmed() {
    return this.bookings.filter((b) => b.status === 'confirmed');
  }
  get totalRevenue() {
    return this.confirmed.reduce((s, b) => s + b.total_amount, 0);
  }
  get confirmedCount() {
    return this.confirmed.length;
  }
  get pendingCount() {
    return this.bookings.filter((b) => b.status === 'pending_approval').length;
  }
  get avgRevenue() {
    return this.confirmedCount ? this.totalRevenue / this.confirmedCount : 0;
  }

  ngOnInit() {
    this.bookingsService.getAll().subscribe((d) => (this.bookings = d));
  }
}
