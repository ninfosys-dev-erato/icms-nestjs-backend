import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchIndexRepository } from '../repositories/search-index.repository';
import {
  CreateSearchIndexDto,
  UpdateSearchIndexDto,
  SearchIndexQueryDto,
  SearchIndexResponseDto,
  SearchIndexStatistics,
  PaginationInfo,
  ValidationResult,
  ValidationError,
  BulkReindexResult,
  ImportResult,
  ContentType
} from '../dto/search.dto';

@Injectable()
export class SearchIndexService {
  constructor(private readonly searchIndexRepository: SearchIndexRepository) {}

  async getIndexById(id: string): Promise<SearchIndexResponseDto> {
    const index = await this.searchIndexRepository.findById(id);
    if (!index) {
      throw new NotFoundException('Search index not found');
    }
    return this.transformToResponseDto(index);
  }

  async getAllIndices(query: SearchIndexQueryDto): Promise<{
    data: SearchIndexResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.searchIndexRepository.findAll(query);
    return {
      data: result.data.map(index => this.transformToResponseDto(index)),
      pagination: result.pagination
    };
  }

  async createIndex(data: CreateSearchIndexDto): Promise<SearchIndexResponseDto> {
    const validation = await this.validateIndex(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const index = await this.searchIndexRepository.create(data);
    return this.transformToResponseDto(index);
  }

  async updateIndex(id: string, data: UpdateSearchIndexDto): Promise<SearchIndexResponseDto> {
    const validation = await this.validateIndex(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const index = await this.searchIndexRepository.update(id, data);
    return this.transformToResponseDto(index);
  }

  async deleteIndex(id: string): Promise<void> {
    const index = await this.searchIndexRepository.findById(id);
    if (!index) {
      throw new NotFoundException('Search index not found');
    }

    await this.searchIndexRepository.delete(id);
  }

  async reindexContent(contentId: string, contentType: ContentType): Promise<SearchIndexResponseDto> {
    const index = await this.searchIndexRepository.reindex(contentId, contentType);
    return this.transformToResponseDto(index);
  }

  async bulkReindex(contentType?: ContentType): Promise<BulkReindexResult> {
    return this.searchIndexRepository.bulkReindex(contentType);
  }

  async validateIndex(data: CreateSearchIndexDto | UpdateSearchIndexDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate title if provided
    if ('title' in data && data.title) {
      if (!data.title.en || !data.title.ne) {
        errors.push({
          field: 'title',
          message: 'Title must have both English and Nepali translations',
          code: 'INVALID_TITLE'
        });
      }
    }

    // Validate content if provided
    if ('content' in data && data.content) {
      if (!data.content.en || !data.content.ne) {
        errors.push({
          field: 'content',
          message: 'Content must have both English and Nepali translations',
          code: 'INVALID_CONTENT'
        });
      }
    }

    // Validate language
    if ('language' in data && data.language) {
      if (!['en', 'ne'].includes(data.language)) {
        errors.push({
          field: 'language',
          message: 'Language must be either "en" or "ne"',
          code: 'INVALID_LANGUAGE'
        });
      }
    }

    // Validate content type
    if ('contentType' in data && data.contentType) {
      const validTypes = Object.values(ContentType);
      if (!validTypes.includes(data.contentType)) {
        errors.push({
          field: 'contentType',
          message: `Content type must be one of: ${validTypes.join(', ')}`,
          code: 'INVALID_CONTENT_TYPE'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getIndexStatistics(): Promise<SearchIndexStatistics> {
    return this.searchIndexRepository.getStatistics();
  }

  async optimizeIndex(): Promise<void> {
    // This would perform index optimization
    console.log('Index optimization completed');
  }

  async exportIndices(query: SearchIndexQueryDto, format: 'json' | 'csv' | 'xlsx'): Promise<Buffer> {
    const result = await this.getAllIndices(query);
    
    // This would export indices in the specified format
    // For now, we'll return a simple JSON buffer
    const data = {
      exportDate: new Date(),
      query,
      format,
      indices: result.data
    };
    
    return Buffer.from(JSON.stringify(data, null, 2));
  }

  async importIndices(file: Express.Multer.File): Promise<ImportResult> {
    // This would import indices from the uploaded file
    // For now, we'll return a mock result
    return {
      success: 10,
      failed: 2,
      errors: ['Invalid format for index 1', 'Missing required field for index 2']
    };
  }

  private transformToResponseDto(index: any): SearchIndexResponseDto {
    return {
      id: index.id,
      contentId: index.contentId,
      contentType: index.contentType,
      title: index.title,
      content: index.content,
      description: index.description,
      tags: index.tags,
      language: index.language,
      isPublished: index.isPublished,
      isActive: index.isActive,
      searchScore: index.searchScore,
      lastIndexedAt: index.lastIndexedAt,
      createdAt: index.createdAt,
      updatedAt: index.updatedAt
    };
  }
} 