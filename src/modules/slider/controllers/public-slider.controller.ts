import { Controller, Get, Post, Body, Param, Query, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
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
import { ApiResponseBuilder } from '@/common/types/api-response';

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
  async getAllSliders(@Res() response: Response, @Query() query?: SliderQueryDto): Promise<void> {
    const result = await this.sliderService.getPublishedSliders(query);
    response
      .status(HttpStatus.OK)
      .json(ApiResponseBuilder.paginated(result.data, result.pagination));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by ID' })
  @ApiResponse({ status: 200, description: 'Slider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async getSliderById(@Res() response: Response, @Param('id') id: string): Promise<void> {
    const slider = await this.sliderService.getSliderById(id);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(slider));
  }

  @Get('display/active')
  @ApiOperation({ summary: 'Get active sliders for display' })
  @ApiResponse({ status: 200, description: 'Active sliders retrieved successfully' })
  async getActiveSlidersForDisplay(@Res() response: Response): Promise<void> {
    const sliders = await this.sliderService.getActiveSlidersForDisplay();
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(sliders));
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get sliders by position' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Slider position' })
  async getSlidersByPosition(@Res() response: Response, @Param('position') position: number): Promise<void> {
    const sliders = await this.sliderService.getSlidersByPosition(position);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(sliders));
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
    const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    
    await this.sliderService.recordSliderClick(id, ipAddress, userAgent);
    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Click recorded successfully' }),
    );
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Record slider view' })
  @ApiResponse({ status: 200, description: 'View recorded successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async recordSliderView(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data?: { duration?: number },
    @Req() request?: Request
  ): Promise<void> {
    const ipAddress = request?.ip || request?.connection?.remoteAddress || 'unknown';
    const userAgent = request?.headers['user-agent'] || 'unknown';
    
    await this.sliderService.recordSliderView(id, ipAddress, userAgent, undefined, data?.duration);
    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'View recorded successfully' }),
    );
  }
} 