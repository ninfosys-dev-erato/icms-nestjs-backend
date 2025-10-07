import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ImportantLinksRepository } from '../repositories/important-links.repository';
import { 
  CreateImportantLinkDto, 
  UpdateImportantLinkDto, 
  ImportantLinkResponseDto,
  ImportantLinksQueryDto,
  BulkCreateImportantLinksDto,
  BulkUpdateImportantLinksDto,
  ReorderImportantLinksDto,
  ImportantLinksStatistics,
  ValidationResult,
  ValidationError,
  ImportResult,
  ExportResult,
  FooterLinksDto
} from '../dto/important-links.dto';
import { TranslatableEntityHelper, Language } from '../../../common/types/translatable.entity';

@Injectable()
export class ImportantLinksService {
  constructor(private readonly importantLinksRepository: ImportantLinksRepository) {}

  async getImportantLink(id: string): Promise<ImportantLinkResponseDto> {
    const link = await this.importantLinksRepository.findById(id);
    
    if (!link) {
      throw new NotFoundException('Important link not found');
    }

    return this.transformToResponseDto(link);
  }

  async getAllImportantLinks(query?: ImportantLinksQueryDto): Promise<ImportantLinkResponseDto[]> {
    const links = await this.importantLinksRepository.findAll(query?.isActive);
    return links.map(link => this.transformToResponseDto(link, query?.lang as Language));
  }

  async getImportantLinksWithPagination(
    page: number = 1, 
    limit: number = 10, 
    isActive?: boolean
  ): Promise<{
    data: ImportantLinkResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const result = await this.importantLinksRepository.findWithPagination(page, limit, isActive);
    
    return {
      data: result.data.map(link => this.transformToResponseDto(link)),
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

  async createImportantLink(data: CreateImportantLinkDto): Promise<ImportantLinkResponseDto> {
    const validation = await this.validateImportantLink(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Check if URL already exists
    const exists = await this.importantLinksRepository.existsByUrl(data.linkUrl);
    if (exists) {
      throw new BadRequestException('Link with this URL already exists');
    }

    const link = await this.importantLinksRepository.create(data);
    return this.transformToResponseDto(link);
  }

  async updateImportantLink(id: string, data: UpdateImportantLinkDto): Promise<ImportantLinkResponseDto> {
    const validation = await this.validateImportantLink(data);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Check if URL already exists (excluding current link)
    if (data.linkUrl) {
      const exists = await this.importantLinksRepository.existsByUrl(data.linkUrl, id);
      if (exists) {
        throw new BadRequestException('Link with this URL already exists');
      }
    }

    const link = await this.importantLinksRepository.update(id, data);
    return this.transformToResponseDto(link);
  }

  async deleteImportantLink(id: string): Promise<void> {
    const exists = await this.importantLinksRepository.findById(id);
    if (!exists) {
      throw new NotFoundException('Important link not found');
    }

    await this.importantLinksRepository.delete(id);
  }

  async reorderImportantLinks(data: ReorderImportantLinksDto): Promise<void> {
    await this.importantLinksRepository.reorder(data.orders);
  }

  async bulkCreateImportantLinks(data: BulkCreateImportantLinksDto): Promise<ImportantLinkResponseDto[]> {
    // Validate all links
    for (const link of data.links) {
      const validation = await this.validateImportantLink(link);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: `Validation failed for link: ${link.linkTitle.en}`,
          errors: validation.errors,
        });
      }
    }

    // Check for duplicate URLs
    const urls = data.links.map(link => link.linkUrl);
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      throw new BadRequestException('Duplicate URLs found in bulk create');
    }

    // Check if any URLs already exist
    for (const url of urls) {
      const exists = await this.importantLinksRepository.existsByUrl(url);
      if (exists) {
        throw new BadRequestException(`Link with URL ${url} already exists`);
      }
    }

