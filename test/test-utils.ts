import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  accessToken: string;
  refreshToken: string;
}

export class TestUtils {
  static async cleanupDatabase(prisma: PrismaService): Promise<void> {
    try {
      // Use a more robust cleanup approach without requiring special permissions
      await prisma.$transaction(async (tx) => {
        // Clear tables in proper order to avoid foreign key constraints
        const tables = [
          'search_suggestions',
          'search_results', 
          'search_queries',
          'search_indices',
          'document_versions',
          'document_downloads',
          'documents',
          'header_configs',
          'menu_items',
          'menus',
          'employees',
          'departments',
          'sliders',
          'media_album_media',
          'media_albums',
          'media',
          'faqs',
          'important_links',
          'content_attachments',
          'contents',
          'categories',
          'office_descriptions',
          'office_settings',
          'global_translations',
          'audit_logs',
          'login_attempts',
          'user_sessions',
          'users',
        ];

        // Clear tables in order to avoid foreign key constraints
        for (const table of tables) {
          try {
            await tx.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
          } catch (error) {
            // If TRUNCATE fails, try DELETE
            try {
              await tx.$executeRawUnsafe(`DELETE FROM "${table}";`);
            } catch (deleteError) {
              // Ignore errors for tables that might not exist or be empty
              console.warn(`Failed to clear ${table}:`, deleteError.message);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Cleanup error:', error.message);
      // Fallback: try individual table cleanup
      try {
        await this.fallbackCleanup(prisma);
      } catch (fallbackError) {
        console.warn('Fallback cleanup also failed:', fallbackError.message);
      }
    }
  }

  static async fallbackCleanup(prisma: PrismaService): Promise<void> {
    // Fallback cleanup method that handles each table individually
    const tables = [
      'search_suggestions',
      'search_results',
      'search_queries', 
      'search_indices',
      'document_versions',
      'document_downloads',
      'documents',
      'header_configs',
      'menu_items',
      'menus',
      'employees',
      'departments',
      'sliders',
      'media_album_media',
      'media_albums',
      'media',
      'faqs',
      'important_links',
      'content_attachments',
      'contents',
      'categories',
      'office_descriptions',
      'office_settings',
      'global_translations',
      'audit_logs',
      'login_attempts',
      'user_sessions',
      'users',
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
        await this.wait(10); // Small delay between operations
      } catch (error) {
        // Ignore errors for tables that might not exist
        console.warn(`Failed to clear ${table} in fallback:`, error.message);
      }
    }
  }

  static async createTestUser(
    prisma: PrismaService,
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: string;
    },
    options: { useExactEmail?: boolean } = {}
  ): Promise<TestUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const email = options.useExactEmail ? userData.email : `${userData.email}-${Date.now()}-${Math.random()}`;
    
    const testUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: (userData.role || 'ADMIN') as 'ADMIN' | 'EDITOR' | 'VIEWER',
        isActive: true,
        isEmailVerified: true,
      },
    });

    // Generate JWT tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-for-testing-only';
    
    const accessToken = jwt.sign(
      { 
        sub: testUser.id, 
        email: testUser.email, 
        role: testUser.role 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { 
        sub: testUser.id, 
        email: testUser.email, 
        role: testUser.role 
      },
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    return {
      id: testUser.id,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      role: testUser.role,
      accessToken,
      refreshToken,
    };
  }

  static async createAuthToken(prisma: PrismaService): Promise<string> {
    const testUser = await this.createTestUser(prisma, {
      email: 'admin',
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    });

    return testUser.accessToken;
  }

  static async loginUser(
    app: INestApplication,
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    return {
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
    };
  }

  static generateValidPassword(): string {
    return 'Password123!';
  }

  static generateValidEmail(): string {
    return `test-${Date.now()}-${Math.random()}@example.com`;
  }

  static generateInvalidEmail(): string {
    return 'invalid-email-format';
  }

  static generateWeakPassword(): string {
    return '123';
  }

  static generateMismatchedPassword(): string {
    return 'DifferentPassword123!';
  }

  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 500,
    operationName: string = 'Database operation'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Check if it's a deadlock or retryable error
        const isRetryable = error.message?.includes('deadlock') || 
                           error.message?.includes('40P01') ||
                           error.message?.includes('Connection') ||
                           error.message?.includes('timeout');
        
        if (isRetryable) {
          console.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
          await this.wait(delayMs);
          // Increase delay for next attempt (exponential backoff)
          delayMs *= 1.5;
        } else {
          // Non-retryable error, throw immediately
          throw error;
        }
      }
    }
    
    throw lastError;
  }

  static mockRequestData() {
    return {
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Test Browser)',
    };
  }

  // Helper method to create test data with proper sequencing
  static async createSequentialData<T>(
    prisma: PrismaService,
    dataArray: any[],
    createFunction: (data: any) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    for (const data of dataArray) {
      try {
        const result = await createFunction(data);
        results.push(result);
        // Small delay to prevent deadlocks
        await this.wait(10);
      } catch (error) {
        console.warn('Failed to create data:', error.message);
        throw error;
      }
    }
    return results;
  }

  // Helper to ensure database is clean before each test
  static async ensureCleanDatabase(prisma: PrismaService): Promise<void> {
    await this.cleanupDatabase(prisma);
    // Wait a bit to ensure cleanup is complete
    await this.wait(100);
  }

  // Helper to create a test user session
  static async createUserSession(
    prisma: PrismaService,
    userId: string,
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    await prisma.userSession.create({
      data: {
        userId,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
      },
    });
  }
}

export const testConstants = {
  validPassword: 'Password123!',
  weakPassword: '123',
  validEmail: 'test@example.com',
  invalidEmail: 'invalid-email',
  firstName: 'John',
  lastName: 'Doe',
  role: 'VIEWER',
} as const; 