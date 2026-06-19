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
        path: 'calendario',
        loadComponent: () => import('./calendar/admin-calendar.component').then(m => m.AdminCalendarComponent),
      },
      {
        path: 'avisos',
        loadComponent: () => import('./announcements/admin-announcements.component').then(m => m.AdminAnnouncementsComponent),
      },
      {
        path: 'tesoreria',
        loadComponent: () => import('./treasury/admin-treasury.component').then(m => m.AdminTreasuryComponent),
      },
      {
        path: 'mercadopago',
        loadComponent: () => import('./mercadopago/admin-mercadopago.component').then(m => m.AdminMercadoPagoComponent),
      },
      {
        path: 'mercadopago/success',
        loadComponent: () => import('./mercadopago/admin-mercadopago.component').then(m => m.AdminMercadoPagoComponent),
      },
      {
        path: 'mercadopago/failure',
        loadComponent: () => import('./mercadopago/admin-mercadopago.component').then(m => m.AdminMercadoPagoComponent),
      },
      {
        path: 'mercadopago/pending',
        loadComponent: () => import('./mercadopago/admin-mercadopago.component').then(m => m.AdminMercadoPagoComponent),
      },
      {
        path: 'galeria',
        loadComponent: () => import('./gallery/admin-gallery.component').then(m => m.AdminGalleryComponent),
      },
    ],
  },
];
