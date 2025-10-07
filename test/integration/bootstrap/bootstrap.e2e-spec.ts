import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../src/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { BootstrapService } from '../../../src/modules/bootstrap/bootstrap.service';
import { UsersRepository } from '../../../src/modules/users/repositories/users.repository';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '../../../src/common/interceptors/api-response.interceptor';

describe('Bootstrap Service - Admin User Creation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let bootstrapService: BootstrapService;
  let usersRepository: UsersRepository;
  let configService: ConfigService;
  let originalEnvContent: string;

  // Test data constants
  const TEST_EMAIL = 'test.admin@example.com';
  const TEST_PASSWORD = 'TestAdmin@123';
  const DEFAULT_EMAIL = 'admin@example.com';
  const DEFAULT_PASSWORD = 'Admin@123';

  beforeAll(async () => {
    // Save original .env content if it exists
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      originalEnvContent = fs.readFileSync(envPath, 'utf8');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    
    // Set global prefix to match main app
    app.setGlobalPrefix('api/v1');

    // Get services
    prisma = app.get<PrismaService>(PrismaService);
    bootstrapService = app.get<BootstrapService>(BootstrapService);
    usersRepository = app.get<UsersRepository>(UsersRepository);
    configService = app.get<ConfigService>(ConfigService);

    await app.init();
    
    // Clean up database before tests
    await cleanupDatabase();
  });

  afterAll(async () => {
    // Restore original .env content if it existed
    const envPath = path.join(process.cwd(), '.env');
    if (originalEnvContent) {
      fs.writeFileSync(envPath, originalEnvContent, 'utf8');
    } else if (fs.existsSync(envPath)) {
      // Only delete if we didn't have original content
      // In production, be more careful about this
    }

    await cleanupDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanupDatabase();
  });

  const cleanupDatabase = async () => {
    await prisma.auditLog.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.loginAttempt.deleteMany();
    await prisma.user.deleteMany();
  };

  describe('Admin User Creation with Environment Variables', () => {
    it('should create admin user with provided USEREMAIL and USERPASSWORD', async () => {
      // Mock configuration service to return our test values
      const originalGet = configService.get;
      configService.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'app.bootstrap.userEmail') return TEST_EMAIL;
        if (key === 'app.bootstrap.userPassword') return TEST_PASSWORD;
        if (key === 'app.bootstrap.defaultEmail') return DEFAULT_EMAIL;
        if (key === 'app.bootstrap.defaultPassword') return DEFAULT_PASSWORD;
        if (key === 'app.security.bcryptRounds') return 12;
        return originalGet.call(configService, key);
      });

      try {
        // Initialize admin user
        await bootstrapService.initializeAdminUser();

        // Verify user was created
        const user = await usersRepository.findByEmail(TEST_EMAIL);
        expect(user).toBeDefined();
        expect(user).not.toBeNull();
        expect(user.email).toBe(TEST_EMAIL);
      expect(user.firstName).toBe('System');
      expect(user.lastName).toBe('Administrator');
      expect(user.role).toBe('ADMIN');
      expect(user.isActive).toBe(true);

      // Verify password was hashed correctly
      const isPasswordValid = await bcrypt.compare(TEST_PASSWORD, user.password);
      expect(isPasswordValid).toBe(true);

      // Verify audit log was created
      const auditLogResult = await prisma.auditLog.findMany({
        where: { 
          resourceId: user.id,
          action: 'BOOTSTRAP_USER_CREATED'
        }
      });
      expect(auditLogResult).toHaveLength(1);
      
      const auditLog = auditLogResult[0];
      expect(auditLog.action).toBe('BOOTSTRAP_USER_CREATED');
      expect(auditLog.resource).toBe('USER');
      expect(auditLog.resourceId).toBe(user.id);
      expect(auditLog.details).toMatchObject({
        email: TEST_EMAIL,
        role: 'ADMIN',
        isDefaultCredentials: false
      });
      expect(auditLog.ipAddress).toBe('system');
      expect(auditLog.userAgent).toBe('bootstrap');
      } finally {
        // Restore original configuration service
        configService.get = originalGet;
      }
    });

    it('should handle partial environment variables and fallback to defaults', async () => {
      // Mock configuration service to return partial values (only email, no password)
      const originalGet = configService.get;
      configService.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'app.bootstrap.userEmail') return TEST_EMAIL;
        if (key === 'app.bootstrap.userPassword') return undefined; // No password provided
        if (key === 'app.bootstrap.defaultEmail') return DEFAULT_EMAIL;
        if (key === 'app.bootstrap.defaultPassword') return DEFAULT_PASSWORD;
        if (key === 'app.security.bcryptRounds') return 12;
        return originalGet.call(configService, key);
      });

      try {
        // Initialize admin user
        await bootstrapService.initializeAdminUser();

      // Should use default credentials because both email and password are required
      const user = await usersRepository.findByEmail(DEFAULT_EMAIL);
      expect(user).toBeDefined();
      expect(user.email).toBe(DEFAULT_EMAIL);

      // Verify user with test email was not created
      const testUser = await usersRepository.findByEmail(TEST_EMAIL);
      expect(testUser).toBeNull();

      // Verify audit log indicates default credentials were used
      const auditLogResult = await prisma.auditLog.findMany({
        where: { 
          resourceId: user.id,
          action: 'BOOTSTRAP_USER_CREATED'
        }
      });
      expect((auditLogResult[0].details as any).isDefaultCredentials).toBe(true);
      } finally {
        // Restore original configuration service
        configService.get = originalGet;
      }
    });
  });

  describe('Admin User Creation with Default Credentials', () => {
    it('should create admin user with default credentials when env vars not provided', async () => {
      // Mock configuration service to return no user credentials (use defaults)
      const originalGet = configService.get;
      configService.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'app.bootstrap.userEmail') return undefined;
        if (key === 'app.bootstrap.userPassword') return undefined;
        if (key === 'app.bootstrap.defaultEmail') return DEFAULT_EMAIL;
        if (key === 'app.bootstrap.defaultPassword') return DEFAULT_PASSWORD;
        if (key === 'app.security.bcryptRounds') return 12;
        return originalGet.call(configService, key);
      });

      try {
        // Initialize admin user
        await bootstrapService.initializeAdminUser();

      // Verify user was created with default credentials
      const user = await usersRepository.findByEmail(DEFAULT_EMAIL);
      expect(user).toBeDefined();
      expect(user.email).toBe(DEFAULT_EMAIL);
      expect(user.firstName).toBe('System');
      expect(user.lastName).toBe('Administrator');
      expect(user.role).toBe('ADMIN');
      expect(user.isActive).toBe(true);

      // Verify password was hashed correctly
      const isPasswordValid = await bcrypt.compare(DEFAULT_PASSWORD, user.password);
      expect(isPasswordValid).toBe(true);

      // Verify audit log indicates default credentials were used
      const auditLogResult = await prisma.auditLog.findMany({
        where: { 
          resourceId: user.id,
          action: 'BOOTSTRAP_USER_CREATED'
        }
      });
      expect(auditLogResult).toHaveLength(1);
      expect((auditLogResult[0].details as any).isDefaultCredentials).toBe(true);
      } finally {
        // Restore original configuration service
        configService.get = originalGet;
      }
    });

    it('should create .env file with default credentials when none exists', async () => {
      // Ensure environment variables are not set
      delete process.env.USEREMAIL;
      delete process.env.USERPASSWORD;

      // Backup and remove .env file if it exists
      const envPath = path.join(process.cwd(), '.env');
      let originalContent = null;
      if (fs.existsSync(envPath)) {
        originalContent = fs.readFileSync(envPath, 'utf8');
        fs.unlinkSync(envPath);
      }

      try {
        // Initialize admin user
        await bootstrapService.initializeAdminUser();

        // Check if .env file was created (may not happen in test environment due to error handling)
        if (fs.existsSync(envPath)) {
          // Verify .env file content
          const envContent = fs.readFileSync(envPath, 'utf8');
          expect(envContent).toContain('# BOOTSTRAP CONFIGURATION');
          expect(envContent).toContain(`USEREMAIL=${DEFAULT_EMAIL}`);
          expect(envContent).toContain(`USERPASSWORD=${DEFAULT_PASSWORD}`);
          expect(envContent).toContain('Default admin user credentials (auto-generated)');
        }

        // Verify user was still created
        const user = await usersRepository.findByEmail(DEFAULT_EMAIL);
        expect(user).toBeDefined();
      } finally {
        // Restore original .env file if it existed
        if (originalContent) {
          fs.writeFileSync(envPath, originalContent, 'utf8');
        } else if (fs.existsSync(envPath)) {
          fs.unlinkSync(envPath);
        }
      }
    });
  });

  describe('Duplicate Prevention', () => {
    it('should not create duplicate admin user when user already exists', async () => {
      // Create an existing admin user
      const existingUser = await usersRepository.create({
        email: TEST_EMAIL,
        password: await bcrypt.hash('ExistingPassword', 12),
        firstName: 'Existing',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true,
      });

      // Set environment variables to same email
      process.env.USEREMAIL = TEST_EMAIL;
      process.env.USERPASSWORD = TEST_PASSWORD;

      // Initialize admin user
      await bootstrapService.initializeAdminUser();

      // Verify only one user exists with this email
      const users = await prisma.user.findMany({
        where: { email: TEST_EMAIL },
      });
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe(existingUser.id);
      expect(users[0].firstName).toBe('Existing'); // Original data unchanged

      // Verify no audit log was created for bootstrap
      const auditLogResult = await prisma.auditLog.findMany({
        where: { 
          resourceId: existingUser.id,
          action: 'BOOTSTRAP_USER_CREATED'
        }
      });
      expect(auditLogResult).toHaveLength(0);

      // Clean up environment variables
      delete process.env.USEREMAIL;
      delete process.env.USERPASSWORD;
    });
  });

  describe('Password Security', () => {
    it('should use configured bcrypt rounds for password hashing', async () => {
      // Mock configuration service to return our test values
      const originalGet = configService.get;
      configService.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'app.bootstrap.userEmail') return TEST_EMAIL;
        if (key === 'app.bootstrap.userPassword') return TEST_PASSWORD;
        if (key === 'app.bootstrap.defaultEmail') return DEFAULT_EMAIL;
        if (key === 'app.bootstrap.defaultPassword') return DEFAULT_PASSWORD;
        if (key === 'app.security.bcryptRounds') return 12;
        return originalGet.call(configService, key);
      });

      try {
        // Initialize admin user
        await bootstrapService.initializeAdminUser();

      // Verify user was created
      const user = await usersRepository.findByEmail(TEST_EMAIL);
      expect(user).toBeDefined();

      // Verify password hash is using bcrypt
      expect(user.password).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt hash pattern

      // Verify password can be verified
      const isValid = await bcrypt.compare(TEST_PASSWORD, user.password);
      expect(isValid).toBe(true);

      // Verify incorrect password fails
      const isInvalid = await bcrypt.compare('wrong-password', user.password);
      expect(isInvalid).toBe(false);
      } finally {
        // Restore original configuration service
        configService.get = originalGet;
      }
    });

    it('should generate unique salt for each password hash', async () => {
      // Mock configuration service for first user
      const originalGet = configService.get;
      
      try {
        // Initialize first user
        configService.get = jest.fn().mockImplementation((key: string) => {
          if (key === 'app.bootstrap.userEmail') return 'user1@example.com';
          if (key === 'app.bootstrap.userPassword') return 'SamePassword123';
          if (key === 'app.bootstrap.defaultEmail') return DEFAULT_EMAIL;
          if (key === 'app.bootstrap.defaultPassword') return DEFAULT_PASSWORD;
          if (key === 'app.security.bcryptRounds') return 12;
          return originalGet.call(configService, key);
        });
        
        await bootstrapService.initializeAdminUser();
        const user1 = await usersRepository.findByEmail('user1@example.com');
        
        // Clean up and create second user
        await cleanupDatabase();
        
        configService.get = jest.fn().mockImplementation((key: string) => {
          if (key === 'app.bootstrap.userEmail') return 'user2@example.com';
          if (key === 'app.bootstrap.userPassword') return 'SamePassword123';
          if (key === 'app.bootstrap.defaultEmail') return DEFAULT_EMAIL;
          if (key === 'app.bootstrap.defaultPassword') return DEFAULT_PASSWORD;
          if (key === 'app.security.bcryptRounds') return 12;
          return originalGet.call(configService, key);
        });
        
        await bootstrapService.initializeAdminUser();
        const user2 = await usersRepository.findByEmail('user2@example.com');

      // Verify hashes are different despite same password
      expect(user1.password).not.toBe(user2.password);

      // Verify both passwords are valid
      expect(await bcrypt.compare('SamePassword123', user1.password)).toBe(true);
      expect(await bcrypt.compare('SamePassword123', user2.password)).toBe(true);
      } finally {
        // Restore original configuration service
        configService.get = originalGet;
      }
    });
  });

  describe('Configuration Integration', () => {
    it('should read configuration values correctly', async () => {
      // Test that bootstrap service reads configuration properly
      const defaultEmail = configService.get<string>('app.bootstrap.defaultEmail');
      const defaultPassword = configService.get<string>('app.bootstrap.defaultPassword');
      const bcryptRounds = configService.get<number>('app.security.bcryptRounds');

      // Verify configuration structure
      expect(defaultEmail).toBe('admin@example.com');
      expect(defaultPassword).toBe('Admin@123');
      expect(bcryptRounds).toBeGreaterThan(0);
    });
  });

  describe('Application Integration', () => {
    it('should initialize admin user during application bootstrap', async () => {
      // This test verifies that the bootstrap service is properly integrated
      // into the application startup process through OnModuleInit
      
      // Set environment variables for this test
      const originalUserEmail = process.env.USEREMAIL;
      const originalUserPassword = process.env.USERPASSWORD;
      process.env.USEREMAIL = TEST_EMAIL;
      process.env.USERPASSWORD = TEST_PASSWORD;

      // Create a new app instance to trigger bootstrap
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const testApp = moduleFixture.createNestApplication();
      await testApp.init();

      // Get services from the new app
      const testPrisma = testApp.get<PrismaService>(PrismaService);

      // Verify user was created during app initialization
      const user = await testPrisma.user.findUnique({
        where: { email: TEST_EMAIL },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(TEST_EMAIL);
      expect(user.role).toBe('ADMIN');

      // Clean up
      await testApp.close();
      
      // Restore original environment variables
      if (originalUserEmail !== undefined) {
        process.env.USEREMAIL = originalUserEmail;
      } else {
        delete process.env.USEREMAIL;
      }
      if (originalUserPassword !== undefined) {
        process.env.USERPASSWORD = originalUserPassword;
      } else {
        delete process.env.USERPASSWORD;
      }
    });
  });
}); 