    const links = await this.importantLinksRepository.bulkCreate(data.links);
    return links.map(link => this.transformToResponseDto(link));
  }

  async bulkUpdateImportantLinks(data: BulkUpdateImportantLinksDto): Promise<ImportantLinkResponseDto[]> {
    // Validate all updates
    for (const update of data.links) {
      if (update.linkUrl) {
        const exists = await this.importantLinksRepository.existsByUrl(update.linkUrl, update.id);
        if (exists) {
          throw new BadRequestException(`Link with URL ${update.linkUrl} already exists`);
        }
      }

      if (update.linkTitle) {
        const validation = await this.validateImportantLink({ 
          linkTitle: update.linkTitle,
          linkUrl: 'dummy-url-for-validation'
        });
        if (!validation.isValid) {
          throw new BadRequestException({
            message: `Validation failed for link ${update.id}`,
            errors: validation.errors,
          });
        }
      }
    }

    const updates = data.links.map(update => ({
      id: update.id,
      data: {
        ...(update.linkTitle && { linkTitle: update.linkTitle }),
        ...(update.linkUrl && { linkUrl: update.linkUrl }),
        ...(update.order !== undefined && { order: update.order }),
        ...(update.isActive !== undefined && { isActive: update.isActive }),
      },
    }));

    const links = await this.importantLinksRepository.bulkUpdate(updates);
    return links.map(link => this.transformToResponseDto(link));
  }

  async getImportantLinksStatistics(): Promise<ImportantLinksStatistics> {
    const stats = await this.importantLinksRepository.getStatistics();
    
    return {
      total: stats.total,
      active: stats.active,
      inactive: stats.inactive,
      lastUpdated: stats.lastUpdated || new Date(),
    };
  }

  async getFooterLinks(lang?: string): Promise<FooterLinksDto> {
    const footerData = await this.importantLinksRepository.getFooterLinks();
    
    return {
      quickLinks: footerData.quickLinks.map(link => this.transformToResponseDto(link, lang as Language)),
      governmentLinks: footerData.governmentLinks.map(link => this.transformToResponseDto(link, lang as Language)),
      socialMediaLinks: footerData.socialMediaLinks.map(link => this.transformToResponseDto(link, lang as Language)),
      contactLinks: footerData.contactLinks.map(link => this.transformToResponseDto(link, lang as Language)),
    };
  }

  async validateImportantLink(data: CreateImportantLinkDto | UpdateImportantLinkDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate linkTitle if provided
    if ('linkTitle' in data && data.linkTitle) {
      const titleErrors = TranslatableEntityHelper.validate(data.linkTitle, {
        en: { required: true, minLength: 1, maxLength: 255 },
        ne: { required: true, minLength: 1, maxLength: 255 },
      });
      titleErrors.forEach(error => {
        errors.push({
          field: 'linkTitle',
          message: error,
          code: 'VALIDATION_ERROR',
        });
      });
    }

    // Validate linkUrl if provided
    if ('linkUrl' in data && data.linkUrl) {
      if (!this.isValidUrl(data.linkUrl)) {
        errors.push({
          field: 'linkUrl',
          message: 'Link URL must be a valid URL',
          code: 'INVALID_URL',
        });
      }
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

  async importImportantLinks(links: CreateImportantLinkDto[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const link of links) {
      try {
        const validation = await this.validateImportantLink(link);
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(`Validation failed for ${link.linkTitle.en}: ${validation.errors.map(e => e.message).join(', ')}`);
          continue;
        }

        const exists = await this.importantLinksRepository.existsByUrl(link.linkUrl);
        if (exists) {
          // Update existing link
          const existingLink = await this.importantLinksRepository.findByUrl(link.linkUrl);
          if (existingLink) {
            await this.importantLinksRepository.update(existingLink.id, link);
          }
        } else {
          // Create new link
          await this.importantLinksRepository.create(link);
        }
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import ${link.linkTitle.en}: ${error.message}`);
      }
    }

    return result;
  }

  async exportImportantLinks(): Promise<ExportResult> {
    const links = await this.importantLinksRepository.findAll();
    const responseLinks = links.map(link => this.transformToResponseDto(link));

    return {
      data: responseLinks,
      total: responseLinks.length,
      exportedAt: new Date(),
    };
  }

  private transformToResponseDto(link: any, lang?: Language): ImportantLinkResponseDto {
    let linkTitle = link.linkTitle;
    
    if (lang && linkTitle) {
      linkTitle = {
        en: linkTitle.en,
        ne: linkTitle.ne,
        value: TranslatableEntityHelper.getValue(linkTitle, lang),
      };
    }

    return {
      id: link.id,
      linkTitle,
      linkUrl: link.linkUrl,
      order: link.order,
      isActive: link.isActive,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
} 