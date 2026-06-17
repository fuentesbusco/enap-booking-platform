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

export interface PriceBreakdown {
  base: number;
  days: number;
  guests_count: number;
  guests_total: number;
  free_guests_applied: number;
  discount: number;
  total: number;
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

export interface Announcement {
  id: number;
  title: string;
  body: string;
  image_url?: string;
  published_at: string;
  is_pinned: boolean;
}

export const MOCK_SPACES: Space[] = [
  {
    id: 1,
    name: 'Cabaña Los Boldos',
    type: 'cabin',
    description: 'Cabaña familiar con vista al jardín. Cocina equipada, living comedor, 2 dormitorios y baño completo. Ideal para familias de hasta 6 personas.',
    max_capacity: 6,
    base_price: 50000,
    socio_price: 35000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80'],
    amenities: ['Cocina equipada', 'TV', 'Ropa de cama', 'Estacionamiento', 'Parrilla exterior'],
  },
  {
    id: 2,
    name: 'Cabaña El Quillay',
    type: 'cabin',
    description: 'Cabaña amplia con terraza privada. 3 dormitorios, 2 baños y cocina totalmente equipada. Capacidad para hasta 8 personas.',
    max_capacity: 8,
    base_price: 65000,
    socio_price: 45000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80'],
    amenities: ['Cocina equipada', 'TV', 'Ropa de cama', 'Terraza privada', 'Parrilla exterior', 'Estacionamiento doble'],
  },
  {
    id: 3,
    name: 'Cabaña La Araucaria',
    type: 'cabin',
    description: 'Cabaña acogedora para parejas o familias pequeñas. 1 dormitorio, baño y cocina americana. Entorno tranquilo con jardín compartido.',
    max_capacity: 4,
    base_price: 38000,
    socio_price: 26000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: ['https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=80'],
    amenities: ['Cocina americana', 'TV', 'Ropa de cama', 'Jardín compartido'],
  },
  {
    id: 4,
    name: 'Quincho Central',
    type: 'quincho',
    description: 'Quincho techado con parrilla de gran tamaño, mesas y sillas para 30 personas. Perfecto para asados familiares y celebraciones.',
    max_capacity: 30,
    base_price: 45000,
    socio_price: 30000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'],
    amenities: ['Parrilla grande', 'Mesas y sillas', 'Lavadero', 'Iluminación nocturna', 'Estacionamiento cercano'],
  },
  {
    id: 5,
    name: 'Quincho Oriente',
    type: 'quincho',
    description: 'Quincho semi abierto con parrilla y acceso directo al jardín. Ambiente íntimo, ideal para grupos de hasta 20 personas.',
    max_capacity: 20,
    base_price: 32000,
    socio_price: 22000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'],
    amenities: ['Parrilla', 'Mesas y sillas', 'Jardín directo', 'Iluminación'],
  },
  {
    id: 6,
    name: 'Piscina General',
    type: 'pool',
    description: 'Piscina principal del centro vacacional con área de sol y zona de niños. Los socios incluyen 5 invitados sin costo adicional.',
    max_capacity: 80,
    base_price: 5000,
    socio_price: 0,
    guest_price: 3500,
    free_guests_for_socio: 5,
    images: ['https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80'],
    amenities: ['Zona de niños', 'Área de sol', 'Camarines', 'Duchas', 'Guardería'],
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Apertura temporada de verano 2025-2026',
    body: 'El Centro Vacacional abre sus puertas para la temporada estival. Reserva con anticipación para asegurar tu espacio preferido. Los socios tienen prioridad de reserva durante los primeros 7 días.',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    published_at: '2025-11-15',
    is_pinned: true,
  },
  {
    id: 2,
    title: 'Nuevas tarifas preferenciales para socios',
    body: 'A partir de diciembre, las tarifas preferenciales para socios han sido actualizadas. Consulta el detalle en cada espacio antes de realizar tu reserva.',
    published_at: '2025-11-28',
    is_pinned: false,
  },
  {
    id: 3,
    title: 'Mantención programada - Quincho Central',
    body: 'El Quincho Central estará fuera de servicio los días 10 y 11 de diciembre por mantención de la parrilla y techumbre. Disculpen las molestias.',
    published_at: '2025-12-05',
    is_pinned: false,
  },
];

export const MOCK_USER_SOCIO: User = {
  id: 1,
  full_name: 'Carlos Muñoz Rojas',
  rut: '12.345.678-9',
  email: 'carlos.munoz@enap.cl',
  role: 'socio',
  ficha_number: 'ENP-0042',
};

export const MOCK_USER_ADMIN: User = {
  id: 99,
  full_name: 'Administrador ENAP',
  rut: '11.111.111-1',
  email: 'admin@sindicatoenap.cl',
  role: 'admin',
};

export const MOCK_USER_EXTERNAL: User = {
  id: 2,
  full_name: 'Ana González',
  rut: '15.678.901-2',
  email: 'ana@gmail.com',
  role: 'external',
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    booking_code: 'ENP-2025-00001',
    user: MOCK_USER_SOCIO,
    space: MOCK_SPACES[0],
    check_in: '2025-12-20',
    check_out: '2025-12-23',
    status: 'confirmed',
    total_amount: 112000,
    guests: [
      { id: 1, full_name: 'María Rojas', rut: '13.456.789-0', phone: '+56912345678' },
      { id: 2, full_name: 'Pedro Muñoz', rut: '14.567.890-1' },
    ],
    created_at: '2025-12-01T10:30:00',
    price_breakdown: { base: 105000, days: 3, guests_count: 2, guests_total: 7000, free_guests_applied: 0, discount: 0, total: 112000 },
  },
  {
    id: 2,
    booking_code: 'ENP-2025-00002',
    user: MOCK_USER_EXTERNAL,
    space: MOCK_SPACES[3],
    check_in: '2025-12-28',
    check_out: '2025-12-28',
    status: 'pending_approval',
    total_amount: 45000,
    guests: [],
    receipt_url: 'https://example.com/comprobante.pdf',
    created_at: '2025-12-10T14:00:00',
    price_breakdown: { base: 45000, days: 1, guests_count: 0, guests_total: 0, free_guests_applied: 0, discount: 0, total: 45000 },
  },
  {
    id: 3,
    booking_code: 'ENP-2025-00003',
    user: { id: 3, full_name: 'Roberto Pérez', rut: '16.789.012-3', email: 'roberto@enap.cl', role: 'socio', ficha_number: 'ENP-0078' },
    space: MOCK_SPACES[5],
    check_in: '2026-01-05',
    check_out: '2026-01-05',
    status: 'pending_payment',
    total_amount: 3500,
    guests: [
      { id: 3, full_name: 'Sofía Pérez', rut: '17.890.123-4' },
      { id: 4, full_name: 'Tomás Pérez', rut: '18.901.234-5' },
      { id: 5, full_name: 'Luis Vera', rut: '19.012.345-6' },
      { id: 6, full_name: 'Carmen Vera', rut: '20.123.456-7' },
      { id: 7, full_name: 'Jorge López', rut: '21.234.567-8' },
      { id: 8, full_name: 'Paula López', rut: '22.345.678-9' },
    ],
    created_at: '2025-12-12T09:00:00',
    price_breakdown: { base: 0, days: 1, guests_count: 6, guests_total: 3500, free_guests_applied: 5, discount: 17500, total: 3500 },
  },
];

export const BLOCKED_DATES: Record<number, string[]> = {
  1: ['2025-12-20', '2025-12-21', '2025-12-22', '2025-12-24', '2025-12-25', '2025-12-31'],
  2: ['2025-12-28', '2025-12-29', '2025-12-30', '2025-12-31', '2026-01-10', '2026-01-11', '2026-01-12', '2026-01-13'],
  3: [],
  4: ['2025-12-10', '2025-12-11', '2025-12-28'],
  5: ['2025-12-31'],
  6: ['2026-01-05'],
};
