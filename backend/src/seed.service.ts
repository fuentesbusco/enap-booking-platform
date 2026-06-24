import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users/user.entity';
import { SpaceEntity } from './spaces/space.entity';
import { AnnouncementEntity } from './announcements/announcement.entity';
import { GalleryEntity } from './gallery/gallery.entity';
import { FaqEntity } from './faq/faq.entity';
import { hashPassword } from './auth/hash.util';
import { MOCK_SPACES, MOCK_ANNOUNCEMENTS, MOCK_USER_SOCIO, MOCK_USER_ADMIN, MOCK_USER_EXTERNAL } from './models';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SpaceEntity)
    private readonly spaceRepository: Repository<SpaceEntity>,
    @InjectRepository(AnnouncementEntity)
    private readonly announcementRepository: Repository<AnnouncementEntity>,
    @InjectRepository(GalleryEntity)
    private readonly galleryRepository: Repository<GalleryEntity>,
    @InjectRepository(FaqEntity)
    private readonly faqRepository: Repository<FaqEntity>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database status to seed initial datasets...');
    try {
      await this.seedSpaces();
      await this.seedUsers();
      await this.seedAnnouncements();
      await this.seedGallery();
      await this.seedFaqs();
      this.logger.log('Database check and seeding complete.');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
    }
  }

  private async seedSpaces() {
    this.logger.log('Synchronizing spaces table to Category model...');
    const mockIds = MOCK_SPACES.map((s) => s.id);

    // 1. Fetch all current spaces in DB
    const dbSpaces = await this.spaceRepository.find();

    // 2. Delete spaces from DB that do not exist in MOCK_SPACES IDs
    for (const dbSpace of dbSpaces) {
      if (!mockIds.includes(dbSpace.id)) {
        this.logger.log(`Removing deprecated space from database: ${dbSpace.name} (ID: ${dbSpace.id})`);
        await this.spaceRepository.remove(dbSpace);
      }
    }

    // 3. Update or insert the 4 Category Spaces
    for (const mockSpace of MOCK_SPACES) {
      let dbSpace = await this.spaceRepository.findOne({ where: { id: mockSpace.id } });
      if (!dbSpace) {
        this.logger.log(`Seeding space category: ${mockSpace.name} (ID: ${mockSpace.id})`);
        dbSpace = this.spaceRepository.create({
          id: mockSpace.id,
          name: mockSpace.name,
          type: mockSpace.type,
          description: mockSpace.description,
          maxCapacity: mockSpace.max_capacity,
          basePrice: mockSpace.base_price,
          socioPrice: mockSpace.socio_price,
          guestPrice: mockSpace.guest_price,
          freeGuestsForSocio: mockSpace.free_guests_for_socio,
          images: mockSpace.images,
          amenities: mockSpace.amenities,
          totalUnits: mockSpace.total_units || 1,
        });
      } else {
        this.logger.log(`Updating space category: ${mockSpace.name} (ID: ${mockSpace.id})`);
        dbSpace.name = mockSpace.name;
        dbSpace.type = mockSpace.type;
        dbSpace.description = mockSpace.description;
        dbSpace.maxCapacity = mockSpace.max_capacity;
        dbSpace.basePrice = mockSpace.base_price;
        dbSpace.socioPrice = mockSpace.socio_price;
        dbSpace.guestPrice = mockSpace.guest_price;
        dbSpace.freeGuestsForSocio = mockSpace.free_guests_for_socio;
        dbSpace.images = mockSpace.images;
        dbSpace.amenities = mockSpace.amenities;
        dbSpace.totalUnits = mockSpace.total_units || 1;
      }
      await this.spaceRepository.save(dbSpace);
    }
    this.logger.log('Database spaces synchronized to exactly 4 categories.');
  }

  private async seedUsers() {
    const count = await this.userRepository.count();
    if (count > 0) {
      this.logger.log('Users table is already seeded.');
      return;
    }

    this.logger.log('Seeding users table...');
    const defaultUsers = [
      {
        fullName: MOCK_USER_SOCIO.full_name,
        rut: MOCK_USER_SOCIO.rut,
        email: MOCK_USER_SOCIO.email,
        role: MOCK_USER_SOCIO.role,
        fichaNumber: MOCK_USER_SOCIO.ficha_number,
        passwordHash: hashPassword('password123'),
        isActive: true,
      },
      {
        fullName: MOCK_USER_ADMIN.full_name,
        rut: MOCK_USER_ADMIN.rut,
        email: MOCK_USER_ADMIN.email,
        role: MOCK_USER_ADMIN.role,
        passwordHash: hashPassword('password123'),
        isActive: true,
      },
      {
        fullName: MOCK_USER_EXTERNAL.full_name,
        rut: MOCK_USER_EXTERNAL.rut,
        email: MOCK_USER_EXTERNAL.email,
        role: MOCK_USER_EXTERNAL.role,
        passwordHash: hashPassword('password123'),
        isActive: true,
      },
      {
        fullName: 'Roberto Pérez',
        rut: '16.789.012-3',
        email: 'roberto@enap.cl',
        role: 'socio' as const,
        fichaNumber: 'ENP-0078',
        passwordHash: hashPassword('password123'),
        isActive: true,
      },
      {
        fullName: 'Valentina Torres',
        rut: '17.890.123-4',
        email: 'vtorres@enap.cl',
        role: 'socio' as const,
        fichaNumber: 'ENP-0112',
        passwordHash: hashPassword('password123'),
        isActive: false,
      },
      {
        fullName: 'Marcos Fuentes',
        rut: '18.901.234-5',
        email: 'marcos@hotmail.com',
        role: 'external' as const,
        passwordHash: hashPassword('password123'),
        isActive: true,
      },
    ];

    const users = defaultUsers.map((u) => this.userRepository.create(u));
    await this.userRepository.save(users);
    this.logger.log(`Successfully seeded ${users.length} default users.`);
  }

  private async seedAnnouncements() {
    const count = await this.announcementRepository.count();
    if (count === 0) {
      this.logger.log('Seeding announcements table...');
      const announcements = MOCK_ANNOUNCEMENTS.map((a) =>
        this.announcementRepository.create({
          title: a.title,
          body: a.body,
          imageUrl: a.image_url,
          publishedAt: a.published_at,
          isPinned: a.is_pinned,
        }),
      );
      await this.announcementRepository.save(announcements);
      this.logger.log(`Successfully seeded ${announcements.length} announcements.`);
    } else {
      const dbAnns = await this.announcementRepository.find();
      for (const dbAnn of dbAnns) {
        const mockAnn = MOCK_ANNOUNCEMENTS.find((ma) => ma.title === dbAnn.title);
        if (mockAnn && mockAnn.image_url && (!dbAnn.imageUrl || dbAnn.imageUrl.includes('unsplash.com'))) {
          this.logger.log(`Updating image for announcement: ${dbAnn.title}`);
          dbAnn.imageUrl = mockAnn.image_url;
          await this.announcementRepository.save(dbAnn);
        }
      }
    }
  }

  private async seedGallery() {
    const count = await this.galleryRepository.count();
    if (count > 0) {
      this.logger.log('Gallery table is already seeded.');
      return;
    }

    this.logger.log('Seeding gallery table...');
    const galleryItems = [
      {
        title: 'Vista Aérea del Centro',
        imageUrl: '/images/aerea-centro.jpeg',
        description: 'Espectacular toma desde el aire de nuestro centro vacacional.',
      },
      {
        title: 'Piscinas y Áreas Verdes',
        imageUrl: '/images/aerea-piscinas.jpeg',
        description: 'Área de piscinas principales con vegetación nativa y reposeras.',
      },
      {
        title: 'Cabañas Familiares',
        imageUrl: '/images/frontal-cabanas.jpeg',
        description: 'Cabañas completamente equipadas para toda la familia.',
      },
      {
        title: 'Quincho Techado',
        imageUrl: '/images/quincho.jpeg',
        description: 'Amplios quinchos para asados y reuniones familiares.',
      },
      {
        title: 'Cancha de Fútbol',
        imageUrl: '/images/cancha-furbol.jpeg',
        description: 'Espacio deportivo para torneos y esparcimiento.',
      },
      {
        title: 'Piscina en Tarde de Sol',
        imageUrl: '/images/piscina-diagonal.jpeg',
        description: 'Perfecto para refrescarse durante el verano y disfrutar con amigos.',
      },
      {
        title: 'Entorno de Noche',
        imageUrl: '/images/centro-norturna.jpeg',
        description: 'Iluminación cálida y ambiente sumamente tranquilo por las noches.',
      },
    ];

    const items = galleryItems.map((g) => this.galleryRepository.create(g));
    await this.galleryRepository.save(items);
    this.logger.log(`Successfully seeded ${items.length} gallery items.`);
  }

  private async seedFaqs() {
    this.logger.log('Checking/Seeding FAQs table...');
    const defaultFaqs = [
      {
        question: '¿Quiénes tienen acceso a las tarifas preferenciales del Centro Vacacional?',
        answer: 'Las tarifas preferenciales ("Socio Sindicato") se aplican exclusivamente a los socios activos del Sindicato de Trabajadores ENAP y sus cargas familiares directas. Al ingresar, el sistema valida tu RUT y tu ficha para aplicar el descuento de forma automática. Los externos/público general pueden reservar a tarifa base si hay disponibilidad.',
        order: 1,
      },
      {
        question: '¿Cuáles son los atractivos turísticos cercanos en la zona de Limache?',
        answer: 'El centro se encuentra en una ubicación privilegiada del Valle de Marga Marga. Puedes visitar el Embalse Los Aromos (ideal para kayak, fotografía y paseos al aire libre), la histórica Estación de Limache, el Parque Nacional La Campana en Olmué (famoso por sus senderos de trekking y palmas chilenas), y las viñas boutique locales. Además, Viña del Mar y Valparaíso quedan a solo 40 minutos en tren suburbano.',
        order: 2,
      },
      {
        question: '¿Cuál es la política para llevar invitados a la piscina del Centro?',
        answer: 'Como beneficio sindical, cada socio titular tiene derecho a ingresar con hasta 5 invitados gratis a la piscina general por jornada de reserva. A partir del sexto invitado, se aplica una tarifa especial de invitado diario de $3.000 CLP, la cual se detalla al registrar a las personas en el paso de invitados del flujo de reserva.',
        order: 3,
      },
      {
        question: '¿Las cabañas familiares incluyen sábanas, toallas y artículos de aseo?',
        answer: 'Para mantener tarifas sindicales preferenciales accesibles y por protocolo de higiene, las cabañas NO incluyen sábanas, fundas de almohada ni toallas de baño. Cada cabaña cuenta con frazadas, vajilla completa, microondas, refrigerador y utensilios de cocina. Te sugerimos traer tus propios textiles personales.',
        order: 4,
      },
      {
        question: '¿Cómo funciona el proceso de pago y validación de reserva por transferencia?',
        answer: 'Puedes pagar directamente con Mercado Pago (tarjetas o saldo) para confirmación inmediata, o elegir transferencia bancaria. Si seleccionas transferencia, tienes un plazo de 24 horas para realizar el depósito y subir el comprobante de pago en la sección "Mis Reservas" para que la administración valide y confirme tu cupo.',
        order: 5,
      },
      {
        question: '¿Puedo cancelar o reprogramar si las condiciones del clima no son favorables?',
        answer: 'Sí, las reprogramaciones de quinchos o piscina debido al clima o motivos de fuerza mayor se pueden solicitar sin costo adicional avisando con un mínimo de 48 horas de anticipación al correo de administración (admin&#64;sindicatoenap.cl).',
        order: 6,
      },
    ];

    let seededCount = 0;
    for (const df of defaultFaqs) {
      const exists = await this.faqRepository.findOne({ where: { question: df.question } });
      if (!exists) {
        const faq = this.faqRepository.create(df);
        await this.faqRepository.save(faq);
        seededCount++;
      }
    }
    
    if (seededCount > 0) {
      this.logger.log(`Successfully seeded ${seededCount} new FAQs.`);
    } else {
      this.logger.log('All default FAQs are already present in the database.');
    }
  }
}
