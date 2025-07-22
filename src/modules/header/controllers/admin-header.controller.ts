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
  UploadedFile
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
  HeaderConfigResponseDto,
  HeaderConfigStatistics,
  BulkOperationResult
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
    @Res() response: Response,
    @Query() query?: HeaderConfigQueryDto
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.getAllHeaderConfigs(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIGS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get header config statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getHeaderConfigStatistics(
    @Res() response: Response
  ): Promise<void> {
    try {
      const statistics = await this.headerConfigService.getHeaderConfigStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_STATISTICS_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchHeaderConfigs(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query() query?: HeaderConfigQueryDto
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.searchHeaderConfigs(searchTerm, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get header config by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async getHeaderConfigById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.getHeaderConfigById(id);
      
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create header config (Admin)' })
  @ApiResponse({ status: 201, description: 'Header config created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async createHeaderConfig(
    @Res() response: Response,
    @Body() data: CreateHeaderConfigDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.createHeaderConfig(data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_CREATION_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateHeaderConfig(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateHeaderConfigDto,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.updateHeaderConfig(id, data, user.id);
      
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN')
  async deleteHeaderConfig(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      await this.headerConfigService.deleteHeaderConfig(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Header config deleted successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_DELETION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config published successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async publishHeaderConfig(
    @Res() response: Response,
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.publishHeaderConfig(id, user.id);
      
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_PUBLISH_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish header config (Admin)' })
  @ApiResponse({ status: 200, description: 'Header config unpublished successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async unpublishHeaderConfig(
    @Res() response: Response,
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.unpublishHeaderConfig(id, user.id);
      
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_UNPUBLISH_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Header configs reordered successfully' })
  @Roles('ADMIN', 'EDITOR')
  async reorderHeaderConfigs(
    @Res() response: Response,
    @Body() orders: { id: string; order: number }[],
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      await this.headerConfigService.reorderHeaderConfigs(orders);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Header configs reordered successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_REORDER_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Put(':id/logo/:logoType')
  @ApiOperation({ summary: 'Update logo (Admin)' })
  @ApiResponse({ status: 200, description: 'Logo updated successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @ApiParam({ name: 'logoType', description: 'Logo type (left or right)' })
  @Roles('ADMIN', 'EDITOR')
  async updateLogo(
    @Res() response: Response,
    @Param('id') id: string,
    @Param('logoType') logoType: 'left' | 'right',
    @Body() logoData: any,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.updateLogo(id, logoType, logoData, user.id);
      
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'LOGO_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id/logo/:logoType')
  @ApiOperation({ summary: 'Remove logo (Admin)' })
  @ApiResponse({ status: 200, description: 'Logo removed successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @ApiParam({ name: 'logoType', description: 'Logo type (left or right)' })
  @Roles('ADMIN', 'EDITOR')
  async removeLogo(
    @Res() response: Response,
    @Param('id') id: string,
    @Param('logoType') logoType: 'left' | 'right',
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.removeLogo(id, logoType, user.id);
      
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(200).json(apiResponse);
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
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.importHeaderConfigs(file, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(201).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_IMPORT_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }

  @Post('bulk-publish')
  @ApiOperation({ summary: 'Bulk publish header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk publish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkPublish(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.bulkPublish(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_BULK_PUBLISH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-unpublish')
  @ApiOperation({ summary: 'Bulk unpublish header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk unpublish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUnpublish(
    @Res() response: Response,
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.bulkUnpublish(data.ids, user.id);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_BULK_UNPUBLISH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete header configs (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(
    @Res() response: Response,
    @Body() data: { ids: string[] }
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.bulkDelete(data.ids);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_CONFIG_BULK_DELETION_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id/css')
  @ApiOperation({ summary: 'Generate CSS (Admin)' })
  @ApiResponse({ status: 200, description: 'CSS generated successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  @Roles('ADMIN', 'EDITOR')
  async generateCSS(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const css = await this.headerConfigService.generateCSS(id);
      
      response.setHeader('Content-Type', 'text/css');
      response.status(200).send(css);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'CSS_GENERATION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 