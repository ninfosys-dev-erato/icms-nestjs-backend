import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as request from 'supertest';

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
    const tables = [
      'user_sessions',
      'login_attempts',
      'audit_logs',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  }

  static async createTestUser(
    app: INestApplication,
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role?: string;
    }
  ): Promise<TestUser> {
    const registerData = {
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: (userData.role || 'VIEWER') as 'ADMIN' | 'EDITOR' | 'VIEWER',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerData)
      .expect(201);

    return {
      id: response.body.data.user.id,
      email: response.body.data.user.email,
      firstName: response.body.data.user.firstName,
      lastName: response.body.data.user.lastName,
      role: response.body.data.user.role,
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
    };
  }

  static async loginUser(
    app: INestApplication,
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
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
    return `test-${Date.now()}@example.com`;
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

  static mockRequestData() {
    return {
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Test Browser)',
    };
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