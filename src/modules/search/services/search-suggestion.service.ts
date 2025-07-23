import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchSuggestionRepository } from '../repositories/search-suggestion.repository';
import {
  CreateSearchSuggestionDto,
  UpdateSearchSuggestionDto,
  SearchSuggestionQueryDto,
  SearchSuggestionResponseDto,
  SearchSuggestionStatistics,
  PaginationInfo,
  ValidationResult,
  ValidationError,
  ImportResult,
  ContentType
} from '../dto/search.dto';

@Injectable()
export class SearchSuggestionService {
  constructor(private readonly searchSuggestionRepository: SearchSuggestionRepository) {}

  async getSuggestionById(id: string): Promise<SearchSuggestionResponseDto> {
    const suggestion = await this.searchSuggestionRepository.findById(id);
    if (!suggestion) {
      throw new NotFoundException('Search suggestion not found');
    }
    return this.transformToResponseDto(suggestion);
  }

  async getAllSuggestions(query: SearchSuggestionQueryDto): Promise<{
    data: SearchSuggestionResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.searchSuggestionRepository.findAll(query);
    return {
      data: result.data.map(suggestion => this.transformToResponseDto(suggestion)),
      pagination: result.pagination
    };
  }

  async getSuggestionsByPrefix(prefix: string, language: string, limit: number = 10): Promise<SearchSuggestionResponseDto[]> {
    const suggestions = await this.searchSuggestionRepository.findByPrefix(prefix, language, limit);
    return suggestions.map(suggestion => this.transformToResponseDto(suggestion));
  }

  async createSuggestion(data: CreateSearchSuggestionDto): Promise<SearchSuggestionResponseDto> {
    const validation = await this.validateSuggestion(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const suggestion = await this.searchSuggestionRepository.create(data);
    return this.transformToResponseDto(suggestion);
  }

  async updateSuggestion(id: string, data: UpdateSearchSuggestionDto): Promise<SearchSuggestionResponseDto> {
    const validation = await this.validateSuggestion(data);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const suggestion = await this.searchSuggestionRepository.update(id, data);
    return this.transformToResponseDto(suggestion);
  }

  async deleteSuggestion(id: string): Promise<void> {
    const suggestion = await this.searchSuggestionRepository.findById(id);
    if (!suggestion) {
      throw new NotFoundException('Search suggestion not found');
    }

    await this.searchSuggestionRepository.delete(id);
  }

  async incrementSuggestionFrequency(term: string, language: string): Promise<void> {
    await this.searchSuggestionRepository.incrementFrequency(term, language);
  }

  async getPopularSuggestions(language: string, limit: number = 10): Promise<SearchSuggestionResponseDto[]> {
    const suggestions = await this.searchSuggestionRepository.getPopularSuggestions(language, limit);
    return suggestions.map(suggestion => this.transformToResponseDto(suggestion));
  }

  async validateSuggestion(data: CreateSearchSuggestionDto | UpdateSearchSuggestionDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate term if provided
    if ('term' in data && data.term) {
      if (data.term.length < 2) {
        errors.push({
          field: 'term',
          message: 'Term must be at least 2 characters long',
          code: 'TERM_TOO_SHORT'
        });
      }

      if (data.term.length > 100) {
        errors.push({
          field: 'term',
          message: 'Term must not exceed 100 characters',
          code: 'TERM_TOO_LONG'
        });
      }
    }

    // Validate language if provided
    if ('language' in data && data.language) {
      if (!['en', 'ne'].includes(data.language)) {
        errors.push({
          field: 'language',
          message: 'Language must be either "en" or "ne"',
          code: 'INVALID_LANGUAGE'
        });
      }
    }

    // Validate content type if provided
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

    // Validate frequency if provided
    if ('frequency' in data && data.frequency !== undefined) {
      if (data.frequency < 0) {
        errors.push({
          field: 'frequency',
          message: 'Frequency must be a non-negative number',
          code: 'INVALID_FREQUENCY'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getSuggestionStatistics(): Promise<SearchSuggestionStatistics> {
    return this.searchSuggestionRepository.getStatistics();
  }

  async exportSuggestions(query: SearchSuggestionQueryDto, format: 'json' | 'csv' | 'xlsx'): Promise<Buffer> {
    const result = await this.getAllSuggestions(query);
    
    // This would export suggestions in the specified format
    // For now, we'll return a simple JSON buffer
    const data = {
      exportDate: new Date(),
      query,
      format,
      suggestions: result.data
    };
    
    return Buffer.from(JSON.stringify(data, null, 2));
  }

  async importSuggestions(file: Express.Multer.File): Promise<ImportResult> {
    // This would import suggestions from the uploaded file
    // For now, we'll return a mock result
    return {
      success: 15,
      failed: 3,
      errors: ['Invalid format for suggestion 1', 'Missing required field for suggestion 2', 'Duplicate term for suggestion 3']
    };
  }

  async cleanInactiveSuggestions(): Promise<void> {
    await this.searchSuggestionRepository.cleanInactiveSuggestions();
  }

  private transformToResponseDto(suggestion: any): SearchSuggestionResponseDto {
    return {
      id: suggestion.id,
      term: suggestion.term,
      language: suggestion.language,
      contentType: suggestion.contentType,
      frequency: suggestion.frequency,
      lastUsedAt: suggestion.lastUsedAt,
      isActive: suggestion.isActive,
      createdAt: suggestion.createdAt,
      updatedAt: suggestion.updatedAt
    };
  }
} 