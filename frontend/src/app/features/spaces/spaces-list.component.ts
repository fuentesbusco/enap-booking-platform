import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { FooterComponent } from '../../shared/components/footer.component';
import { SpacesService } from '../../core/services/spaces.service';
import { WeatherService } from '../../core/services/weather.service';
import { Space, SpaceType } from '../../core/models';

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './spaces-list.component.html',
})
export class SpacesListComponent implements OnInit {
  private spacesService = inject(SpacesService);
  private route = inject(ActivatedRoute);
  private weatherService = inject(WeatherService);

  spaces: Space[] = [];
  filtered: Space[] = [];
  activeType: string = 'all';
  weatherData: any = null;

  // Carrusel index por espacio
  activeIndexes: Record<number, number> = {};

  filters = [
    { value: 'all', emoji: '🏠', label: 'Todos' },
    { value: 'cabin', emoji: '🏡', label: 'Cabañas' },
    { value: 'quincho', emoji: '🔥', label: 'Quinchos' },
    { value: 'pool', emoji: '🏊', label: 'Piscina' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      if (p['tipo']) this.activeType = p['tipo'];
    });
    this.spacesService.getAll().subscribe((d) => {
      this.spaces = d;
      this.filterSpaces();
    });
    this.weatherService.getLimacheWeather().subscribe({
      next: (data) => this.weatherData = data,
      error: (err) => console.error('Error fetching weather in spaces list:', err)
    });
  }

  filterSpaces() {
    const list = this.activeType === 'all'
      ? this.spaces
      : this.spaces.filter((s) => s.type === this.activeType);

    const cabins = list.filter((s) => s.type === 'cabin');
    const others = list.filter((s) => s.type !== 'cabin');

    if (cabins.length > 0) {
      // Tomamos la primera cabaña como base y consolidamos datos
      const consolidatedCabin: Space = {
        ...cabins[0],
        name: 'Cabañas Familiares (1 al 6)',
        id: 1, // Inicia el flujo en Cabaña 1
        description: 'Seis acogedoras cabañas totalmente equipadas para 6 personas con menaje completo, cocina, TV satelital y parrilla exterior. Las cabañas 1 y 2 son del tipo A y las del 3 al 6 son del tipo B (idénticas).',
        images: Array.from(new Set(cabins.flatMap(c => c.images))),
      };
      this.filtered = [consolidatedCabin, ...others];
    } else {
      this.filtered = others;
    }
  }

  typeLabel(type: SpaceType) {
    return ({ cabin: 'Cabaña', quincho: 'Quincho', pool: 'Piscina' } as any)[
      type
    ];
  }

  getActiveImage(space: Space): string {
    const idx = this.activeIndexes[space.id] || 0;
    return space.images[idx] || 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80';
  }

  prevImage(event: Event, space: Space) {
    event.stopPropagation();
    const current = this.activeIndexes[space.id] || 0;
    const len = space.images.length;
    if (len <= 1) return;
    this.activeIndexes[space.id] = (current - 1 + len) % len;
  }

  nextImage(event: Event, space: Space) {
    event.stopPropagation();
    const current = this.activeIndexes[space.id] || 0;
    const len = space.images.length;
    if (len <= 1) return;
    this.activeIndexes[space.id] = (current + 1) % len;
  }
}
