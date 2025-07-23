import {
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { OfficeDescriptionService } from '../services/office-description.service';
import { 
  OfficeDescriptionResponseDto, 
  OfficeDescriptionQueryDto,
  OfficeDescriptionType 
} from '../dto/office-description.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Office Descriptions')
@Controller('office-descriptions')
export class OfficeDescriptionController {
  constructor(private readonly officeDescriptionService: OfficeDescriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all office descriptions (Public)' })
  @ApiResponse({ status: 200, description: 'Office descriptions retrieved successfully', type: [OfficeDescriptionResponseDto] })
  async getAllOfficeDescriptions(
    @Query() query: OfficeDescriptionQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const descriptions = await this.officeDescriptionService.getAllOfficeDescriptions(query);
      
      const apiResponse = ApiResponseBuilder.success(descriptions);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTIONS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all office description types (Public)' })
  @ApiResponse({ status: 200, description: 'Office description types retrieved successfully' })
  async getOfficeDescriptionTypes(@Res() response: Response): Promise<void> {
    try {
      const types = Object.values(OfficeDescriptionType);
      
      const apiResponse = ApiResponseBuilder.success(types);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_TYPES_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get office description by type (Public)' })
  @ApiResponse({ status: 200, description: 'Office description retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async getOfficeDescriptionByType(
    @Param('type') type: OfficeDescriptionType,
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescriptionByType(type, lang);
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get office description by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Office description retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async getOfficeDescriptionById(
    @Param('id') id: string,
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescription(id);
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_DESCRIPTION_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('introduction')
  @ApiOperation({ summary: 'Get office introduction (Public)' })
  @ApiResponse({ status: 200, description: 'Office introduction retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office introduction not found' })
  async getOfficeIntroduction(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescriptionByType(
        OfficeDescriptionType.INTRODUCTION, 
        lang
      );
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_INTRODUCTION_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('objective')
  @ApiOperation({ summary: 'Get office objective (Public)' })
  @ApiResponse({ status: 200, description: 'Office objective retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office objective not found' })
  async getOfficeObjective(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescriptionByType(
        OfficeDescriptionType.OBJECTIVE, 
        lang
      );
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_OBJECTIVE_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('work-details')
  @ApiOperation({ summary: 'Get office work details (Public)' })
  @ApiResponse({ status: 200, description: 'Office work details retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office work details not found' })
  async getOfficeWorkDetails(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescriptionByType(
        OfficeDescriptionType.WORK_DETAILS, 
        lang
      );
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'OFFICE_WORK_DETAILS_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('organizational-structure')
  @ApiOperation({ summary: 'Get organizational structure (Public)' })
  @ApiResponse({ status: 200, description: 'Organizational structure retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Organizational structure not found' })
  async getOrganizationalStructure(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescriptionByType(
        OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE, 
        lang
      );
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'ORGANIZATIONAL_STRUCTURE_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('digital-charter')
  @ApiOperation({ summary: 'Get digital charter (Public)' })
  @ApiResponse({ status: 200, description: 'Digital charter retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Digital charter not found' })
  async getDigitalCharter(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescriptionByType(
        OfficeDescriptionType.DIGITAL_CHARTER, 
        lang
      );
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DIGITAL_CHARTER_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }

  @Get('employee-sanctions')
  @ApiOperation({ summary: 'Get employee sanctions (Public)' })
  @ApiResponse({ status: 200, description: 'Employee sanctions retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Employee sanctions not found' })
  async getEmployeeSanctions(
    @Res() response: Response,
    @Query('lang') lang?: string,
  ): Promise<void> {
    try {
      const description = await this.officeDescriptionService.getOfficeDescriptionByType(
        OfficeDescriptionType.EMPLOYEE_SANCTIONS, 
        lang
      );
      
      const apiResponse = ApiResponseBuilder.success(description);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'EMPLOYEE_SANCTIONS_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 