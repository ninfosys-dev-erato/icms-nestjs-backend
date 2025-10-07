import { Controller, Get, Param, Query, Res, Post, Body } from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { HeaderConfigService } from '../services/header-config.service';
import { 
  HeaderConfigQueryDto, 
  HeaderConfigResponseDto,
  CreateHeaderConfigDto,
  UpdateHeaderConfigDto
} from '../dto/header.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Public Header Configurations')
@Controller('header-configs')
export class PublicHeaderController {
  constructor(private readonly headerConfigService: HeaderConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published header configs' })
  @ApiResponse({ status: 200, description: 'Header configs retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  async getAllHeaderConfigs(
    @Res() response: Response,
    @Query() query?: HeaderConfigQueryDto
  ): Promise<void> {
    try {
      const result = await this.headerConfigService.getPublishedHeaderConfigs(query);
      
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

  @Get(':id')
  @ApiOperation({ summary: 'Get header config by ID' })
  @ApiResponse({ status: 200, description: 'Header config retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
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

  @Get('display/active')
  @ApiOperation({ summary: 'Get active header config for display' })
  @ApiResponse({ status: 200, description: 'Active header config retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No active header config found' })
  async getActiveHeaderConfigForDisplay(
    @Res() response: Response
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.getActiveHeaderConfigForDisplay();
      
      // Ensure presigned URLs are generated for logos
      const apiResponse = ApiResponseBuilder.success(headerConfig);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ACTIVE_HEADER_CONFIG_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('order/:order')
  @ApiOperation({ summary: 'Get header config by order' })
  @ApiResponse({ status: 200, description: 'Header config retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'order', description: 'Header config order' })
  async getHeaderConfigByOrder(
    @Res() response: Response,
    @Param('order') order: number
  ): Promise<void> {
    try {
      const headerConfig = await this.headerConfigService.getHeaderConfigByOrder(order);
      
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

  @Get(':id/css')
  @ApiOperation({ summary: 'Get header CSS' })
  @ApiResponse({ status: 200, description: 'CSS generated successfully' })
  @ApiResponse({ status: 404, description: 'Header config not found' })
  @ApiParam({ name: 'id', description: 'Header config ID' })
  async getHeaderCSS(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const css = await this.headerConfigService.generateCSS(id);
      
      const apiResponse = ApiResponseBuilder.success({ css });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'CSS_GENERATION_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview header config' })
  @ApiResponse({ status: 200, description: 'Preview generated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async previewHeaderConfig(
    @Res() response: Response,
    @Body() data: CreateHeaderConfigDto | UpdateHeaderConfigDto
  ): Promise<void> {
    try {
      const preview = await this.headerConfigService.previewHeaderConfig(data);
      
      const apiResponse = ApiResponseBuilder.success(preview);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'HEADER_PREVIEW_ERROR',
        error.message
      );

      response.status(400).json(apiResponse);
    }
  }
} 