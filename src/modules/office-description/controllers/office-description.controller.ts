import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { OfficeDescriptionService } from '../services/office-description.service';
import { 
  OfficeDescriptionResponseDto, 
  OfficeDescriptionQueryDto,
  OfficeDescriptionType 
} from '../dto/office-description.dto';

@ApiTags('Office Descriptions')
@Controller('office-descriptions')
export class OfficeDescriptionController {
  constructor(private readonly officeDescriptionService: OfficeDescriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all office descriptions (Public)' })
  @ApiResponse({ status: 200, description: 'Office descriptions retrieved successfully', type: [OfficeDescriptionResponseDto] })
  async getAllOfficeDescriptions(
    @Query() query: OfficeDescriptionQueryDto,
  ): Promise<OfficeDescriptionResponseDto[]> {
    return await this.officeDescriptionService.getAllOfficeDescriptions(query);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all office description types (Public)' })
  @ApiResponse({ status: 200, description: 'Office description types retrieved successfully' })
  async getOfficeDescriptionTypes(): Promise<OfficeDescriptionType[]> {
    return Object.values(OfficeDescriptionType);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get office description by type (Public)' })
  @ApiResponse({ status: 200, description: 'Office description retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async getOfficeDescriptionByType(
    @Param('type') type: OfficeDescriptionType,
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescriptionByType(type, lang);
  }

  @Get('introduction')
  @ApiOperation({ summary: 'Get office introduction (Public)' })
  @ApiResponse({ status: 200, description: 'Office introduction retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office introduction not found' })
  async getOfficeIntroduction(
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescriptionByType(
      OfficeDescriptionType.INTRODUCTION, 
      lang
    );
  }

  @Get('objective')
  @ApiOperation({ summary: 'Get office objective (Public)' })
  @ApiResponse({ status: 200, description: 'Office objective retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office objective not found' })
  async getOfficeObjective(
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescriptionByType(
      OfficeDescriptionType.OBJECTIVE, 
      lang
    );
  }

  @Get('work-details')
  @ApiOperation({ summary: 'Get office work details (Public)' })
  @ApiResponse({ status: 200, description: 'Office work details retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office work details not found' })
  async getOfficeWorkDetails(
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescriptionByType(
      OfficeDescriptionType.WORK_DETAILS, 
      lang
    );
  }

  @Get('organizational-structure')
  @ApiOperation({ summary: 'Get organizational structure (Public)' })
  @ApiResponse({ status: 200, description: 'Organizational structure retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Organizational structure not found' })
  async getOrganizationalStructure(
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescriptionByType(
      OfficeDescriptionType.ORGANIZATIONAL_STRUCTURE, 
      lang
    );
  }

  @Get('digital-charter')
  @ApiOperation({ summary: 'Get digital charter (Public)' })
  @ApiResponse({ status: 200, description: 'Digital charter retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Digital charter not found' })
  async getDigitalCharter(
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescriptionByType(
      OfficeDescriptionType.DIGITAL_CHARTER, 
      lang
    );
  }

  @Get('employee-sanctions')
  @ApiOperation({ summary: 'Get employee sanctions (Public)' })
  @ApiResponse({ status: 200, description: 'Employee sanctions retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Employee sanctions not found' })
  async getEmployeeSanctions(
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescriptionByType(
      OfficeDescriptionType.EMPLOYEE_SANCTIONS, 
      lang
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get office description by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Office description retrieved successfully', type: OfficeDescriptionResponseDto })
  @ApiResponse({ status: 404, description: 'Office description not found' })
  async getOfficeDescriptionById(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ): Promise<OfficeDescriptionResponseDto> {
    return await this.officeDescriptionService.getOfficeDescription(id);
  }
} 