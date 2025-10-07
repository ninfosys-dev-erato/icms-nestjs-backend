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
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { OfficeDescriptionService } from '../services/office-description.service';
import {
  CreateOfficeDescriptionDto,
  UpdateOfficeDescriptionDto,
  OfficeDescriptionResponseDto,
  OfficeDescriptionQueryDto,
  OfficeDescriptionType,
  BulkCreateOfficeDescriptionDto,
  BulkUpdateOfficeDescriptionDto,
  OfficeDescriptionStatistics,
} from '../dto/office-description.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Admin Office Descriptions')
@Controller('admin/office-descriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'EDITOR')
@ApiBearerAuth()
export class AdminOfficeDescriptionController {
  constructor(private readonly officeDescriptionService: OfficeDescriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all office descriptions (Admin)' })
  @ApiResponse({ status: 200, description: 'Office descriptions retrieved successfully', type: [OfficeDescriptionResponseDto] })
  async getAllOfficeDescriptions(
    @Query() query: OfficeDescriptionQueryDto,
  ): Promise<OfficeDescriptionResponseDto[]> {
    return await this.officeDescriptionService.getAllOfficeDescriptions(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get office description statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: OfficeDescriptionStatistics })
  async getOfficeDescriptionStatistics(): Promise<OfficeDescriptionStatistics> {
    return await this.officeDescriptionService.getOfficeDescriptionStatistics();
  }

  @Get('export')
  @ApiOperation({ summary: 'Export office descriptions (Admin)' })
  @ApiResponse({ status: 200, description: 'Export completed successfully' })
  async exportOfficeDescriptions(): Promise<any> {
    return await this.officeDescriptionService.exportOfficeDescriptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get office description by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async getOfficeDescriptionById(
    @Param('id') id: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescription(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create office description (Admin)' })
  @ApiResponse({ status: 201, description: 'Office description created successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createOfficeDescription(
    @Body() data: CreateOfficeDescriptionDto,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.createOfficeDescription(data);
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update office descriptions (Admin)' })
  @ApiResponse({ status: 200, description: 'Office descriptions updated successfully', type: [OfficeDescriptionResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async bulkUpdateOfficeDescriptions(
    @Body() data: BulkUpdateOfficeDescriptionDto,
  ): Promise<OfficeDescriptionResponseDto[]> {
    return await this.officeDescriptionService.bulkUpdateOfficeDescriptions(data);
  }

  @Put('import')
  @ApiOperation({ summary: 'Import office descriptions (Admin)' })
  @ApiResponse({ status: 200, description: 'Import completed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async importOfficeDescriptions(
    @Body() data: BulkCreateOfficeDescriptionDto,
  ): Promise<any> {
    return await this.officeDescriptionService.importOfficeDescriptions(data.descriptions);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update office description (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description updated successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async updateOfficeDescription(
    @Param('id') id: string,
    @Body() data: UpdateOfficeDescriptionDto,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.updateOfficeDescription(id, data);
  }

  @Put('type/:type/upsert')
  @ApiOperation({ summary: 'Upsert office description by type (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description upserted successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async upsertOfficeDescriptionByType(
    @Param('type') type: OfficeDescriptionType,
    @Body() data: CreateOfficeDescriptionDto,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.upsertOfficeDescriptionByType(type, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete office description (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description deleted successfully' })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async deleteOfficeDescription(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.officeDescriptionService.deleteOfficeDescription(id);
    return { message: 'Office description deleted successfully' };
  }

  @Delete('type/:type')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete office description by type (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description deleted successfully' })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async deleteOfficeDescriptionByType(
    @Param('type') type: OfficeDescriptionType,
  ): Promise<{ message: string }> {
    await this.officeDescriptionService.deleteOfficeDescriptionByType(type);
    return { message: 'Office description deleted successfully' };
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create office descriptions (Admin)' })
  @ApiResponse({ status: 201, description: 'Office descriptions created successfully', type: [OfficeDescriptionResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async bulkCreateOfficeDescriptions(
    @Body() data: BulkCreateOfficeDescriptionDto,
  ): Promise<OfficeDescriptionResponseDto[]> {
    return await this.officeDescriptionService.bulkCreateOfficeDescriptions(data);
  }
} 