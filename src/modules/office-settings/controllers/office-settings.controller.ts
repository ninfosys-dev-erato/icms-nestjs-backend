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
  Request,
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
  @UseInterceptors(
    FileInterceptor('file', {
      // Add logging to see what's happening during file upload
      fileFilter: (req, file, callback) => {
        console.log('🔍 DEBUG: Office Settings FileInterceptor fileFilter called');
        console.log('  File object:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: file.size
        });
        console.log('  Request body before file processing:', req.body);
        console.log('  Request headers in fileFilter:', {
          'content-type': req.headers['content-type'],
          'content-length': req.headers['content-length']
        });
        callback(null, true);
      },
      // Add error handling
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      }
    })
  )
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
    @Request() req: any,
  ) {
    try {
      // DEBUG: Log everything about the request
      console.log('🔍 DEBUG: Office Settings Background Photo Upload Request Details');
      console.log('=====================================');
      
      // Log request headers
      console.log('📋 Request Headers:');
      console.log('  Content-Type:', req.headers['content-type']);
      console.log('  Content-Length:', req.headers['content-length']);
      console.log('  User-Agent:', req.headers['user-agent']);
      console.log('  Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
      
      // Log file information
      console.log('📁 File Information:');
      if (file) {
        console.log('  ✅ File received:');
        console.log('    - originalname:', file.originalname);
        console.log('    - mimetype:', file.mimetype);
        console.log('    - size:', file.size);
        console.log('    - fieldname:', file.fieldname);
        console.log('    - buffer length:', file.buffer?.length);
        console.log('    - encoding:', file.encoding);
      } else {
        console.log('  ❌ No file received');
      }
      
      // Log raw request body
      console.log('📦 Raw Request Body:');
      console.log('  Body keys:', Object.keys(req.body || {}));
      console.log('  Body content:', req.body);
      
      // Log multer information
      console.log('🔧 Multer Information:');
      console.log('  Files in request:', req.files);
      console.log('  File in request:', req.file);
      
      // Log form data fields
      console.log('📝 Form Data Fields:');
      if (req.body) {
        Object.entries(req.body).forEach(([key, value]) => {
          console.log(`  ${key}:`, value, `(type: ${typeof value})`);
        });
      }
      
      console.log('=====================================');

      return this.officeSettingsService.updateBackgroundPhoto(id, file, req.user.id);
    } catch (error) {
      console.error('❌ ERROR in updateBackgroundPhoto:', error);
      console.error('  Error message:', error.message);
      console.error('  Error stack:', error.stack);
      throw error;
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
  ) {
    return this.officeSettingsService.removeBackgroundPhoto(id);
  }
} 