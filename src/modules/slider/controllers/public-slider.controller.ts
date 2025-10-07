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
  constructor(private readonly sliderService: SliderService) {
    console.log('🎯 PublicSliderController instantiated');
  }

  @Get()
  @ApiOperation({ summary: 'Get all published sliders' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'position', required: false, type: Number })
  async getAllSliders(@Query() query?: SliderQueryDto) {
    console.log('🎯 getAllSliders route called with query:', query);
    const result = await this.sliderService.getPublishedSliders(query);
    return ApiResponseBuilder.paginated(result.data, result.pagination);
  }

  @Get('display/active')
  @ApiOperation({ summary: 'Get active sliders for display' })
  @ApiResponse({ status: 200, description: 'Active sliders retrieved successfully' })
  async getActiveSlidersForDisplay() {
    const startTime = Date.now();
    console.log('🎯 getActiveSlidersForDisplay route called at:', new Date().toISOString());
    
    try {
      const sliders = await this.sliderService.getActiveSlidersForDisplay();
      const endTime = Date.now();
      console.log(`✅ getActiveSlidersForDisplay completed in ${endTime - startTime}ms`);
      console.log(`📊 Returned ${sliders.length} sliders`);
      return ApiResponseBuilder.success(sliders);
    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ getActiveSlidersForDisplay failed after ${endTime - startTime}ms:`, error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by ID' })
  @ApiResponse({ status: 200, description: 'Slider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async getSliderById(@Param('id') id: string) {
    console.log('🎯 getSliderById route called with id:', id);
    const slider = await this.sliderService.getSliderById(id);
    return ApiResponseBuilder.success(slider);
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get sliders by position' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Slider position' })
  async getSlidersByPosition(@Param('position') position: number) {
    console.log('🎯 getSlidersByPosition route called with position:', position);
    const sliders = await this.sliderService.getSlidersByPosition(position);
    return ApiResponseBuilder.success(sliders);
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Record slider click' })
  @ApiResponse({ status: 200, description: 'Click recorded successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async recordSliderClick(
    @Param('id') id: string,
    @Req() request: Request
  ) {
    console.log('🎯 recordSliderClick route called with id:', id);
    const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    
    await this.sliderService.recordSliderClick(id, ipAddress, userAgent);
    return ApiResponseBuilder.success({ message: 'Click recorded successfully' });
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Record slider view' })
  @ApiResponse({ status: 200, description: 'View recorded successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async recordSliderView(
    @Param('id') id: string,
    @Body() data?: { duration?: number },
    @Req() request?: Request
  ) {
    console.log('🎯 recordSliderView route called with id:', id);
    const ipAddress = request?.ip || request?.connection?.remoteAddress || 'unknown';
    const userAgent = request?.headers['user-agent'] || 'unknown';
    
    await this.sliderService.recordSliderView(id, ipAddress, userAgent, undefined, data?.duration);
    return ApiResponseBuilder.success({ message: 'View recorded successfully' });
  }
} 