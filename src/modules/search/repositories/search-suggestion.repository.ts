import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SearchSuggestion } from '../entities/search-suggestion.entity';
import {
  CreateSearchSuggestionDto,
  UpdateSearchSuggestionDto,
  SearchSuggestionQueryDto,
  PaginationInfo,
  SearchSuggestionStatistics
} from '../dto/search.dto';
import { ContentType } from '../dto/search.dto';

@Injectable()
export class SearchSuggestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SearchSuggestion | null> {
    const result = await this.prisma.searchSuggestion.findUnique({
      where: { id }
    });
    return result as SearchSuggestion | null;
  }

  async findByTerm(term: string, language: string): Promise<SearchSuggestion | null> {
    const result = await this.prisma.searchSuggestion.findFirst({
      where: { 
        term,
        language
      }
    });
    return result as SearchSuggestion | null;
  }

  async findAll(query: SearchSuggestionQueryDto): Promise<{
    data: SearchSuggestion[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (query.search) {
      where.term = {
        contains: query.search,
        mode: 'insensitive'
      };
    }
    
    if (query.language) {
      where.language = query.language;
    }
    
    if (query.contentType) {
      where.contentType = query.contentType;
    }
    
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy: any = {};
    if (query.sort) {
      orderBy[query.sort] = query.order || 'desc';
    } else {
      orderBy.frequency = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.searchSuggestion.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.searchSuggestion.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as SearchSuggestion[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findByPrefix(prefix: string, language: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const result = await this.prisma.searchSuggestion.findMany({
      where: {
        term: {
          startsWith: prefix,
          mode: 'insensitive'
        },
        language,
        isActive: true
      },
      orderBy: {
        frequency: 'desc'
      },
      take: limit
    });
    return result as SearchSuggestion[];
  }

  async create(data: CreateSearchSuggestionDto): Promise<SearchSuggestion> {
    const result = await this.prisma.searchSuggestion.create({
      data: {
        term: data.term,
        language: data.language,
        contentType: data.contentType as any,
        frequency: data.frequency || 1,
        lastUsedAt: new Date(),
        isActive: true
      }
    });
    return result as SearchSuggestion;
  }

  async update(id: string, data: UpdateSearchSuggestionDto): Promise<SearchSuggestion> {
    const updateData: any = {};

    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const result = await this.prisma.searchSuggestion.update({
      where: { id },
      data: updateData
    });
    return result as SearchSuggestion;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.searchSuggestion.delete({
      where: { id }
    });
  }

  async incrementFrequency(term: string, language: string): Promise<void> {
    const existing = await this.findByTerm(term, language);
    
    if (existing) {
      await this.prisma.searchSuggestion.update({
        where: { id: existing.id },
        data: {
          frequency: existing.frequency + 1,
          lastUsedAt: new Date()
        }
      });
    } else {
      await this.create({
        term,
        language,
        frequency: 1
      });
    }
  }

  async getPopularSuggestions(language: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const result = await this.prisma.searchSuggestion.findMany({
      where: {
        language,
        isActive: true
      },
      orderBy: {
        frequency: 'desc'
      },
      take: limit
    });
    return result as SearchSuggestion[];
  }

  async getStatistics(): Promise<SearchSuggestionStatistics> {
    const [
      total,
      active,
      byLanguage,
      byContentType,
      averageFrequency
    ] = await Promise.all([
      this.prisma.searchSuggestion.count(),
      this.prisma.searchSuggestion.count({ where: { isActive: true } }),
      this.prisma.searchSuggestion.groupBy({
        by: ['language'],
        _count: { language: true }
      }),
      this.prisma.searchSuggestion.groupBy({
        by: ['contentType'],
        _count: { contentType: true }
      }),
      this.prisma.searchSuggestion.aggregate({
        _avg: { frequency: true }
      })
    ]);

    const languageStats: Record<string, number> = {};
    byLanguage.forEach(item => {
      languageStats[item.language] = item._count.language;
    });

    const contentTypeStats: Record<ContentType, number> = {} as any;
    byContentType.forEach(item => {
      if (item.contentType) {
        contentTypeStats[item.contentType] = item._count.contentType;
      }
    });

    return {
      total,
      active,
      byLanguage: languageStats,
      byContentType: contentTypeStats,
      averageFrequency: averageFrequency._avg.frequency || 0
    };
  }

  async cleanInactiveSuggestions(): Promise<void> {
    // Remove suggestions that haven't been used in 30 days and have low frequency
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    await this.prisma.searchSuggestion.deleteMany({
      where: {
        lastUsedAt: {
          lt: cutoffDate
        },
        frequency: {
          lt: 2
        }
      }
    });
  }
} 