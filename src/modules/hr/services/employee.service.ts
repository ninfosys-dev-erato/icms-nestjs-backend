import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MediaService } from '../../media/services/media.service';
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
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly mediaService: MediaService,
  ) {}

  async getEmployeeById(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return await this.transformToResponseDto(employee);
  }

  async getAllEmployees(query: EmployeeQueryDto): Promise<{
    data: EmployeeResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.employeeRepository.findAll(query);
    
    return {
      data: await Promise.all(result.data.map(employee => this.transformToResponseDto(employee))),
      pagination: result.pagination
    };
  }

  async getActiveEmployees(query: EmployeeQueryDto): Promise<{
    data: EmployeeResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.employeeRepository.findActive(query);
    
    return {
      data: await Promise.all(result.data.map(employee => this.transformToResponseDto(employee))),
      pagination: result.pagination
    };
  }

  async searchEmployees(searchTerm: string, query: EmployeeQueryDto): Promise<{
    data: EmployeeResponseDto[];
    pagination: PaginationInfo;
  }> {
    const result = await this.employeeRepository.search(searchTerm, query);
    
    return {
      data: await Promise.all(result.data.map(employee => this.transformToResponseDto(employee))),
      pagination: result.pagination
    };
  }

  async createEmployee(data: CreateEmployeeDto, userId: string): Promise<EmployeeResponseDto> {
    const validation = await this.validateEmployee(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    const employee = await this.employeeRepository.create(data, userId);
    return await this.transformToResponseDto(employee);
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
    return await this.transformToResponseDto(employee);
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
    return Promise.all(employees.map(employee => this.transformToResponseDto(employee)));
  }

  async getEmployeesByPosition(position: string): Promise<EmployeeResponseDto[]> {
    const employees = await this.employeeRepository.findByPosition(position);
    return Promise.all(employees.map(employee => this.transformToResponseDto(employee)));
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

  private async transformToResponseDto(employee: any): Promise<EmployeeResponseDto> {
    // Try to append a presigned URL to the photo if available
    let photoWithPresignedUrl = employee.photo;
    if (employee.photo && employee.photoMediaId) {
      try {
        const presignedUrl = await this.mediaService.generatePresignedUrl(
          employee.photoMediaId,
          'get',
          86400 // 24 hours
        );
        photoWithPresignedUrl = {
          ...employee.photo,
          presignedUrl,
        };
      } catch (_) {
        // ignore URL generation errors
      }
    }

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
      photoMediaId: employee.photoMediaId,
      photo: photoWithPresignedUrl,
      isActive: employee.isActive,
      department: employee.department,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    };
  }

  async uploadEmployeePhoto(
    id: string,
    file: Express.Multer.File,
    userId: string
  ): Promise<EmployeeResponseDto> {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    const metadata = {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: 'employees',
      altText: `Employee photo: ${existingEmployee.name?.en || 'Unnamed'}`,
      title: `Employee Photo`,
      description: `Photo for employee ${existingEmployee.name?.en || existingEmployee.id}`,
      tags: ['employee', 'photo', 'profile'],
      isPublic: true,
    } as any;

    const mediaResponse = await this.mediaService.uploadMedia(file, metadata, userId);
    if (!mediaResponse.success || !mediaResponse.data) {
      throw new BadRequestException('Failed to upload media: ' + (mediaResponse.message || 'Unknown error'));
    }

    // Delete old photo if exists
    if (existingEmployee.photoMediaId) {
      try {
        await this.mediaService.deleteMedia(existingEmployee.photoMediaId);
      } catch {
        // ignore
      }
    }

    const updated = await this.employeeRepository.update(
      id,
      { photoMediaId: mediaResponse.data.id } as any,
      userId
    );

    return await this.transformToResponseDto(updated);
  }

  async removeEmployeePhoto(id: string, userId: string): Promise<EmployeeResponseDto> {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    if (existingEmployee.photoMediaId) {
      try {
        await this.mediaService.deleteMedia(existingEmployee.photoMediaId);
      } catch {
        // ignore
      }
    }

    const updated = await this.employeeRepository.update(
      id,
      { photoMediaId: undefined } as any,
      userId
    );

    return await this.transformToResponseDto(updated);
  }

  async createEmployeeWithImage(
    file: Express.Multer.File,
    employeeData: any,
    userId: string
  ): Promise<EmployeeResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    // Helpers to parse fields from multipart form data
    const parseNumber = (val: any, fallback: number): number => {
      if (typeof val === 'number' && !isNaN(val)) return val;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? fallback : parsed;
    };
    const parseBoolean = (val: any, fallback = true): boolean => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') {
        const lowered = val.toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(lowered)) return true;
        if (['false', '0', 'no', 'off'].includes(lowered)) return false;
      }
      return fallback;
    };
    const buildTranslatable = (baseKey: string): any | undefined => {
      try {
        const raw = employeeData[baseKey];
        if (raw && typeof raw === 'string') {
          const s = raw.trim();
          if ((s.startsWith('{') && s.endsWith('}')) || s.includes('"en"')) {
            return JSON.parse(s);
          }
        }
      } catch (_) {}
      const en = employeeData[`${baseKey}[en]`] ?? employeeData[`${baseKey}.en`] ?? employeeData.en;
      const ne = employeeData[`${baseKey}[ne]`] ?? employeeData[`${baseKey}.ne`] ?? employeeData.ne;
      if (en || ne) return { en: en ?? '', ne: ne ?? '' };
      return undefined;
    };

    const createDto: CreateEmployeeDto = {
      name: buildTranslatable('name')!,
      departmentId: employeeData.departmentId,
      position: buildTranslatable('position')!,
      order: employeeData.order ? parseNumber(employeeData.order, 0) : 0,
      mobileNumber: employeeData.mobileNumber,
      telephone: employeeData.telephone,
      email: employeeData.email,
      roomNumber: employeeData.roomNumber,
      isActive: employeeData.isActive ? parseBoolean(employeeData.isActive, true) : true,
      photoMediaId: '' // will be set after media upload
    } as any;

    const validation = await this.validateEmployee(createDto);
    if (!validation.isValid) {
      throw new BadRequestException('Employee validation failed', { cause: validation.errors });
    }

    const metadata = {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: 'employees',
      altText: `Employee photo: ${createDto.name?.en || 'Unnamed'}`,
      title: 'Employee Photo',
      description: `Photo for employee ${createDto.name?.en || ''}`,
      tags: ['employee', 'photo', 'profile'],
      isPublic: true,
    } as any;

    const mediaResponse = await this.mediaService.uploadMedia(file, metadata, userId);
    if (!mediaResponse.success || !mediaResponse.data) {
      throw new BadRequestException('Failed to upload media: ' + (mediaResponse.message || 'Unknown error'));
    }

    createDto.photoMediaId = mediaResponse.data.id;

    const employee = await this.employeeRepository.create(createDto, userId);
    return await this.transformToResponseDto(employee);
  }
} 