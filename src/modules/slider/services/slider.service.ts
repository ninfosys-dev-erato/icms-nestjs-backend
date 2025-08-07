import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SliderRepository } from '../repositories/slider.repository';
import { SliderClickRepository } from '../repositories/slider-click.repository';
import { SliderViewRepository } from '../repositories/slider-view.repository';
import { MediaService } from '../../media/services/media.service';
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
  PaginationInfo,
  CreateSliderWithImageDto,
  SliderImageUploadResponseDto
} from '../dto/slider.dto';

@Injectable()
export class SliderService {
  constructor(
    private readonly sliderRepository: SliderRepository,
    private readonly sliderClickRepository: SliderClickRepository,
    private readonly sliderViewRepository: SliderViewRepository,
    private readonly mediaService: MediaService,
  ) {}

  async getSliderById(id: string): Promise<SliderResponseDto> {
    const slider = await this.sliderRepository.findById(id);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    return await this.transformToResponseDto(slider);
  }

  async getAllSliders(query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.findAll(query);
    
    const transformedData = await Promise.all(
      result.data.map(slider => this.transformToResponseDto(slider))
    );
    
    return {
      data: transformedData,
      pagination: result.pagination
    };
  }

  async getActiveSliders(query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.findActive(query);
    
    const transformedData = await Promise.all(
      result.data.map(slider => this.transformToResponseDto(slider))
    );
    
    return {
      data: transformedData,
      pagination: result.pagination
    };
  }

  async getPublishedSliders(query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.findPublished(query);
    
    const transformedData = await Promise.all(
      result.data.map(slider => this.transformToResponseDto(slider))
    );
    
    return {
      data: transformedData,
      pagination: result.pagination
    };
  }

  async getSlidersByPosition(position: number): Promise<SliderResponseDto[]> {
    const sliders = await this.sliderRepository.findByPosition(position);
    const transformedSliders = await Promise.all(
      sliders.map(slider => this.transformToResponseDto(slider))
    );
    return transformedSliders;
  }

