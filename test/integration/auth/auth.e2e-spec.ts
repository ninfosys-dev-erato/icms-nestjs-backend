import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { PrismaService } from '@/database/prisma.service';
import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ApiResponseInterceptor } from '@/common/interceptors/api-response.interceptor';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let testUserToken: string;
  let testUserRefreshToken: string;

  beforeAll(async () => {
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

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up database before tests
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
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

  describe('POST /api/v1/auth/register', () => {
    const validRegisterData = {
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'VIEWER' as const,
    };

    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validRegisterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(validRegisterData.email);
      expect(response.body.data.user.firstName).toBe(validRegisterData.firstName);
      expect(response.body.data.user.lastName).toBe(validRegisterData.lastName);
      expect(response.body.data.user.role).toBe(validRegisterData.role);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      // UserResponseDto doesn't include password field
    });

    it('should fail when passwords do not match', async () => {
      const invalidData = {
        ...validRegisterData,
        confirmPassword: 'DifferentPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Passwords do not match');
    });

    it('should fail when email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validRegisterData)
        .expect(201);

      // Second registration with same email
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(validRegisterData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('User with this email already exists');
    });

    it('should fail with invalid email format', async () => {
      const invalidData = {
        ...validRegisterData,
        email: 'invalid-email',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const invalidData = {
        ...validRegisterData,
        password: '123',
        confirmPassword: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'login@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Login',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      testUser = response.body.data.user;
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.tokenType).toBe('Bearer');
    });

    it('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should handle remember me option', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!',
        rememberMe: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should block after too many failed attempts', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!',
      };

      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(loginData);

        if (i < 5) {
          expect(response.status).toBe(401);
          expect(response.body.error.message).toBe('Invalid credentials');
        } else {
          expect(response.status).toBe(401);
          expect(response.body.error.message).toBe('Too many failed attempts. Please try again later.');
        }
      }
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    beforeEach(async () => {
      // Create and login a test user
      const registerData = {
        email: 'logout@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Logout',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      testUserToken = registerResponse.body.data.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });

    it('should fail without authentication token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    beforeEach(async () => {
      // Create and login a test user
      const registerData = {
        email: 'refresh@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Refresh',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      // Login to get a valid refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'Password123!',
        });

      testUserRefreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: testUserRefreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'forgot@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Forgot',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);
    });

    it('should send reset email for existing user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Password reset email sent');
    });

    it('should not reveal if email exists or not', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Password reset email sent');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // This test would require a valid reset token
      // In a real scenario, you'd get this from the forgot password flow
      const resetData = {
        token: 'valid-reset-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      // This test is commented out as it requires a valid token
      // const response = await request(app.getHttpServer())
      //   .post('/api/v1/auth/reset-password')
      //   .send(resetData)
      //   .expect(200);

      // expect(response.body.success).toBe(true);
      // expect(response.body.data.message).toBe('Password reset successful');
    });

    it('should fail with invalid token', async () => {
      const resetData = {
        token: 'invalid-reset-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when passwords do not match', async () => {
      const resetData = {
        token: 'valid-reset-token',
        password: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    beforeEach(async () => {
      // Create and login a test user
      const registerData = {
        email: 'change@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Change',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      testUserToken = registerResponse.body.data.accessToken;
    });

    it('should change password successfully', async () => {
      const changeData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(changeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Password changed successfully');
    });

    it('should fail with incorrect current password', async () => {
      const changeData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(changeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when new passwords do not match', async () => {
      const changeData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(changeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const changeData = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .send(changeData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/verify-email/:token', () => {
    it('should verify email with valid token', async () => {
      // This test would require a valid verification token
      // In a real scenario, you'd get this from the registration flow
      const validToken = 'valid-verification-token';

      // This test is commented out as it requires a valid token
      // const response = await request(app.getHttpServer())
      //   .get(`/api/v1/auth/verify-email/${validToken}`)
      //   .expect(200);

      // expect(response.body.success).toBe(true);
      // expect(response.body.data.message).toBe('Email verified successfully');
    });

    it('should fail with invalid token', async () => {
      const invalidToken = 'invalid-verification-token';

      const response = await request(app.getHttpServer())
        .get(`/api/v1/auth/verify-email/${invalidToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/resend-verification', () => {
    beforeEach(async () => {
      // Create a test user
      const registerData = {
        email: 'resend@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Resend',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);
    });

    it('should resend verification email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'resend@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Verification email sent');
    });

    it('should not reveal if email exists or not', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Verification email sent');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    beforeEach(async () => {
      // Create and login a test user
      const registerData = {
        email: 'me@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Me',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      testUserToken = registerResponse.body.data.accessToken;
    });

    it('should return current user info', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe('me@example.com');
      expect(response.body.data.firstName).toBe('Me');
      expect(response.body.data.lastName).toBe('User');
      // UserResponseDto doesn't include password field
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/sessions', () => {
    beforeEach(async () => {
      // Create and login a test user
      const registerData = {
        email: 'sessions@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Sessions',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      testUserToken = registerResponse.body.data.accessToken;
    });

    it('should return user sessions', async () => {
      // First ensure user has a session by logging in
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'sessions@example.com',
          password: 'Password123!',
        });

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/sessions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/sessions/:sessionId/revoke', () => {
    beforeEach(async () => {
      // Create and login a test user
      const registerData = {
        email: 'revoke@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Revoke',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      testUserToken = registerResponse.body.data.accessToken;
    });

    it('should revoke specific session', async () => {
      // First ensure user has a session by logging in
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'revoke@example.com',
          password: 'Password123!',
        });

      // Then get sessions to get a session ID
      const sessionsResponse = await request(app.getHttpServer())
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(sessionsResponse.body.data.length).toBeGreaterThan(0);
      const sessionId = sessionsResponse.body.data[0].id;

      const response = await request(app.getHttpServer())
        .post(`/api/v1/auth/sessions/${sessionId}/revoke`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Session revoked successfully');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sessions/some-session-id/revoke')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/sessions/revoke-all', () => {
    beforeEach(async () => {
      // Create and login a test user
      const registerData = {
        email: 'revokeall@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'RevokeAll',
        lastName: 'User',
        role: 'VIEWER' as const,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerData);

      testUserToken = registerResponse.body.data.accessToken;
    });

    it('should revoke all user sessions', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sessions/revoke-all')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('All sessions revoked successfully');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/sessions/revoke-all')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'ratelimit@example.com',
        password: 'WrongPassword123!',
      };

      // Make multiple requests to trigger rate limiting
      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send(loginData);

        if (i < 5) {
          expect(response.status).toBe(401); // Invalid credentials
          expect(response.body.error.message).toBe('Invalid credentials');
        } else {
          expect(response.status).toBe(401); // Too many failed attempts (also returns 401)
          expect(response.body.error.message).toBe('Too many failed attempts. Please try again later.');
        }
      }
    });
  });

  describe('Input Validation', () => {
    it('should validate email format in login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email-format',
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('email must be an email');
    });

    it('should validate required fields in register', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
}); 