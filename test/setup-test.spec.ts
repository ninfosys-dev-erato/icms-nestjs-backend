import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { DatabaseModule } from '@/database/database.module';

// Set test environment variables before importing modules
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/icms_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '10';
process.env.MAX_LOGIN_ATTEMPTS = '5';
process.env.LOGIN_ATTEMPT_WINDOW = '15';
process.env.SESSION_EXPIRY_DAYS = '7';
process.env.REMEMBER_ME_EXPIRY_DAYS = '30';

describe('Test Setup', () => {
  let module: TestingModule;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        DatabaseModule,
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should connect to test database', async () => {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toEqual([{ test: 1 }]);
  });

  it('should have correct environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.DATABASE_URL).toContain('icms_test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  it('should be able to execute raw SQL', async () => {
    // Test if we can execute raw SQL (useful for cleanup)
    await expect(
      prisma.$executeRawUnsafe('SELECT 1')
    ).resolves.not.toThrow();
  });
}); 