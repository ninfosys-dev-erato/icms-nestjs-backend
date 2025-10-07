import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FAQRepository } from '../repositories/faq.repository';
import { 
  CreateFAQDto, 
  UpdateFAQDto, 
  FAQResponseDto,
  FAQQueryDto,
  BulkCreateFAQDto,
  BulkUpdateFAQDto,
  ReorderFAQDto,
  FAQStatistics,
  FAQSearchResult,
  ValidationResult,
  ValidationError,
  ImportResult,
  ExportResult
} from '../dto/faq.dto';
import { TranslatableEntityHelper, Language } from '../../../common/types/translatable.entity';

@Injectable()
export class FAQService {
  constructor(private readonly faqRepository: FAQRepository) {}

  async getFAQ(id: string): Promise<FAQResponseDto> {
    const faq = await this.faqRepository.findById(id);
    
    if (!faq) {
      throw new NotFoundException('FAQ not found');
    }

    return this.transformToResponseDto(faq);
  }

  async getAllFAQs(query?: FAQQueryDto): Promise<FAQResponseDto[]> {
    const faqs = await this.faqRepository.findAll(query?.isActive);
    return faqs.map(faq => this.transformToResponseDto(faq, query?.lang));
  }

  async getFAQsWithPagination(
    page: number = 1, 
    limit: number = 10, 
    isActive?: boolean
  ): Promise<{
    data: FAQResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.faqRepository.findWithPagination(page, limit, isActive);
    
    return {
      data: result.data.map(faq => this.transformToResponseDto(faq)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    };
  }

  async searchFAQs(searchTerm: string, isActive?: boolean): Promise<FAQSearchResult> {
    const faqs = await this.faqRepository.search(searchTerm, isActive);
    
    return {
      data: faqs.map(faq => this.transformToResponseDto(faq)),
      total: faqs.length,
      searchTerm,
      relevanceScore: this.calculateRelevanceScore(searchTerm, faqs),
    };
  }

  async createFAQ(data: CreateFAQDto): Promise<FAQResponseDto> {
    const validation = await this.validateFAQ(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const faq = await this.faqRepository.create(data);
    return this.transformToResponseDto(faq);
  }

  async updateFAQ(id: string, data: UpdateFAQDto): Promise<FAQResponseDto> {
    const validation = await this.validateFAQ(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const faq = await this.faqRepository.update(id, data);
    return this.transformToResponseDto(faq);
  }

  async deleteFAQ(id: string): Promise<void> {
    const exists = await this.faqRepository.findById(id);
    if (!exists) {
      throw new NotFoundException('FAQ not found');
    }

    await this.faqRepository.delete(id);
  }

  async reorderFAQs(data: ReorderFAQDto): Promise<void> {
    await this.faqRepository.reorder(data.orders);
  }

  async bulkCreateFAQs(data: BulkCreateFAQDto): Promise<FAQResponseDto[]> {
    // Validate all FAQs
    for (const faq of data.faqs) {
      const validation = await this.validateFAQ(faq);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: `Validation failed for FAQ: ${faq.question.en}`,
          errors: validation.errors,
        });
      }
    }

    const faqs = await this.faqRepository.bulkCreate(data.faqs);
    return faqs.map(faq => this.transformToResponseDto(faq));
  }

  async bulkUpdateFAQs(data: BulkUpdateFAQDto): Promise<FAQResponseDto[]> {
    // Validate all updates
    for (const update of data.faqs) {
      if (update.question) {
        const validation = await this.validateFAQ({ 
          question: update.question,
          answer: { en: 'dummy', ne: 'dummy' } // Dummy answer for validation
        });
        if (!validation.isValid) {
          throw new BadRequestException({
            message: `Validation failed for FAQ ${update.id}`,
            errors: validation.errors,
          });
        }
      }

      if (update.answer) {
        const validation = await this.validateFAQ({ 
          question: { en: 'dummy', ne: 'dummy' }, // Dummy question for validation
          answer: update.answer
        });
        if (!validation.isValid) {
          throw new BadRequestException({
            message: `Validation failed for FAQ ${update.id}`,
            errors: validation.errors,
          });
        }
      }
    }

    const updates = data.faqs.map(update => ({
      id: update.id,
      data: {
        question: update.question,
        answer: update.answer,
        order: update.order,
        isActive: update.isActive,
      },
    }));

    const faqs = await this.faqRepository.bulkUpdate(updates);
    return faqs.map(faq => this.transformToResponseDto(faq));
  }

