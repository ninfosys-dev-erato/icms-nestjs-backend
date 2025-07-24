import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { AuthService } from '@/modules/auth/auth.service';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { UserSessionRepository } from '@/modules/auth/repositories/user-session.repository';
import { LoginAttemptRepository } from '@/modules/auth/repositories/login-attempt.repository';
import { AuditLogRepository } from '@/modules/auth/repositories/audit-log.repository';
import { DatabaseModule } from '@/database/database.module';
import { TestUtils } from '../../test-utils';
import { PrismaService } from '@/database/prisma.service';

type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

describe('AuthService', () => {
  let module: TestingModule;
  let service: AuthService;
  let authRepository: AuthRepository;
  let userSessionRepository: UserSessionRepository;
  let loginAttemptRepository: LoginAttemptRepository;
  let auditLogRepository: AuditLogRepository;
  let prisma: PrismaService;
  let testUser: any;

  const validRegisterData = {
    email: 'newuser@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'VIEWER' as UserRole,
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        DatabaseModule,
        PassportModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        AuthRepository,
        UserSessionRepository,
        LoginAttemptRepository,
        AuditLogRepository,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    userSessionRepository = module.get<UserSessionRepository>(UserSessionRepository);
    loginAttemptRepository = module.get<LoginAttemptRepository>(LoginAttemptRepository);
    auditLogRepository = module.get<AuditLogRepository>(AuditLogRepository);
    prisma = module.get<PrismaService>(PrismaService);

    // Create test user
    testUser = await TestUtils.createTestUser(prisma, {
      email: 'testuser',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await TestUtils.ensureCleanDatabase(prisma);
    
    // Recreate test user after cleanup
    testUser = await TestUtils.createTestUser(prisma, {
      email: 'testuser',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'ADMIN',
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await service.register(validRegisterData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(validRegisterData.email);
      expect(result.user.firstName).toBe(validRegisterData.firstName);
      expect(result.user.lastName).toBe(validRegisterData.lastName);
      expect(result.user.role).toBe(validRegisterData.role);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.tokenType).toBe('Bearer');
    });

    it('should fail with mismatched passwords', async () => {
      const invalidData = {
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(service.register(invalidData))
        .rejects.toThrow(BadRequestException);
    });

    it('should fail with weak password', async () => {
      const invalidData = {
        ...validRegisterData,
        password: '123',
        confirmPassword: '123',
      };

      await expect(service.register(invalidData))
        .rejects.toThrow(BadRequestException);
    });

    it('should fail with invalid email', async () => {
      const invalidData = {
        ...validRegisterData,
        email: 'invalid-email',
      };

      await expect(service.register(invalidData))
        .rejects.toThrow(BadRequestException);
    });

    it('should fail with duplicate email', async () => {
      // First registration should succeed
      await service.register(validRegisterData);

      // Second registration with same email should fail
      await expect(service.register(validRegisterData))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'Password123!',
      };

      const result = await service.login(loginData, '127.0.0.1', 'Test Browser');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.tokenType).toBe('Bearer');
    });

    it('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await expect(service.login(loginData, '127.0.0.1', 'Test Browser'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should fail with invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      await expect(service.login(loginData, '127.0.0.1', 'Test Browser'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should fail with inactive user', async () => {
      // Deactivate user
      await authRepository.update(testUser.id, { isActive: false });

      const loginData = {
        email: testUser.email,
        password: 'Password123!',
      };

      await expect(service.login(loginData, '127.0.0.1', 'Test Browser'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should create session on successful login', async () => {
      const loginData = {
        email: testUser.email,
        password: 'Password123!',
      };

      const result = await service.login(loginData, '127.0.0.1', 'Test Browser');

      // Verify session was created
      const sessions = await userSessionRepository.findActiveByUser(testUser.id);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].token).toBe(result.accessToken);
      expect(sessions[0].refreshToken).toBe(result.refreshToken);
    });

    it('should record login attempt', async () => {
      const loginData = {
        email: testUser.email,
        password: 'Password123!',
      };

      await service.login(loginData, '127.0.0.1', 'Test Browser');

      const attempts = await loginAttemptRepository.findByEmail(testUser.email);
      expect(attempts.length).toBeGreaterThan(0);
      expect(attempts[0].success).toBe(true);
    });

    it('should record failed login attempt', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      try {
        await service.login(loginData, '127.0.0.1', 'Test Browser');
      } catch (error) {
        // Expected to fail
      }

      const attempts = await loginAttemptRepository.findByEmail(testUser.email);
      expect(attempts.length).toBeGreaterThan(0);
      expect(attempts[0].success).toBe(false);
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      // First login to get tokens
      const loginData = {
        email: testUser.email,
        password: 'Password123!',
      };

      const loginResult = await service.login(loginData, '127.0.0.1', 'Test Browser');

      // Refresh token
      const refreshResult = await service.refreshToken(loginResult.refreshToken);

      expect(refreshResult.user).toBeDefined();
      expect(refreshResult.accessToken).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.tokenType).toBe('Bearer');
      expect(refreshResult.accessToken).not.toBe(loginResult.accessToken);
    });

    it('should fail with invalid refresh token', async () => {
      await expect(service.refreshToken('invalid-token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // First login to create session
      const loginData = {
        email: testUser.email,
        password: 'Password123!',
      };

      await service.login(loginData, '127.0.0.1', 'Test Browser');

      // Logout
      await expect(service.logout(testUser.id)).resolves.not.toThrow();

      // Verify session is deactivated
      const sessions = await userSessionRepository.findActiveByUser(testUser.id);
      expect(sessions.length).toBe(0);
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      // Get the actual user from database to access the hashed password
      const actualUser = await authRepository.findById(testUser.id);
      const result = await service.validatePassword('Password123!', actualUser.password);
      expect(result).toBe(true);
    });

    it('should return false for invalid credentials', async () => {
      // Get the actual user from database to access the hashed password
      const actualUser = await authRepository.findById(testUser.id);
      const result = await service.validatePassword('WrongPassword123!', actualUser.password);
      expect(result).toBe(false);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', async () => {
      const profile = await service.validateToken(testUser.accessToken);
      expect(profile).toBeDefined();
      expect(profile.email).toBe(testUser.email);
      expect(profile.firstName).toBe(testUser.firstName);
      expect(profile.lastName).toBe(testUser.lastName);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      await authRepository.update(testUser.id, updateData);

      const updatedUser = await authRepository.findById(testUser.id);
      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      await service.changePassword(testUser.id, changePasswordData);

      // Verify password was changed
      const updatedUser = await authRepository.findById(testUser.id);
      const isNewPasswordValid = await service.validatePassword('NewPassword123!', updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should fail with incorrect current password', async () => {
      const changePasswordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      await expect(service.changePassword(testUser.id, changePasswordData))
        .rejects.toThrow(BadRequestException);
    });

    it('should fail with mismatched new passwords', async () => {
      const changePasswordData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(service.changePassword(testUser.id, changePasswordData))
        .rejects.toThrow(BadRequestException);
    });
  });
}); 