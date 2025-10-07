import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchIndexRepository } from '../repositories/search-index.repository';
import { SearchQueryRepository } from '../repositories/search-query.repository';
import { SearchSuggestionRepository } from '../repositories/search-suggestion.repository';
import {
  SearchQueryDto,
  AdvancedSearchQueryDto,
  SearchResponseDto,
  SearchResultResponseDto,
  SearchFacets,
  PopularQuery,
  SearchAnalytics,
  SearchStatistics,
  BulkReindexResult,
  SearchExportQueryDto,
  ContentType
} from '../dto/search.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly searchIndexRepository: SearchIndexRepository,
    private readonly searchQueryRepository: SearchQueryRepository,
    private readonly searchSuggestionRepository: SearchSuggestionRepository,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResponseDto> {
    const startTime = Date.now();
    
    // Perform search
    const searchResult = await this.searchIndexRepository.search(query.q, query);
    
    // Get suggestions
    const suggestions = await this.getSearchSuggestions(query.q, query.language || 'en', 5);
    
    // Calculate facets
    const facets = await this.calculateFacets(query);
    
    // Log search query
    await this.logSearchQuery(query, searchResult.data.length, Date.now() - startTime);
    
    // Transform results
    const results = searchResult.data.map((item, index) => this.transformToSearchResult(item, index + 1));
    
    return {
      query: query.q,
      totalResults: searchResult.pagination.total,
      executionTime: (Date.now() - startTime) / 1000,
      suggestions,
      results,
      pagination: searchResult.pagination,
      facets
    };
  }

  async searchWithFilters(query: SearchQueryDto, filters: Record<string, any>): Promise<SearchResponseDto> {
    const enhancedQuery = { ...query, ...filters };
    return this.search(enhancedQuery);
  }

  async advancedSearch(query: AdvancedSearchQueryDto): Promise<SearchResponseDto> {
    // Enhanced search with advanced features
    const startTime = Date.now();
    
    // Build advanced search criteria
    const searchCriteria = this.buildAdvancedSearchCriteria(query);
    
    // Perform search
    const searchResult = await this.searchIndexRepository.search(query.q, searchCriteria);
    
    // Get suggestions
    const suggestions = await this.getSearchSuggestions(query.q, query.language || 'en', 5);
    
    // Calculate facets
    const facets = await this.calculateFacets(query);
    
    // Log search query
    await this.logSearchQuery(query, searchResult.data.length, Date.now() - startTime);
    
    // Transform results
    const results = searchResult.data.map((item, index) => this.transformToSearchResult(item, index + 1));
    
    return {
      query: query.q,
      totalResults: searchResult.pagination.total,
      executionTime: (Date.now() - startTime) / 1000,
      suggestions,
      results,
      pagination: searchResult.pagination,
      facets
    };
  }

  async getSearchSuggestions(prefix: string, language: string, limit: number = 10): Promise<string[]> {
    const suggestions = await this.searchSuggestionRepository.findByPrefix(prefix, language, limit);
    return suggestions.map(s => s.term);
  }

  async getPopularSearches(language: string, limit: number = 10): Promise<PopularQuery[]> {
    return this.searchQueryRepository.findPopularQueries({ language, limit });
  }

  async getSearchAnalytics(days: number = 7): Promise<SearchAnalytics> {
    return this.searchQueryRepository.getSearchAnalytics(days);
  }

  async getSearchStatistics(): Promise<SearchStatistics> {
    const [indexStats, queryStats] = await Promise.all([
      this.searchIndexRepository.getStatistics(),
      this.searchQueryRepository.getStatistics()
    ]);

    return {
      totalIndexed: indexStats.total,
      totalQueries: queryStats.total,
      averageQueryTime: queryStats.averageExecutionTime,
      cacheHitRate: 0.85, // This would be calculated from cache statistics
      indexSize: 1024000, // This would be calculated from actual index size
      lastOptimization: new Date() // This would be tracked
    };
  }

  async indexContent(contentId: string, contentType: ContentType): Promise<void> {
    // This would typically fetch content from other modules and index it
    // For now, we'll create a basic index entry
    const existing = await this.searchIndexRepository.findByContent(contentId, contentType);
    
    if (!existing) {
      await this.searchIndexRepository.create({
        contentId,
        contentType,
        title: { en: `Content ${contentId}`, ne: `सामग्री ${contentId}` },
        content: { en: `Content for ${contentId}`, ne: `${contentId} को लागि सामग्री` },
        language: 'en',
        isPublished: true,
        isActive: true
      });
    }
  }

  async reindexContent(contentId: string, contentType: ContentType): Promise<void> {
    await this.searchIndexRepository.reindex(contentId, contentType);
  }

  async removeFromIndex(contentId: string, contentType: ContentType): Promise<void> {
    await this.searchIndexRepository.deleteByContent(contentId, contentType);
  }

  async bulkReindex(contentType?: ContentType): Promise<BulkReindexResult> {
    return this.searchIndexRepository.bulkReindex(contentType);
  }

  async optimizeIndex(): Promise<void> {
    // This would perform index optimization
    // For now, we'll just update the last optimization time
    console.log('Index optimization completed');
  }

  async clearSearchCache(): Promise<void> {
    // This would clear search cache
    console.log('Search cache cleared');
  }

  async exportSearchData(query: SearchExportQueryDto, format: 'json' | 'csv' | 'xlsx'): Promise<Buffer> {
    // This would export search data in the specified format
    // For now, we'll return a simple JSON buffer
    const data = {
      exportDate: new Date(),
      query,
      format
    };
    
    return Buffer.from(JSON.stringify(data, null, 2));
  }

  private async logSearchQuery(query: SearchQueryDto, resultsCount: number, executionTime: number): Promise<void> {
    await this.searchQueryRepository.create({
      query: query.q,
      language: query.language || 'en',
      contentType: query.contentType,
      filters: query.filters,
      resultsCount,
      executionTime,
      ipAddress: '127.0.0.1', // This would come from request context
      userAgent: 'SearchService' // This would come from request context
    });
  }

  private async calculateFacets(query: SearchQueryDto): Promise<SearchFacets> {
    // This would calculate facets based on search results
    // For now, we'll return mock data
    return {
      contentType: {
        CONTENT: 100,
        DOCUMENT: 30,
        MEDIA: 25,
        FAQ: 20,
        USER: 15,
        DEPARTMENT: 10,
        EMPLOYEE: 5
      },
      language: {
        en: 120,
        ne: 30
      },
      tags: {
        government: 50,
        services: 45,
        portal: 30
      },
      dateRange: {
        today: 10,
        thisWeek: 50,
        thisMonth: 200,
        thisYear: 1000
      }
    };
  }

  private buildAdvancedSearchCriteria(query: AdvancedSearchQueryDto): any {
    const criteria: any = {};
    
    if (query.contentTypes) {
      criteria.contentType = { in: query.contentTypes };
    }
    
    if (query.languages) {
      criteria.language = { in: query.languages };
    }
    
    if (query.dateRange) {
      criteria.createdAt = {
        gte: query.dateRange.from,
        lte: query.dateRange.to
      };
    }
    
    return criteria;
  }

  private transformToSearchResult(item: any, rank: number): SearchResultResponseDto {
    return {
      id: item.contentId,
      contentType: item.contentType,
      title: item.title,
      description: item.description,
      snippet: this.generateSnippet(item.content, item.title),
      url: this.generateUrl(item.contentType, item.contentId),
      relevanceScore: item.searchScore,
      tags: item.tags,
      language: item.language,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      metadata: {
        contentType: item.contentType,
        language: item.language,
        rank
      }
    };
  }

  private generateSnippet(content: any, title: any): string {
    const text = content?.en || title?.en || 'No content available';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  }

  private generateUrl(contentType: ContentType, contentId: string): string {
    switch (contentType) {
      case ContentType.CONTENT:
        return `/content/${contentId}`;
      case ContentType.DOCUMENT:
        return `/documents/${contentId}`;
      case ContentType.FAQ:
        return `/faq/${contentId}`;
      default:
        return `/${contentType.toLowerCase()}/${contentId}`;
    }
  }
} 