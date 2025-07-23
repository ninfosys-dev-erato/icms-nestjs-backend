# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Government CMS Backend. The testing approach follows the testing pyramid principle with a focus on test-driven development (TDD) and automated testing.

## Testing Philosophy

### 1. Test-Driven Development (TDD)
- **Red-Green-Refactor** cycle
- **Write tests first** before implementation
- **Continuous testing** throughout development
- **Test coverage** minimum 80%

### 2. Testing Pyramid
```
┌─────────────────────────────────────┐
│         Testing Strategy            │
│                                     │
│           E2E Tests                 │
│        ┌─────────────┐              │
│        │Integration  │              │
│        │   Tests     │              │
│        └─────────────┘              │
│     ┌─────────────────────┐         │
│     │    Unit Tests       │         │
│     └─────────────────────┘         │
└─────────────────────────────────────┘
```

### 3. Testing Principles
- **Fast:** Tests should run quickly
- **Reliable:** Tests should be deterministic
- **Isolated:** Tests should not depend on each other
- **Maintainable:** Tests should be easy to understand and modify

## Testing Tools

### 1. Unit Testing
- **Jest:** Primary testing framework
- **@nestjs/testing:** Nest.js testing utilities
- **ts-jest:** TypeScript support for Jest

### 2. Integration Testing
- **Supertest:** HTTP testing library
- **@nestjs/testing:** Module testing utilities
- **Testcontainers:** Database testing

### 3. E2E Testing
- **Jest:** Test runner
- **Supertest:** HTTP client
- **Testcontainers:** External services

### 4. Code Coverage
- **Jest Coverage:** Built-in coverage reporting
- **Istanbul:** Coverage instrumentation
- **Coveralls:** Coverage reporting service

## Unit Testing

### 1. Service Testing

#### Service Test Structure
```typescript
describe('OfficeSettingsService', () => {
  let service: OfficeSettingsService;
  let repository: OfficeSettingsRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OfficeSettingsService,
        {
          provide: OfficeSettingsRepository,
          useValue: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfficeSettingsService>(OfficeSettingsService);
    repository = module.get<OfficeSettingsRepository>(OfficeSettingsRepository);
  });

  describe('getOfficeSettings', () => {
    it('should return office settings', async () => {
      // Arrange
      const mockSettings = { id: '1', officeName: { en: 'Test', ne: 'परीक्षण' } };
      jest.spyOn(repository, 'findFirst').mockResolvedValue(mockSettings);

      // Act
      const result = await service.getOfficeSettings();

      // Assert
      expect(result).toEqual(mockSettings);
      expect(repository.findFirst).toHaveBeenCalled();
    });

    it('should throw error when settings not found', async () => {
      // Arrange
      jest.spyOn(repository, 'findFirst').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getOfficeSettings()).rejects.toThrow('Office settings not found');
    });
  });
});
```

#### Service Test Categories
- **Happy Path Tests:** Test successful operations
- **Error Path Tests:** Test error scenarios
- **Edge Case Tests:** Test boundary conditions
- **Validation Tests:** Test input validation

### 2. Repository Testing

#### Repository Test Structure
```typescript
describe('OfficeSettingsRepository', () => {
  let repository: OfficeSettingsRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OfficeSettingsRepository,
        {
          provide: PrismaService,
          useValue: {
            officeSettings: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<OfficeSettingsRepository>(OfficeSettingsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findFirst', () => {
    it('should return first office settings', async () => {
      // Arrange
      const mockSettings = { id: '1', officeName: { en: 'Test', ne: 'परीक्षण' } };
      jest.spyOn(prisma.officeSettings, 'findFirst').mockResolvedValue(mockSettings);

      // Act
      const result = await repository.findFirst();

      // Assert
      expect(result).toEqual(mockSettings);
      expect(prisma.officeSettings.findFirst).toHaveBeenCalled();
    });
  });
});
```

### 3. DTO Testing

#### DTO Validation Tests
```typescript
describe('CreateOfficeSettingsDto', () => {
  let validator: ValidationPipe;

  beforeEach(() => {
    validator = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  });

  it('should validate correct data', async () => {
    // Arrange
    const dto = new CreateOfficeSettingsDto();
    dto.directorate = { en: 'Test', ne: 'परीक्षण' };
    dto.officeName = { en: 'Test Office', ne: 'परीक्षण कार्यालय' };
    dto.email = 'test@example.com';

    // Act
    const result = await validator.transform(dto, {} as ArgumentMetadata);

    // Assert
    expect(result).toBeDefined();
  });

  it('should reject invalid email', async () => {
    // Arrange
    const dto = new CreateOfficeSettingsDto();
    dto.email = 'invalid-email';

    // Act & Assert
    await expect(validator.transform(dto, {} as ArgumentMetadata)).rejects.toThrow();
  });
});
```

### 4. Guard Testing

