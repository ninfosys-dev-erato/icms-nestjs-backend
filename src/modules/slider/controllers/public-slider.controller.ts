import { Controller, Get, Post, Body, Param, Query, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { SliderService } from '../services/slider.service';
import { 
  SliderQueryDto, 
  SliderResponseDto 
} from '../dto/slider.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Public Sliders')
@Controller('sliders')
export class PublicSliderController {
  constructor(private readonly sliderService: SliderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published sliders' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'position', required: false, type: Number })
  async getAllSliders(
    @Res() response: Response,
    @Query() query?: SliderQueryDto
  ): Promise<void> {
    try {
      const result = await this.sliderService.getPublishedSliders(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDERS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by ID' })
  @ApiResponse({ status: 200, description: 'Slider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async getSliderById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const slider = await this.sliderService.getSliderById(id);
      
      const apiResponse = ApiResponseBuilder.success(slider);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('display/active')
  @ApiOperation({ summary: 'Get active sliders for display' })
  @ApiResponse({ status: 200, description: 'Active sliders retrieved successfully' })
  async getActiveSlidersForDisplay(
    @Res() response: Response
  ): Promise<void> {
    try {
      const sliders = await this.sliderService.getActiveSlidersForDisplay();
      
      const apiResponse = ApiResponseBuilder.success(sliders);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'ACTIVE_SLIDERS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get sliders by position' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Slider position' })
  async getSlidersByPosition(
    @Res() response: Response,
    @Param('position') position: number
  ): Promise<void> {
    try {
      const sliders = await this.sliderService.getSlidersByPosition(position);
      
      const apiResponse = ApiResponseBuilder.success(sliders);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'SLIDERS_POSITION_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Record slider click' })
  @ApiResponse({ status: 200, description: 'Click recorded successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async recordSliderClick(
    @Res() response: Response,
    @Param('id') id: string,
    @Req() request: Request
  ): Promise<void> {
    try {
      const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
      const userAgent = request.headers['user-agent'] || 'unknown';
      
      await this.sliderService.recordSliderClick(id, ipAddress, userAgent);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Click recorded successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_CLICK_RECORDING_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Record slider view' })
  @ApiResponse({ status: 200, description: 'View recorded successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async recordSliderView(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: { duration?: number },
    @Req() request: Request
  ): Promise<void> {
    try {
      const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
      const userAgent = request.headers['user-agent'] || 'unknown';
      
      await this.sliderService.recordSliderView(id, ipAddress, userAgent, undefined, data.duration);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'View recorded successfully' });

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'SLIDER_VIEW_RECORDING_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 