  async searchSliders(searchTerm: string, query: SliderQueryDto): Promise<{
    data: SliderResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.sliderRepository.search(searchTerm, query);
    
    const transformedData = await Promise.all(
      result.data.map(slider => this.transformToResponseDto(slider))
    );
    
    return {
      data: transformedData,
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
    const transformedSliders = await Promise.all(
      sliders.map(slider => this.transformToResponseDto(slider))
    );
    return transformedSliders;
  }

  async recordSliderClick(sliderId: string, ipAddress: string, userAgent: string, userId?: string): Promise<void> {
    const slider = await this.sliderRepository.findById(sliderId);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    await this.sliderClickRepository.create({
      sliderId,
      userId,
      ipAddress,
      userAgent
    });
  }

  async recordSliderView(sliderId: string, ipAddress: string, userAgent: string, userId?: string, duration?: number): Promise<void> {
    const slider = await this.sliderRepository.findById(sliderId);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    await this.sliderViewRepository.create({
      sliderId,
      userId,
      ipAddress,
      userAgent,
      viewDuration: duration
    });
  }

  async getSliderAnalytics(sliderId: string, dateFrom?: Date, dateTo?: Date): Promise<SliderAnalytics> {
    const slider = await this.sliderRepository.findById(sliderId);
    if (!slider) {
      throw new NotFoundException('Slider not found');
    }

    const [totalClicks, totalViews, clicksByDate, viewsByDate, averageViewDuration] = await Promise.all([
      this.sliderClickRepository.getClickCount(sliderId),
      this.sliderViewRepository.getViewCount(sliderId),
      this.sliderClickRepository.getClicksByDate(sliderId),
      this.sliderViewRepository.getViewsByDate(sliderId),
      this.sliderViewRepository.getAverageViewDuration(sliderId)
    ]);

    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Get device breakdown from user agents
    const views = await this.sliderViewRepository.findBySliderId(sliderId);
    const deviceBreakdown: Record<string, number> = {};
    views.forEach(view => {
      const userAgent = view.userAgent.toLowerCase();
      if (userAgent.includes('mobile')) {
        deviceBreakdown.mobile = (deviceBreakdown.mobile || 0) + 1;
      } else if (userAgent.includes('tablet')) {
        deviceBreakdown.tablet = (deviceBreakdown.tablet || 0) + 1;
      } else {
        deviceBreakdown.desktop = (deviceBreakdown.desktop || 0) + 1;
      }
    });

    return {
      sliderId,
      totalClicks,
      totalViews,
      clickThroughRate,
      averageViewDuration,
      clicksByDate,
      viewsByDate,
      topReferrers: [], // TODO: Implement referrer tracking
      deviceBreakdown
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

  async uploadSliderImage(id: string, file: Express.Multer.File, userId: string): Promise<SliderResponseDto> {
    // Check if slider exists
    const existingSlider = await this.sliderRepository.findById(id);
    if (!existingSlider) {
      throw new NotFoundException('Slider not found');
    }

    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type - only images allowed for sliders
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed for sliders');
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    console.log('🔄 Slider: Starting image upload process');
    console.log('  File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer?.length
    });

    // Upload to media service (which uses Backblaze)
    const metadata = {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: 'sliders', // This will create the sliders folder in Backblaze
      altText: `Slider image: ${existingSlider.title?.en || 'Untitled'}`,
      title: `Slider Image`,
      description: `Image for slider at position ${existingSlider.position}`,
      tags: ['slider', 'banner', 'image'],
      isPublic: true,
    };

    console.log('📤 Slider: Calling media service with metadata:', metadata);

    const mediaResponse = await this.mediaService.uploadMedia(file, metadata, userId);

    console.log('📥 Slider: Media service response received');
    console.log('  Media response success:', mediaResponse.success);
    console.log('  Media response data exists:', !!mediaResponse.data);

    if (!mediaResponse.success || !mediaResponse.data) {
      throw new BadRequestException('Failed to upload media: ' + (mediaResponse.message || 'Unknown error'));
    }

    console.log('💾 Slider: Updating slider with media ID');
    console.log('  Media ID to store:', mediaResponse.data.id);
    console.log('  Current mediaId:', existingSlider.mediaId);

    // Delete old media if it exists
    if (existingSlider.mediaId) {
      try {
        console.log('🗑️ Slider: Removing old slider image');
        console.log('  Old mediaId:', existingSlider.mediaId);
        await this.mediaService.deleteMedia(existingSlider.mediaId);
        console.log('✅ Slider: Old image deleted from media service');
      } catch (error) {
        console.warn('⚠️ Slider: Failed to delete old image from media service:', error.message);
        // Continue with the update even if old media deletion fails
      }
    }

    // Update slider with the new media ID
    const updateData = {
      mediaId: mediaResponse.data.id
    };

    console.log('🔧 Slider: Update data being passed to repository:', updateData);

    let slider;
    try {
      slider = await this.sliderRepository.update(id, updateData, userId);
      console.log('✅ Slider: Repository update successful');
    } catch (error) {
      console.error('❌ Slider: Repository update failed:', error);
      throw new BadRequestException('Failed to update slider: ' + error.message);
    }

    console.log('✅ Slider: Image uploaded successfully');
    console.log('  Media ID:', mediaResponse.data.id);
    console.log('  Media URL:', mediaResponse.data.url);
    console.log('  Stored in mediaId:', slider.mediaId);

    console.log('🔄 Slider: Transforming to response DTO...');
    const responseDto = await this.transformToResponseDto(slider);
    console.log('✅ Slider: Response DTO created');

    return responseDto;
  }

  async removeSliderImage(id: string): Promise<SliderResponseDto> {
    const existingSlider = await this.sliderRepository.findById(id);
    if (!existingSlider) {
      throw new NotFoundException('Slider not found');
    }

    // If there's an existing image, delete it from media service
    if (existingSlider.mediaId) {
      try {
        console.log('🗑️ Slider: Removing slider image');
        console.log('  Current mediaId:', existingSlider.mediaId);
        
        // Delete the media from the media service
        await this.mediaService.deleteMedia(existingSlider.mediaId);
        console.log('✅ Slider: Image deleted from media service');
      } catch (error) {
        console.warn('⚠️ Slider: Failed to delete image from media service:', error.message);
        // Continue with the removal even if media deletion fails
      }
    }

    // Update slider to remove media reference
    const updateData = {
      mediaId: undefined // This will remove the mediaId
    };

    const slider = await this.sliderRepository.update(id, updateData, 'system');

    console.log('✅ Slider: Image removed successfully');

    return await this.transformToResponseDto(slider);
  }

  async createSliderWithImage(
    file: Express.Multer.File, 
    sliderData: any, 
    userId: string
  ): Promise<SliderResponseDto> {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed for sliders');
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    console.log('🔄 Slider: Creating slider with image upload');
    console.log('  File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    console.log('  Slider data:', sliderData);

    // Parse slider data from form data
    const createSliderDto: CreateSliderDto = {
      title: sliderData.title ? JSON.parse(sliderData.title) : undefined,
      position: parseInt(sliderData.position) || 1,
      displayTime: parseInt(sliderData.displayTime) || 5000,
      isActive: sliderData.isActive === 'true' || sliderData.isActive === true,
      mediaId: '' // Will be set after media upload
    };

    // Validate slider data
    const validation = await this.validateSlider(createSliderDto);
    if (!validation.isValid) {
      throw new BadRequestException('Slider validation failed', { cause: validation.errors });
    }

    // Upload image to media service
    const metadata = {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: 'sliders',
      altText: `Slider image: ${createSliderDto.title?.en || 'Untitled'}`,
      title: `Slider Image`,
      description: `Image for slider at position ${createSliderDto.position}`,
      tags: ['slider', 'banner', 'image'],
      isPublic: true,
    };

    console.log('📤 Slider: Uploading image to media service');
    const mediaResponse = await this.mediaService.uploadMedia(file, metadata, userId);

    if (!mediaResponse.success || !mediaResponse.data) {
      throw new BadRequestException('Failed to upload media: ' + (mediaResponse.message || 'Unknown error'));
    }

    console.log('📥 Slider: Image uploaded successfully, creating slider');

    // Set the mediaId from the uploaded image
    createSliderDto.mediaId = mediaResponse.data.id;

    // Create the slider
    const slider = await this.sliderRepository.create(createSliderDto, userId);

    console.log('✅ Slider: Created successfully with image');
    console.log('  Slider ID:', slider.id);
    console.log('  Media ID:', mediaResponse.data.id);

    return await this.transformToResponseDto(slider);
  }

  private async transformToResponseDto(slider: any): Promise<SliderResponseDto> {
    const [clickCount, viewCount] = await Promise.all([
      this.sliderClickRepository.getClickCount(slider.id),
      this.sliderViewRepository.getViewCount(slider.id)
    ]);

    const clickThroughRate = viewCount > 0 ? (clickCount / viewCount) * 100 : 0;

    // Generate presigned URL for the media if it exists
    let mediaWithPresignedUrl = slider.media;
    if (slider.media && slider.mediaId) {
      try {
        const presignedUrl = await this.mediaService.generatePresignedUrl(
          slider.mediaId,
          'get',
          86400 // 24 hours expiration
        );
        mediaWithPresignedUrl = {
          ...slider.media,
          presignedUrl
        };
        console.log('🖼️ Slider: Generated presigned URL for media');
      } catch (error) {
        console.warn('⚠️ Slider: Failed to generate presigned URL for media:', error.message);
      }
    }

    return {
      id: slider.id,
      title: slider.title,
      position: slider.position,
      displayTime: slider.displayTime,
      isActive: slider.isActive,
      media: mediaWithPresignedUrl,
      clickCount,
      viewCount,
      clickThroughRate,
      createdAt: slider.createdAt,
      updatedAt: slider.updatedAt
    };
  }
} 