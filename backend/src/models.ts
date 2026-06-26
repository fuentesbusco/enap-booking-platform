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
  rating_average?: number;
  rating_count?: number;
  total_units?: number;
}

export interface Guest {
  id?: number;
  full_name: string;
  rut: string;
  phone?: string;
  age?: number;
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
  is_for_third_party?: boolean;
  third_party_name?: string;
  third_party_rut?: string;
  third_party_phone?: string;
  admin_created_for_external?: boolean;
  visit_type?: string;
  assigned_unit?: string;
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
    name: 'Cabañas Familiares',
    type: 'cabin',
    description: 'Cabañas totalmente equipadas para 6 personas con menaje, servicios, cocina, refrigerador, televisión satelital e Internet. El centro cuenta con 6 cabañas independientes.',
    max_capacity: 6,
    base_price: 50000,
    socio_price: 35000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: ['/images/frontal-cabanas.jpeg', '/images/aereo-dron-cabanas.jpeg'],
    amenities: ['Matrimonial + 2 Camarotes', 'Cocina equipada', 'TV Satelital', 'Internet controlado', 'Traer sábanas y toallas', 'Estacionamiento', 'Parrilla exterior'],
    total_units: 6,
  },
  {
    id: 2,
    name: 'Quinchos Familiares',
    type: 'quincho',
    description: 'Espacios de quincho equipados con parrilla, mesas y sillas para asados y celebraciones familiares al aire libre. El centro cuenta con 10 quinchos independientes.',
    max_capacity: 15,
    base_price: 45000,
    socio_price: 30000,
    guest_price: 3500,
    free_guests_for_socio: 0,
    images: ['/images/quincho.jpeg', '/images/quincho-nocturno.jpeg'],
    amenities: ['Parrilla', 'Mesas y sillas', 'Lavadero', 'Iluminación'],
    total_units: 10,
  },
  {
    id: 3,
    name: 'Piscina General',
    type: 'pool',
    description: 'Piscina principal del centro vacacional con área de sol y zona de niños. Los socios incluyen 5 invitados sin costo adicional. Capacidad máxima total de 1.000 personas.',
    max_capacity: 1000,
    base_price: 5000,
    socio_price: 0,
    guest_price: 3500,
    free_guests_for_socio: 5,
    images: ['/images/piscina-diagonal.jpeg', '/images/aerea-piscina-central.jpeg', '/images/piscina-quitasol.jpeg', '/images/piscina-entrada.jpeg'],
    amenities: ['Zona de niños', 'Área de sol', 'Camarines', 'Duchas', 'Guardería'],
    total_units: 1,
  },
  {
    id: 4,
    name: 'Club House',
    type: 'quincho',
    description: 'Sede social y Club House con capacidad para 120 personas, equipado con cocina completa, salón de eventos, baños y área exterior. Pronto disponible para celebraciones grandes y reuniones de socios.',
    max_capacity: 120,
    base_price: 0,
    socio_price: 0,
    guest_price: 0,
    free_guests_for_socio: 0,
    images: ['/images/aerea-centro.jpeg', '/images/frontal-cabanas.jpeg'],
    amenities: ['Cocina completa', 'Salón de eventos', 'Mesas y sillas para 120', 'Baños integrados', 'Estacionamiento amplio'],
    total_units: 1,
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Apertura temporada de verano 2025-2026',
    body: 'El Centro Vacacional abre sus puertas para la temporada estival. Reserva con anticipación para asegurar tu espacio preferido. Los socios tienen prioridad de reserva durante los primeros 7 días.',
    image_url: '/images/aerea-piscinas.jpeg',
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
    image_url: '/images/quincho.jpeg',
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


