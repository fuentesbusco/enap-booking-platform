import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsService } from '../../../core/services/bookings.service';
import { SpacesService } from '../../../core/services/spaces.service';
import { Booking, Space } from '../../../core/models';

interface CalendarDay {
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  bookings: Booking[];
}

@Component({
  selector: 'app-admin-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-calendar.component.html',
})
export class AdminCalendarComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  private spacesService = inject(SpacesService);

  spaces: Space[] = [];
  selectedSpaceId: number | string = 'all';
  
  // Date State (Initialized to June 2026 based on workspace context)
  currentDate = new Date(2026, 5, 16);
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  calendarWeeks: CalendarDay[][] = [];
  allBookings: Booking[] = [];

  ngOnInit() {
    this.spacesService.getAll().subscribe((list) => {
      this.spaces = list;
    });

    this.bookingsService.getAll().subscribe((list) => {
      this.allBookings = list;
      this.generateCalendar();
    });
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  onSpaceChange() {
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayInstance = new Date(year, month, 1);
    let startDayOfWeek = firstDayInstance.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Fill days of the previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, prevDay);
      const dateString = this.formatDate(prevDate);
      days.push({
        dateString,
        dayNumber: prevDay,
        isCurrentMonth: false,
        bookings: this.getBookingsForDate(dateString),
      });
    }

    // Fill days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, month, i);
      const dateString = this.formatDate(currDate);
      days.push({
        dateString,
        dayNumber: i,
        isCurrentMonth: true,
        bookings: this.getBookingsForDate(dateString),
      });
    }

    // Fill days of the next month to complete the last week grid
    const totalDays = days.length;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateString = this.formatDate(nextDate);
      days.push({
        dateString,
        dayNumber: i,
        isCurrentMonth: false,
        bookings: this.getBookingsForDate(dateString),
      });
    }

    // Split list into weeks of 7 days
    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    this.calendarWeeks = weeks;
  }

  getBookingsForDate(dateStr: string): Booking[] {
    return this.allBookings.filter((b) => {
      if (b.status !== 'confirmed' && b.status !== 'pending_approval') {
        return false;
      }
      if (this.selectedSpaceId !== 'all' && b.space.id !== Number(this.selectedSpaceId)) {
        return false;
      }
      
      const checkIn = new Date(b.check_in);
      const checkOut = new Date(b.check_out);
      const current = new Date(dateStr);
      
      return current >= checkIn && current <= checkOut;
    });
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getSpaceColor(spaceId: number): string {
    const colors = [
      'bg-emerald-50 text-emerald-800 border-emerald-200/50 hover:bg-emerald-100/70',
      'bg-sky-50 text-sky-800 border-sky-200/50 hover:bg-sky-100/70',
      'bg-indigo-50 text-indigo-800 border-indigo-200/50 hover:bg-indigo-100/70',
      'bg-amber-50 text-amber-800 border-amber-200/50 hover:bg-amber-100/70',
      'bg-orange-50 text-orange-800 border-orange-200/50 hover:bg-orange-100/70',
      'bg-pink-50 text-pink-800 border-pink-200/50 hover:bg-pink-100/70',
    ];
    return colors[(spaceId - 1) % colors.length] || 'bg-gray-50 text-gray-800 border-gray-200';
  }
}
