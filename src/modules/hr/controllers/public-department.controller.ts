import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { DepartmentService } from '../services/department.service';
import { 
  DepartmentQueryDto, 
  DepartmentResponseDto 
} from '../dto/hr.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Public Departments')
@Controller('departments')
export class PublicDepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  async getAllDepartments(
    @Res() response: Response,
    @Query() query?: DepartmentQueryDto
  ): Promise<void> {
    try {
      const result = await this.departmentService.getActiveDepartments(query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENTS_RETRIEVAL_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get department hierarchy' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getDepartmentHierarchy(
    @Res() response: Response
  ): Promise<void> {
    try {
      const hierarchy = await this.departmentService.getDepartmentHierarchy();
      
      const apiResponse = ApiResponseBuilder.success(hierarchy);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_HIERARCHY_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search departments' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchDepartments(
    @Res() response: Response,
    @Query('q') searchTerm: string,
    @Query() query?: DepartmentQueryDto
  ): Promise<void> {
    try {
      const result = await this.departmentService.searchDepartments(searchTerm, query);
      
      const apiResponse = ApiResponseBuilder.paginated(result.data, result.pagination);

      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_SEARCH_ERROR',
        error.message
      );

      response.status(500).json(apiResponse);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  async getDepartmentById(
    @Res() response: Response,
    @Param('id') id: string
  ): Promise<void> {
    try {
      const department = await this.departmentService.getDepartmentById(id);
      
      const apiResponse = ApiResponseBuilder.success(department);

      response.status(200).json(apiResponse);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      const apiResponse = ApiResponseBuilder.error(
        'DEPARTMENT_NOT_FOUND',
        error.message
      );

      response.status(status).json(apiResponse);
    }
  }
} 