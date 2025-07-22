import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SliderRepository } from '../repositories/slider.repository';
import { 
  CreateSliderDto, 
  UpdateSliderDto, 
  SliderQueryDto,
  SliderResponseDto,
  SliderStatistics,
  SliderAnalytics,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  PaginationInfo
} from '../dto/slider.dto';

@Injectable()
export class SliderService {
  constructor(private readonly sliderRepository: SliderRepository) {}

  async getSliderById(id: string): Promise<SliderResponseDto> {
    const slider = await this.sliderRepository.findById(id);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    return this.transformToResponseDto(slider);
  }

  async getAllSliders(query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.findAll(query);
    
    return {
      data: result.data.map(slider => this.transformToResponseDto(slider)),
      pagination: result.pagination
    };
  }

  async getActiveSliders(query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.findActive(query);
    
    return {
      data: result.data.map(slider => this.transformToResponseDto(slider)),
      pagination: result.pagination
    };
  }

  async getPublishedSliders(query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.findPublished(query);
    
    return {
      data: result.data.map(slider => this.transformToResponseDto(slider)),
      pagination: result.pagination
    };
  }

  async getSlidersByPosition(position: number): Promise<SliderResponseDto[]> {
    const sliders = await this.sliderRepository.findByPosition(position);
    return sliders.map(slider => this.transformToResponseDto(slider));
  }

  async searchSliders(searchTerm: string, query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.search(searchTerm, query);
    
    return {
      data: result.data.map(slider => this.transformToResponseDto(slider)),
      pagination: result.pagination
    };
  }

  async createSlider(data: CreateSliderDto, userId: string): Promise<SliderResponseDto> {
    const validation = await this.validateSlider(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const slider = await this.sliderRepository.create(data, userId);
    return this.transformToResponseDto(slider);
  }

  async updateSlider(id: string, data: UpdateSliderDto, userId: string): Promise<SliderResponseDto> {
    const existingSlider = await this.sliderRepository.findById(id);
    if (!existingSlider) {
      throw new NotFoundException('Slider not found');
    }

    const validation = await this.validateSlider(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const slider = await this.sliderRepository.update(id, data, userId);
    return this.transformToResponseDto(slider);
  }

  async deleteSlider(id: string): Promise<void> {
    const slider = await this.sliderRepository.findById(id);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    await this.sliderRepository.delete(id);
  }

  async publishSlider(id: string, userId: string): Promise<SliderResponseDto> {
    const slider = await this.sliderRepository.findById(id);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    const updatedSlider = await this.sliderRepository.publish(id, userId);
    return this.transformToResponseDto(updatedSlider);
  }

  async unpublishSlider(id: string, userId: string): Promise<SliderResponseDto> {
    const slider = await this.sliderRepository.findById(id);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    const updatedSlider = await this.sliderRepository.unpublish(id, userId);
    return this.transformToResponseDto(updatedSlider);
  }

  async reorderSliders(orders: { id: string; position: number }[]): Promise<void> {
    // Validate that all sliders exist
    for (const order of orders) {
      const slider = await this.sliderRepository.findById(order.id);
      if (!slider) {
        throw new NotFoundException(`Slider with ID ${order.id} not found`);
      }
    }

    await this.sliderRepository.reorder(orders);
  }

  async validateSlider(data: CreateSliderDto | UpdateSliderDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate position
    if ('position' in data && data.position !== undefined) {
      if (data.position < 0) {
        errors.push({
          field: 'position',
          message: 'Position must be a non-negative number',
          code: 'INVALID_POSITION'
        });
      }
    }

    // Validate display time
    if ('displayTime' in data && data.displayTime !== undefined) {
      if (data.displayTime < 1000) {
        errors.push({
          field: 'displayTime',
          message: 'Display time must be at least 1000 milliseconds',
          code: 'INVALID_DISPLAY_TIME'
        });
      }
    }

    // Validate media ID
    if ('mediaId' in data && data.mediaId) {
      if (typeof data.mediaId !== 'string' || data.mediaId.trim() === '') {
        errors.push({
          field: 'mediaId',
          message: 'Media ID must be a valid string',
          code: 'INVALID_MEDIA_ID'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getSliderStatistics(): Promise<SliderStatistics> {
    return this.sliderRepository.getStatistics();
  }

  async getActiveSlidersForDisplay(): Promise<SliderResponseDto[]> {
    const sliders = await this.sliderRepository.getActiveSlidersForDisplay();
    return sliders.map(slider => this.transformToResponseDto(slider));
  }

  async recordSliderClick(sliderId: string, ipAddress: string, userAgent: string, userId?: string): Promise<void> {
    const slider = await this.sliderRepository.findById(sliderId);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    // TODO: Implement when SliderClick model is added
    // await this.sliderClickRepository.create({
    //   sliderId,
    //   userId,
    //   ipAddress,
    //   userAgent
    // });
  }

  async recordSliderView(sliderId: string, ipAddress: string, userAgent: string, userId?: string, duration?: number): Promise<void> {
    const slider = await this.sliderRepository.findById(sliderId);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    // TODO: Implement when SliderView model is added
    // await this.sliderViewRepository.create({
    //   sliderId,
    //   userId,
    //   ipAddress,
    //   userAgent,
    //   viewDuration: duration
    // });
  }

  async getSliderAnalytics(sliderId: string, dateFrom?: Date, dateTo?: Date): Promise<SliderAnalytics> {
    const slider = await this.sliderRepository.findById(sliderId);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    // TODO: Implement analytics when SliderClick and SliderView models are added
    return {
      sliderId,
      totalClicks: 0,
      totalViews: 0,
      clickThroughRate: 0,
      averageViewDuration: 0,
      clicksByDate: {},
      viewsByDate: {},
      topReferrers: [],
      deviceBreakdown: {}
    };
  }

  async exportSliders(query: SliderQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.sliderRepository.findAll(query);
    
    if (format === 'json') {
      return Buffer.from(JSON.stringify(result.data, null, 2));
    }
    
    // TODO: Implement CSV and PDF export
    throw new BadRequestException('Export format not implemented yet');
  }

  async importSliders(file: Express.Multer.File, userId: string): Promise<{ success: number; failed: number; errors: string[] }> {
    // TODO: Implement import functionality
    throw new BadRequestException('Import functionality not implemented yet');
  }

  async bulkPublish(ids: string[], userId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.publishSlider(id, userId);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to publish slider ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkUnpublish(ids: string[], userId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.unpublishSlider(id, userId);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to unpublish slider ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.deleteSlider(id);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to delete slider ${id}: ${error.message}`);
      }
    }

    return result;
  }

  private transformToResponseDto(slider: any): SliderResponseDto {
    return {
      id: slider.id,
      title: slider.title,
      position: slider.position,
      displayTime: slider.displayTime,
      isActive: slider.isActive,
      media: slider.media,
      clickCount: 0, // TODO: Implement when analytics are added
      viewCount: 0, // TODO: Implement when analytics are added
      clickThroughRate: 0, // TODO: Implement when analytics are added
      createdAt: slider.createdAt,
      updatedAt: slider.updatedAt
    };
  }
} 