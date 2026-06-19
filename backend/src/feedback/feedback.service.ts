import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedbackEntity } from './feedback.entity';
import { Booking } from '../bookings/booking.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(
    userId: number,
    body: { bookingId: number; rating: number; comment: string }
  ): Promise<FeedbackEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id: body.bookingId },
      relations: { user: true, space: true },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (booking.user.id !== userId) {
      throw new ForbiddenException('No tienes permiso para dejar feedback en esta reserva');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestException('La reserva debe estar confirmada para dejar una opinión');
    }

    // Comprobar si la estadía ya finalizó
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (booking.checkOut > todayStr) {
      throw new BadRequestException('Solo puedes dejar una opinión después de que haya finalizado tu estadía');
    }

    // Verificar si ya existe feedback para esta reserva
    const existing = await this.feedbackRepository.findOne({
      where: { booking: { id: body.bookingId } }
    });

    if (existing) {
      throw new ConflictException('Ya has enviado feedback para esta reserva');
    }

    if (body.rating < 1 || body.rating > 5) {
      throw new BadRequestException('La calificación debe estar entre 1 y 5 estrellas');
    }

    const newFeedback = this.feedbackRepository.create({
      rating: body.rating,
      comment: body.comment,
      status: 'pending_approval',
      booking,
      user: booking.user,
      space: booking.space,
    });

    return this.feedbackRepository.save(newFeedback);
  }

  async getApprovedBySpace(spaceId: number): Promise<FeedbackEntity[]> {
    return this.feedbackRepository.find({
      where: { space: { id: spaceId }, status: 'approved' },
      order: { createdAt: 'DESC' },
    });
  }

  async getAll(): Promise<FeedbackEntity[]> {
    return this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async moderate(id: number, status: 'approved' | 'rejected'): Promise<FeedbackEntity> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback no encontrado');
    }

    if (status !== 'approved' && status !== 'rejected') {
      throw new BadRequestException('Estado de moderación no válido');
    }

    feedback.status = status;
    return this.feedbackRepository.save(feedback);
  }
}
