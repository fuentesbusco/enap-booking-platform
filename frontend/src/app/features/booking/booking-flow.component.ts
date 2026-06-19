import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SpacesService } from '../../core/services/spaces.service';
import { BookingsService } from '../../core/services/bookings.service';
import { AuthService } from '../../core/services/auth.service';
import { MercadoPagoService } from '../../core/services/mercadopago.service';
import { FeedbackService } from '../../core/services/feedback.service';
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
  private mpService = inject(MercadoPagoService);
  private feedbackService = inject(FeedbackService);
  auth = inject(AuthService);

  space: Space | undefined;
  currentStep = 1;
  steps = ['Fechas', 'Invitados', 'Pago', 'Confirmación'];

  activeImageIndex = 0;
  feedbacks: any[] = [];

  checkIn = '';
  checkOut = '';
  guests: Guest[] = [];
  breakdown: PriceBreakdown | null = null;
  blockedDates: string[] = [];
  paymentMethod = 'transfer';
  
  selectedFile: File | null = null;
  createdBookingCode = '';
  today = new Date().toISOString().split('T')[0];
  loading = false;

  isForThirdParty = false;
  thirdPartyName = '';
  thirdPartyRut = '';
  thirdPartyPhone = '';

  get isSocio() {
    return this.auth.isSocio();
  }
  
  get hasConflict(): boolean {
    if (!this.checkIn || !this.checkOut) return false;
    const start = new Date(this.checkIn + 'T00:00:00');
    const end = new Date(this.checkOut + 'T00:00:00');
    return this.blockedDates.some((d) => {
      const bd = new Date(d + 'T00:00:00');
      if (this.checkIn === this.checkOut) {
        return bd.getTime() === start.getTime();
      } else {
        return bd >= start && bd < end;
      }
    });
  }

  onJornadaDateChange(val: string) {
    this.checkIn = val;
    this.checkOut = val;
    this.recalculate();
  }

  prevImage() {
    if (!this.space || !this.space.images.length) return;
    this.activeImageIndex = (this.activeImageIndex - 1 + this.space.images.length) % this.space.images.length;
  }

  nextImage() {
    if (!this.space || !this.space.images.length) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % this.space.images.length;
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

      // Load feedbacks
      this.feedbackService.getApprovedBySpace(id).subscribe({
        next: (res) => {
          this.feedbacks = res.feedbacks || [];
        },
        error: (err) => console.error('Error fetching feedbacks:', err)
      });

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
        this.isForThirdParty,
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
      const isFree = this.breakdown?.total === 0;

      if (!isFree && this.paymentMethod === 'transfer' && !this.selectedFile) {
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
          isForThirdParty: this.isForThirdParty,
          thirdPartyName: this.isForThirdParty ? this.thirdPartyName : undefined,
          thirdPartyRut: this.isForThirdParty ? this.thirdPartyRut : undefined,
          thirdPartyPhone: this.isForThirdParty ? this.thirdPartyPhone : undefined,
        })
        .subscribe({
          next: (b) => {
            this.createdBookingCode = b.booking_code;
            
            if (isFree) {
              this.loading = false;
              this.currentStep = 4;
            } else if (this.paymentMethod === 'transfer') {
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
            } else {
              // Mercado Pago payment flow
              const backUrls = {
                success: `${window.location.origin}/mercadopago/success?external_reference=${b.booking_code}`,
                failure: `${window.location.origin}/mercadopago/failure?external_reference=${b.booking_code}`,
                pending: `${window.location.origin}/mercadopago/pending?external_reference=${b.booking_code}`
              };

              this.mpService
                .createPreference(
                  `Reserva ${this.space!.name} - Código ${b.booking_code}`,
                  1,
                  b.total_amount,
                  backUrls
                )
                .subscribe({
                  next: (res) => {
                    this.loading = false;
                    if (res.success) {
                      window.location.href = res.sandbox_init_point || res.init_point;
                    } else {
                      alert('Error al inicializar la pasarela de pago. Su reserva quedó registrada, pero deberá pagarla en la sección Mis Reservas.');
                      this.router.navigate(['/mis-reservas']);
                    }
                  },
                  error: (err) => {
                    this.loading = false;
                    alert('Error al conectar con la pasarela de pago de Mercado Pago. Su reserva quedó registrada en estado pendiente de pago.');
                    console.error(err);
                    this.router.navigate(['/mis-reservas']);
                  }
                });
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
