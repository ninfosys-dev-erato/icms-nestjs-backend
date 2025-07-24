import { Controller, Get, Param, Query } from '@nestjs/common';
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
    @Query() query?: DepartmentQueryDto
  ) {
    const result = await this.departmentService.getActiveDepartments(query);
    return result;
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get department hierarchy' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getDepartmentHierarchy() {
    const hierarchy = await this.departmentService.getDepartmentHierarchy();
    return hierarchy;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search departments' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'search', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchDepartments(
    @Query() query: DepartmentQueryDto
  ) {
    if (!query.search) {
      throw new Error('Search term is required');
    }

    const result = await this.departmentService.searchDepartments(query.search, query);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  async getDepartmentById(
    @Param('id') id: string
  ) {
    const department = await this.departmentService.getDepartmentById(id);
    return department;
  }
} 