  async getFAQStatistics(): Promise<FAQStatistics> {
    const stats = await this.faqRepository.getStatistics();
    
    return {
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
      lastUpdated: stats.lastUpdated || new Date(),
    };
  }

  async getRandomFAQs(limit: number = 5, lang?: string): Promise<FAQResponseDto[]> {
    const faqs = await this.faqRepository.getRandomFAQs(limit, true);
    return faqs.map(faq => this.transformToResponseDto(faq, lang));
  }

  async getPopularFAQs(limit: number = 10, lang?: string): Promise<FAQResponseDto[]> {
    const faqs = await this.faqRepository.getPopularFAQs(limit, true);
    return faqs.map(faq => this.transformToResponseDto(faq, lang));
  }

  async validateFAQ(data: CreateFAQDto | UpdateFAQDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate question if provided
    if ('question' in data && data.question) {
      const questionErrors = TranslatableEntityHelper.validate(data.question, {
        en: { required: true, minLength: 5, maxLength: 500 },
        ne: { required: true, minLength: 5, maxLength: 500 },
      });
      questionErrors.forEach(error => {
        errors.push({
          field: 'question',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    // Validate answer if provided
    if ('answer' in data && data.answer) {
      const answerErrors = TranslatableEntityHelper.validate(data.answer, {
        en: { required: true, minLength: 10, maxLength: 2000 },
        ne: { required: true, minLength: 10, maxLength: 2000 },
      });
      answerErrors.forEach(error => {
        errors.push({
          field: 'answer',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    // Validate order if provided
    if ('order' in data && data.order !== undefined) {
      if (data.order < 0) {
        errors.push({
          field: 'order',
          message: 'Order must be a non-negative number',
          code: 'INVALID_ORDER',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async importFAQs(faqs: CreateFAQDto[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const faq of faqs) {
      try {
        const validation = await this.validateFAQ(faq);
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(`Validation failed for ${faq.question.en}: ${validation.errors.map(e => e.message).join(', ')}`);
          continue;
        }

        await this.faqRepository.create(faq);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import ${faq.question.en}: ${error.message}`);
      }
    }

    return result;
  }

  async exportFAQs(): Promise<ExportResult> {
    const faqs = await this.faqRepository.findAll();
    const responseFaqs = faqs.map(faq => this.transformToResponseDto(faq));

    return {
      data: responseFaqs,
      total: responseFaqs.length,
      exportedAt: new Date(),
    };
  }

  private transformToResponseDto(faq: any, lang?: string): FAQResponseDto {
    let question = faq.question;
    let answer = faq.answer;
    
    if (lang) {
      if (question) {
        question = {
          en: question.en,
          ne: question.ne,
          value: TranslatableEntityHelper.getValue(question, lang as Language),
        };
      }
      
      if (answer) {
        answer = {
          en: answer.en,
          ne: answer.ne,
          value: TranslatableEntityHelper.getValue(answer, lang as Language),
        };
      }
    }

    return {
      id: faq.id,
      question,
      answer,
      order: faq.order,
      isActive: faq.isActive,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    };
  }

  private calculateRelevanceScore(searchTerm: string, faqs: any[]): number {
    if (faqs.length === 0) return 0;

    // Simple relevance calculation based on exact matches
    const searchLower = searchTerm.toLowerCase();
    let totalScore = 0;

    faqs.forEach(faq => {
      const questionEn = faq.question.en.toLowerCase();
      const questionNe = faq.question.ne.toLowerCase();
      const answerEn = faq.answer.en.toLowerCase();
      const answerNe = faq.answer.ne.toLowerCase();

      let score = 0;
      
      // Exact match gets highest score
      if (questionEn.includes(searchLower) || questionNe.includes(searchLower)) {
        score += 0.8;
      }
      
      if (answerEn.includes(searchLower) || answerNe.includes(searchLower)) {
        score += 0.6;
      }

      // Partial match gets lower score
      const words = searchLower.split(' ');
      words.forEach(word => {
        if (questionEn.includes(word) || questionNe.includes(word)) {
          score += 0.3;
        }
        if (answerEn.includes(word) || answerNe.includes(word)) {
          score += 0.2;
        }
      });

      totalScore += Math.min(score, 1.0); // Cap at 1.0
    });

    return totalScore / faqs.length;
  }
} 