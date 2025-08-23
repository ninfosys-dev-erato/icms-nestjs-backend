import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HeaderConfigRepository } from '../repositories/header-config.repository';
import { 
  CreateHeaderConfigDto, 
  UpdateHeaderConfigDto, 
  HeaderConfigQueryDto,
  HeaderConfigResponseDto,
  HeaderConfigStatistics,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  ImportResult,
  HeaderPreview,
  PaginationInfo
} from '../dto/header.dto';
import { MediaService } from '../../media/services/media.service';

@Injectable()
export class HeaderConfigService {
  constructor(
    
    private readonly headerConfigRepository: HeaderConfigRepository,
    private readonly mediaService: MediaService
  ) {}

  async getHeaderConfigById(id: string): Promise<HeaderConfigResponseDto> {
    const headerConfig = await this.headerConfigRepository.findById(id);
    if (!headerConfig) {
      throw new NotFoundException('Header configuration not found');
    }
    return this.transformToResponseDto(headerConfig);
  }

  async getAllHeaderConfigs(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfigResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.headerConfigRepository.findAll(query);
    return {
      data: await Promise.all(result.data.map(config => this.transformToResponseDto(config))),
      pagination: result.pagination
    };
  }

  async getActiveHeaderConfigs(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfigResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.headerConfigRepository.findActive(query);
    return {
      data: await Promise.all(result.data.map(config => this.transformToResponseDto(config))),
      pagination: result.pagination
    };
  }

  async getPublishedHeaderConfigs(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfigResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.headerConfigRepository.findPublished(query);
    return {
      data: await Promise.all(result.data.map(config => this.transformToResponseDto(config))),
      pagination: result.pagination
    };
  }

  async getHeaderConfigByOrder(order: number): Promise<HeaderConfigResponseDto> {
    const headerConfig = await this.headerConfigRepository.findByOrder(order);
    if (!headerConfig) {
      throw new NotFoundException('Header configuration not found');
    }
    return await this.transformToResponseDto(headerConfig);
  }

  async searchHeaderConfigs(searchTerm: string, query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfigResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.headerConfigRepository.search(searchTerm, query);
    return {
      data: await Promise.all(result.data.map(config => this.transformToResponseDto(config))),
      pagination: result.pagination
    };
  }

  async createHeaderConfig(data: CreateHeaderConfigDto, userId: string): Promise<HeaderConfigResponseDto> {
    const validation = await this.validateHeaderConfig(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const headerConfig = await this.headerConfigRepository.create(data, userId);
    return await this.transformToResponseDto(headerConfig);
  }

  async updateHeaderConfig(id: string, data: UpdateHeaderConfigDto, userId: string): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const validation = await this.validateHeaderConfig(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const headerConfig = await this.headerConfigRepository.update(id, data, userId);
    return await this.transformToResponseDto(headerConfig);
  }

  async deleteHeaderConfig(id: string): Promise<void> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    await this.headerConfigRepository.delete(id);
  }

