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
  BadRequestException,
  UploadedFiles,
  Request
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiConsumes,
  ApiBody
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
  HeaderConfigSearchDto,
  HeaderConfigResponseDto,
  LogoUploadDto
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
    return ApiResponseBuilder.success(headerConfig);
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

  // Fallback for environments that block DELETE method at the proxy layer
  @Post(':id/delete')
  @ApiOperation({ summary: 'Delete header config (Admin) [Fallback POST]' })
  @ApiResponse({ status: 200, description: 'Header config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN')
  async deleteHeaderConfigFallback(
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

  // Method-override fallback on the same path for environments allowing only POST
  @Post(':id')
  @ApiOperation({ summary: 'Delete header config (Admin) via method override [POST]' })
  @ApiResponse({ status: 200, description: 'Header config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN')
  async deleteHeaderConfigViaMethodOverride(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any
  ) {
    const override = (req.headers['x-http-method-override'] || body?._method || body?.method || '').toString().toUpperCase();
    if (override !== 'DELETE') {
      throw new BadRequestException({ message: 'Invalid method for this endpoint', error: 'INVALID_METHOD' });
    }
    await this.headerConfigService.deleteHeaderConfig(id);
    return { message: 'Header config deleted successfully' };
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

  @Post(':id/logo/:logoType/upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'file', maxCount: 1 },
      { name: 'logo', maxCount: 1 }  // Add support for 'logo' field
    ], {
      fileFilter: (req, file, callback) => {
        // Validate image files only
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
          console.log(`❌ File type rejected: ${file.mimetype} for file: ${file.originalname}`);
          callback(new Error('Only JPG, PNG, WebP, SVG, and GIF files are allowed for logos'), false);
          return;
        }
        console.log(`✅ File type accepted: ${file.mimetype} for file: ${file.originalname}`);
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for logos
      }
    })
  )
  @ApiOperation({ summary: 'Upload logo file for header config (Admin) - Supports JPG, PNG, WebP, SVG, and GIF' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @ApiParam({ name: 'logoType', description: 'Logo type (left or right)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (alternative field to file)',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file',
        },
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (alternative field name)',
        },
        altText: {
          type: 'object',
          properties: {
            en: { type: 'string', example: 'Company Logo' },
            ne: { type: 'string', example: 'कम्पनी लोगो' }
          },
          description: 'Alt text for accessibility (English and Nepali)'
        },
        width: { 
          type: 'number', 
          example: 150, 
          description: 'Logo width in pixels (optional, default: 150)' 
        },
        height: { 
          type: 'number', 
          example: 50, 
          description: 'Logo height in pixels (optional, default: 50)' 
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'File validation error - Only JPG, PNG, WebP, SVG, and GIF files are allowed' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Roles('ADMIN', 'EDITOR')
  async uploadLogo(
    @Param('id') id: string,
    @Param('logoType') logoType: 'left' | 'right',
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[]; logo?: Express.Multer.File[] },
    @Body() logoData: LogoUploadDto,
    @Request() req: any,
    @CurrentUser() user: any
  ) {
    try {
      console.log('🔍 DEBUG: Header Logo Upload Request Details');
      console.log('=====================================');
      
      console.log('📋 Request Headers:');
      console.log('  Content-Type:', req.headers['content-type']);
      console.log('  Content-Length:', req.headers['content-length']);
      console.log('  Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
      
      // Check for file in any of the accepted fields
      const file = files?.image?.[0] || files?.file?.[0] || files?.logo?.[0];
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
      console.log('  All form fields:', req.body);
      
      console.log('=====================================');

      const result = await this.headerConfigService.uploadLogo(id, logoType, file, logoData, user.id);
      
      // Ensure the response includes presigned URLs for logos
      return ApiResponseBuilder.success(result);
    } catch (error) {
      console.error('❌ ERROR in uploadLogo:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      throw error;
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
      
      // Ensure the response includes presigned URLs for any remaining logos
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