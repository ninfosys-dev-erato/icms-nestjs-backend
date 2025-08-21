import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiConsumes
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { HeaderConfigService } from '../services/header-config.service';
import { 
  CreateHeaderConfigDto, 
  UpdateHeaderConfigDto, 
  HeaderConfigQueryDto, 
  HeaderConfigSearchDto
} from '../dto/header.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Header Configurations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/header-configs')
export class AdminHeaderController {
  constructor(private readonly headerConfigService: HeaderConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Header configs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async getAllHeaderConfigs(
    @Query() query?: HeaderConfigQueryDto
  ) {
    const result = await this.headerConfigService.getAllHeaderConfigs(query);
    return result;
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get header config statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getHeaderConfigStatistics() {
    const statistics = await this.headerConfigService.getHeaderConfigStatistics();
    return statistics;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiResponse({ status: 400, description: 'Search term is required' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchHeaderConfigs(
    @Query() query: HeaderConfigSearchDto
  ) {
    if (!query.q || query.q.trim() === '') {
      throw new BadRequestException({
        message: 'Search term is required',
        error: 'SEARCH_TERM_REQUIRED'
      });
    }
    
    const result = await this.headerConfigService.searchHeaderConfigs(query.q, query);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get header config by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async getHeaderConfigById(
    @Param('id') id: string
  ) {
    const headerConfig = await this.headerConfigService.getHeaderConfigById(id);
    return headerConfig;
  }

  @Post()
  @ApiOperation({ summary: 'Create header config (Admin)' })
  @ApiResponse({ status: 201, description: 'Header config created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async createHeaderConfig(
    @Body() data: CreateHeaderConfigDto,
    @CurrentUser() user: any
  ) {
    const headerConfig = await this.headerConfigService.createHeaderConfig(data, user.id);
    return headerConfig;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateHeaderConfig(
    @Param('id') id: string,
    @Body() data: UpdateHeaderConfigDto,
    @CurrentUser() user: any
  ) {
    const headerConfig = await this.headerConfigService.updateHeaderConfig(id, data, user.id);
    return headerConfig;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN')
  async deleteHeaderConfig(
    @Param('id') id: string
  ) {
    await this.headerConfigService.deleteHeaderConfig(id);
    return { message: 'Header config deleted successfully' };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config published successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async publishHeaderConfig(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const headerConfig = await this.headerConfigService.publishHeaderConfig(id, user.id);
    return headerConfig;
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config unpublished successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async unpublishHeaderConfig(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const headerConfig = await this.headerConfigService.unpublishHeaderConfig(id, user.id);
    return headerConfig;
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Header configs reordered successfully' })
  @Roles('ADMIN', 'EDITOR')
  async reorderHeaderConfigs(
    @Body() orders: { id: string; order: number }[],
    @CurrentUser() user: any
  ) {
    await this.headerConfigService.reorderHeaderConfigs(orders);
    return { message: 'Header configs reordered successfully' };
  }

  @Put(':id/logo/:logoType')
  @UseInterceptors(
    FileInterceptor('logo', {
      fileFilter: (req, file, callback) => {
        console.log('🔍 DEBUG: Header Logo FileInterceptor fileFilter called');
        console.log('  File object:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size,
        });
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for logos
      }
    })
  )
  @ApiOperation({ summary: 'Upload header logo (Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'File validation error' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @ApiParam({ name: 'logoType', description: 'Logo type (left or right)' })
  @Roles('ADMIN', 'EDITOR')
  async uploadLogo(
    @Param('id') id: string,
    @Param('logoType') logoType: 'left' | 'right',
    @UploadedFile() file: Express.Multer.File,
    @Body() logoData: any,
    @CurrentUser() user: any,
    @Res() response: Response
  ): Promise<void> {
    try {
      console.log('🔍 DEBUG: Header Logo Upload Request Details');
      console.log('=====================================');
      
      console.log('📋 Request Headers:');
      console.log('  Content-Type:', response.req.headers['content-type']);
      console.log('  Content-Length:', response.req.headers['content-length']);
      console.log('  Authorization:', response.req.headers['authorization'] ? 'Present' : 'Missing');
      
      console.log('📁 File Information:');
      if (file) {
        console.log('  ✅ File received:');
        console.log('    - originalname:', file.originalname);
        console.log('    - mimetype:', file.mimetype);
        console.log('    - size:', file.size);
        console.log('    - fieldname:', file.fieldname);
        console.log('    - buffer length:', file.buffer?.length);
      } else {
        console.log('  ❌ No file received');
      }
      
      console.log('📝 Logo Data:');
      console.log('  Data received:', logoData);
      
      console.log('=====================================');

      if (!file) {
        throw new BadRequestException('No logo file uploaded');
      }

      // Parse logo data from form data
      const parseTranslatableEntity = (prefix: string): any => {
        const en = logoData[`${prefix}[en]`] || logoData[`${prefix}.en`] || logoData[`${prefix}_en`];
        const ne = logoData[`${prefix}[ne]`] || logoData[`${prefix}.ne`] || logoData[`${prefix}_ne`];
        
        if (en || ne) {
          return { en: en || '', ne: ne || '' };
        }
        return undefined;
      };

      const parsedLogoData = {
        altText: parseTranslatableEntity('altText'),
        width: parseInt(logoData.width) || 150,
        height: parseInt(logoData.height) || 50
      };

      const result = await this.headerConfigService.uploadLogo(id, logoType, file, parsedLogoData, user.id);
      
      response.status(200).json(
        ApiResponseBuilder.success(result)
      );
    } catch (error) {
      console.error('❌ ERROR in uploadLogo:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      
      const status = error.message.includes('not found') ? 404 : 
                    error.message.includes('validation') ? 400 : 500;
      
      const apiResponse = ApiResponseBuilder.error(
        'LOGO_UPLOAD_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id/logo/:logoType')
  @ApiOperation({ summary: 'Remove header logo (Admin)' })
  @ApiResponse({ status: 200, description: 'Logo removed successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @ApiParam({ name: 'logoType', description: 'Logo type (left or right)' })
  @Roles('ADMIN', 'EDITOR')
  async removeLogo(
    @Param('id') id: string,
    @Param('logoType') logoType: 'left' | 'right',
    @CurrentUser() user: any,
    @Res() response: Response
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.removeLogo(id, logoType, user.id);
      
      response.status(200).json(
        ApiResponseBuilder.success(result)
      );
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      
      const apiResponse = ApiResponseBuilder.error(
        'LOGO_REMOVAL_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Header configs exported successfully' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async exportHeaderConfigs(
    @Res() response: Response,
    @Query() query: HeaderConfigQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<void> {
    try {
      const buffer = await this.headerConfigService.exportHeaderConfigs(query, format);
      
      const contentType = format === 'json' ? 'application/json' : 'application/octet-stream';
      const filename = `header-configs-export.${format}`;
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.send(buffer);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_EXPORT_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import header configs (Admin)' })
  @ApiResponse({ status: 201, description: 'Header configs imported successfully' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN')
  async importHeaderConfigs(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    const result = await this.headerConfigService.importHeaderConfigs(file, user.id);
    return result;
  }

  @Post('bulk-publish')
  @ApiOperation({ summary: 'Bulk publish header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk publish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkPublish(
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ) {
    const result = await this.headerConfigService.bulkPublish(data.ids, user.id);
    return result;
  }

  @Post('bulk-unpublish')
  @ApiOperation({ summary: 'Bulk unpublish header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk unpublish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUnpublish(
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ) {
    const result = await this.headerConfigService.bulkUnpublish(data.ids, user.id);
    return result;
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(
    @Body() data: { ids: string[] }
  ) {
    const result = await this.headerConfigService.bulkDelete(data.ids);
    return result;
  }

  @Get(':id/css')
  @ApiOperation({ summary: 'Generate CSS (Admin)' })
  @ApiResponse({ status: 200, description: 'CSS generated successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async generateCSS(
    @Param('id') id: string
  ) {
    const css = await this.headerConfigService.generateCSS(id);
    return { css };
  }
} 