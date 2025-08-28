import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';

import { ContentRepository } from '../repositories/content.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { FileStorageService } from '../../../common/services/file-storage/interfaces/file-storage.interface';
import {
  CreateContentDto,
  UpdateContentDto,
  ContentQueryDto,
  PaginatedContentResponse,
  ContentResponseDto,
  ContentStatistics,
  ValidationResult,
  ImportResult,
  ContentStatus,
} from '../dto/content-management.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async getContentById(id: string): Promise<ContentResponseDto> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return await this.mapContentToResponse(content);
  }

  async getContentBySlug(slug: string): Promise<ContentResponseDto> {
    const content = await this.contentRepository.findBySlug(slug);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return await this.mapContentToResponse(content);
  }

  async getPublishedContentBySlug(slug: string): Promise<ContentResponseDto> {
    const content = await this.contentRepository.findBySlug(slug);
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    
    if (content.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Content not found');
    }

    return await this.mapContentToResponse(content);
  }

  async getPublishedContentByCategoryAndSlug(categorySlug: string, contentSlug: string): Promise<ContentResponseDto> {
    const content = await this.contentRepository.findByCategoryAndSlug(categorySlug, contentSlug);
    if (!content) {
      throw new NotFoundException('Content not found');
    }
    
    if (content.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('Content not found');
    }

    return await this.mapContentToResponse(content);
  }

  async getAllContent(query: ContentQueryDto): Promise<PaginatedContentResponse> {
    const result = await this.contentRepository.findAll(query);
    const mappedData = await Promise.all(
      result.data.map(content => this.mapContentToResponse(content))
    );
    
    return {
      ...result,
      data: mappedData,
    };
  }

  async getPublishedContent(query: ContentQueryDto): Promise<PaginatedContentResponse> {
    const result = await this.contentRepository.findPublished(query);
    const mappedData = await Promise.all(
      result.data.map(content => this.mapContentToResponse(content))
    );
    
    return {
      ...result,
      data: mappedData,
    };
  }

  async getContentByCategory(categoryId: string, query: ContentQueryDto): Promise<PaginatedContentResponse> {
    const result = await this.contentRepository.findByCategory(categoryId, query);
    const mappedData = await Promise.all(
      result.data.map(content => this.mapContentToResponse(content))
    );
    
    return {
      ...result,
      data: mappedData,
    };
  }

  async getPublishedContentByCategory(categorySlug: string, query: ContentQueryDto): Promise<PaginatedContentResponse> {
    // First find the category by slug
    const category = await this.categoryRepository.findBySlug(categorySlug);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Then get published content for that category
    const result = await this.contentRepository.findByCategory(category.id, { ...query, status: ContentStatus.PUBLISHED });
    const mappedData = await Promise.all(
      result.data.map(content => this.mapContentToResponse(content))
    );
    
    return {
      ...result,
      data: mappedData,
    };
  }

  async getFeaturedContent(limit: number = 10): Promise<ContentResponseDto[]> {
    const contents = await this.contentRepository.findFeatured(limit);
    return await Promise.all(
      contents.map(content => this.mapContentToResponse(content))
    );
  }

  async searchContent(searchTerm: string, query: ContentQueryDto): Promise<PaginatedContentResponse> {
    const result = await this.contentRepository.search(searchTerm, query);
    const mappedData = await Promise.all(
      result.data.map(content => this.mapContentToResponse(content))
    );
    
    return {
      ...result,
      data: mappedData,
    };
  }

  async createContent(data: CreateContentDto, userId: string): Promise<ContentResponseDto> {
    // Validate content data
    const validation = await this.validateContent(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    // Validate category exists
    const category = await this.categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if slug already exists
    const slug = data.slug || await this.generateSlug(data.title.en);
    if (await this.contentRepository.slugExists(slug)) {
      throw new ConflictException('Content with this slug already exists');
    }

    const content = await this.contentRepository.create({
      ...data,
      slug,
    }, userId);

    return await this.mapContentToResponse(content);
  }

  async updateContent(id: string, data: UpdateContentDto, userId: string): Promise<ContentResponseDto> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    // Validate content data
    const validation = await this.validateContent(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    // Validate category if being updated
    if (data.categoryId && data.categoryId !== content.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Check if slug already exists (if being updated)
    if (data.slug && data.slug !== content.slug) {
      if (await this.contentRepository.slugExists(data.slug, id)) {
        throw new ConflictException('Content with this slug already exists');
      }
    }

    const updatedContent = await this.contentRepository.update(id, data, userId);
    return await this.mapContentToResponse(updatedContent);
  }

  async deleteContent(id: string): Promise<void> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    await this.contentRepository.delete(id);
  }

  async publishContent(id: string, userId: string): Promise<ContentResponseDto> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    if (content.status === ContentStatus.PUBLISHED) {
      throw new BadRequestException('Content is already published');
    }

    const publishedContent = await this.contentRepository.publish(id, userId);
    return await this.mapContentToResponse(publishedContent);
  }

  async archiveContent(id: string, userId: string): Promise<ContentResponseDto> {
    const content = await this.contentRepository.findById(id);
    if (!content) {
      throw new NotFoundException('Content not found');
    }

    if (content.status === ContentStatus.ARCHIVED) {
      throw new BadRequestException('Content is already archived');
    }

    const archivedContent = await this.contentRepository.archive(id, userId);
    return await this.mapContentToResponse(archivedContent);
  }

  async validateContent(data: CreateContentDto | UpdateContentDto): Promise<ValidationResult> {
    const errors: any[] = [];

    // Validate title (for create operations)
    if ('title' in data && data.title) {
      if (!data.title.en || !data.title.ne) {
        errors.push({
          field: 'title',
          message: 'Title must have both English and Nepali translations',
          code: 'INVALID_TITLE',
        });
      }
    }

    // Validate content (for create operations)
    if ('content' in data && data.content) {
      if (!data.content.en || !data.content.ne) {
        errors.push({
          field: 'content',
          message: 'Content must have both English and Nepali translations',
          code: 'INVALID_CONTENT',
        });
      }
    }

    // Validate excerpt (if provided)
    if (data.excerpt) {
      if (!data.excerpt.en || !data.excerpt.ne) {
        errors.push({
          field: 'excerpt',
          message: 'Excerpt must have both English and Nepali translations',
          code: 'INVALID_EXCERPT',
        });
      }
    }

    // Validate slug format (if provided)
    if (data.slug) {
      if (!/^[a-z0-9-]+$/.test(data.slug)) {
        errors.push({
          field: 'slug',
          message: 'Slug must contain only lowercase letters, numbers, and hyphens',
          code: 'INVALID_SLUG_FORMAT',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async generateSlug(title: string, excludeId?: string): Promise<string> {
    let slug = this.slugify(title);
    let counter = 1;
    let finalSlug = slug;

    while (await this.contentRepository.slugExists(finalSlug, excludeId)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }

  async getContentStatistics(): Promise<ContentStatistics> {
    return this.contentRepository.getStatistics();
  }

  async exportContent(query: ContentQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.getAllContent({ ...query, limit: 1000 }); // Export up to 1000 items

    switch (format) {
      case 'json':
        return Buffer.from(JSON.stringify(result.data, null, 2));
      
      case 'csv':
        const csvHeaders = 'ID,Title_EN,Title_NE,Status,Category,Featured,Order,CreatedAt\n';
        const csvRows = result.data.map(content => 
          `${content.id},"${content.title.en}","${content.title.ne}",${content.status},${content.category.name.en},${content.featured},${content.order},${content.createdAt}`
        ).join('\n');
        return Buffer.from(csvHeaders + csvRows);
      
      case 'pdf':
        // TODO: Implement PDF generation
        throw new BadRequestException('PDF export not implemented yet');
      
      default:
        throw new BadRequestException('Unsupported export format');
    }
  }

  async importContent(file: Express.Multer.File, userId: string): Promise<ImportResult> {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const content = file.buffer.toString();
      const lines = content.split('\n').filter(line => line.trim());

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const [titleEn, titleNe, contentEn, contentNe, categorySlug, status] = line.split(',');

        try {
          // Find category by slug
          const category = await this.categoryRepository.findBySlug(categorySlug.trim());
          if (!category) {
            result.failed++;
            result.errors.push(`Line ${i + 1}: Category not found: ${categorySlug}`);
            continue;
          }

          await this.createContent({
            title: {
              en: titleEn.trim(),
              ne: titleNe.trim(),
            },
            content: {
              en: contentEn.trim(),
              ne: contentNe.trim(),
            },
            categoryId: category.id,
            status: (status.trim() as ContentStatus) || ContentStatus.DRAFT,
          }, userId);

          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Line ${i + 1}: ${error.message}`);
        }
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`File processing error: ${error.message}`);
    }

    return result;
  }

  // Utility methods
  private async mapContentToResponse(content: any): Promise<ContentResponseDto> {
    // Generate presigned URLs for attachments
    const attachmentsWithPresignedUrls = content.attachments ? await Promise.all(
      content.attachments.map(async (attachment: any) => {
        try {
          const presignedUrl = await this.fileStorageService.generatePresignedUrl(
            attachment.filePath,
            'get',
            86400 // 24 hours expiration
          );
          
          return {
            id: attachment.id,
            contentId: attachment.contentId,
            fileName: attachment.fileName,
            filePath: attachment.filePath,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            order: attachment.order,
            createdAt: attachment.createdAt,
            downloadUrl: presignedUrl,
          };
        } catch (error) {
          // Fallback to original download URL if presigned URL generation fails
          console.warn(`Failed to generate presigned URL for attachment ${attachment.id}:`, error.message);
          return {
            id: attachment.id,
            contentId: attachment.contentId,
            fileName: attachment.fileName,
            filePath: attachment.filePath,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            order: attachment.order,
            createdAt: attachment.createdAt,
            downloadUrl: `/api/v1/attachments/${attachment.id}/download`,
          };
        }
      })
    ) : [];

    return {
      id: content.id,
      title: content.title,
      content: content.content,
      excerpt: content.excerpt,
      slug: content.slug,
      categoryId: content.categoryId,
      status: content.status,
      publishedAt: content.publishedAt,
      featured: content.featured,
      order: content.order,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      category: {
        id: content.category.id,
        name: content.category.name,
        description: content.category.description,
        slug: content.category.slug,
        parentId: content.category.parentId,
        order: content.category.order,
        isActive: content.category.isActive,
        createdAt: content.category.createdAt,
        updatedAt: content.category.updatedAt,
        children: [],
        contentCount: 0,
      },
      attachments: attachmentsWithPresignedUrls,
      createdBy: content.createdBy,
      updatedBy: content.updatedBy,
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
} 