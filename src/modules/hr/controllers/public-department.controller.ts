import { Controller, Get, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
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
  @ApiResponse({ status: 200, description: 'Department hierarchy retrieved successfully' })
  async getDepartmentHierarchy() {
    const hierarchy = await this.departmentService.getDepartmentHierarchy();
    return hierarchy;
  }

  @Get('with-employees')
  @ApiOperation({ summary: 'Get all departments with their employees ordered by display order' })
  @ApiResponse({ status: 200, description: 'Departments with employees retrieved successfully' })
  async getDepartmentsWithEmployeesOrdered() {
    const result = await this.departmentService.getDepartmentsWithEmployeesOrdered();
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search departments' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async searchDepartments(
    @Query('q') q: string,
    @Query() query: any
  ) {
    if (!q) {
      throw new HttpException('Search term is required', HttpStatus.BAD_REQUEST);
    }
    // Remove 'q' from query before passing to DTO
    const { q: _q, ...rest } = query;
    // Sanitize pagination
    rest.page = rest.page && rest.page > 0 ? Number(rest.page) : 1;
    rest.limit = rest.limit && rest.limit > 0 ? Number(rest.limit) : 10;
    // Convert isActive to boolean if provided
    if (rest.isActive !== undefined) {
      rest.isActive = rest.isActive === 'true' || rest.isActive === true;
    }
    const result = await this.departmentService.searchDepartments(q, rest);
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
    try {
      const department = await this.departmentService.getDepartmentById(id);
      return department;
    } catch (error) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }
  }
} 