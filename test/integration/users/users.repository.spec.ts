import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { PrismaService } from '../../../src/database/prisma.service';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UserQueryDto,
  UserStatistics,
  UserActivityDto,
  BulkOperationResult,
  ValidationResult,
  PaginatedUserResult
} from '../../../src/modules/users/dto/users.dto';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            auditLog: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
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

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById('test-user-id');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN' as UserRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all users with pagination', async () => {
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

      const query: UserQueryDto = { page: 1, limit: 10 };

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find users with search filter', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'ADMIN' as UserRole,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const query: UserQueryDto = { 
        page: 1, 
        limit: 10, 
        search: 'john' 
      };

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'john', mode: 'insensitive' } },
            { firstName: { contains: 'john', mode: 'insensitive' } },
            { lastName: { contains: 'john', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find users with role filter', async () => {
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

      const query: UserQueryDto = { 
        page: 1, 
        limit: 10, 
        role: 'ADMIN' 
      };

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findAll(query);

      expect(result.data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find users with activity status filter', async () => {
      const query: UserQueryDto = { 
        page: 1, 
        limit: 10, 
        isActive: true 
      };

      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      await repository.findAll(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find users with email verification filter', async () => {
      const query: UserQueryDto = { 
        page: 1, 
        limit: 10, 
        isEmailVerified: true 
      };

      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      await repository.findAll(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isEmailVerified: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should find users with custom sorting', async () => {
      const query: UserQueryDto = { 
        page: 1, 
        limit: 10, 
        sort: 'firstName', 
        order: 'asc' 
      };

      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(0);

      await repository.findAll(query);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { firstName: 'asc' },
      });
    });
  });

  describe('findActive', () => {
    it('should find active users', async () => {
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

      const query: UserQueryDto = { page: 1, limit: 10 };

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findActive(query);

      expect(result.data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'editor@example.com',
          firstName: 'Editor',
          lastName: 'User',
          role: 'EDITOR' as UserRole,
          isActive: true,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const query: UserQueryDto = { page: 1, limit: 10 };

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.findByRole('EDITOR', query);

      expect(result.data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'EDITOR' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('search', () => {
    it('should search users by term', async () => {
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

      const searchTerm = 'searchable';
      const query: UserQueryDto = { page: 1, limit: 10 };

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const result = await repository.search(searchTerm, query);

      expect(result.data).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const createData: CreateUserDto = {
        email: 'new@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'New',
        lastName: 'User',
        role: 'VIEWER',
        isActive: true,
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        ...createData,
        isEmailVerified: false,
        phoneNumber: null,
        avatarUrl: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await repository.create(createData);

      expect(result).toEqual(mockCreatedUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createData.email,
          password: createData.password,
          firstName: createData.firstName,
          lastName: createData.lastName,
          role: createData.role,
          isActive: true,
        },
      });
    });

    it('should create user with default isActive true', async () => {
      const createData: CreateUserDto = {
        email: 'new@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'New',
        lastName: 'User',
        role: 'VIEWER',
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        ...createData,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await repository.create(createData);

      expect(result).toEqual(mockCreatedUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: createData.email,
          password: createData.password,
          firstName: createData.firstName,
          lastName: createData.lastName,
          role: createData.role,
          isActive: true,
        },
      });
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateData: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        role: 'EDITOR',
        isActive: false,
      };

      const mockUpdatedUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'Updated',
        lastName: 'Name',
        role: 'EDITOR' as UserRole,
        isActive: false,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.update('test-user-id', updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: updateData,
      });
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue(undefined);

      await repository.delete('test-user-id');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
    });
  });

  describe('activate', () => {
    it('should activate user', async () => {
      const mockActivatedUser = {
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

      (prisma.user.update as jest.Mock).mockResolvedValue(mockActivatedUser);

      const result = await repository.activate('test-user-id');

      expect(result).toEqual(mockActivatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { isActive: true },
      });
    });
  });

  describe('deactivate', () => {
    it('should deactivate user', async () => {
      const mockDeactivatedUser = {
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

      (prisma.user.update as jest.Mock).mockResolvedValue(mockDeactivatedUser);

      const result = await repository.deactivate('test-user-id');

      expect(result).toEqual(mockDeactivatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { isActive: false },
      });
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const mockUpdatedUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN' as UserRole,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await repository.updateRole('test-user-id', 'ADMIN');

      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
        data: { role: 'ADMIN' },
      });
    });
  });

  describe('getStatistics', () => {
    it('should get user statistics', async () => {
      const mockGroupBy = [
        { role: 'ADMIN', _count: { role: 2 } },
        { role: 'EDITOR', _count: { role: 3 } },
        { role: 'VIEWER', _count: { role: 5 } },
      ];

      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8)  // active
        .mockResolvedValueOnce(7)  // verified
        .mockResolvedValueOnce(3)  // unverified
        .mockResolvedValueOnce(2)  // recentRegistrations
        .mockResolvedValueOnce(4); // recentLogins
      (prisma.user.groupBy as jest.Mock).mockResolvedValue(mockGroupBy);

      const result = await repository.getStatistics();

      expect(result).toEqual({
        total: 10,
        active: 8,
        byRole: { ADMIN: 2, EDITOR: 3, VIEWER: 5 },
        verified: 7,
        unverified: 3,
        recentRegistrations: 2,
        recentLogins: 4,
      });
    });
  });

  describe('getRecentActivity', () => {
    it('should get recent user activity', async () => {
      const mockAuditLogs = [
        {
          id: 'log-1',
          action: 'LOGIN',
          createdAt: new Date(),
          ipAddress: '192.168.1.1',
          user: {
            id: 'user-1',
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        {
          id: 'log-2',
          action: 'USER_CREATED',
          createdAt: new Date(),
          ipAddress: '192.168.1.2',
          user: {
            id: 'user-2',
            email: 'user2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
          },
        },
      ];

      const expectedActivity: UserActivityDto[] = [
        {
          userId: 'user-1',
          email: 'user1@example.com',
          fullName: 'John Doe',
          action: 'LOGIN',
          timestamp: mockAuditLogs[0].createdAt,
          ipAddress: '192.168.1.1',
        },
        {
          userId: 'user-2',
          email: 'user2@example.com',
          fullName: 'Jane Smith',
          action: 'USER_CREATED',
          timestamp: mockAuditLogs[1].createdAt,
          ipAddress: '192.168.1.2',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockAuditLogs);

      const result = await repository.getRecentActivity(10);

      expect(result).toEqual(expectedActivity);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          action: {
            in: ['LOGIN', 'LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED'],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    });

    it('should handle missing user in audit logs', async () => {
      const mockAuditLogs = [
        {
          id: 'log-1',
          action: 'USER_DELETED',
          createdAt: new Date(),
          ipAddress: '192.168.1.1',
          user: null,
        },
      ];

      const expectedActivity: UserActivityDto[] = [
        {
          userId: 'unknown',
          email: 'unknown',
          fullName: 'Unknown User',
          action: 'USER_DELETED',
          timestamp: mockAuditLogs[0].createdAt,
          ipAddress: '192.168.1.1',
        },
      ];

      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockAuditLogs);

      const result = await repository.getRecentActivity(10);

      expect(result).toEqual(expectedActivity);
    });
  });

  describe('bulkActivate', () => {
    it('should bulk activate users', async () => {
      const ids = ['user-1', 'user-2'];
      
      (prisma.user.update as jest.Mock)
        .mockResolvedValueOnce({ id: 'user-1', isActive: true })
        .mockResolvedValueOnce({ id: 'user-2', isActive: true });

      const result = await repository.bulkActivate(ids);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during bulk activate', async () => {
      const ids = ['user-1', 'user-2'];
      
      (prisma.user.update as jest.Mock)
        .mockResolvedValueOnce({ id: 'user-1', isActive: true })
        .mockRejectedValueOnce(new Error('User not found'));

      const result = await repository.bulkActivate(ids);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to activate user user-2');
    });
  });

  describe('bulkDeactivate', () => {
    it('should bulk deactivate users', async () => {
      const ids = ['user-1', 'user-2'];
      
      (prisma.user.update as jest.Mock)
        .mockResolvedValueOnce({ id: 'user-1', isActive: false })
        .mockResolvedValueOnce({ id: 'user-2', isActive: false });

      const result = await repository.bulkDeactivate(ids);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(prisma.user.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkDelete', () => {
    it('should bulk delete users', async () => {
      const ids = ['user-1', 'user-2'];
      
      (prisma.user.delete as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const result = await repository.bulkDelete(ids);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toEqual([]);
      expect(prisma.user.delete).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during bulk delete', async () => {
      const ids = ['user-1', 'user-2'];
      
      (prisma.user.delete as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('User not found'));

      const result = await repository.bulkDelete(ids);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to delete user user-2');
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

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.validateUser(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for existing email', async () => {
      const invalidData: CreateUserDto = {
        email: 'existing@example.com',
        password: 'ValidPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
      };

      const mockExistingUser = {
        id: 'existing-user-id',
        email: 'existing@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockExistingUser);

      const result = await repository.validateUser(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('email');
      expect(result.errors[0].code).toBe('EMAIL_EXISTS');
    });

    it('should return validation errors for weak password', async () => {
      const invalidData: CreateUserDto = {
        email: 'new@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.validateUser(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('password');
      expect(result.errors[0].code).toBe('PASSWORD_TOO_SHORT');
    });

    it('should validate update data without email check', async () => {
      const updateData: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const result = await repository.validateUser(updateData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (prisma.user.findMany as jest.Mock).mockRejectedValue(error);

      const query: UserQueryDto = { page: 1, limit: 10 };

      await expect(repository.findAll(query)).rejects.toThrow('Database connection failed');
    });

    it('should handle update errors', async () => {
      const error = new Error('Record not found');
      (prisma.user.update as jest.Mock).mockRejectedValue(error);

      const updateData: UpdateUserDto = {
        firstName: 'Updated',
      };

      await expect(repository.update('non-existent-id', updateData)).rejects.toThrow('Record not found');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Record not found');
      (prisma.user.delete as jest.Mock).mockRejectedValue(error);

      await expect(repository.delete('non-existent-id')).rejects.toThrow('Record not found');
    });
  });

  describe('Data Transformation', () => {
    it('should handle optional fields correctly', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        password: '$2b$10$hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
        isActive: true,
        isEmailVerified: true,
        phoneNumber: null,
        avatarUrl: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById('test-user-id');

      expect(result).toEqual(mockUser);
      expect(result.phoneNumber).toBeNull();
      expect(result.avatarUrl).toBeNull();
      expect(result.lastLoginAt).toBeNull();
    });

    it('should handle pagination correctly', async () => {
      const query: UserQueryDto = { page: 2, limit: 5 };

      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.count as jest.Mock).mockResolvedValue(12);

      const result = await repository.findAll(query);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(12);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    });
  });
}); 