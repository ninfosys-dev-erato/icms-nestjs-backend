import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { DatabaseModule } from '@/database/database.module';

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