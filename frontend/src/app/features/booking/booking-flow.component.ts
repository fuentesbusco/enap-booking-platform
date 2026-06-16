import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SpacesService } from '../../core/services/spaces.service';
import { BookingsService } from '../../core/services/bookings.service';
import { AuthService } from '../../core/services/auth.service';
import { Space, Guest, PriceBreakdown } from '../../core/models';
import { BLOCKED_DATES } from '../../core/mock-data';

@Component({
  selector: 'app-booking-flow',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  templateUrl: './booking-flow.component.html',
})
export class BookingFlowComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private spacesService = inject(SpacesService);
  private bookingsService = inject(BookingsService);
  auth = inject(AuthService);

  space: Space | undefined;
  currentStep = 1;
  steps = ['Fechas', 'Invitados', 'Pago', 'Confirmación'];

  checkIn = '';
  checkOut = '';
  guests: Guest[] = [];
  breakdown: PriceBreakdown | null = null;
  blockedDates: string[] = [];
  receiptUploaded = false;
  createdBookingCode = '';
  today = new Date().toISOString().split('T')[0];

  get isSocio() {
    return this.auth.isSocio();
  }
  get hasConflict(): boolean {
    if (!this.checkIn || !this.checkOut) return false;
    const start = new Date(this.checkIn);
    const end = new Date(this.checkOut);
    return this.blockedDates.some((d) => {
      const bd = new Date(d);
      return bd >= start && bd < end;
    });
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/ingresar']);
      return;
    }
    const id = Number(this.route.snapshot.paramMap.get('spaceId'));
    this.spacesService.getById(id).subscribe((s) => {
      this.space = s;
      if (!s) this.router.navigate(['/espacios']);
    });
    this.spacesService
      .getBlockedDates(id)
      .subscribe((d) => (this.blockedDates = d));
  }

  recalculate() {
    if (this.space && this.checkIn && this.checkOut) {
      this.breakdown = this.bookingsService.calculatePrice(
        this.space,
        this.checkIn,
        this.checkOut,
        this.guests.length,
      );
    }
  }

  addGuest() {
    this.guests.push({ full_name: '', rut: '' });
    this.recalculate();
  }

  removeGuest(i: number) {
    this.guests.splice(i, 1);
    this.recalculate();
  }

  simulateUpload() {
    setTimeout(() => {
      this.receiptUploaded = true;
    }, 600);
  }

  nextStep() {
    if (this.currentStep === 1) this.recalculate();
    if (this.currentStep < 3) {
      this.currentStep++;
      return;
    }
    // Paso 3 -> confirmar
    this.bookingsService
      .createBooking({
        space: this.space!,
        check_in: this.checkIn,
        check_out: this.checkOut,
        guests: this.guests,
        receipt_url: 'mock://comprobante.pdf',
      })
      .subscribe((b) => {
        this.createdBookingCode = b.booking_code;
        this.currentStep = 4;
      });
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }
}
