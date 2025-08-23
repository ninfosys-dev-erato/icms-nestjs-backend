import { Controller, Get, Param, Query, HttpStatus, HttpException } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { EmployeeService } from '../services/employee.service';
import { 
  EmployeeQueryDto, 
  EmployeeResponseDto 
} from '../dto/hr.dto';

@ApiTags('Public Employees')
@Controller('employees')
export class PublicEmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async getAllEmployees(
    @Query() query?: EmployeeQueryDto
  ) {
    const result = await this.employeeService.getActiveEmployees(query);
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search employees' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async searchEmployees(
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
    const result = await this.employeeService.searchEmployees(q, rest);
    return result;
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Get employees by department' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  async getEmployeesByDepartment(
    @Param('departmentId') departmentId: string
  ) {
    // Check if department exists
    const employees = await this.employeeService.getEmployeesByDepartment(departmentId);
    if (!employees || employees.length === 0) {
      throw new HttpException('Department not found', HttpStatus.NOT_FOUND);
    }
    return employees;
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get employees by position' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
  async getEmployeesByPosition(
    @Param('position') position: string
  ) {
    const employees = await this.employeeService.getEmployeesByPosition(position);
    return employees;
  }

  @Get('photos')
  @ApiOperation({ summary: 'Get all employee photos' })
  @ApiResponse({ status: 200, description: 'Employee photos retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async getAllEmployeePhotos(
    @Query() query?: EmployeeQueryDto
  ) {
    const result = await this.employeeService.getAllEmployeePhotos(query);
    return result;
  }

  @Get('photos/search')
  @ApiOperation({ summary: 'Search employee photos' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async searchEmployeePhotos(
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
    const result = await this.employeeService.searchEmployeePhotos(q, rest);
    return result;
  }

  @Get('photos/statistics')
  @ApiOperation({ summary: 'Get employee photo statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getEmployeePhotoStatistics() {
    const statistics = await this.employeeService.getEmployeePhotoStatistics();
    return statistics;
  }

  @Get('department/:departmentId/photos')
  @ApiOperation({ summary: 'Get employee photos by department' })
  @ApiResponse({ status: 200, description: 'Employee photos retrieved successfully' })
  @ApiParam({ name: 'departmentId', description: 'Department ID' })
  async getEmployeePhotosByDepartment(
    @Param('departmentId') departmentId: string
  ) {
    const photos = await this.employeeService.getEmployeePhotosByDepartment(departmentId);
    return photos;
  }

  @Get('position/:position/photos')
  @ApiOperation({ summary: 'Get employee photos by position' })
  @ApiResponse({ status: 200, description: 'Employee photos retrieved successfully' })
  @ApiParam({ name: 'position', description: 'Position name' })
  async getEmployeePhotosByPosition(
    @Param('position') position: string
  ) {
    const photos = await this.employeeService.getEmployeePhotosByPosition(position);
    return photos;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  async getEmployeeById(
    @Param('id') id: string
  ) {
    try {
      const employee = await this.employeeService.getEmployeeById(id);
      return employee;
    } catch (error) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id/photo')
  @ApiOperation({ summary: 'Get employee photo' })
  @ApiResponse({ status: 200, description: 'Employee photo retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee or photo not found' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  async getEmployeePhoto(
    @Param('id') id: string
  ) {
    try {
      const photoData = await this.employeeService.getEmployeePhoto(id);
      return photoData;
    } catch (error) {
      throw new HttpException('Employee photo not found', HttpStatus.NOT_FOUND);
    }
  }
} 