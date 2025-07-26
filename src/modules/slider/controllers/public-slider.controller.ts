import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
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
  async getAllSliders(@Query() query?: SliderQueryDto) {
    return await this.sliderService.getPublishedSliders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by ID' })
  @ApiResponse({ status: 200, description: 'Slider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  async getSliderById(@Param('id') id: string) {
    return await this.sliderService.getSliderById(id);
  }

  @Get('display/active')
  @ApiOperation({ summary: 'Get active sliders for display' })
  @ApiResponse({ status: 200, description: 'Active sliders retrieved successfully' })
  async getActiveSlidersForDisplay() {
    return await this.sliderService.getActiveSlidersForDisplay();
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get sliders by position' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Slider position' })
  async getSlidersByPosition(@Param('position') position: number) {
    return await this.sliderService.getSlidersByPosition(position);
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
    const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';
    
    await this.sliderService.recordSliderClick(id, ipAddress, userAgent);
    return { message: 'Click recorded successfully' };
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
    const ipAddress = request?.ip || request?.connection?.remoteAddress || 'unknown';
    const userAgent = request?.headers['user-agent'] || 'unknown';
    
    await this.sliderService.recordSliderView(id, ipAddress, userAgent, undefined, data?.duration);
    return { message: 'View recorded successfully' };
  }
} 