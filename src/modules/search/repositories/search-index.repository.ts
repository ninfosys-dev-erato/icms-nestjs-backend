import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SearchIndex } from '../entities/search-index.entity';
import {
  CreateSearchIndexDto,
  UpdateSearchIndexDto,
  SearchIndexQueryDto,
  SearchIndexStatistics,
  PaginationInfo,
  BulkReindexResult
} from '../dto/search.dto';
import { ContentType } from '../dto/search.dto';

@Injectable()
export class SearchIndexRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SearchIndex | null> {
    const result = await this.prisma.searchIndex.findUnique({
      where: { id }
    });
    return result as SearchIndex | null;
  }

  async findByContent(contentId: string, contentType: ContentType): Promise<SearchIndex | null> {
    const result = await this.prisma.searchIndex.findFirst({
      where: { 
        contentId,
        contentType: contentType as any
      }
    });
    return result as SearchIndex | null;
  }

  async findAll(query: SearchIndexQueryDto): Promise<{
    data: SearchIndex[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (query.contentType) {
      where.contentType = query.contentType as any;
    }
    
    if (query.language) {
      where.language = query.language;
    }
    
    if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }
    
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy: any = {};
    if (query.sort) {
      orderBy[query.sort] = query.order || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.searchIndex.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.searchIndex.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as SearchIndex[],
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



  async search(searchTerm: string, query: any): Promise<{
    data: SearchIndex[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        {
          title: {
            path: ['en'],
            string_contains: searchTerm
          }
        },
        {
          title: {
            path: ['ne'],
            string_contains: searchTerm
          }
        },
        {
          content: {
            path: ['en'],
            string_contains: searchTerm
          }
        },
        {
          content: {
            path: ['ne'],
            string_contains: searchTerm
          }
        }
      ]
    };

    if (query.contentType) {
      where.contentType = query.contentType as any;
    }

    if (query.language) {
      where.language = query.language;
    }

    if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const orderBy: any = {};
    if (query.sort === 'relevance') {
      orderBy.searchScore = 'desc';
    } else if (query.sort) {
      orderBy[query.sort] = query.order || 'desc';
    } else {
      orderBy.searchScore = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.searchIndex.findMany({
        where,
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.searchIndex.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as SearchIndex[],
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

  async create(data: CreateSearchIndexDto): Promise<SearchIndex> {
    const result = await this.prisma.searchIndex.create({
      data: {
        contentId: data.contentId,
        contentType: data.contentType as any,
        title: data.title as any,
        content: data.content as any,
        description: data.description as any,
        tags: data.tags || [],
        language: data.language,
        isPublished: data.isPublished ?? true,
        isActive: data.isActive ?? true,
        searchScore: 0,
        lastIndexedAt: new Date()
      }
    });
    return result as SearchIndex;
  }

  async update(id: string, data: UpdateSearchIndexDto): Promise<SearchIndex> {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title as any;
    if (data.content !== undefined) updateData.content = data.content as any;
    if (data.description !== undefined) updateData.description = data.description as any;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const result = await this.prisma.searchIndex.update({
      where: { id },
      data: updateData
    });
    return result as SearchIndex;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.searchIndex.delete({
      where: { id }
    });
  }

  async deleteByContent(contentId: string, contentType: ContentType): Promise<void> {
    await this.prisma.searchIndex.deleteMany({
      where: { 
        contentId,
        contentType: contentType as any
      }
    });
  }

  async reindex(contentId: string, contentType: ContentType): Promise<SearchIndex> {
    // This would typically involve fetching the content and reindexing it
    // For now, we'll just update the lastIndexedAt timestamp
    const existing = await this.findByContent(contentId, contentType);
    if (!existing) {
      throw new Error('Search index not found');
    }

    const result = await this.prisma.searchIndex.update({
      where: { id: existing.id },
      data: {
        lastIndexedAt: new Date(),
        searchScore: Math.random() // This would be calculated based on content relevance
      }
    });
    return result as SearchIndex;
  }

  async bulkReindex(contentType?: ContentType): Promise<BulkReindexResult> {
    const where: any = {};
    if (contentType) {
      where.contentType = contentType as any;
    }

    const indices = await this.prisma.searchIndex.findMany({ where });
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const index of indices) {
      try {
        await this.reindex(index.contentId, index.contentType as any);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to reindex ${index.contentId}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async getStatistics(): Promise<SearchIndexStatistics> {
    const [
      total,
      byContentType,
      byLanguage,
      published,
      active,
      averageScore
    ] = await Promise.all([
      this.prisma.searchIndex.count(),
      this.prisma.searchIndex.groupBy({
        by: ['contentType'],
        _count: { contentType: true }
      }),
      this.prisma.searchIndex.groupBy({
        by: ['language'],
        _count: { language: true }
      }),
      this.prisma.searchIndex.count({ where: { isPublished: true } }),
      this.prisma.searchIndex.count({ where: { isActive: true } }),
      this.prisma.searchIndex.aggregate({
        _avg: { searchScore: true }
      })
    ]);

    const contentTypeStats: Record<ContentType, number> = {} as any;
    byContentType.forEach(item => {
      contentTypeStats[item.contentType] = item._count.contentType;
    });

    const languageStats: Record<string, number> = {};
    byLanguage.forEach(item => {
      languageStats[item.language] = item._count.language;
    });

    return {
      total,
      byContentType: contentTypeStats,
      byLanguage: languageStats,
      published,
      active,
      averageScore: averageScore._avg.searchScore || 0
    };
  }

  async findByContentType(contentType: ContentType): Promise<SearchIndex[]> {
    const result = await this.prisma.searchIndex.findMany({
      where: { contentType: contentType as any }
    });
    return result as SearchIndex[];
  }

  async findByLanguage(language: string): Promise<SearchIndex[]> {
    const result = await this.prisma.searchIndex.findMany({
      where: { language }
    });
    return result as SearchIndex[];
  }

  async updateSearchScore(id: string, score: number): Promise<void> {
    await this.prisma.searchIndex.update({
      where: { id },
      data: { searchScore: score }
    });
  }
} 