import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementsService } from '../../../core/services/announcements.service';
import { Announcement } from '../../../core/models';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-announcements.component.html',
})
export class AdminAnnouncementsComponent implements OnInit {
  private service = inject(AnnouncementsService);
  announcements: Announcement[] = [];
  ngOnInit() {
    this.service.getAll().subscribe((d) => (this.announcements = d));
  }
}
