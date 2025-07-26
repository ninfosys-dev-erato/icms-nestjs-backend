import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FAQ } from '../entities/faq.entity';
import { CreateFAQDto } from '../dto/faq.dto';
import { UpdateFAQDto } from '../dto/faq.dto';

@Injectable()
export class FAQRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<FAQ | null> {
    const faq = await this.prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) return null;

    return {
      id: faq.id,
      question: faq.question as any,
      answer: faq.answer as any,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    };
  }

  async findAll(isActive?: boolean): Promise<FAQ[]> {
    const where = isActive !== undefined ? { isActive } : {};
    
    const faqs = await this.prisma.fAQ.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return faqs.map(faq => ({
      id: faq.id,
      question: faq.question as any,
      answer: faq.answer as any,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    }));
  }

  async findWithPagination(page: number = 1, limit: number = 10, isActive?: boolean): Promise<{
    data: FAQ[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where = isActive !== undefined ? { isActive } : {};
    const skip = (page - 1) * limit;

    const [faqs, total] = await Promise.all([
      this.prisma.fAQ.findMany({
        where,
        orderBy: { order: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.fAQ.count({ where }),
    ]);

    const data = faqs.map(faq => ({
      id: faq.id,
      question: faq.question as any,
      answer: faq.answer as any,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(searchTerm: string, isActive?: boolean): Promise<FAQ[]> {
    const where: any = isActive !== undefined ? { isActive } : {};
    
    // Search in both question and answer fields using JSON string search
    where.OR = [
      {
        question: {
          path: ['en'],
          string_contains: searchTerm,
        },
      },
      {
        question: {
          path: ['ne'],
          string_contains: searchTerm,
        },
      },
      {
        answer: {
          path: ['en'],
          string_contains: searchTerm,
        },
      },
      {
        answer: {
          path: ['ne'],
          string_contains: searchTerm,
        },
      },
    ];

    try {
      const faqs = await this.prisma.fAQ.findMany({
        where,
        orderBy: { order: 'asc' },
      });

      return faqs.map(faq => ({
        id: faq.id,
        question: faq.question as any,
        answer: faq.answer as any,
        order: faq.order,
        isActive: faq.isActive,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
      }));
    } catch (error) {
      // Fallback to simple string search if JSON path search fails
      console.warn('JSON path search failed, falling back to simple search:', error.message);
      
      const faqs = await this.prisma.fAQ.findMany({
        where: isActive !== undefined ? { isActive } : {},
        orderBy: { order: 'asc' },
      });

      // Filter in memory
      return faqs
        .filter(faq => {
          const question = faq.question as any;
          const answer = faq.answer as any;
          
          return (
            (question?.en && question.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (question?.ne && question.ne.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (answer?.en && answer.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (answer?.ne && answer.ne.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        })
        .map(faq => ({
          id: faq.id,
          question: faq.question as any,
          answer: faq.answer as any,
          order: faq.order,
          isActive: faq.isActive,
          createdAt: faq.createdAt,
          updatedAt: faq.updatedAt,
        }));
    }
  }

  async create(data: CreateFAQDto): Promise<FAQ> {
    const faq = await this.prisma.fAQ.create({
      data: {
        question: data.question as any,
        answer: data.answer as any,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return {
      id: faq.id,
      question: faq.question as any,
      answer: faq.answer as any,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    };
  }

  async update(id: string, data: UpdateFAQDto): Promise<FAQ> {
    const faq = await this.prisma.fAQ.update({
      where: { id },
      data: {
        ...(data.question && { question: data.question as any }),
        ...(data.answer && { answer: data.answer as any }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return {
      id: faq.id,
      question: faq.question as any,
      answer: faq.answer as any,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fAQ.delete({
      where: { id },
    });
  }

  async reorder(orders: { id: string; order: number }[]): Promise<void> {
    const updatePromises = orders.map(({ id, order }) =>
      this.prisma.fAQ.update({
        where: { id },
        data: { order },
      })
    );

    await Promise.all(updatePromises);
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    lastUpdated: Date | null;
  }> {
    const [total, active, lastUpdated] = await Promise.all([
      this.prisma.fAQ.count(),
      this.prisma.fAQ.count({ where: { isActive: true } }),
      this.prisma.fAQ.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      lastUpdated: lastUpdated?.updatedAt || null,
    };
  }

  async bulkCreate(faqs: CreateFAQDto[]): Promise<FAQ[]> {
    const createdFaqs = await this.prisma.fAQ.createMany({
      data: faqs.map(faq => ({
        question: faq.question as any,
        answer: faq.answer as any,
        order: faq.order || 0,
        isActive: faq.isActive !== undefined ? faq.isActive : true,
      })),
    });

    // Return the created FAQs
    return this.findAll();
  }

  async bulkUpdate(updates: { id: string; data: Partial<UpdateFAQDto> }[]): Promise<FAQ[]> {
    const updatePromises = updates.map(({ id, data }) =>
      this.prisma.fAQ.update({
        where: { id },
        data: {
          ...(data.question && { question: data.question as any }),
          ...(data.answer && { answer: data.answer as any }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      })
    );

    await Promise.all(updatePromises);
    return this.findAll();
  }

  async getRandomFAQs(limit: number = 5, isActive: boolean = true): Promise<FAQ[]> {
    const faqs = await this.prisma.fAQ.findMany({
      where: { isActive },
      orderBy: { order: 'asc' },
      take: limit,
    });

    return faqs.map(faq => ({
      id: faq.id,
      question: faq.question as any,
      answer: faq.answer as any,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    }));
  }

  async getPopularFAQs(limit: number = 10, isActive: boolean = true): Promise<FAQ[]> {
    // This would typically use a view count or similar metric
    // For now, we'll return the most recently updated FAQs
    const faqs = await this.prisma.fAQ.findMany({
      where: { isActive },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return faqs.map(faq => ({
      id: faq.id,
      question: faq.question as any,
      answer: faq.answer as any,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    }));
  }
} 