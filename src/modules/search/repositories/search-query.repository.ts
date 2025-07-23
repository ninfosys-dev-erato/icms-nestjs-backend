import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SearchQuery } from '../entities/search-query.entity';
import {
  CreateSearchQueryDto,
  SearchQueryHistoryQueryDto,
  PopularQueriesQueryDto,
  PaginationInfo,
  SearchQueryStatistics,
  SearchAnalytics,
  PopularQuery
} from '../dto/search.dto';
import { ContentType } from '../dto/search.dto';

@Injectable()
export class SearchQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SearchQuery | null> {
    const result = await this.prisma.searchQuery.findUnique({
      where: { id },
      include: {
        results: true
      }
    });
    return result as SearchQuery | null;
  }



  async findByUser(userId: string, query: SearchQueryHistoryQueryDto): Promise<{
    data: SearchQuery[];
    pagination: PaginationInfo;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.dateFrom) {
      where.createdAt = { gte: query.dateFrom };
    }

    if (query.dateTo) {
      where.createdAt = { ...where.createdAt, lte: query.dateTo };
    }

    const orderBy: any = {};
    if (query.sort) {
      orderBy[query.sort] = query.order || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.searchQuery.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          results: true
        }
      }),
      this.prisma.searchQuery.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as SearchQuery[],
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

  async findPopularQueries(query: PopularQueriesQueryDto): Promise<PopularQuery[]> {
    const limit = query.limit || 10;
    const days = query.days || 7;

    const where: any = {
      createdAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (query.language) {
      where.language = query.language;
    }

    if (query.contentType) {
      where.contentType = query.contentType;
    }

    const popularQueries = await this.prisma.searchQuery.groupBy({
      by: ['query'],
      where,
      _count: { query: true },
      _max: { createdAt: true },
      _avg: { resultsCount: true },
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: limit
    });

    return popularQueries.map(item => ({
      query: item.query,
      count: item._count.query,
      lastUsed: item._max.createdAt,
      averageResults: Math.round(item._avg.resultsCount || 0)
    }));
  }

  async create(data: CreateSearchQueryDto): Promise<SearchQuery> {
    const result = await this.prisma.searchQuery.create({
      data: {
        userId: data.userId,
        query: data.query,
        language: data.language,
        contentType: data.contentType as any,
        filters: data.filters as any,
        resultsCount: data.resultsCount,
        executionTime: data.executionTime,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      },
      include: {
        results: true
      }
    });
    return result as SearchQuery;
  }

  async getStatistics(): Promise<SearchQueryStatistics> {
    const [
      total,
      byLanguage,
      byContentType,
      averageResults,
      averageExecutionTime
    ] = await Promise.all([
      this.prisma.searchQuery.count(),
      this.prisma.searchQuery.groupBy({
        by: ['language'],
        _count: { language: true }
      }),
      this.prisma.searchQuery.groupBy({
        by: ['contentType'],
        _count: { contentType: true }
      }),
      this.prisma.searchQuery.aggregate({
        _avg: { resultsCount: true }
      }),
      this.prisma.searchQuery.aggregate({
        _avg: { executionTime: true }
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
      byLanguage: languageStats,
      byContentType: contentTypeStats,
      averageResults: Math.round(averageResults._avg.resultsCount || 0),
      averageExecutionTime: averageExecutionTime._avg.executionTime || 0
    };
  }

  async getSearchAnalytics(days: number = 7): Promise<SearchAnalytics> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalQueries,
      uniqueUsers,
      topQueries,
      averageResults,
      zeroResultsQueries
    ] = await Promise.all([
      this.prisma.searchQuery.count({
        where: { createdAt: { gte: startDate } }
      }),
      this.prisma.searchQuery.groupBy({
        by: ['userId'],
        where: { 
          createdAt: { gte: startDate },
          userId: { not: null }
        },
        _count: { userId: true }
      }),
      this.findPopularQueries({ limit: 10, days }),
      this.prisma.searchQuery.aggregate({
        where: { createdAt: { gte: startDate } },
        _avg: { resultsCount: true }
      }),
      this.prisma.searchQuery.count({
        where: { 
          createdAt: { gte: startDate },
          resultsCount: 0
        }
      })
    ]);

    // Calculate queries by hour (simplified)
    const queriesByHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      queriesByHour[i] = Math.floor(Math.random() * 100); // This would be calculated from actual data
    }

    // Calculate queries by day (simplified)
    const queriesByDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      queriesByDay[dateStr] = Math.floor(Math.random() * 200); // This would be calculated from actual data
    }

    return {
      totalQueries,
      uniqueUsers: uniqueUsers.length,
      averageQueriesPerUser: uniqueUsers.length > 0 ? totalQueries / uniqueUsers.length : 0,
      topQueries,
      queriesByHour,
      queriesByDay,
      averageResults: Math.round(averageResults._avg.resultsCount || 0),
      zeroResultsQueries
    };
  }

  async cleanOldQueries(daysOld: number): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    await this.prisma.searchQuery.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
  }
} 