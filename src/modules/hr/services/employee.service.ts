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
  PaginationInfo,
  PhotoValidationResult
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

  async bulkRemovePhotos(employeeIds: string[], userId: string): Promise<BulkOperationResult> {
    console.log('🗑️ Employee: Starting bulk photo removal process');
    console.log('  Employee IDs:', employeeIds);
    console.log('  User ID:', userId);

    const result: BulkOperationResult = { success: 0, failed: 0, errors: [] };

    for (const id of employeeIds) {
      try {
        await this.removeEmployeePhoto(id, userId);
        result.success++;
        console.log(`✅ Employee: Successfully removed photo for employee ${id}`);
      } catch (error) {
        result.failed++;
        const errorMessage = `Failed to remove photo for employee ${id}: ${error.message}`;
        result.errors.push(errorMessage);
        console.error(`❌ Employee: ${errorMessage}`);
      }
    }

    console.log('📊 Employee: Bulk photo removal completed');
    console.log('  Success:', result.success);
    console.log('  Failed:', result.failed);
    console.log('  Total errors:', result.errors.length);

    return result;
  }

  async getAllEmployeePhotos(query: EmployeeQueryDto): Promise<{
    data: Array<{ id: string; name: any; photo: any; presignedUrl?: string }>;
    pagination: PaginationInfo;
  }> {
    console.log('🖼️ Employee: Getting all employee photos');
    console.log('  Query:', query);

    const result = await this.employeeRepository.findAll(query);
    
    const photosWithUrls = await Promise.all(
      result.data.map(async (employee) => {
        let presignedUrl: string | undefined;
        
        if (employee.photoMediaId && employee.photo) {
          try {
            presignedUrl = await this.mediaService.generatePresignedUrl(
              employee.photoMediaId,
              'get',
              86400 // 24 hours expiration
            );
          } catch (error) {
            console.warn(`⚠️ Employee: Failed to generate presigned URL for employee ${employee.id}:`, error.message);
          }
        }

        return {
          id: employee.id,
          name: employee.name,
          photo: employee.photo,
          presignedUrl
        };
      })
    );

    console.log(`✅ Employee: Retrieved ${photosWithUrls.length} employee photos`);

    return {
      data: photosWithUrls,
      pagination: result.pagination
    };
  }

  async getEmployeePhotosByDepartment(departmentId: string): Promise<Array<{ id: string; name: any; photo: any; presignedUrl?: string }>> {
    console.log('🖼️ Employee: Getting employee photos by department');
    console.log('  Department ID:', departmentId);

    const employees = await this.employeeRepository.findByDepartment(departmentId);
    
    const photosWithUrls = await Promise.all(
      employees.map(async (employee) => {
        let presignedUrl: string | undefined;
        
        if (employee.photoMediaId && employee.photo) {
          try {
            presignedUrl = await this.mediaService.generatePresignedUrl(
              employee.photoMediaId,
              'get',
              86400 // 24 hours expiration
            );
          } catch (error) {
            console.warn(`⚠️ Employee: Failed to generate presigned URL for employee ${employee.id}:`, error.message);
          }
        }

        return {
          id: employee.id,
          name: employee.name,
          photo: employee.photo,
          presignedUrl
        };
      })
    );

    console.log(`✅ Employee: Retrieved ${photosWithUrls.length} employee photos for department ${departmentId}`);

    return photosWithUrls;
  }

  async getEmployeePhotosByPosition(position: string): Promise<Array<{ id: string; name: any; photo: any; presignedUrl?: string }>> {
    console.log('🖼️ Employee: Getting employee photos by position');
    console.log('  Position:', position);

    const employees = await this.employeeRepository.findByPosition(position);
    
    const photosWithUrls = await Promise.all(
      employees.map(async (employee) => {
        let presignedUrl: string | undefined;
        
        if (employee.photoMediaId && employee.photo) {
          try {
            presignedUrl = await this.mediaService.generatePresignedUrl(
              employee.photoMediaId,
              'get',
              86400 // 24 hours expiration
            );
          } catch (error) {
            console.warn(`⚠️ Employee: Failed to generate presigned URL for employee ${employee.id}:`, error.message);
          }
        }

        return {
          id: employee.id,
          name: employee.name,
          photo: employee.photo,
          presignedUrl
        };
      })
    );

    console.log(`✅ Employee: Retrieved ${photosWithUrls.length} employee photos for position ${position}`);

    return photosWithUrls;
  }

  async searchEmployeePhotos(searchTerm: string, query: EmployeeQueryDto): Promise<{
    data: Array<{ id: string; name: any; photo: any; presignedUrl?: string }>;
    pagination: PaginationInfo;
  }> {
    console.log('🔍 Employee: Searching employee photos');
    console.log('  Search term:', searchTerm);
    console.log('  Query:', query);

    const result = await this.employeeRepository.search(searchTerm, query);
    
    const photosWithUrls = await Promise.all(
      result.data.map(async (employee) => {
        let presignedUrl: string | undefined;
        
        if (employee.photoMediaId && employee.photo) {
          try {
            presignedUrl = await this.mediaService.generatePresignedUrl(
              employee.photoMediaId,
              'get',
              86400 // 24 hours expiration
            );
          } catch (error) {
            console.warn(`⚠️ Employee: Failed to generate presigned URL for employee ${employee.id}:`, error.message);
          }
        }

        return {
          id: employee.id,
          name: employee.name,
          photo: employee.photo,
          presignedUrl
        };
      })
    );

    console.log(`✅ Employee: Found ${photosWithUrls.length} employee photos for search term "${searchTerm}"`);

    return {
      data: photosWithUrls,
      pagination: result.pagination
    };
  }

  async getEmployeePhotoStatistics(): Promise<{
    totalEmployees: number;
    employeesWithPhotos: number;
    employeesWithoutPhotos: number;
    photoPercentage: number;
    photosByDepartment: Record<string, number>;
    photosByPosition: Record<string, number>;
  }> {
    console.log('📊 Employee: Getting employee photo statistics');

    // Get all employees to calculate statistics
    const allEmployees = await this.employeeRepository.findAll({ limit: 10000 }); // Get all employees
    
    const totalEmployees = allEmployees.pagination.total;
    const employeesWithPhotos = allEmployees.data.filter(emp => emp.photoMediaId).length;
    const employeesWithoutPhotos = totalEmployees - employeesWithPhotos;
    const photoPercentage = totalEmployees > 0 ? (employeesWithPhotos / totalEmployees) * 100 : 0;

    // Group photos by department
    const photosByDepartment: Record<string, number> = {};
    const departmentGroups = new Map<string, number>();
    
    for (const emp of allEmployees.data) {
      if (emp.photoMediaId && emp.department?.departmentName?.en) {
        const deptName = emp.department.departmentName.en;
        departmentGroups.set(deptName, (departmentGroups.get(deptName) || 0) + 1);
      }
    }
    
    for (const [deptName, count] of departmentGroups) {
      photosByDepartment[deptName] = count;
    }

    // Group photos by position
    const photosByPosition: Record<string, number> = {};
    const positionGroups = new Map<string, number>();
    
    for (const emp of allEmployees.data) {
      if (emp.photoMediaId && emp.position?.en) {
        const posName = emp.position.en;
        positionGroups.set(posName, (positionGroups.get(posName) || 0) + 1);
      }
    }
    
    for (const [posName, count] of positionGroups) {
      photosByPosition[posName] = count;
    }

    const stats = {
      totalEmployees,
      employeesWithPhotos,
      employeesWithoutPhotos,
      photoPercentage: Math.round(photoPercentage * 100) / 100,
      photosByDepartment,
      photosByPosition
    };

    console.log('✅ Employee: Photo statistics generated');
    console.log('  Total employees:', totalEmployees);
    console.log('  Employees with photos:', employeesWithPhotos);
    console.log('  Photo percentage:', stats.photoPercentage + '%');

    return stats;
  }

  async exportEmployeePhotos(query: EmployeeQueryDto, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Buffer> {
    console.log('📤 Employee: Exporting employee photos');
    console.log('  Format:', format);
    console.log('  Query:', query);

    const result = await this.employeeRepository.findAll(query);
    
    // Transform data to include photo information
    const photoData = result.data.map(emp => ({
      id: emp.id,
      name: emp.name,
      department: emp.department?.departmentName,
      position: emp.position,
      hasPhoto: !!emp.photoMediaId,
      photoUrl: emp.photo?.url || null,
      photoSize: emp.photo?.size || null,
      photoType: emp.photo?.mimetype || null,
      isActive: emp.isActive,
      createdAt: emp.createdAt,
      updatedAt: emp.updatedAt
    }));

    if (format === 'json') {
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalEmployees: result.pagination.total,
          employeesWithPhotos: photoData.filter(emp => emp.hasPhoto).length,
          format: 'json'
        },
        data: photoData,
        pagination: result.pagination
      };
      
      return Buffer.from(JSON.stringify(exportData, null, 2));
    }
    
    // TODO: Implement CSV and PDF export
    throw new BadRequestException('Export format not implemented yet');
  }

  private async transformToResponseDto(employee: any): Promise<EmployeeResponseDto> {
    // Try to append a presigned URL to the photo if available
    let photoWithPresignedUrl = employee.photo;
    if (employee.photo && employee.photoMediaId) {
      try {
        console.log('🖼️ Employee: Generating presigned URL for photo');
        console.log('  Photo media ID:', employee.photoMediaId);
        
        const presignedUrl = await this.mediaService.generatePresignedUrl(
          employee.photoMediaId,
          'get',
          86400 // 24 hours expiration
        );
        
        photoWithPresignedUrl = {
          ...employee.photo,
          presignedUrl,
        };
        
        console.log('✅ Employee: Presigned URL generated successfully');
        console.log('  Presigned URL length:', presignedUrl?.length || 0);
      } catch (error) {
        console.warn('⚠️ Employee: Failed to generate presigned URL for photo:', error.message);
        // Continue without presigned URL
      }
    } else {
      console.log('ℹ️ Employee: No photo to generate presigned URL for');
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
    console.log('🔄 Employee: Starting photo upload process');
    console.log('  Employee ID:', id);
    console.log('  User ID:', userId);

    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type - only images allowed for employee photos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed for employee photos');
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    console.log('✅ Employee: File validation passed');
    console.log('  File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer?.length
    });

    // Upload to media service (which uses Backblaze)
    const metadata = {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: 'employees', // This will create the employees folder in Backblaze
      altText: `Employee photo: ${existingEmployee.name?.en || 'Unnamed'}`,
      title: `Employee Photo`,
      description: `Photo for employee ${existingEmployee.name?.en || existingEmployee.id}`,
      tags: ['employee', 'photo', 'profile'],
      isPublic: true,
    };

    console.log('📤 Employee: Calling media service with metadata:', metadata);

    const mediaResponse = await this.mediaService.uploadMedia(file, metadata, userId);

    console.log('📥 Employee: Media service response received');
    console.log('  Media response success:', mediaResponse.success);
    console.log('  Media response data exists:', !!mediaResponse.data);

    if (!mediaResponse.success || !mediaResponse.data) {
      throw new BadRequestException('Failed to upload media: ' + (mediaResponse.message || 'Unknown error'));
    }

    console.log('💾 Employee: Updating employee with media ID');
    console.log('  Media ID to store:', mediaResponse.data.id);
    console.log('  Current photoMediaId:', existingEmployee.photoMediaId);

    // Delete old photo if it exists
    if (existingEmployee.photoMediaId) {
      try {
        console.log('🗑️ Employee: Removing old employee photo');
        console.log('  Old photoMediaId:', existingEmployee.photoMediaId);
        await this.mediaService.deleteMedia(existingEmployee.photoMediaId);
        console.log('✅ Employee: Old photo deleted from media service');
      } catch (error) {
        console.warn('⚠️ Employee: Failed to delete old photo from media service:', error.message);
        // Continue with the update even if old media deletion fails
      }
    }

    // Update employee with the new media ID
    const updateData = {
      photoMediaId: mediaResponse.data.id
    };

    console.log('🔧 Employee: Update data being passed to repository:', updateData);

    let employee;
    try {
      employee = await this.employeeRepository.update(id, updateData, userId);
      console.log('✅ Employee: Repository update successful');
    } catch (error) {
      console.error('❌ Employee: Repository update failed:', error);
      throw new BadRequestException('Failed to update employee: ' + error.message);
    }

    console.log('✅ Employee: Photo uploaded successfully');
    console.log('  Media ID:', mediaResponse.data.id);
    console.log('  Media URL:', mediaResponse.data.url);
    console.log('  Stored in photoMediaId:', employee.photoMediaId);

    console.log('🔄 Employee: Transforming to response DTO...');
    const responseDto = await this.transformToResponseDto(employee);
    console.log('✅ Employee: Response DTO created');

    return responseDto;
  }

  async removeEmployeePhoto(id: string, userId: string): Promise<EmployeeResponseDto> {
    console.log('🗑️ Employee: Starting photo removal process');
    console.log('  Employee ID:', id);
    console.log('  User ID:', userId);

    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundException('Employee not found');
    }

    // If there's an existing photo, delete it from media service
    if (existingEmployee.photoMediaId) {
      try {
        console.log('🗑️ Employee: Removing employee photo');
        console.log('  Current photoMediaId:', existingEmployee.photoMediaId);
        
        // Delete the media from the media service
        await this.mediaService.deleteMedia(existingEmployee.photoMediaId);
        console.log('✅ Employee: Photo deleted from media service');
      } catch (error) {
        console.warn('⚠️ Employee: Failed to delete photo from media service:', error.message);
        // Continue with the removal even if media deletion fails
      }
    } else {
      console.log('ℹ️ Employee: No photo to remove');
    }

    // Update employee to remove photo reference
    const updateData = {
      photoMediaId: undefined as unknown as string,
    };

    console.log('🔧 Employee: Update data being passed to repository:', updateData);

    let employee;
    try {
      employee = await this.employeeRepository.update(id, updateData as any, userId);
      console.log('✅ Employee: Repository update successful');
    } catch (error) {
      console.error('❌ Employee: Repository update failed:', error);
      throw new BadRequestException('Failed to update employee: ' + error.message);
    }

    console.log('✅ Employee: Photo removed successfully');

    return await this.transformToResponseDto(employee);
  }

  async createEmployeeWithImage(
    file: Express.Multer.File,
    employeeData: any,
    userId: string
  ): Promise<EmployeeResponseDto> {
    console.log('🔄 Employee: Creating employee with image upload');
    console.log('  User ID:', userId);
    console.log('  Employee data received:', employeeData);
    console.log('  Employee data type:', typeof employeeData);
    console.log('  Employee data keys:', Object.keys(employeeData || {}));
    
    // Log each field individually to debug parsing issues
    if (employeeData) {
      Object.entries(employeeData).forEach(([key, value]) => {
        console.log(`  ${key}:`, value, `(type: ${typeof value})`);
      });
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type - only images allowed for employee photos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed for employee photos');
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    console.log('✅ Employee: File validation passed');
    console.log('  File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

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
      console.log(`🔍 Building translatable for key: ${baseKey}`);
      
      // Try direct key first
      const directValue = employeeData[baseKey];
      console.log(`  Direct value for ${baseKey}:`, directValue);
      
      if (directValue) {
        // If it's already an object with en/ne properties
        if (typeof directValue === 'object' && directValue.en !== undefined && directValue.ne !== undefined) {
          console.log(`  ✅ Found object with en/ne for ${baseKey}:`, directValue);
          return directValue;
        }
        
        // If it's a JSON string
        if (typeof directValue === 'string') {
          try {
            const parsed = JSON.parse(directValue.trim());
            if (parsed && typeof parsed === 'object' && parsed.en !== undefined && parsed.ne !== undefined) {
              console.log(`  ✅ Parsed JSON for ${baseKey}:`, parsed);
              return parsed;
            }
          } catch (e) {
            console.log(`  ❌ Failed to parse JSON for ${baseKey}:`, e.message);
          }
        }
      }
      
      // Try bracket notation (e.g., name[en], name[ne])
      const en = employeeData[`${baseKey}[en]`];
      const ne = employeeData[`${baseKey}[ne]`];
      console.log(`  Bracket notation - en: ${en}, ne: ${ne}`);
      
      if (en || ne) {
        const result = { en: en ?? '', ne: ne ?? '' };
        console.log(`  ✅ Using bracket notation for ${baseKey}:`, result);
        return result;
      }
      
      // Try dot notation (e.g., name.en, name.ne)
      const enDot = employeeData[`${baseKey}.en`];
      const neDot = employeeData[`${baseKey}.ne`];
      console.log(`  Dot notation - en: ${enDot}, ne: ${neDot}`);
      
      if (enDot || neDot) {
        const result = { en: enDot ?? '', ne: neDot ?? '' };
        console.log(`  ✅ Using dot notation for ${baseKey}:`, result);
        return result;
      }
      
      // Try fallback to root level en/ne
      const rootEn = employeeData.en;
      const rootNe = employeeData.ne;
      console.log(`  Root level - en: ${rootEn}, ne: ${rootNe}`);
      
      if (rootEn || rootNe) {
        const result = { en: rootEn ?? '', ne: rootNe ?? '' };
        console.log(`  ✅ Using root level for ${baseKey}:`, result);
        return result;
      }
      
      console.log(`  ❌ No translatable data found for ${baseKey}`);
      return undefined;
    };

    // Build required fields with validation
    const name = buildTranslatable('name');
    const position = buildTranslatable('position');
    
    if (!name || !name.en || !name.ne) {
      throw new BadRequestException('Employee name is required in both English and Nepali');
    }
    
    if (!position || !position.en || !position.ne) {
      throw new BadRequestException('Employee position is required in both English and Nepali');
    }
    
    if (!employeeData.departmentId) {
      throw new BadRequestException('Department ID is required');
    }

    const createDto: CreateEmployeeDto = {
      name,
      departmentId: employeeData.departmentId,
      position,
      order: employeeData.order ? parseNumber(employeeData.order, 0) : 0,
      mobileNumber: employeeData.mobileNumber,
      telephone: employeeData.telephone,
      email: employeeData.email,
      roomNumber: employeeData.roomNumber,
      isActive: employeeData.isActive ? parseBoolean(employeeData.isActive, true) : true,
      photoMediaId: '' // will be set after media upload
    } as any;

    console.log('📝 Employee: Parsed employee data:', createDto);

    const validation = await this.validateEmployee(createDto);
    if (!validation.isValid) {
      throw new BadRequestException('Employee validation failed', { cause: validation.errors });
    }

    console.log('📤 Employee: Uploading image to media service');
    const metadata = {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      folder: 'employees', // This will use the EMPLOYEES folder from MediaFolder enum
      altText: `Employee photo: ${createDto.name?.en || 'Unnamed'}`,
      title: 'Employee Photo',
      description: `Photo for employee ${createDto.name?.en || ''}`,
      tags: ['employee', 'photo', 'profile'],
      isPublic: true,
    };

    console.log('📤 Employee: Media service metadata:', metadata);

    const mediaResponse = await this.mediaService.uploadMedia(file, metadata, userId);

    console.log('📥 Employee: Media service response received');
    console.log('  Media response success:', mediaResponse.success);
    console.log('  Media response data exists:', !!mediaResponse.data);

    if (!mediaResponse.success || !mediaResponse.data) {
      throw new BadRequestException('Failed to upload media: ' + (mediaResponse.message || 'Unknown error'));
    }

    console.log('📥 Employee: Image uploaded successfully, creating employee');
    console.log('  Media ID:', mediaResponse.data.id);
    console.log('  Media URL:', mediaResponse.data.url);

    // Set the photoMediaId from the uploaded image
    createDto.photoMediaId = mediaResponse.data.id;

    // Create the employee
    const employee = await this.employeeRepository.create(createDto, userId);

    console.log('✅ Employee: Created successfully with image');
    console.log('  Employee ID:', employee.id);
    console.log('  Media ID:', mediaResponse.data.id);

    return await this.transformToResponseDto(employee);
  }

  async getEmployeePhoto(id: string): Promise<{ photo: any; presignedUrl?: string }> {
    console.log('🖼️ Employee: Getting employee photo');
    console.log('  Employee ID:', id);

    const employee = await this.employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (!employee.photoMediaId || !employee.photo) {
      console.log('ℹ️ Employee: No photo found for employee');
      return { photo: null };
    }

    try {
      console.log('🖼️ Employee: Generating presigned URL for photo');
      console.log('  Photo media ID:', employee.photoMediaId);
      
      const presignedUrl = await this.mediaService.generatePresignedUrl(
        employee.photoMediaId,
        'get',
        86400 // 24 hours expiration
      );
      
      console.log('✅ Employee: Presigned URL generated successfully');
      console.log('  Presigned URL length:', presignedUrl?.length || 0);
      
      return {
        photo: employee.photo,
        presignedUrl
      };
    } catch (error) {
      console.warn('⚠️ Employee: Failed to generate presigned URL for photo:', error.message);
      return {
        photo: employee.photo
      };
    }
  }

  async validatePhotoFile(file: Express.Multer.File): Promise<PhotoValidationResult> {
    console.log('🔍 Employee: Validating photo file');
    console.log('  File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Check if file exists
    if (!file) {
      return {
        isValid: false,
        message: 'No file uploaded',
        code: 'NO_FILE'
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        message: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed for employee photos',
        code: 'INVALID_FILE_TYPE'
      };
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        message: 'File size too large. Maximum size is 10MB',
        code: 'FILE_TOO_LARGE'
      };
    }

    // Validate file buffer
    if (!file.buffer || file.buffer.length === 0) {
      return {
        isValid: false,
        message: 'File buffer is empty or corrupted',
        code: 'EMPTY_BUFFER'
      };
    }

    console.log('✅ Employee: Photo file validation passed');

    return {
      isValid: true
    };
  }

  async getEmployeePhotoAnalytics(employeeId: string, dateFrom?: Date, dateTo?: Date): Promise<{
    employeeId: string;
    employeeName: any;
    photoInfo: {
      hasPhoto: boolean;
      photoSize?: number;
      photoType?: string;
      photoUrl?: string;
      uploadDate?: Date;
    };
    usage: {
      totalViews: number;
      totalDownloads: number;
      lastAccessed?: Date;
    };
    trends: {
      viewsByDate: Record<string, number>;
      downloadsByDate: Record<string, number>;
    };
  }> {
    console.log('📊 Employee: Getting employee photo analytics');
    console.log('  Employee ID:', employeeId);
    console.log('  Date range:', { dateFrom, dateTo });

    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Get photo information
    const photoInfo = {
      hasPhoto: !!employee.photoMediaId,
      photoSize: employee.photo?.size,
      photoType: employee.photo?.mimetype,
      photoUrl: employee.photo?.url,
      uploadDate: employee.photo?.createdAt
    };

    // TODO: Implement actual analytics tracking
    // For now, return mock data
    const usage = {
      totalViews: 0,
      totalDownloads: 0,
      lastAccessed: undefined
    };

    const trends = {
      viewsByDate: {},
      downloadsByDate: {}
    };

    const analytics = {
      employeeId: employee.id,
      employeeName: employee.name,
      photoInfo,
      usage,
      trends
    };

    console.log('✅ Employee: Photo analytics generated');
    console.log('  Has photo:', photoInfo.hasPhoto);
    console.log('  Photo size:', photoInfo.photoSize);

    return analytics;
  }
} 