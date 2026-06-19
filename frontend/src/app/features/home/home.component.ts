import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { SpacesService } from '../../core/services/spaces.service';
import { AnnouncementsService } from '../../core/services/announcements.service';
import { FaqService } from '../../core/services/faq.service';
import { WeatherService } from '../../core/services/weather.service';
import { Space, Announcement } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private spacesService = inject(SpacesService);
  private announcementsService = inject(AnnouncementsService);
  private faqService = inject(FaqService);
  private weatherService = inject(WeatherService);

  spaces: Space[] = [];
  announcements: Announcement[] = [];
  faqs: any[] = [];
  openFaqId: number | null = null;
  weatherData: any = null;

  tiposEspacio = [
    {
      key: 'cabin',
      emoji: '🏡',
      label: 'Cabañas',
      sublabel: 'Check-in 14:00 hrs',
    },
    {
      key: 'quincho',
      emoji: '🔥',
      label: 'Quinchos',
      sublabel: 'Con parrilla',
    },
    {
      key: 'pool',
      emoji: '🏊',
      label: 'Piscina',
      sublabel: '5 invitados gratis socios',
    },
  ];

  beneficios = [
    {
      icon: '🏷️',
      title: 'Tarifas preferenciales',
      desc: 'Precio especial en cabañas y quinchos, solo para socios.',
    },
    {
      icon: '🏊',
      title: '5 invitados gratis en piscina',
      desc: 'Trae a tu familia sin costo adicional en la Piscina General.',
    },
    {
      icon: '📋',
      title: 'Historial y comprobantes',
      desc: 'Todas tus reservas y pagos en un solo lugar.',
    },
  ];

  ngOnInit() {
    this.spacesService.getAll().subscribe((d) => (this.spaces = d));
    this.announcementsService
      .getPublic()
      .subscribe((d) => (this.announcements = d));
    this.faqService.getAll().subscribe((d) => {
      this.faqs = (d || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    this.weatherService.getLimacheWeather().subscribe({
      next: (data) => this.weatherData = data,
      error: (err) => console.error('Error fetching weather in home', err)
    });
  }

  toggleFaq(id: number) {
    this.openFaqId = this.openFaqId === id ? null : id;
  }

  spaceLabel(type: string) {
    return (
      ({ cabin: 'Cabaña', quincho: 'Quincho', pool: 'Piscina' } as any)[type] ??
      type
    );
  }
}