#### Guard Test Structure
```typescript
describe('OfficeSettingsGuard', () => {
  let guard: OfficeSettingsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OfficeSettingsGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<OfficeSettingsGuard>(OfficeSettingsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow admin access', () => {
      // Arrange
      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: 'ADMIN' },
          }),
        }),
      };

      // Act
      const result = guard.canActivate(context as any);

      // Assert
      expect(result).toBe(true);
    });

    it('should deny non-admin access', () => {
      // Arrange
      const context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: 'VIEWER' },
          }),
        }),
      };

      // Act
      const result = guard.canActivate(context as any);

      // Assert
      expect(result).toBe(false);
    });
  });
});
```

## Integration Testing

### 1. Module Integration Testing

#### Module Test Structure
```typescript
describe('OfficeSettingsModule', () => {
  let module: TestingModule;
  let service: OfficeSettingsService;
  let repository: OfficeSettingsRepository;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [OfficeSettingsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        officeSettings: {
          findFirst: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      })
      .compile();

    service = module.get<OfficeSettingsService>(OfficeSettingsService);
    repository = module.get<OfficeSettingsRepository>(OfficeSettingsRepository);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should handle complete workflow', async () => {
    // Test complete module workflow
    const createDto = {
      directorate: { en: 'Test', ne: 'परीक्षण' },
      officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
      email: 'test@example.com',
    };

    const result = await service.createOfficeSettings(createDto);
    expect(result).toBeDefined();
  });
});
```

### 2. Database Integration Testing

#### Database Test Setup
```typescript
describe('OfficeSettingsRepository Integration', () => {
  let repository: OfficeSettingsRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanDatabase();
    
    const module = await Test.createTestingModule({
      providers: [
        OfficeSettingsRepository,
        PrismaService,
      ],
    }).compile();

    repository = module.get<OfficeSettingsRepository>(OfficeSettingsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should create and retrieve office settings', async () => {
    // Arrange
    const createDto = {
      directorate: { en: 'Test', ne: 'परीक्षण' },
      officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
      email: 'test@example.com',
    };

    // Act
    const created = await repository.create(createDto);
    const retrieved = await repository.findById(created.id);

    // Assert
    expect(retrieved).toEqual(created);
  });
});
```

### 3. External Service Integration Testing

#### S3 Service Integration Test
```typescript
describe('S3Service Integration', () => {
  let s3Service: S3Service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: 'S3_CLIENT',
          useValue: createMockS3Client(),
        },
      ],
    }).compile();

    s3Service = module.get<S3Service>(S3Service);
  });

  it('should upload file to S3', async () => {
    // Arrange
    const file = createMockFile();
    const bucket = 'test-bucket';
    const key = 'test-key';

    // Act
    const result = await s3Service.uploadFile(file, bucket, key);

    // Assert
    expect(result).toBeDefined();
    expect(result.url).toContain(bucket);
  });
});
```

## E2E Testing

### 1. API Endpoint Testing

#### E2E Test Structure
```typescript
describe('OfficeSettings E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createTestPrismaService())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('/api/v1/office-settings (GET)', () => {
    it('should return office settings', async () => {
      // Arrange
      const settings = await createTestOfficeSettings();

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/v1/office-settings')
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(settings.id);
    });

    it('should return 404 when no settings exist', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/office-settings')
        .expect(404);
    });
  });

  describe('/api/v1/admin/office-settings (POST)', () => {
    it('should create office settings', async () => {
      // Arrange
      const createDto = {
        directorate: { en: 'Test', ne: 'परीक्षण' },
        officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
        email: 'test@example.com',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/admin/office-settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.officeName).toEqual(createDto.officeName);
    });

    it('should reject invalid data', async () => {
      // Arrange
      const invalidDto = {
        email: 'invalid-email',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/admin/office-settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });
});
```

### 2. Authentication Testing

#### Authentication E2E Tests
```typescript
describe('Authentication E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should authenticate valid user', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@example.com',
        password: 'password123',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginDto.email);
    });

    it('should reject invalid credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });
});
```

### 3. File Upload Testing

#### File Upload E2E Tests
```typescript
describe('File Upload E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/v1/admin/office-settings/{id}/background-photo (POST)', () => {
    it('should upload background photo', async () => {
      // Arrange
      const settings = await createTestOfficeSettings();
      const file = createTestImageFile();

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/v1/admin/office-settings/${settings.id}/background-photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', file.buffer, file.originalname)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.backgroundPhoto).toBeDefined();
    });

    it('should reject invalid file type', async () => {
      // Arrange
      const settings = await createTestOfficeSettings();
      const file = createTestTextFile();

      // Act & Assert
      await request(app.getHttpServer())
        .post(`/api/v1/admin/office-settings/${settings.id}/background-photo`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', file.buffer, file.originalname)
        .expect(400);
    });
  });
});
```

## Performance Testing

### 1. Load Testing

#### Load Test Structure
```typescript
describe('Performance Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should handle concurrent requests', async () => {
    // Arrange
    const concurrentRequests = 100;
    const requests = Array(concurrentRequests).fill(null).map(() =>
      request(app.getHttpServer())
        .get('/api/v1/office-settings')
        .expect(200)
    );

    // Act
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    // Assert
    expect(responses).toHaveLength(concurrentRequests);
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
  });

  it('should respond within acceptable time', async () => {
    // Act
    const startTime = Date.now();
    await request(app.getHttpServer())
      .get('/api/v1/office-settings')
      .expect(200);
    const endTime = Date.now();

    // Assert
    expect(endTime - startTime).toBeLessThan(100); // 100ms
  });
});
```

