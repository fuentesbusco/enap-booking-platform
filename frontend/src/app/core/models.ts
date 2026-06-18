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
  is_active?: boolean;
  passwordHash?: string;
  tempPassword?: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  created_at?: string;
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
  is_for_third_party?: boolean;
  third_party_name?: string;
  third_party_rut?: string;
  third_party_phone?: string;
  admin_created_for_external?: boolean;
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

export function mapUserToFrontend(user: any): User {
  if (!user) return user;
  return {
    id: user.id,
    full_name: user.fullName || user.full_name,
    rut: user.rut,
    email: user.email,
    role: user.role,
    ficha_number: user.fichaNumber || user.ficha_number,
    is_active: user.isActive !== undefined ? user.isActive : user.is_active,
    tempPassword: user.tempPassword,
  };
}

export function mapGalleryItemToFrontend(item: any): GalleryItem {
  if (!item) return item;
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    image_url: item.imageUrl || item.image_url,
    created_at: item.createdAt || item.created_at,
  };
}

export function mapUserToBackend(user: any): any {
  if (!user) return user;
  return {
    id: user.id,
    fullName: user.full_name,
    rut: user.rut,
    email: user.email,
    role: user.role,
    fichaNumber: user.ficha_number,
    isActive: user.is_active,
  };
}

export function mapSpaceToFrontend(space: any): Space {
  if (!space) return space;
  return {
    id: space.id,
    name: space.name,
    type: space.type,
    description: space.description,
    max_capacity: space.maxCapacity !== undefined ? space.maxCapacity : space.max_capacity,
    base_price: space.basePrice !== undefined ? space.basePrice : space.base_price,
    socio_price: space.socioPrice !== undefined ? space.socioPrice : space.socio_price,
    guest_price: space.guestPrice !== undefined ? space.guestPrice : space.guest_price,
    free_guests_for_socio: space.freeGuestsForSocio !== undefined ? space.freeGuestsForSocio : space.free_guests_for_socio,
    images: space.images || [],
    amenities: space.amenities || [],
  };
}

export function mapSpaceToBackend(space: any): any {
  if (!space) return space;
  return {
    id: space.id,
    name: space.name,
    type: space.type,
    description: space.description,
    maxCapacity: space.max_capacity,
    basePrice: space.base_price,
    socioPrice: space.socio_price,
    guestPrice: space.guest_price,
    freeGuestsForSocio: space.free_guests_for_socio,
    images: space.images,
    amenities: space.amenities,
  };
}

export function mapGuestToFrontend(guest: any): Guest {
  if (!guest) return guest;
  return {
    id: guest.id,
    full_name: guest.fullName || guest.full_name,
    rut: guest.rut,
    phone: guest.phone,
  };
}

export function mapGuestToBackend(guest: any): any {
  if (!guest) return guest;
  return {
    id: guest.id,
    fullName: guest.full_name,
    rut: guest.rut,
    phone: guest.phone,
  };
}

export function mapBookingToFrontend(booking: any): Booking {
  if (!booking) return booking;
  return {
    id: booking.id,
    booking_code: booking.bookingCode || booking.booking_code,
    user: mapUserToFrontend(booking.user),
    space: mapSpaceToFrontend(booking.space),
    check_in: booking.checkIn || booking.check_in,
    check_out: booking.checkOut || booking.check_out,
    status: booking.status,
    total_amount: booking.totalAmount !== undefined ? booking.totalAmount : booking.total_amount,
    guests: (booking.guests || []).map(mapGuestToFrontend),
    receipt_url: booking.receiptUrl || booking.receipt_url,
    admin_notes: booking.adminNotes || booking.admin_notes,
    created_at: booking.createdAt || booking.created_at,
    price_breakdown: booking.priceBreakdown || booking.price_breakdown,
    is_for_third_party: booking.isForThirdParty !== undefined ? booking.isForThirdParty : booking.is_for_third_party,
    third_party_name: booking.thirdPartyName || booking.third_party_name,
    third_party_rut: booking.thirdPartyRut || booking.third_party_rut,
    third_party_phone: booking.thirdPartyPhone || booking.third_party_phone,
    admin_created_for_external: booking.adminCreatedForExternal !== undefined ? booking.adminCreatedForExternal : booking.admin_created_for_external,
  };
}

export function mapAnnouncementToFrontend(ann: any): Announcement {
  if (!ann) return ann;
  return {
    id: ann.id,
    title: ann.title,
    body: ann.body,
    image_url: ann.imageUrl || ann.image_url,
    published_at: ann.publishedAt || ann.published_at,
    is_pinned: ann.isPinned !== undefined ? ann.isPinned : ann.is_pinned,
  };
}
