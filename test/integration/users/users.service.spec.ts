import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../../../src/modules/users/users.service';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { UserSessionRepository } from '../../../src/modules/auth/repositories/user-session.repository';
import { AuditLogRepository } from '../../../src/modules/auth/repositories/audit-log.repository';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UserQueryDto,
  UserResponseDto,
  UserStatistics,
  UserActivityDto,
  BulkOperationResult,
  ValidationResult,
  PaginatedUserResult,
  UserProfileDto,
  UpdateUserProfileDto,
  ImportResult
} from '../../../src/modules/users/dto/users.dto';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepository;
  let userSessionRepository: UserSessionRepository;
  let auditLogRepository: AuditLogRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findAll: jest.fn(),
            findActive: jest.fn(),
            findByRole: jest.fn(),
            search: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            activate: jest.fn(),
            deactivate: jest.fn(),
            updateRole: jest.fn(),
            validateUser: jest.fn(),
            getStatistics: jest.fn(),
            getRecentActivity: jest.fn(),
            bulkActivate: jest.fn(),
            bulkDeactivate: jest.fn(),
            bulkDelete: jest.fn(),
          },
        },
        {
          provide: UserSessionRepository,
          useValue: {
            deactivateAllUserSessions: jest.fn(),
          },
        },
        {
          provide: AuditLogRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    userSessionRepository = module.get<UserSessionRepository>(UserSessionRepository);
    auditLogRepository = module.get<AuditLogRepository>(AuditLogRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN' as UserRole,
        isActive: true,
        isEmailVerified: true,
        phoneNumber: '+1234567890',
        avatarUrl: 'https://example.com/avatar.jpg',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById('test-user-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-user-id');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.role).toBe('ADMIN');
      expect(usersRepository.findById).toHaveBeenCalledWith('test-user-id');
    });

    it('should throw error when user not found', async () => {
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserById('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('getAllUsers', () => {
    it('should get all users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          password: '$2b$10$hashedpassword',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN' as UserRole,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          password: '$2b$10$hashedpassword',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'EDITOR' as UserRole,
          isActive: true,
          isEmailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (usersRepository.findAll as jest.Mock).mockResolvedValue(mockResult);

      const query: UserQueryDto = { page: 1, limit: 10 };
      const result = await service.getAllUsers(query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(2);
      expect(result.pagination).toEqual(mockResult.pagination);
      expect(usersRepository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getActiveUsers', () => {
    it('should get active users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'active@example.com',
          firstName: 'Active',
          lastName: 'User',
          role: 'VIEWER' as UserRole,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (usersRepository.findActive as jest.Mock).mockResolvedValue(mockResult);

      const query: UserQueryDto = { page: 1, limit: 10 };
      const result = await service.getActiveUsers(query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(usersRepository.findActive).toHaveBeenCalledWith(query);
    });
  });

  describe('getUsersByRole', () => {
    it('should get users by role', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN' as UserRole,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (usersRepository.findByRole as jest.Mock).mockResolvedValue(mockResult);

      const query: UserQueryDto = { page: 1, limit: 10 };
      const result = await service.getUsersByRole('ADMIN', query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(usersRepository.findByRole).toHaveBeenCalledWith('ADMIN', query);
    });
  });

  describe('searchUsers', () => {
    it('should search users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'searchable@example.com',
          firstName: 'Searchable',
          lastName: 'User',
          role: 'VIEWER' as UserRole,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (usersRepository.search as jest.Mock).mockResolvedValue(mockResult);

      const searchTerm = 'searchable';
      const query: UserQueryDto = { page: 1, limit: 10 };
      const result = await service.searchUsers(searchTerm, query);

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(usersRepository.search).toHaveBeenCalledWith(searchTerm, query);
    });
  });

  describe('createUser', () => {
    it('should create user', async () => {
      const createData: CreateUserDto = {
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'VIEWER',
        isActive: true,
      };

      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        email: 'new@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'New',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);
      (usersRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.createUser(createData);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-user-id');
      expect(result.email).toBe('new@example.com');
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createData,
        password: expect.any(String), // hashed password
      });
      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it('should fail with validation errors', async () => {
      const createData: CreateUserDto = {
        email: 'invalid@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
      };

      const mockValidation: ValidationResult = {
        isValid: false,
        errors: [
          { field: 'password', message: 'Password too short', code: 'PASSWORD_TOO_SHORT' },
        ],
      };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);

      await expect(service.createUser(createData)).rejects.toThrow(BadRequestException);
    });

    it('should fail when user already exists', async () => {
      const createData: CreateUserDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
      };

      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
      };

      const mockExistingUser = {
        id: 'existing-id',
        email: 'existing@example.com',
      };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);
      (usersRepository.findByEmail as jest.Mock).mockResolvedValue(mockExistingUser);

      await expect(service.createUser(createData)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updateData: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        role: 'EDITOR',
      };

      const mockExistingUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Original',
        lastName: 'Name',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockExistingUser,
        ...updateData,
        role: 'EDITOR' as UserRole,
      };

      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockExistingUser);
      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);
      (usersRepository.update as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.updateUser('test-user-id', updateData);

      expect(result).toBeDefined();
      expect(result.firstName).toBe('Updated');
      expect(result.role).toBe('EDITOR');
      expect(usersRepository.update).toHaveBeenCalledWith('test-user-id', updateData);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      const updateData: UpdateUserDto = {
        firstName: 'Updated',
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.updateUser('non-existent-id', updateData)).rejects.toThrow('User not found');
    });

    it('should fail with validation errors', async () => {
      const updateData: UpdateUserDto = {
        firstName: '', // Invalid
      };

      const mockExistingUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Original',
        lastName: 'Name',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockValidation: ValidationResult = {
        isValid: false,
        errors: [
          { field: 'firstName', message: 'First name required', code: 'REQUIRED' },
        ],
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockExistingUser);
      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);

      await expect(service.updateUser('test-user-id', updateData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userSessionRepository.deactivateAllUserSessions as jest.Mock).mockResolvedValue(undefined);
      (usersRepository.delete as jest.Mock).mockResolvedValue(undefined);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      await service.deleteUser('test-user-id');

      expect(usersRepository.findById).toHaveBeenCalledWith('test-user-id');
      expect(userSessionRepository.deactivateAllUserSessions).toHaveBeenCalledWith('test-user-id');
      expect(usersRepository.delete).toHaveBeenCalledWith('test-user-id');
      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteUser('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
        isActive: false,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockActivatedUser = {
        ...mockUser,
        isActive: true,
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (usersRepository.activate as jest.Mock).mockResolvedValue(mockActivatedUser);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.activateUser('test-user-id');

      expect(result).toBeDefined();
      expect(result.isActive).toBe(true);
      expect(usersRepository.activate).toHaveBeenCalledWith('test-user-id');
      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.activateUser('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDeactivatedUser = {
        ...mockUser,
        isActive: false,
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userSessionRepository.deactivateAllUserSessions as jest.Mock).mockResolvedValue(undefined);
      (usersRepository.deactivate as jest.Mock).mockResolvedValue(mockDeactivatedUser);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.deactivateUser('test-user-id');

      expect(result).toBeDefined();
      expect(result.isActive).toBe(false);
      expect(userSessionRepository.deactivateAllUserSessions).toHaveBeenCalledWith('test-user-id');
      expect(usersRepository.deactivate).toHaveBeenCalledWith('test-user-id');
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockUser,
        role: 'ADMIN' as UserRole,
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (usersRepository.updateRole as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.updateUserRole('test-user-id', 'ADMIN');

      expect(result).toBeDefined();
      expect(result.role).toBe('ADMIN');
      expect(usersRepository.updateRole).toHaveBeenCalledWith('test-user-id', 'ADMIN');
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const validData: CreateUserDto = {
        email: 'valid@example.com',
        password: 'ValidPassword123!',
        firstName: 'Valid',
        lastName: 'User',
        role: 'VIEWER',
      };

      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
      };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);

      const result = await service.validateUser(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors', async () => {
      const invalidData: CreateUserDto = {
        email: 'invalid@example.com',
        password: '123',
        firstName: '',
        lastName: 'User',
        role: 'VIEWER',
      };

      const mockValidation: ValidationResult = {
        isValid: false,
        errors: [
          { field: 'password', message: 'Password too short', code: 'PASSWORD_TOO_SHORT' },
          { field: 'firstName', message: 'First name required', code: 'REQUIRED' },
        ],
      };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);

      const result = await service.validateUser(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(2);
    });
  });

  describe('getUserStatistics', () => {
    it('should get user statistics', async () => {
      const mockStatistics: UserStatistics = {
        total: 100,
        active: 85,
        byRole: { ADMIN: 10, EDITOR: 25, VIEWER: 65 },
        verified: 80,
        unverified: 20,
        recentRegistrations: 15,
        recentLogins: 40,
      };

      (usersRepository.getStatistics as jest.Mock).mockResolvedValue(mockStatistics);

      const result = await service.getUserStatistics();

      expect(result).toEqual(mockStatistics);
      expect(usersRepository.getStatistics).toHaveBeenCalled();
    });
  });

  describe('getRecentActivity', () => {
    it('should get recent user activity', async () => {
      const mockActivity: UserActivityDto[] = [
        {
          userId: 'user-1',
          email: 'user1@example.com',
          fullName: 'John Doe',
          action: 'LOGIN',
          timestamp: new Date(),
          ipAddress: '192.168.1.1',
        },
        {
          userId: 'user-2',
          email: 'user2@example.com',
          fullName: 'Jane Smith',
          action: 'USER_CREATED',
          timestamp: new Date(),
          ipAddress: '192.168.1.2',
        },
      ];

      (usersRepository.getRecentActivity as jest.Mock).mockResolvedValue(mockActivity);

      const result = await service.getRecentActivity(10);

      expect(result).toEqual(mockActivity);
      expect(usersRepository.getRecentActivity).toHaveBeenCalledWith(10);
    });
  });

  describe('exportUsers', () => {
    it('should export users as JSON', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN' as UserRole,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 1000,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (usersRepository.findAll as jest.Mock).mockResolvedValue(mockResult);

      const query: UserQueryDto = { page: 1, limit: 10 };
      const result = await service.exportUsers(query, 'json');

      expect(result).toBeInstanceOf(Buffer);
      const jsonData = JSON.parse(result.toString());
      // JSON serialization converts dates to strings, so we need to compare with string format
      const expectedJsonData = mockUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString(),
      }));
      expect(jsonData).toEqual(expectedJsonData);
    });

    it('should export users as CSV', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN' as UserRole,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      const mockResult = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 1000,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      (usersRepository.findAll as jest.Mock).mockResolvedValue(mockResult);

      const query: UserQueryDto = { page: 1, limit: 10 };
      const result = await service.exportUsers(query, 'csv');

      expect(result).toBeInstanceOf(Buffer);
      const csvData = result.toString();
      expect(csvData).toContain('ID,Email,FirstName,LastName,Role,IsActive,IsEmailVerified,LastLoginAt,CreatedAt');
      expect(csvData).toContain('user-1,user1@example.com,John,Doe,ADMIN,true,true');
    });

    it('should throw error for PDF export', async () => {
      const query: UserQueryDto = { page: 1, limit: 10 };

      await expect(service.exportUsers(query, 'pdf')).rejects.toThrow('PDF export not implemented yet');
    });

    it('should throw error for unsupported format', async () => {
      const query: UserQueryDto = { page: 1, limit: 10 };

      await expect(service.exportUsers(query, 'xml' as any)).rejects.toThrow('Unsupported export format');
    });
  });

  describe('importUsers', () => {
    it('should import users from CSV file', async () => {
      const csvContent = 'email,firstName,lastName,role,password\ntest@example.com,Test,User,VIEWER,Password123!\ntest2@example.com,Test2,User2,EDITOR,Password123!';
      const mockFile = {
        buffer: Buffer.from(csvContent),
      } as Express.Multer.File;

      const mockValidation: ValidationResult = {
        isValid: true,
        errors: [],
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);
      (usersRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.importUsers(mockFile);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(usersRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should handle import errors', async () => {
      const csvContent = 'email,firstName,lastName,role,password\ninvalid-email,Test,User,VIEWER,123'; // Invalid email and password
      const mockFile = {
        buffer: Buffer.from(csvContent),
      } as Express.Multer.File;

      const mockValidation: ValidationResult = {
        isValid: false,
        errors: [
          { field: 'email', message: 'Invalid email', code: 'INVALID_EMAIL' },
          { field: 'password', message: 'Password too short', code: 'PASSWORD_TOO_SHORT' },
        ],
      };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);

      const result = await service.importUsers(mockFile);

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('bulkActivate', () => {
    it('should bulk activate users', async () => {
      const ids = ['user-1', 'user-2'];
      
      const mockResult: BulkOperationResult = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (usersRepository.bulkActivate as jest.Mock).mockResolvedValue(mockResult);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.bulkActivate(ids);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(usersRepository.bulkActivate).toHaveBeenCalledWith(ids);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('bulkDeactivate', () => {
    it('should bulk deactivate users', async () => {
      const ids = ['user-1', 'user-2'];
      
      const mockResult: BulkOperationResult = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (usersRepository.bulkDeactivate as jest.Mock).mockResolvedValue(mockResult);
      (userSessionRepository.deactivateAllUserSessions as jest.Mock).mockResolvedValue(undefined);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.bulkDeactivate(ids);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(usersRepository.bulkDeactivate).toHaveBeenCalledWith(ids);
      expect(userSessionRepository.deactivateAllUserSessions).toHaveBeenCalledTimes(2);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete users', async () => {
      const ids = ['user-1', 'user-2'];
      
      const mockResult: BulkOperationResult = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (usersRepository.bulkDelete as jest.Mock).mockResolvedValue(mockResult);
      (userSessionRepository.deactivateAllUserSessions as jest.Mock).mockResolvedValue(undefined);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await service.bulkDelete(ids);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(usersRepository.bulkDelete).toHaveBeenCalledWith(ids);
      expect(userSessionRepository.deactivateAllUserSessions).toHaveBeenCalledTimes(2);
      expect(auditLogRepository.create).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN' as UserRole,
        isActive: true,
        isEmailVerified: true,
        phoneNumber: '+1234567890',
        avatarUrl: 'https://example.com/avatar.jpg',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserProfile('test-user-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-user-id');
      expect(result.fullName).toBe('John Doe');
      expect(result.username).toBe('test');
      expect(result.phoneNumber).toBe('+1234567890');
      expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
    });

    it('should throw error when user not found', async () => {
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserProfile('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const updateData: UpdateUserProfileDto = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+9876543210',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      };

      const mockExistingUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Original',
        lastName: 'Name',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: true,
        phoneNumber: '+1234567890',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockExistingUser,
        ...updateData,
      };

      (usersRepository.findById as jest.Mock).mockResolvedValue(mockExistingUser);
      (usersRepository.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserProfile('test-user-id', updateData);

      expect(result).toBeDefined();
      expect(result.firstName).toBe('Updated');
      expect(result.phoneNumber).toBe('+9876543210');
      expect(result.avatarUrl).toBe('https://example.com/new-avatar.jpg');
      expect(result.fullName).toBe('Updated Name');
    });
  });

  describe('Utility Methods', () => {
    describe('hashPassword', () => {
      it('should hash password', async () => {
        // This is a private method, but we can test it indirectly through createUser
        const createData: CreateUserDto = {
          email: 'new@example.com',
          password: 'Password123!',
          firstName: 'New',
          lastName: 'User',
          role: 'VIEWER',
        };

        const mockValidation: ValidationResult = { isValid: true, errors: [] };
        const mockCreatedUser = { id: 'new-id', password: '$2b$10$hashedpassword' };

        (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);
        (usersRepository.findByEmail as jest.Mock).mockResolvedValue(null);
        (usersRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);
        (auditLogRepository.create as jest.Mock).mockResolvedValue({});

        await service.createUser(createData);

        expect(usersRepository.create).toHaveBeenCalledWith({
          ...createData,
          password: expect.stringMatching(/^\$2b\$12\$/), // bcrypt hash pattern
        });
      });
    });

    describe('generateRandomPassword', () => {
      it('should generate random password for imports', async () => {
        const csvContent = 'email,firstName,lastName,role\ntest@example.com,Test,User,VIEWER'; // No password
        const mockFile = {
          buffer: Buffer.from(csvContent),
        } as Express.Multer.File;

        const mockValidation: ValidationResult = { isValid: true, errors: [] };
        const mockCreatedUser = { id: 'new-id' };

        (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);
        (usersRepository.findByEmail as jest.Mock).mockResolvedValue(null);
        (usersRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);
        (auditLogRepository.create as jest.Mock).mockResolvedValue({});

        const result = await service.importUsers(mockFile);

        expect(result.success).toBe(1);
        expect(usersRepository.create).toHaveBeenCalledWith({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'VIEWER',
          password: expect.any(String), // Random generated password
          isActive: true,
        });
      });
    });

    describe('mapUserToResponse', () => {
      it('should map user to response DTO', async () => {
        const mockUser = {
          id: 'test-user-id',
          email: 'test@example.com',
          password: '$2b$10$hashedpassword', // Should be excluded
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN' as UserRole,
          isActive: true,
          isEmailVerified: true,
          phoneNumber: '+1234567890',
          avatarUrl: 'https://example.com/avatar.jpg',
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (usersRepository.findById as jest.Mock).mockResolvedValue(mockUser);

        const result = await service.getUserById('test-user-id');

        expect(result).not.toHaveProperty('password');
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('firstName');
        expect(result).toHaveProperty('lastName');
        expect(result).toHaveProperty('role');
        expect(result).toHaveProperty('isActive');
        expect(result).toHaveProperty('isEmailVerified');
        expect(result).toHaveProperty('lastLoginAt');
        expect(result).toHaveProperty('createdAt');
        expect(result).toHaveProperty('updatedAt');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (usersRepository.findById as jest.Mock).mockRejectedValue(error);

      await expect(service.getUserById('test-id')).rejects.toThrow('Database connection failed');
    });

    it('should handle audit log errors gracefully', async () => {
      const createData: CreateUserDto = {
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        role: 'VIEWER',
      };

      const mockValidation: ValidationResult = { isValid: true, errors: [] };
      const mockCreatedUser = { id: 'new-id' };

      (usersRepository.validateUser as jest.Mock).mockResolvedValue(mockValidation);
      (usersRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (auditLogRepository.create as jest.Mock).mockRejectedValue(new Error('Audit log failed'));

      // Should still succeed even if audit log fails
      const result = await service.createUser(createData);
      expect(result).toBeDefined();

      consoleErrorSpy.mockRestore();
    });
  });
}); 