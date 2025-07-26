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

@Injectable()
export class HeaderConfigService {
  constructor(private readonly headerConfigRepository: HeaderConfigRepository) {}

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
      data: result.data.map(config => this.transformToResponseDto(config)),
      pagination: result.pagination
    };
  }

  async getActiveHeaderConfigs(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfigResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.headerConfigRepository.findActive(query);
    return {
      data: result.data.map(config => this.transformToResponseDto(config)),
      pagination: result.pagination
    };
  }

  async getPublishedHeaderConfigs(query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfigResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.headerConfigRepository.findPublished(query);
    return {
      data: result.data.map(config => this.transformToResponseDto(config)),
      pagination: result.pagination
    };
  }

  async getHeaderConfigByOrder(order: number): Promise<HeaderConfigResponseDto> {
    const headerConfig = await this.headerConfigRepository.findByOrder(order);
    if (!headerConfig) {
      throw new NotFoundException('Header configuration not found');
    }
    return this.transformToResponseDto(headerConfig);
  }

  async searchHeaderConfigs(searchTerm: string, query: HeaderConfigQueryDto): Promise<{
    data: HeaderConfigResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.headerConfigRepository.search(searchTerm, query);
    return {
      data: result.data.map(config => this.transformToResponseDto(config)),
      pagination: result.pagination
    };
  }

  async createHeaderConfig(data: CreateHeaderConfigDto, userId: string): Promise<HeaderConfigResponseDto> {
    const validation = await this.validateHeaderConfig(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const headerConfig = await this.headerConfigRepository.create(data, userId);
    return this.transformToResponseDto(headerConfig);
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
    return this.transformToResponseDto(headerConfig);
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
    return this.transformToResponseDto(headerConfig);
  }

  async unpublishHeaderConfig(id: string, userId: string): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const headerConfig = await this.headerConfigRepository.unpublish(id, userId);
    return this.transformToResponseDto(headerConfig);
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
    return this.transformToResponseDto(headerConfig);
  }

  async removeLogo(id: string, logoType: 'left' | 'right', userId: string): Promise<HeaderConfigResponseDto> {
    const existingConfig = await this.headerConfigRepository.findById(id);
    if (!existingConfig) {
      throw new NotFoundException('Header configuration not found');
    }

    const currentLogo = existingConfig.logo || {};
    const { [logoType === 'left' ? 'leftLogo' : 'rightLogo']: removed, ...updatedLogo } = currentLogo;

    const updateData: UpdateHeaderConfigDto = {
      logo: updatedLogo as any
    };

    const headerConfig = await this.headerConfigRepository.update(id, updateData, userId);
    return this.transformToResponseDto(headerConfig);
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
  height: ${layout.headerHeight}px;
  background-color: ${layout.backgroundColor};
  padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
  margin: ${layout.margin.top}px ${layout.margin.right}px ${layout.margin.bottom}px ${layout.margin.left}px;
`;

    if (layout.borderColor && layout.borderWidth) {
      css += `  border: ${layout.borderWidth}px solid ${layout.borderColor};\n`;
    }

    css += `  text-align: ${headerConfig.alignment.toLowerCase()};\n`;
    css += `  font-family: ${typography.fontFamily};\n`;
    css += `  font-size: ${typography.fontSize}px;\n`;
    css += `  font-weight: ${typography.fontWeight};\n`;
    css += `  color: ${typography.color};\n`;
    css += `  line-height: ${typography.lineHeight};\n`;
    css += `  letter-spacing: ${typography.letterSpacing}px;\n`;
    css += `}\n`;

    // Logo styles
    if (logo.leftLogo) {
      css += `
.header-config-${id} .logo-left {
  width: ${logo.leftLogo.width}px;
  height: ${logo.leftLogo.height}px;
  margin-right: ${logo.logoSpacing}px;
}\n`;
    }

    if (logo.rightLogo) {
      css += `
.header-config-${id} .logo-right {
  width: ${logo.rightLogo.width}px;
  height: ${logo.rightLogo.height}px;
  margin-left: ${logo.logoSpacing}px;
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
      config: this.transformToResponseDto(data as any)
    };
  }

  private generateCSSFromData(data: CreateHeaderConfigDto | UpdateHeaderConfigDto, id: string): string {
    const { typography, layout, logo } = data;
    
    let css = `
.header-config-${id} {
  height: ${layout.headerHeight}px;
  background-color: ${layout.backgroundColor};
  padding: ${layout.padding.top}px ${layout.padding.right}px ${layout.padding.bottom}px ${layout.padding.left}px;
  margin: ${layout.margin.top}px ${layout.margin.right}px ${layout.margin.bottom}px ${layout.margin.left}px;
`;

    if (layout.borderColor && layout.borderWidth) {
      css += `  border: ${layout.borderWidth}px solid ${layout.borderColor};\n`;
    }

    css += `  text-align: ${data.alignment.toLowerCase()};\n`;
    css += `  font-family: ${typography.fontFamily};\n`;
    css += `  font-size: ${typography.fontSize}px;\n`;
    css += `  font-weight: ${typography.fontWeight};\n`;
    css += `  color: ${typography.color};\n`;
    css += `  line-height: ${typography.lineHeight};\n`;
    css += `  letter-spacing: ${typography.letterSpacing}px;\n`;
    css += `}\n`;

    // Logo styles
    if (logo?.leftLogo) {
      css += `
.header-config-${id} .logo-left {
  width: ${logo.leftLogo.width}px;
  height: ${logo.leftLogo.height}px;
  margin-right: ${logo.logoSpacing}px;
}\n`;
    }

    if (logo?.rightLogo) {
      css += `
.header-config-${id} .logo-right {
  width: ${logo.rightLogo.width}px;
  height: ${logo.rightLogo.height}px;
  margin-left: ${logo.logoSpacing}px;
}\n`;
    }

    return css;
  }

  private transformToResponseDto(headerConfig: any): HeaderConfigResponseDto {
    return {
      id: headerConfig.id,
      name: headerConfig.name,
      order: headerConfig.order,
      isActive: headerConfig.isActive,
      isPublished: headerConfig.isPublished,
      typography: headerConfig.typography,
      alignment: headerConfig.alignment,
      logo: {
        leftLogo: headerConfig.logo?.leftLogo ? {
          media: null, // Would need to fetch from media service
          altText: headerConfig.logo.leftLogo.altText,
          width: headerConfig.logo.leftLogo.width,
          height: headerConfig.logo.leftLogo.height
        } : undefined,
        rightLogo: headerConfig.logo?.rightLogo ? {
          media: null, // Would need to fetch from media service
          altText: headerConfig.logo.rightLogo.altText,
          width: headerConfig.logo.rightLogo.width,
          height: headerConfig.logo.rightLogo.height
        } : undefined,
        logoAlignment: headerConfig.logo?.logoAlignment || 'left',
        logoSpacing: headerConfig.logo?.logoSpacing || 0
      },
      layout: headerConfig.layout,
      createdAt: headerConfig.createdAt,
      updatedAt: headerConfig.updatedAt,
      createdBy: headerConfig.createdBy,
      updatedBy: headerConfig.updatedBy
    };
  }
} 