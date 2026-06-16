import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SpacesService } from '../../core/services/spaces.service';
import { Space, SpaceType } from '../../core/models';

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './spaces-list.component.html',
})
export class SpacesListComponent implements OnInit {
  private spacesService = inject(SpacesService);
  private route = inject(ActivatedRoute);

  spaces: Space[] = [];
  filtered: Space[] = [];
  activeType: string = 'all';

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
  }

  filterSpaces() {
    this.filtered =
      this.activeType === 'all'
        ? this.spaces
        : this.spaces.filter((s) => s.type === this.activeType);
  }

  typeLabel(type: SpaceType) {
    return ({ cabin: 'Cabaña', quincho: 'Quincho', pool: 'Piscina' } as any)[
      type
    ];
  }
}
