import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/guards';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'espacios', loadComponent: () => import('./features/spaces/spaces-list.component').then(m => m.SpacesListComponent) },
  { path: 'reservar/:spaceId', loadComponent: () => import('./features/booking/booking-flow.component').then(m => m.BookingFlowComponent), canActivate: [authGuard] },
  { path: 'mis-reservas', loadComponent: () => import('./features/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent), canActivate: [authGuard] },
  { path: 'ingresar', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'admin', canActivate: [adminGuard], loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes) },
  { path: '**', redirectTo: '' },
];
