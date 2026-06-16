export type UserRole = 'socio' | 'external' | 'admin';
export type SpaceType = 'cabin' | 'quincho' | 'pool';
export type BookingStatus = 'pending_payment' | 'pending_approval' | 'confirmed' | 'cancelled' | 'rejected' | 'expired';

export interface User {
  id: number;
  full_name: string;
  rut: string;
  email: string;
  role: UserRole;
  ficha_number?: string;
}

export interface Space {
  id: number;
  name: string;
  type: SpaceType;
  description: string;
  max_capacity: number;
  base_price: number;
  socio_price: number;
  guest_price: number;
  free_guests_for_socio: number;
  images: string[];
  amenities: string[];
}

export interface Guest {
  id?: number;
  full_name: string;
  rut: string;
  phone?: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  user: User;
  space: Space;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  total_amount: number;
  guests: Guest[];
  receipt_url?: string;
  admin_notes?: string;
  created_at: string;
  price_breakdown: PriceBreakdown;
}

export interface PriceBreakdown {
  base: number;
  days: number;
  guests_count: number;
  guests_total: number;
  free_guests_applied: number;
  discount: number;
  total: number;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  image_url?: string;
  published_at: string;
  is_pinned: boolean;
}
