import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { SliderService } from '../services/slider.service';
import { 
  CreateSliderDto, 
  UpdateSliderDto, 
  SliderQueryDto, 
  SliderResponseDto,
  SliderStatistics,
  SliderAnalytics,
  BulkOperationResult
} from '../dto/slider.dto';

@ApiTags('Admin Sliders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/sliders')
export class AdminSliderController {
  constructor(private readonly sliderService: SliderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Sliders retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'position', required: false, type: Number })
  @Roles('ADMIN', 'EDITOR')
  async getAllSliders(@Query() query?: SliderQueryDto) {
    return await this.sliderService.getAllSliders(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get slider statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getSliderStatistics() {
    return await this.sliderService.getSliderStatistics();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @Roles('ADMIN', 'EDITOR')
  async searchSliders(
    @Query('q') searchTerm: string,
    @Query() query?: SliderQueryDto
  ) {
    return await this.sliderService.searchSliders(searchTerm, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async getSliderById(@Param('id') id: string) {
    return await this.sliderService.getSliderById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create slider (Admin)' })
  @ApiResponse({ status: 201, description: 'Slider created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Roles('ADMIN', 'EDITOR')
  async createSlider(
    @Body() data: CreateSliderDto,
    @CurrentUser() user: any
  ) {
    return await this.sliderService.createSlider(data, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async updateSlider(
    @Param('id') id: string,
    @Body() data: UpdateSliderDto,
    @CurrentUser() user: any
  ) {
    return await this.sliderService.updateSlider(id, data, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider deleted successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN')
  async deleteSlider(@Param('id') id: string) {
    await this.sliderService.deleteSlider(id);
    return { message: 'Slider deleted successfully' };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider published successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async publishSlider(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return await this.sliderService.publishSlider(id, user.id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish slider (Admin)' })
  @ApiResponse({ status: 200, description: 'Slider unpublished successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @Roles('ADMIN', 'EDITOR')
  async unpublishSlider(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return await this.sliderService.unpublishSlider(id, user.id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Sliders reordered successfully' })
  @ApiResponse({ status: 400, description: 'Reorder failed' })
  @Roles('ADMIN', 'EDITOR')
  async reorderSliders(@Body() orders: { id: string; position: number }[]) {
    await this.sliderService.reorderSliders(orders);
    return { message: 'Sliders reordered successfully' };
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get slider analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Slider not found' })
  @ApiParam({ name: 'id', description: 'Slider ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @Roles('ADMIN', 'EDITOR')
  async getSliderAnalytics(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: Date,
    @Query('dateTo') dateTo?: Date
  ) {
    return await this.sliderService.getSliderAnalytics(id, dateFrom, dateTo);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Sliders exported successfully' })
  @ApiQuery({ name: 'format', required: false, type: String })
  @Roles('ADMIN', 'EDITOR')
  async exportSliders(
    @Query() query: SliderQueryDto,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json'
  ) {
    return await this.sliderService.exportSliders(query, format);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import sliders (Admin)' })
  @ApiResponse({ status: 201, description: 'Sliders imported successfully' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles('ADMIN')
  async importSliders(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    return await this.sliderService.importSliders(file, user.id);
  }

  @Post('bulk-publish')
  @ApiOperation({ summary: 'Bulk publish sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk publish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkPublish(
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ) {
    return await this.sliderService.bulkPublish(data.ids, user.id);
  }

  @Post('bulk-unpublish')
  @ApiOperation({ summary: 'Bulk unpublish sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk unpublish completed' })
  @Roles('ADMIN', 'EDITOR')
  async bulkUnpublish(
    @Body() data: { ids: string[] },
    @CurrentUser() user: any
  ) {
    return await this.sliderService.bulkUnpublish(data.ids, user.id);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete sliders (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed' })
  @Roles('ADMIN')
  async bulkDelete(@Body() data: { ids: string[] }) {
    return await this.sliderService.bulkDelete(data.ids);
  }
} 