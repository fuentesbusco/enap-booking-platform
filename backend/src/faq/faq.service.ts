import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqEntity } from './faq.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FaqEntity)
    private readonly faqRepository: Repository<FaqEntity>,
  ) {}

  async getAll(): Promise<FaqEntity[]> {
    return this.faqRepository.find({
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async getById(id: number): Promise<FaqEntity> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException('Pregunta frecuente no encontrada');
    }
    return faq;
  }

  async create(data: { question: string; answer: string; order?: number }): Promise<FaqEntity> {
    const faq = this.faqRepository.create({
      question: data.question,
      answer: data.answer,
      order: data.order ?? 0,
    });
    return this.faqRepository.save(faq);
  }

  async update(id: number, data: Partial<{ question: string; answer: string; order: number }>): Promise<FaqEntity> {
    const faq = await this.getById(id);
    Object.assign(faq, data);
    return this.faqRepository.save(faq);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.faqRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Pregunta frecuente no encontrada');
    }
    return true;
  }
}
