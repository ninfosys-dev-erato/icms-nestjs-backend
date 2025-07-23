import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from '@/modules/auth/auth.service';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { UserSessionRepository } from '@/modules/auth/repositories/user-session.repository';
import { LoginAttemptRepository } from '@/modules/auth/repositories/login-attempt.repository';
import { AuditLogRepository } from '@/modules/auth/repositories/audit-log.repository';
import { PrismaService } from '@/database/prisma.service';
import { DatabaseModule } from '@/database/database.module';

// Define UserRole type to match the DTO
type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: AuthRepository;
  let userSessionRepository: UserSessionRepository;
  let loginAttemptRepository: LoginAttemptRepository;
  let auditLogRepository: AuditLogRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        DatabaseModule,
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
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

    // Clean up database before each test
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  const cleanupDatabase = async () => {
    const tables = [
      'user_sessions',
      'login_attempts',
      'audit_logs',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  };

  describe('register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'VIEWER' as UserRole,
    };

    it('should register a new user successfully', async () => {
      const result = await service.register(validRegisterData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(validRegisterData.email);
      expect(result.user.firstName).toBe(validRegisterData.firstName);
      expect(result.user.lastName).toBe(validRegisterData.lastName);
      expect(result.user.role).toBe(validRegisterData.role);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // UserResponseDto doesn't include password field
    });

    it('should fail when passwords do not match', async () => {
      const invalidData = {
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(service.register(invalidData)).rejects.toThrow(BadRequestException);
    });

    it('should fail when email already exists', async () => {
      // First registration
      await service.register(validRegisterData);

      // Second registration with same email
      await expect(service.register(validRegisterData)).rejects.toThrow(ConflictException);
    });

    it('should hash password before storing', async () => {
      const result = await service.register(validRegisterData);

      // Verify user exists in database
      const user = await authRepository.findByEmail(validRegisterData.email);
      expect(user).toBeDefined();
      expect(user.password).not.toBe(validRegisterData.password);
      
      // Verify password is hashed
      const isPasswordValid = await bcrypt.compare(validRegisterData.password, user.password);
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'login@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Login',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      await service.register(registerData);
      testUser = await authRepository.findByEmail('login@example.com');
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
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
        email: 'login@example.com',
        password: 'WrongPassword123!',
      };

      await expect(service.login(loginData, '127.0.0.1', 'Test Browser'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should fail with inactive user', async () => {
      // Deactivate user
      await authRepository.update(testUser.id, { isActive: false });

      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      await expect(service.login(loginData, '127.0.0.1', 'Test Browser'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should create session on successful login', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      const result = await service.login(loginData, '127.0.0.1', 'Test Browser');

      // Verify session was created using findActiveByUser
      const sessions = await userSessionRepository.findActiveByUser(testUser.id);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0].token).toBe(result.accessToken);
      expect(sessions[0].refreshToken).toBe(result.refreshToken);
    });

    it('should record login attempt', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      await service.login(loginData, '127.0.0.1', 'Test Browser');

      // Verify login attempt was recorded
      const attempts = await loginAttemptRepository.findByEmail('login@example.com');
      expect(attempts.length).toBeGreaterThan(0);
      expect(attempts[0].success).toBe(true);
    });

    it('should record failed login attempt', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!',
      };

      try {
        await service.login(loginData, '127.0.0.1', 'Test Browser');
      } catch (error) {
        // Expected to fail
      }

      // Verify failed login attempt was recorded
      const attempts = await loginAttemptRepository.findByEmail('login@example.com');
      expect(attempts.length).toBeGreaterThan(0);
      expect(attempts[0].success).toBe(false);
    });
  });

  describe('validateLoginAttempt', () => {
    it('should allow login when no previous attempts', async () => {
      const result = await service.validateLoginAttempt('test@example.com', '127.0.0.1');
      expect(result.isValid).toBe(true);
    });

    it('should block after too many failed attempts', async () => {
      // Create multiple failed attempts
      for (let i = 0; i < 5; i++) {
        await loginAttemptRepository.create({
          email: 'test@example.com',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser',
          success: false,
          failureReason: 'Invalid credentials',
        });
      }

      const result = await service.validateLoginAttempt('test@example.com', '127.0.0.1');
      expect(result.isValid).toBe(false);
    });

    it('should allow login after successful attempt', async () => {
      // Create failed attempts
      for (let i = 0; i < 3; i++) {
        await loginAttemptRepository.create({
          email: 'test@example.com',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser',
          success: false,
          failureReason: 'Invalid credentials',
        });
      }

      // Create successful attempt
      await loginAttemptRepository.create({
        email: 'test@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        success: true,
      });

      const result = await service.validateLoginAttempt('test@example.com', '127.0.0.1');
      expect(result.isValid).toBe(true);
    });
  });

  describe('logout', () => {
    let testUser: any;
    let sessionId: string;

    beforeEach(async () => {
      // Create a test user and session
      const registerData = {
        email: 'logout@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Logout',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      await service.register(registerData);
      testUser = await authRepository.findByEmail('logout@example.com');

      // Create a session with unique token
      const session = await userSessionRepository.create({
        userId: testUser.id,
        token: `logout-token-${Date.now()}`,
        refreshToken: `logout-refresh-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      sessionId = session.id;
    });

    it('should logout user and deactivate all sessions', async () => {
      await service.logout(testUser.id);

      // Verify all sessions are deactivated
      const sessions = await userSessionRepository.findActiveByUser(testUser.id);
      expect(sessions.every(session => !session.isActive)).toBe(true);
    });

    it('should logout specific session', async () => {
      await service.logout(testUser.id, sessionId);

      // Verify specific session is deactivated
      const session = await userSessionRepository.findById(sessionId);
      expect(session.isActive).toBe(false);
    });
  });

  describe('refreshToken', () => {
    let testUser: any;
    let refreshToken: string;

    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'refresh@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Refresh',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      await service.register(registerData);
      testUser = await authRepository.findByEmail('refresh@example.com');

      // Create a session with refresh token
      const session = await userSessionRepository.create({
        userId: testUser.id,
        token: `refresh-token-${Date.now()}`,
        refreshToken: `refresh-refresh-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      refreshToken = session.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const result = await service.refreshToken(refreshToken);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(testUser.id);
    });

    it('should fail with invalid refresh token', async () => {
      await expect(service.refreshToken('invalid-refresh-token'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should fail with expired refresh token', async () => {
      // Create expired session with unique tokens
      const uniqueToken = `expired-token-${Date.now()}`;
      const uniqueRefreshToken = `expired-refresh-${Date.now()}`;
      
      await userSessionRepository.create({
        userId: testUser.id,
        token: uniqueToken,
        refreshToken: uniqueRefreshToken,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired
      });

      await expect(service.refreshToken(uniqueRefreshToken))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'change@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Change',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      await service.register(registerData);
      testUser = await authRepository.findByEmail('change@example.com');
    });

    it('should change password successfully', async () => {
      const changeData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      await service.changePassword(testUser.id, changeData);

      // Verify password was changed
      const updatedUser = await authRepository.findById(testUser.id);
      const isNewPasswordValid = await bcrypt.compare(changeData.newPassword, updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should fail with incorrect current password', async () => {
      const changeData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      await expect(service.changePassword(testUser.id, changeData))
        .rejects.toThrow(BadRequestException);
    });

    it('should fail when new passwords do not match', async () => {
      const changeData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(service.changePassword(testUser.id, changeData))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserSessions', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'sessions@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Sessions',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      await service.register(registerData);
      testUser = await authRepository.findByEmail('sessions@example.com');

      // Create multiple sessions
      await userSessionRepository.create({
        userId: testUser.id,
        token: 'token-1',
        refreshToken: 'refresh-1',
        ipAddress: '127.0.0.1',
        userAgent: 'Browser 1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await userSessionRepository.create({
        userId: testUser.id,
        token: 'token-2',
        refreshToken: 'refresh-2',
        ipAddress: '127.0.0.2',
        userAgent: 'Browser 2',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    });

    it('should return all user sessions', async () => {
      const sessions = await service.getUserSessions(testUser.id);

      expect(sessions).toBeDefined();
      expect(sessions.length).toBe(2);
      // SessionResponseDto doesn't include userId field, so we check the sessions exist
      expect(sessions[0]).toBeDefined();
      expect(sessions[1]).toBeDefined();
    });
  });

  describe('revokeSession', () => {
    let testUser: any;
    let sessionId: string;

    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'revoke@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Revoke',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      await service.register(registerData);
      testUser = await authRepository.findByEmail('revoke@example.com');

      // Create a session with unique token
      const session = await userSessionRepository.create({
        userId: testUser.id,
        token: `test-token-${Date.now()}`,
        refreshToken: `test-refresh-token-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      sessionId = session.id;
    });

    it('should revoke specific session', async () => {
      await service.revokeSession(testUser.id, sessionId);

      // Verify session is deactivated
      const session = await userSessionRepository.findById(sessionId);
      expect(session.isActive).toBe(false);
    });

    it('should fail when trying to revoke another user session', async () => {
      // Create another user and session
      const anotherUser = await authRepository.create({
        email: 'another@example.com',
        password: await bcrypt.hash('Password123!', 10),
        firstName: 'Another',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      });

      const anotherSession = await userSessionRepository.create({
        userId: anotherUser.id,
        token: `another-token-${Date.now()}`,
        refreshToken: `another-refresh-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await expect(service.revokeSession(testUser.id, anotherSession.id))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeAllSessions', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'revokeall@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'RevokeAll',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      await service.register(registerData);
      testUser = await authRepository.findByEmail('revokeall@example.com');

      // Create multiple sessions with unique tokens
      await userSessionRepository.create({
        userId: testUser.id,
        token: `revokeall-token-1-${Date.now()}`,
        refreshToken: `revokeall-refresh-1-${Date.now()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Browser 1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await userSessionRepository.create({
        userId: testUser.id,
        token: `revokeall-token-2-${Date.now() + 1}`,
        refreshToken: `revokeall-refresh-2-${Date.now() + 1}`,
        ipAddress: '127.0.0.2',
        userAgent: 'Browser 2',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    });

    it('should revoke all user sessions', async () => {
      await service.revokeAllSessions(testUser.id);

      // Verify all sessions are deactivated
      const sessions = await userSessionRepository.findActiveByUser(testUser.id);
      expect(sessions.every(session => !session.isActive)).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should hash password correctly', async () => {
      const password = 'Password123!';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt format
    });

    it('should validate password correctly', async () => {
      const password = 'Password123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await service.validatePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject invalid password', async () => {
      const password = 'Password123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await service.validatePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });
}); 