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
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

import { OfficeSettingsService } from '../services/office-settings.service';
import { CreateOfficeSettingsDto } from '../dto/create-office-settings.dto';
import { UpdateOfficeSettingsDto } from '../dto/update-office-settings.dto';
import { OfficeSettingsResponseDto } from '../dto/office-settings-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Office Settings')
@Controller('office-settings')
export class OfficeSettingsController {
  constructor(private readonly officeSettingsService: OfficeSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get office settings (Public)' })
  @ApiResponse({ status: 200, description: 'Office settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  async getOfficeSettings(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const settings = await this.officeSettingsService.getOfficeSettings(lang);
      
      const apiResponse = ApiResponseBuilder.success(settings);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_SETTINGS_NOT_FOUND',
        error.message
      );

      response.status(404).json(apiResponse);
    }
  }

  @Get('seo')
  @ApiOperation({ summary: 'Get office settings for SEO (Public)' })
  @ApiResponse({ status: 200, description: 'SEO settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  async getOfficeSettingsForSEO(@Res() response: Response): Promise<void> {
    try {
      const seoSettings = await this.officeSettingsService.getOfficeSettingsForSEO();
      
      const apiResponse = ApiResponseBuilder.success(seoSettings);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_SETTINGS_NOT_FOUND',
        error.message
      );

      response.status(404).json(apiResponse);
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get office settings by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Office settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getOfficeSettingsById(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const settings = await this.officeSettingsService.getOfficeSettingsById(id);
      
      const apiResponse = ApiResponseBuilder.success(settings);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_SETTINGS_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create office settings (Admin)' })
  @ApiResponse({ status: 201, description: 'Office settings created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createOfficeSettings(
    @Body() data: CreateOfficeSettingsDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const settings = await this.officeSettingsService.createOfficeSettings(data);
      
      const apiResponse = ApiResponseBuilder.success(settings);

      response.status(201).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_SETTINGS_CREATION_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update office settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Office settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateOfficeSettings(
    @Param('id') id: string,
    @Body() data: UpdateOfficeSettingsDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const settings = await this.officeSettingsService.updateOfficeSettings(id, data);
      
      const apiResponse = ApiResponseBuilder.success(settings);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_SETTINGS_UPDATE_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Put('upsert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upsert office settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Office settings upserted successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async upsertOfficeSettings(
    @Body() data: CreateOfficeSettingsDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const settings = await this.officeSettingsService.upsertOfficeSettings(data);
      
      const apiResponse = ApiResponseBuilder.success(settings);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_SETTINGS_UPSERT_ERROR',
        error.message,
        error.response?.errors || []
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete office settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Office settings deleted successfully' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteOfficeSettings(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      await this.officeSettingsService.deleteOfficeSettings(id);
      
      const apiResponse = ApiResponseBuilder.success(null);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_SETTINGS_DELETE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Post(':id/background-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update background photo (Admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Background photo updated successfully' })
  @ApiResponse({ status: 400, description: 'File validation error' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateBackgroundPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const settings = await this.officeSettingsService.updateBackgroundPhoto(id, file);
      
      const apiResponse = ApiResponseBuilder.success(settings);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.status || 500;
      const apiResponse = ApiResponseBuilder.error(
        'BACKGROUND_PHOTO_UPDATE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Delete(':id/background-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove background photo (Admin)' })
  @ApiResponse({ status: 200, description: 'Background photo removed successfully' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeBackgroundPhoto(
    @Param('id') id: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const settings = await this.officeSettingsService.removeBackgroundPhoto(id);
      
      const apiResponse = ApiResponseBuilder.success(settings);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'BACKGROUND_PHOTO_REMOVE_ERROR',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 