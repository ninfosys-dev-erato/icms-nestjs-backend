import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EmployeeRepository } from '../repositories/employee.repository';
import { 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  EmployeeQueryDto,
  EmployeeResponseDto,
  ValidationResult,
  ValidationError,
  BulkOperationResult,
  PaginationInfo
} from '../dto/hr.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async getEmployeeById(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.transformToResponseDto(employee);
  }

  async getAllEmployees(query: EmployeeQueryDto): Promise<{
    data: EmployeeResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.employeeRepository.findAll(query);
    
    return {
      data: result.data.map(employee => this.transformToResponseDto(employee)),
      pagination: result.pagination
    };
  }

  async getActiveEmployees(query: EmployeeQueryDto): Promise<{
    data: EmployeeResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.employeeRepository.findActive(query);
    
    return {
      data: result.data.map(employee => this.transformToResponseDto(employee)),
      pagination: result.pagination
    };
  }

  async searchEmployees(searchTerm: string, query: EmployeeQueryDto): Promise<{
    data: EmployeeResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.employeeRepository.search(searchTerm, query);
    
    return {
      data: result.data.map(employee => this.transformToResponseDto(employee)),
      pagination: result.pagination
    };
  }

  async createEmployee(data: CreateEmployeeDto, userId: string): Promise<EmployeeResponseDto> {
    const validation = await this.validateEmployee(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const employee = await this.employeeRepository.create(data, userId);
    return this.transformToResponseDto(employee);
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto, userId: string): Promise<EmployeeResponseDto> {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    const validation = await this.validateEmployee(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const employee = await this.employeeRepository.update(id, data, userId);
    return this.transformToResponseDto(employee);
  }

  async deleteEmployee(id: string): Promise<void> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.employeeRepository.delete(id);
  }

  async getEmployeesByDepartment(departmentId: string): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.findByDepartment(departmentId);
    return employees.map(employee => this.transformToResponseDto(employee));
  }

  async getEmployeesByPosition(position: string): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.findByPosition(position);
    return employees.map(employee => this.transformToResponseDto(employee));
  }

  async validateEmployee(data: CreateEmployeeDto | UpdateEmployeeDto): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate employee name
    if ('name' in data && data.name) {
      if (!data.name.en || !data.name.ne) {
        errors.push({
          field: 'name',
          message: 'Employee name must be provided in both English and Nepali',
          code: 'INVALID_EMPLOYEE_NAME'
        });
      }
    }

    // Validate position
    if ('position' in data && data.position) {
      if (!data.position.en || !data.position.ne) {
        errors.push({
          field: 'position',
          message: 'Position must be provided in both English and Nepali',
          code: 'INVALID_POSITION'
        });
      }
    }

    // Validate department ID
    if ('departmentId' in data && data.departmentId) {
      if (typeof data.departmentId !== 'string' || data.departmentId.trim() === '') {
        errors.push({
          field: 'departmentId',
          message: 'Department ID must be a valid string',
          code: 'INVALID_DEPARTMENT_ID'
        });
      }
    }

    // Validate email format
    if ('email' in data && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push({
          field: 'email',
          message: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT'
        });
      }
    }

    // Validate phone numbers
    if ('mobileNumber' in data && data.mobileNumber) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(data.mobileNumber)) {
        errors.push({
          field: 'mobileNumber',
          message: 'Invalid mobile number format',
          code: 'INVALID_MOBILE_NUMBER'
        });
      }
    }

    if ('telephone' in data && data.telephone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(data.telephone)) {
        errors.push({
          field: 'telephone',
          message: 'Invalid telephone number format',
          code: 'INVALID_TELEPHONE_NUMBER'
        });
      }
    }

    // Validate order
    if ('order' in data && data.order !== undefined) {
      if (data.order < 0) {
        errors.push({
          field: 'order',
          message: 'Order must be a non-negative number',
          code: 'INVALID_ORDER'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async exportEmployees(query: EmployeeQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.employeeRepository.findAll(query);
    
    if (format === 'json') {
      return Buffer.from(JSON.stringify(result.data, null, 2));
    }
    
    // TODO: Implement CSV and PDF export
    throw new BadRequestException('Export format not implemented yet');
  }

  async importEmployees(file: Express.Multer.File, userId: string): Promise<{ success: number; failed: number; errors: string[] }> {
    // TODO: Implement import functionality
    throw new BadRequestException('Import functionality not implemented yet');
  }

  async bulkActivate(ids: string[], userId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.updateEmployee(id, { isActive: true }, userId);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to activate employee ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDeactivate(ids: string[], userId: string): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.updateEmployee(id, { isActive: false }, userId);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to deactivate employee ${id}: ${error.message}`);
      }
    }

    return result;
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of ids) {
      try {
        await this.deleteEmployee(id);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to delete employee ${id}: ${error.message}`);
      }
    }

    return result;
  }

  private transformToResponseDto(employee: any): EmployeeResponseDto {
    return {
      id: employee.id,
      name: employee.name,
      departmentId: employee.departmentId,
      position: employee.position,
      order: employee.order,
      mobileNumber: employee.mobileNumber,
      telephone: employee.telephone,
      email: employee.email,
      roomNumber: employee.roomNumber,
      isActive: employee.isActive,
      department: employee.department,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }
} 