### 2. Memory Testing

#### Memory Leak Test
```typescript
describe('Memory Tests', () => {
  it('should not have memory leaks', async () => {
    // Arrange
    const initialMemory = process.memoryUsage().heapUsed;
    const iterations = 1000;

    // Act
    for (let i = 0; i < iterations; i++) {
      await performMemoryIntensiveOperation();
    }

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Assert
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
  });
});
```

## Test Utilities

### 1. Test Data Factories

#### Factory Pattern
```typescript
export class OfficeSettingsFactory {
  static create(overrides: Partial<CreateOfficeSettingsDto> = {}): CreateOfficeSettingsDto {
    return {
      directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
      officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
      officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
      email: 'test@example.com',
      phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      ...overrides,
    };
  }

  static createEntity(overrides: Partial<OfficeSettings> = {}): OfficeSettings {
    return {
      id: 'test-id',
      directorate: { en: 'Test Directorate', ne: 'परीक्षण निर्देशनालय' },
      officeName: { en: 'Test Office', ne: 'परीक्षण कार्यालय' },
      officeAddress: { en: 'Test Address', ne: 'परीक्षण ठेगाना' },
      email: 'test@example.com',
      phoneNumber: { en: '+977-123456789', ne: '+९७७-१२३४५६७८९' },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
```

### 2. Test Helpers

#### Database Helpers
```typescript
export class TestDatabaseHelper {
  static async cleanDatabase(): Promise<void> {
    // Clean all tables
    await prisma.officeSettings.deleteMany();
    await prisma.user.deleteMany();
    // ... other tables
  }

  static async createTestUser(role: UserRole = 'ADMIN'): Promise<User> {
    return prisma.user.create({
      data: {
        email: 'test@example.com',
        password: await hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        role,
      },
    });
  }

  static async createTestOfficeSettings(): Promise<OfficeSettings> {
    return prisma.officeSettings.create({
      data: OfficeSettingsFactory.create(),
    });
  }
}
```

### 3. Mock Factories

#### Mock Factories
```typescript
export class MockFactory {
  static createMockFile(): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 4,
      stream: null,
      destination: null,
      filename: null,
      path: null,
    };
  }

  static createMockUser(role: UserRole = 'ADMIN'): User {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
```

## Test Configuration

### 1. Jest Configuration

#### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testTimeout: 10000,
};
```

### 2. Test Environment Setup

#### test/setup.ts
```typescript
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';

beforeAll(async () => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});

afterAll(async () => {
  // Cleanup test environment
});

beforeEach(async () => {
  // Setup before each test
});

afterEach(async () => {
  // Cleanup after each test
});
```

## Continuous Integration

### 1. GitHub Actions Workflow

#### .github/workflows/test.yml
```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    
    - name: Use Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

### 2. Test Scripts

#### package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:ci": "jest --coverage --ci --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand"
  }
}
```

## Test Reporting

### 1. Coverage Reports
- **HTML Coverage:** Detailed coverage reports
- **Console Coverage:** Terminal coverage output
- **Coverage Badges:** GitHub badges for coverage

### 2. Test Reports
- **JUnit Reports:** CI/CD integration
- **HTML Reports:** Detailed test results
- **Console Reports:** Terminal test output

### 3. Performance Reports
- **Performance Metrics:** Response time tracking
- **Memory Usage:** Memory consumption tracking
- **Load Test Results:** Concurrent request handling

## Best Practices

### 1. Test Organization
- **Group related tests** using describe blocks
- **Use descriptive test names** that explain the scenario
- **Follow AAA pattern** (Arrange, Act, Assert)
- **Keep tests independent** and isolated

### 2. Test Data Management
- **Use factories** for creating test data
- **Clean up test data** after each test
- **Use realistic test data** that matches production
- **Avoid hardcoded values** in tests

### 3. Mocking Strategy
- **Mock external dependencies** (databases, APIs)
- **Use realistic mocks** that simulate real behavior
- **Avoid over-mocking** that makes tests brittle
- **Document mock behavior** clearly

### 4. Performance Considerations
- **Run tests in parallel** when possible
- **Use test databases** for integration tests
- **Optimize test setup** and teardown
- **Monitor test execution time**

## Troubleshooting

### 1. Common Issues
- **Database connection issues** in integration tests
- **Memory leaks** in long-running tests
- **Async/await** timing issues
- **Mock configuration** problems

### 2. Debugging Tips
- **Use debugger statements** for step-by-step debugging
- **Add console.log** for temporary debugging
- **Use Jest --verbose** for detailed output
- **Check test isolation** when tests fail intermittently

### 3. Performance Issues
- **Database connection pooling** for integration tests
- **Test data cleanup** to prevent accumulation
- **Mock external services** to reduce test time
- **Parallel test execution** where possible 