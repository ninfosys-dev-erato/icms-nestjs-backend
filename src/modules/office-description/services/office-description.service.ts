import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OfficeDescriptionRepository } from '../repositories/office-description.repository';
import { 
  CreateOfficeDescriptionDto, 
  UpdateOfficeDescriptionDto, 
  OfficeDescriptionResponseDto,
  OfficeDescriptionQueryDto,
  OfficeDescriptionType,
  BulkCreateOfficeDescriptionDto,
  BulkUpdateOfficeDescriptionDto,
  OfficeDescriptionStatistics,
  ValidationResult,
  ValidationError,
  ImportResult,
  ExportResult
} from '../dto/office-description.dto';
import { TranslatableEntityHelper, Language } from '../../../common/types/translatable.entity';

@Injectable()
export class OfficeDescriptionService {
  constructor(private readonly officeDescriptionRepository: OfficeDescriptionRepository) {}

  async getOfficeDescription(id: string): Promise<OfficeDescriptionResponseDto> {
    const description = await this.officeDescriptionRepository.findById(id);
    
    if (!description) {
      throw new NotFoundException('Office description not found');
    }

    return this.transformToResponseDto(description);
  }

  async getOfficeDescriptionByType(type: OfficeDescriptionType, lang?: string): Promise<OfficeDescriptionResponseDto> {
    const description = await this.officeDescriptionRepository.findByType(type);
    
    if (!description) {
      throw new NotFoundException(`Office description of type ${type} not found`);
    }

    return this.transformToResponseDto(description, lang);
  }

  async getAllOfficeDescriptions(query?: OfficeDescriptionQueryDto): Promise<OfficeDescriptionResponseDto[]> {
    const descriptions = await this.officeDescriptionRepository.findAll();
    
    if (query?.type) {
      const filtered = descriptions.filter(desc => desc.officeDescriptionType === query.type);
      return filtered.map(desc => this.transformToResponseDto(desc, query.lang));
    }

    return descriptions.map(desc => this.transformToResponseDto(desc, query?.lang));
  }

  async createOfficeDescription(data: CreateOfficeDescriptionDto): Promise<OfficeDescriptionResponseDto> {
    const validation = await this.validateOfficeDescription(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Check if description of this type already exists
    const exists = await this.officeDescriptionRepository.existsByType(data.officeDescriptionType);
    if (exists) {
      throw new BadRequestException(`Office description of type ${data.officeDescriptionType} already exists`);
    }

    const description = await this.officeDescriptionRepository.create(data);
    return this.transformToResponseDto(description);
  }

  async updateOfficeDescription(id: string, data: UpdateOfficeDescriptionDto): Promise<OfficeDescriptionResponseDto> {
    const validation = await this.validateOfficeDescription(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    try {
      const description = await this.officeDescriptionRepository.update(id, data);
      return this.transformToResponseDto(description);
    } catch (error) {
      if (error.message === 'Office description not found') {
        throw new NotFoundException('Office description not found');
      }
      throw error;
    }
  }

  async upsertOfficeDescriptionByType(type: OfficeDescriptionType, data: CreateOfficeDescriptionDto): Promise<OfficeDescriptionResponseDto> {
    const validation = await this.validateOfficeDescription(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const description = await this.officeDescriptionRepository.upsertByType(type, data);
    return this.transformToResponseDto(description);
  }

  async deleteOfficeDescription(id: string): Promise<void> {
    const exists = await this.officeDescriptionRepository.findById(id);
    if (!exists) {
      throw new NotFoundException('Office description not found');
    }

    await this.officeDescriptionRepository.delete(id);
  }

  async deleteOfficeDescriptionByType(type: OfficeDescriptionType): Promise<void> {
    const exists = await this.officeDescriptionRepository.existsByType(type);
    if (!exists) {
      throw new NotFoundException(`Office description of type ${type} not found`);
    }

    await this.officeDescriptionRepository.deleteByType(type);
  }

  async bulkCreateOfficeDescriptions(data: BulkCreateOfficeDescriptionDto): Promise<OfficeDescriptionResponseDto[]> {
    // Validate all descriptions
    for (const description of data.descriptions) {
      const validation = await this.validateOfficeDescription(description);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: `Validation failed for description type ${description.officeDescriptionType}`,
          errors: validation.errors,
        });
      }
    }

    // Check for duplicates
    const types = data.descriptions.map(d => d.officeDescriptionType);
    const uniqueTypes = new Set(types);
    if (types.length !== uniqueTypes.size) {
      throw new BadRequestException('Duplicate office description types found');
    }

    // Check if any types already exist
    for (const type of types) {
      const exists = await this.officeDescriptionRepository.existsByType(type);
      if (exists) {
        throw new BadRequestException(`Office description of type ${type} already exists`);
      }
    }

    const descriptions = await this.officeDescriptionRepository.bulkCreate(data.descriptions);
    return descriptions.map(desc => this.transformToResponseDto(desc));
  }

