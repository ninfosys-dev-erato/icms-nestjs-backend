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
  HttpCode,
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
    @Query('lang') lang?: string,
  ) {
    return this.officeSettingsService.getOfficeSettings(lang);
  }

  @Get('seo')
  @ApiOperation({ summary: 'Get office settings for SEO (Public)' })
  @ApiResponse({ status: 200, description: 'SEO settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  async getOfficeSettingsForSEO() {
    return this.officeSettingsService.getOfficeSettingsForSEO();
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
  ) {
    return this.officeSettingsService.createOfficeSettings(data);
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
  ) {
    return this.officeSettingsService.upsertOfficeSettings(data);
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
  ) {
    return this.officeSettingsService.updateOfficeSettings(id, data);
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
  ) {
    return this.officeSettingsService.getOfficeSettingsById(id);
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
  ) {
    return this.officeSettingsService.deleteOfficeSettings(id);
  }

  @Post(':id/background-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update background photo (Admin)' })
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Background photo updated successfully' })
  @ApiResponse({ status: 400, description: 'File validation error' })
  @ApiResponse({ status: 404, description: 'Office settings not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateBackgroundPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.officeSettingsService.updateBackgroundPhoto(id, file);
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
  ) {
    return this.officeSettingsService.removeBackgroundPhoto(id);
  }
} 