  async publishHeaderConfig(id: string, userId: string): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const headerConfig = await this.headerConfigRepository.publish(id, userId);
    return await this.transformToResponseDto(headerConfig);
  }

  async unpublishHeaderConfig(id: string, userId: string): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const headerConfig = await this.headerConfigRepository.unpublish(id, userId);
    return await this.transformToResponseDto(headerConfig);
  }

  async reorderHeaderConfigs(orders: { id: string; order: number }[]): Promise<void> {
    await this.headerConfigRepository.reorder(orders);
  }

  async validateHeaderConfig(data: CreateHeaderConfigDto | UpdateHeaderConfigDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate name
    if ('name' in data && data.name) {
      if (!data.name.en || !data.name.ne) {
        errors.push({
          field: 'name',
          message: 'Name must be provided in both English and Nepali',
          code: 'REQUIRED_FIELD'
        });
      }
    }

    // Validate typography
    if ('typography' in data && data.typography) {
      if (!data.typography.fontFamily) {
        errors.push({
          field: 'typography.fontFamily',
          message: 'Font family is required',
          code: 'REQUIRED_FIELD'
        });
      }

      if (data.typography.fontSize <= 0) {
        errors.push({
          field: 'typography.fontSize',
          message: 'Font size must be greater than 0',
          code: 'INVALID_VALUE'
        });
      }

      if (!data.typography.color) {
        errors.push({
          field: 'typography.color',
          message: 'Color is required',
          code: 'REQUIRED_FIELD'
        });
      }
    }

    // Validate layout
    if ('layout' in data && data.layout) {
      if (data.layout.headerHeight <= 0) {
        errors.push({
          field: 'layout.headerHeight',
          message: 'Header height must be greater than 0',
          code: 'INVALID_VALUE'
        });
      }

      if (!data.layout.backgroundColor) {
        errors.push({
          field: 'layout.backgroundColor',
          message: 'Background color is required',
          code: 'REQUIRED_FIELD'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getHeaderConfigStatistics(): Promise<HeaderConfigStatistics> {
    return this.headerConfigRepository.getStatistics();
  }

  async getActiveHeaderConfigForDisplay(): Promise<HeaderConfigResponseDto> {
    const headerConfig = await this.headerConfigRepository.getActiveHeaderConfig();
    if (!headerConfig) {
      throw new NotFoundException('No active header configuration found');
    }
    return this.transformToResponseDto(headerConfig);
  }

  async uploadLogo(
    id: string, 
    logoType: 'left' | 'right', 
    file: Express.Multer.File, 
    logoData: any, 
    userId: string
  ): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    // Validate file
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type - only images allowed for logos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WebP, SVG, and GIF are allowed for logos');
    }

    // Validate file size (5MB for logos)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB');
    }

    console.log('🔄 Header: Starting logo upload process');
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
      folder: 'logos', // Use the LOGOS folder from MediaFolder enum
      altText: logoData.altText?.en || `Logo for ${logoType} side`,
      title: `Header Logo - ${logoType}`,
      description: `Logo uploaded for header configuration`,
      tags: ['logo', 'header', logoType],
      isPublic: true,
    };

    console.log('📤 Header: Calling media service with metadata:', metadata);

    const mediaResponse = await this.mediaService.uploadMedia(file, metadata, userId);

    console.log('📥 Header: Media service response received');
    console.log('  Media response success:', mediaResponse.success);
    console.log('  Media response data exists:', !!mediaResponse.data);

    if (!mediaResponse.success || !mediaResponse.data) {
      throw new BadRequestException('Failed to upload logo: ' + (mediaResponse.message || 'Unknown error'));
    }

    console.log('💾 Header: Updating header config with media ID');
    console.log('  Media ID to store:', mediaResponse.data.id);

    // Delete old logo if it exists
    const currentLogo = existingConfig.logo || {};
    const currentLogoData = logoType === 'left' ? currentLogo.leftLogo : currentLogo.rightLogo;
    
    if (currentLogoData?.mediaId) {
      try {
        console.log('🗑️ Header: Removing old logo');
        console.log('  Old mediaId:', currentLogoData.mediaId);
        await this.mediaService.deleteMedia(currentLogoData.mediaId);
        console.log('✅ Header: Old logo deleted from media service');
      } catch (error) {
        console.warn('⚠️ Header: Failed to delete old logo from media service:', error.message);
        // Continue with the update even if old logo deletion fails
      }
    }

    // Update header configuration with the new logo
    const updatedLogo = {
      ...currentLogo,
      [logoType === 'left' ? 'leftLogo' : 'rightLogo']: {
        mediaId: mediaResponse.data.id,
        altText: logoData.altText || { en: 'Logo', ne: 'लोगो' },
        width: logoData.width || 150,
        height: logoData.height || 50
      },
      logoAlignment: currentLogo.logoAlignment || 'left',
      logoSpacing: currentLogo.logoSpacing || 0
    };

    const updateData: UpdateHeaderConfigDto = {
      logo: updatedLogo as any
    };

    console.log('🔧 Header: Update data being passed to repository:', updateData);

    let headerConfig;
    try {
      headerConfig = await this.headerConfigRepository.update(id, updateData, userId);
      console.log('✅ Header: Repository update successful');
    } catch (error) {
      console.error('❌ Header: Repository update failed:', error);
      throw new BadRequestException('Failed to update header configuration: ' + error.message);
    }

    console.log('✅ Header: Logo uploaded successfully');
    console.log('  Media ID:', mediaResponse.data.id);
    console.log('  Media URL:', mediaResponse.data.url);

    // Transform to response DTO to include presigned URLs
    console.log('🔄 Header: Transforming to response DTO with presigned URLs...');
    const responseDto = await this.transformToResponseDto(headerConfig);
    console.log('✅ Header: Response DTO created with presigned URLs');

    return responseDto;
  }

  async updateLogo(id: string, logoType: 'left' | 'right', logoData: any, userId: string): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const currentLogo = existingConfig.logo || {};
    const updatedLogo = {
      ...currentLogo,
      [logoType === 'left' ? 'leftLogo' : 'rightLogo']: logoData,
      logoAlignment: currentLogo.logoAlignment || 'left',
      logoSpacing: currentLogo.logoSpacing || 0
    };

    const updateData: UpdateHeaderConfigDto = {
      logo: updatedLogo as any
    };

    const headerConfig = await this.headerConfigRepository.update(id, updateData, userId);
    return await this.transformToResponseDto(headerConfig);
  }



  async removeLogo(id: string, logoType: 'left' | 'right', userId: string): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const currentLogo = existingConfig.logo || {};
    const currentLogoData = logoType === 'left' ? currentLogo.leftLogo : currentLogo.rightLogo;
    
    // Delete logo media if it exists
    if (currentLogoData?.mediaId) {
      try {
        console.log('🗑️ Header: Removing logo from media service');
        console.log('  Media ID to remove:', currentLogoData.mediaId);
        await this.mediaService.deleteMedia(currentLogoData.mediaId);
        console.log('✅ Header: Logo removed from media service');
      } catch (error) {
        console.warn('⚠️ Header: Failed to delete logo from media service:', error.message);
        // Continue with the removal even if media deletion fails
      }
    }

    const { [logoType === 'left' ? 'leftLogo' : 'rightLogo']: removed, ...updatedLogo } = currentLogo;

    const updateData: UpdateHeaderConfigDto = {
      logo: updatedLogo as any
    };

    console.log('🔧 Header: Updating header config after logo removal');
    const headerConfig = await this.headerConfigRepository.update(id, updateData, userId);
    
    console.log('✅ Header: Logo removed successfully');
    console.log('  Remaining logos:', Object.keys(updatedLogo).filter(key => key !== 'logoAlignment' && key !== 'logoSpacing'));

    // Transform to response DTO to include presigned URLs for any remaining logos
    return await this.transformToResponseDto(headerConfig);
  }

  async exportHeaderConfigs(query: HeaderConfigQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.headerConfigRepository.findAll(query);
    
    if (format === 'json') {
      return Buffer.from(JSON.stringify(result.data, null, 2));
    } else if (format === 'csv') {
      // Simple CSV export
      const csvData = result.data.map(config => 
        `${config.id},${config.name.en},${config.order},${config.isActive},${config.isPublished}`
      ).join('\n');
      return Buffer.from(csvData);
    } else {
      // PDF export would require a PDF library
      throw new BadRequestException('PDF export not implemented');
    }
  }

  async importHeaderConfigs(file: Express.Multer.File, userId: string): Promise<ImportResult> {
    // Simple JSON import
    try {
      const data = JSON.parse(file.buffer.toString());
      const configs = Array.isArray(data) ? data : [data];
      
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const config of configs) {
        try {
          await this.headerConfigRepository.create(config, userId);
          success++;
        } catch (error) {
          failed++;
          errors.push(`Failed to import config: ${error.message}`);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      throw new BadRequestException('Invalid import file format');
    }
  }

  async bulkPublish(ids: string[], userId: string): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.headerConfigRepository.publish(id, userId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to publish config ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async bulkUnpublish(ids: string[], userId: string): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.headerConfigRepository.unpublish(id, userId);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to unpublish config ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.headerConfigRepository.delete(id);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Failed to delete config ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  async generateCSS(id: string): Promise<string> {
    const headerConfig = await this.headerConfigRepository.findById(id);
    if (!headerConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const { typography, layout, logo } = headerConfig;
    
    let css = `
.header-config-${id} {
  height: ${layout?.headerHeight || 80}px;
  background-color: ${layout?.backgroundColor || '#ffffff'};
  padding: ${layout?.padding?.top || 10}px ${layout?.padding?.right || 20}px ${layout?.padding?.bottom || 10}px ${layout?.padding?.left || 20}px;
  margin: ${layout?.margin?.top || 0}px ${layout?.margin?.right || 0}px ${layout?.margin?.bottom || 0}px ${layout?.margin?.left || 0}px;
`;

    if (layout?.borderColor && layout?.borderWidth) {
      css += `  border: ${layout.borderWidth}px solid ${layout.borderColor};\n`;
    }

    css += `  text-align: ${(headerConfig.alignment || 'LEFT').toLowerCase()};\n`;
    
    if (typography) {
      css += `  font-family: ${typography.fontFamily || 'Arial, sans-serif'};\n`;
      css += `  font-size: ${typography.fontSize || 16}px;\n`;
      css += `  font-weight: ${typography.fontWeight || 'normal'};\n`;
      css += `  color: ${typography.color || '#333333'};\n`;
      css += `  line-height: ${typography.lineHeight || 1.5};\n`;
      css += `  letter-spacing: ${typography.letterSpacing || 0}px;\n`;
    }
    
    css += `}\n`;

    // Logo styles - only add if logos exist
    if (logo?.leftLogo?.width && logo?.leftLogo?.height) {
      css += `
.header-config-${id} .logo-left {
  width: ${logo.leftLogo.width}px;
  height: ${logo.leftLogo.height}px;
  margin-right: ${logo.logoSpacing || 0}px;
}\n`;
    }

    if (logo?.rightLogo?.width && logo?.rightLogo?.height) {
      css += `
.header-config-${id} .logo-right {
  width: ${logo.rightLogo.width}px;
  height: ${logo.rightLogo.height}px;
  margin-left: ${logo.logoSpacing || 0}px;
}\n`;
    }

    return css;
  }

  async previewHeaderConfig(data: CreateHeaderConfigDto | UpdateHeaderConfigDto): Promise<HeaderPreview> {
    const tempId = 'preview-' + Date.now();
    const css = this.generateCSSFromData(data, tempId);
    
    const leftLogo = data.logo?.leftLogo as any;
    const rightLogo = data.logo?.rightLogo as any;
    
    const html = `
<header class="header-config-${tempId}">
  ${leftLogo ? `<img src="/media/${leftLogo.mediaId}" alt="${leftLogo.altText?.en || ''}" class="logo-left">` : ''}
  <h1>${data.name?.en || 'Header Preview'}</h1>
  ${rightLogo ? `<img src="/media/${rightLogo.mediaId}" alt="${rightLogo.altText?.en || ''}" class="logo-right">` : ''}
</header>`;

    return {
      css,
      html,
      config: await this.transformToResponseDto(data as any)
    };
  }

  private generateCSSFromData(data: CreateHeaderConfigDto | UpdateHeaderConfigDto, id: string): string {
    const { typography, layout, logo } = data;
    
    let css = `
.header-config-${id} {
  height: ${layout?.headerHeight || 80}px;
  background-color: ${layout?.backgroundColor || '#ffffff'};
  padding: ${layout?.padding?.top || 10}px ${layout?.padding?.right || 20}px ${layout?.padding?.bottom || 10}px ${layout?.padding?.left || 20}px;
  margin: ${layout?.margin?.top || 0}px ${layout?.margin?.right || 0}px ${layout?.margin?.bottom || 0}px ${layout?.margin?.left || 0}px;
`;

    if (layout?.borderColor && layout?.borderWidth) {
      css += `  border: ${layout.borderWidth}px solid ${layout.borderColor};\n`;
    }

    css += `  text-align: ${(data.alignment || 'LEFT').toLowerCase()};\n`;
    
    if (typography) {
      css += `  font-family: ${typography.fontFamily || 'Arial, sans-serif'};\n`;
      css += `  font-size: ${typography.fontSize || 16}px;\n`;
      css += `  font-weight: ${typography.fontWeight || 'normal'};\n`;
      css += `  color: ${typography.color || '#333333'};\n`;
      css += `  line-height: ${typography.lineHeight || 1.5};\n`;
      css += `  letter-spacing: ${typography.letterSpacing || 0}px;\n`;
    }
    
    css += `}\n`;

    // Logo styles - only add if logos exist
    if (logo?.leftLogo?.width && logo?.leftLogo?.height) {
      css += `
.header-config-${id} .logo-left {
  width: ${logo.leftLogo.width}px;
  height: ${logo.leftLogo.height}px;
  margin-right: ${logo.logoSpacing || 0}px;
}\n`;
    }

    if (logo?.rightLogo?.width && logo?.rightLogo?.height) {
      css += `
.header-config-${id} .logo-right {
  width: ${logo.rightLogo.width}px;
  height: ${logo.rightLogo.height}px;
  margin-left: ${logo.logoSpacing || 0}px;
}\n`;
    }

    return css;
  }

  private async transformToResponseDto(headerConfig: any): Promise<HeaderConfigResponseDto> {
    // Generate presigned URLs for logos if they exist
    let logoWithMedia = headerConfig.logo;
    
    if (headerConfig.logo?.leftLogo?.mediaId) {
      try {
        const presignedUrl = await this.mediaService.generatePresignedUrl(
          headerConfig.logo.leftLogo.mediaId,
          'get',
          86400 // 24 hours expiration
        );
        logoWithMedia = {
          ...logoWithMedia,
          leftLogo: {
            ...logoWithMedia.leftLogo,
            media: { 
              presignedUrl,
              id: headerConfig.logo.leftLogo.mediaId,
              url: presignedUrl // Include both presignedUrl and url for compatibility
            }
          }
        };
        console.log('🖼️ Header: Generated presigned URL for left logo');
      } catch (error) {
        console.warn('⚠️ Header: Failed to generate presigned URL for left logo:', error.message);
        // Fallback to include logo without presigned URL
        logoWithMedia = {
          ...logoWithMedia,
          leftLogo: {
            ...logoWithMedia.leftLogo,
            media: { 
              id: headerConfig.logo.leftLogo.mediaId,
              error: 'Failed to generate presigned URL'
            }
          }
        };
      }
    }

    if (headerConfig.logo?.rightLogo?.mediaId) {
      try {
        const presignedUrl = await this.mediaService.generatePresignedUrl(
          headerConfig.logo.rightLogo.mediaId,
          'get',
          86400 // 24 hours expiration
        );
        logoWithMedia = {
          ...logoWithMedia,
          rightLogo: {
            ...logoWithMedia.rightLogo,
            media: { 
              presignedUrl,
              id: headerConfig.logo.rightLogo.mediaId,
              url: presignedUrl // Include both presignedUrl and url for compatibility
            }
          }
        };
        console.log('🖼️ Header: Generated presigned URL for right logo');
      } catch (error) {
        console.warn('⚠️ Header: Failed to generate presigned URL for right logo:', error.message);
        // Fallback to include logo without presigned URL
        logoWithMedia = {
          ...logoWithMedia,
          rightLogo: {
            ...logoWithMedia.rightLogo,
            media: { 
              id: headerConfig.logo.rightLogo.mediaId,
              error: 'Failed to generate presigned URL'
            }
          }
        };
      }
    }

    return {
      id: headerConfig.id,
      name: headerConfig.name,
      order: headerConfig.order,
      isActive: headerConfig.isActive,
      isPublished: headerConfig.isPublished,
      typography: headerConfig.typography,
      alignment: headerConfig.alignment,
      logo: logoWithMedia,
      layout: headerConfig.layout,
      createdAt: headerConfig.createdAt,
      updatedAt: headerConfig.updatedAt,
      createdBy: headerConfig.createdBy,
      updatedBy: headerConfig.updatedBy
    };
  }
}