  async bulkUpdateOfficeDescriptions(data: BulkUpdateOfficeDescriptionDto): Promise<OfficeDescriptionResponseDto[]> {
    const results: OfficeDescriptionResponseDto[] = [];
    const errors: string[] = [];

    for (const update of data.descriptions) {
      try {
        const validation = await this.validateOfficeDescription(update);
        if (!validation.isValid) {
          errors.push(`Validation failed for ID ${update.id}: ${validation.errors.map(e => e.message).join(', ')}`);
          continue;
        }

        const description = await this.officeDescriptionRepository.update(update.id, update);
        results.push(this.transformToResponseDto(description));
      } catch (error) {
        if (error.message === 'Office description not found') {
          errors.push(`Office description with ID ${update.id} not found`);
        } else {
          errors.push(`Failed to update ID ${update.id}: ${error.message}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Some updates failed',
        errors,
      });
    }

    return results;
  }

  async getOfficeDescriptionStatistics(): Promise<OfficeDescriptionStatistics> {
    const stats = await this.officeDescriptionRepository.getStatistics();
    
    return {
      total: stats.total,
      byType: stats.byType,
      lastUpdated: stats.lastUpdated || new Date(),
    };
  }

  async validateOfficeDescription(data: CreateOfficeDescriptionDto | UpdateOfficeDescriptionDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate content if provided
    if ('content' in data && data.content) {
      const contentErrors = TranslatableEntityHelper.validate(data.content, {
        en: { required: true, minLength: 10, maxLength: 10000 },
        ne: { required: true, minLength: 10, maxLength: 10000 },
      });
      contentErrors.forEach(error => {
        errors.push({
          field: 'content',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async importOfficeDescriptions(descriptions: CreateOfficeDescriptionDto[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const description of descriptions) {
      try {
        const validation = await this.validateOfficeDescription(description);
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(`Validation failed for ${description.officeDescriptionType}: ${validation.errors.map(e => e.message).join(', ')}`);
          continue;
        }

        const exists = await this.officeDescriptionRepository.existsByType(description.officeDescriptionType);
        if (exists) {
          await this.officeDescriptionRepository.upsertByType(description.officeDescriptionType, description);
        } else {
          await this.officeDescriptionRepository.create(description);
        }
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import ${description.officeDescriptionType}: ${error.message}`);
      }
    }

    return result;
  }

  async exportOfficeDescriptions(): Promise<ExportResult> {
    const descriptions = await this.officeDescriptionRepository.findAll();
    const responseDescriptions = descriptions.map(desc => this.transformToResponseDto(desc));

    return {
      data: responseDescriptions,
      total: responseDescriptions.length,
      exportedAt: new Date(),
    };
  }

  private transformToResponseDto(description: any, lang?: string): OfficeDescriptionResponseDto {
    let content = description.content;
    
    if (lang && content) {
      content = {
        en: content.en,
        ne: content.ne,
        value: TranslatableEntityHelper.getValue(content, lang as Language),
      };
    }

    return {
      id: description.id,
      officeDescriptionType: description.officeDescriptionType,
      content,
      createdAt: description.createdAt,
      updatedAt: description.updatedAt,
    };
  }
} 