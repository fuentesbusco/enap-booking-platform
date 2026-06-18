import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './users/user.entity';
import { SpaceEntity } from './spaces/space.entity';
import { AnnouncementEntity } from './announcements/announcement.entity';
import { GalleryEntity } from './gallery/gallery.entity';
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
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database status to seed initial datasets...');
    try {
      await this.seedSpaces();
      await this.seedUsers();
      await this.seedAnnouncements();
      await this.seedGallery();
      this.logger.log('Database check and seeding complete.');
    } catch (error) {
      this.logger.error('Database seeding failed:', error);
    }
  }

  private async seedSpaces() {
    const count = await this.spaceRepository.count();
    if (count === 0) {
      this.logger.log('Seeding spaces table...');
      const spaces = MOCK_SPACES.map((s) =>
        this.spaceRepository.create({
          name: s.name,
          type: s.type,
          description: s.description,
          maxCapacity: s.max_capacity,
          basePrice: s.base_price,
          socioPrice: s.socio_price,
          guestPrice: s.guest_price,
          freeGuestsForSocio: s.free_guests_for_socio,
          images: s.images,
          amenities: s.amenities,
        }),
      );
      await this.spaceRepository.save(spaces);
      this.logger.log(`Successfully seeded ${spaces.length} spaces.`);
    } else {
      const dbSpaces = await this.spaceRepository.find();
      for (const dbSpace of dbSpaces) {
        const mockSpace = MOCK_SPACES.find((ms) => ms.name === dbSpace.name);
        if (mockSpace && (dbSpace.images.length === 0 || dbSpace.images[0].includes('unsplash.com'))) {
          this.logger.log(`Updating images for space: ${dbSpace.name}`);
          dbSpace.images = mockSpace.images;
          await this.spaceRepository.save(dbSpace);
        }
      }
    }
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
}
