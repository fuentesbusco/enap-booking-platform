import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_SPACES } from '../../../core/mock-data';

@Component({
  selector: 'app-admin-spaces',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-spaces.component.html',
})
export class AdminSpacesComponent {
  spaces = MOCK_SPACES;
}
