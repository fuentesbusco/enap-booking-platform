import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SpacesService } from '../../core/services/spaces.service';
import { BookingsService } from '../../core/services/bookings.service';
import { AuthService } from '../../core/services/auth.service';
import { Space, Guest, PriceBreakdown } from '../../core/models';

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
  
  selectedFile: File | null = null;
  createdBookingCode = '';
  today = new Date().toISOString().split('T')[0];
  loading = false;

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
    const id = Number(this.route.snapshot.paramMap.get('spaceId'));
    this.spacesService.getById(id).subscribe((s) => {
      this.space = s;
      if (!s) {
        this.router.navigate(['/espacios']);
        return;
      }
      
      // Load blocked dates from backend (public endpoint)
      this.spacesService
        .getBlockedDates(id)
        .subscribe((d) => (this.blockedDates = d));

      // Restore pending booking state if returning from authentication redirect
      const pending = sessionStorage.getItem('pending_booking_flow');
      if (pending) {
        try {
          const state = JSON.parse(pending);
          this.checkIn = state.checkIn || '';
          this.checkOut = state.checkOut || '';
          this.guests = state.guests || [];
          sessionStorage.removeItem('pending_booking_flow');
          
          this.currentStep = 3;
          this.recalculate();
        } catch (e) {
          console.error('Error restoring pending booking flow state', e);
        }
      }
    });
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

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      this.recalculate();
      this.currentStep = 2;
      return;
    }
    
    if (this.currentStep === 2) {
      // If going to Step 3 (Payment) and not logged in, save progress and authenticate
      if (!this.auth.isLoggedIn()) {
        sessionStorage.setItem(
          'pending_booking_flow',
          JSON.stringify({
            checkIn: this.checkIn,
            checkOut: this.checkOut,
            guests: this.guests,
          })
        );
        this.router.navigate(['/ingresar'], {
          queryParams: { redirectTo: `/reservar/${this.space!.id}` },
        });
        return;
      }
      this.recalculate();
      this.currentStep = 3;
      return;
    }

    // Step 3 -> Confirm/Submit booking
    if (this.currentStep === 3) {
      if (!this.selectedFile) {
        alert('Debe adjuntar el comprobante de transferencia.');
        return;
      }

      this.loading = true;
      this.bookingsService
        .createBooking({
          space: this.space!,
          check_in: this.checkIn,
          check_out: this.checkOut,
          guests: this.guests,
        })
        .subscribe({
          next: (b) => {
            this.createdBookingCode = b.booking_code;
            if (this.selectedFile) {
              this.bookingsService.uploadReceipt(b.id, this.selectedFile).subscribe({
                next: () => {
                  this.loading = false;
                  this.currentStep = 4;
                },
                error: (err) => {
                  this.loading = false;
                  alert('Error al subir el comprobante. Por favor intente nuevamente.');
                  console.error(err);
                },
              });
            } else {
              this.loading = false;
              this.currentStep = 4;
            }
          },
          error: (err) => {
            this.loading = false;
            alert(err.error?.message || 'Error al crear la reserva. Intente con otras fechas.');
            console.error(err);
          },
        });
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }
}
