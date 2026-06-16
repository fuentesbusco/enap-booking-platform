import { Routes } from '@angular/router';
import { AdminShellComponent } from './admin-shell.component';
import { AdminBookingsComponent } from './bookings/admin-bookings.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '', redirectTo: 'reservas', pathMatch: 'full' },
      { path: 'reservas', component: AdminBookingsComponent },
      {
        path: 'espacios',
        loadComponent: () => import('./spaces/admin-spaces.component').then(m => m.AdminSpacesComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'avisos',
        loadComponent: () => import('./announcements/admin-announcements.component').then(m => m.AdminAnnouncementsComponent),
      },
      {
        path: 'tesoreria',
        loadComponent: () => import('./treasury/admin-treasury.component').then(m => m.AdminTreasuryComponent),
      },
    ],
  },
];
