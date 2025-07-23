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
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
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
import { ApiResponseBuilder } from '@/common/types/api-response';

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
    @Res() response: Response,
  ): Promise<void> {
    try {
      const descriptions = await this.officeDescriptionService.getAllOfficeDescriptions(query);
      
      const apiResponse = ApiResponseBuilder.success(descriptions);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTIONS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get office description statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: OfficeDescriptionStatistics })
  async getOfficeDescriptionStatistics(@Res() response: Response): Promise<void> {
    try {
      const statistics = await this.officeDescriptionService.getOfficeDescriptionStatistics();
      
      const apiResponse = ApiResponseBuilder.success(statistics);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'STATISTICS_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get office description by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async getOfficeDescriptionById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescription(id);
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create office description (Admin)' })
  @ApiResponse({ status: 201, description: 'Office description created successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createOfficeDescription(
    @Body() data: CreateOfficeDescriptionDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.createOfficeDescription(data);
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(HttpStatus.CREATED).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_CREATION_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update office description (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description updated successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async updateOfficeDescription(
    @Param('id') id: string,
    @Body() data: UpdateOfficeDescriptionDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.updateOfficeDescription(id, data);
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_UPDATE_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('type/:type/upsert')
  @ApiOperation({ summary: 'Upsert office description by type (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description upserted successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async upsertOfficeDescriptionByType(
    @Param('type') type: OfficeDescriptionType,
    @Body() data: CreateOfficeDescriptionDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.upsertOfficeDescriptionByType(type, data);
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_UPSERT_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete office description (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description deleted successfully' })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async deleteOfficeDescription(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.officeDescriptionService.deleteOfficeDescription(id);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Office description deleted successfully' });

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_DELETE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete('type/:type')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete office description by type (Admin)' })
  @ApiResponse({ status: 200, description: 'Office description deleted successfully' })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async deleteOfficeDescriptionByType(
    @Param('type') type: OfficeDescriptionType,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.officeDescriptionService.deleteOfficeDescriptionByType(type);
      
      const apiResponse = ApiResponseBuilder.success({ message: 'Office description deleted successfully' });

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_DELETE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post('bulk-create')
  @ApiOperation({ summary: 'Bulk create office descriptions (Admin)' })
  @ApiResponse({ status: 201, description: 'Office descriptions created successfully', type: [OfficeDescriptionResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async bulkCreateOfficeDescriptions(
    @Body() data: BulkCreateOfficeDescriptionDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const descriptions = await this.officeDescriptionService.bulkCreateOfficeDescriptions(data);
      
      const apiResponse = ApiResponseBuilder.success(descriptions);

      response.status(HttpStatus.CREATED).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'BULK_CREATION_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update office descriptions (Admin)' })
  @ApiResponse({ status: 200, description: 'Office descriptions updated successfully', type: [OfficeDescriptionResponseDto] })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async bulkUpdateOfficeDescriptions(
    @Body() data: BulkUpdateOfficeDescriptionDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const descriptions = await this.officeDescriptionService.bulkUpdateOfficeDescriptions(data);
      
      const apiResponse = ApiResponseBuilder.success(descriptions);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'BULK_UPDATE_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post('import')
  @ApiOperation({ summary: 'Import office descriptions (Admin)' })
  @ApiResponse({ status: 200, description: 'Import completed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async importOfficeDescriptions(
    @Body() data: BulkCreateOfficeDescriptionDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const result = await this.officeDescriptionService.importOfficeDescriptions(data.descriptions);
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const apiResponse = ApiResponseBuilder.error(
        'IMPORT_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('export')
  @ApiOperation({ summary: 'Export office descriptions (Admin)' })
  @ApiResponse({ status: 200, description: 'Export completed successfully' })
  async exportOfficeDescriptions(@Res() response: Response): Promise<void> {
    try {
      const result = await this.officeDescriptionService.exportOfficeDescriptions();
      
      const apiResponse = ApiResponseBuilder.success(result);

      response.status(HttpStatus.OK).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'EXPORT_ERROR',
        error.message
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }
  }
} 