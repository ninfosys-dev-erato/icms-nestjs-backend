import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

// Global test setup
beforeAll(async () => {
  // Set test environment
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
  
  // Email configuration
  process.env.SMTP_HOST = 'smtp.mailtrap.io';
  process.env.SMTP_PORT = '2525';
  process.env.SMTP_USER = 'test';
  process.env.SMTP_PASS = 'test';
  process.env.SMTP_FROM = 'noreply@test.com';
  
  // Redis configuration
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  
  // AWS S3 configuration
  process.env.AWS_ACCESS_KEY_ID = 'test';
  process.env.AWS_SECRET_ACCESS_KEY = 'test';
  process.env.AWS_REGION = 'us-east-1';
  process.env.AWS_S3_BUCKET = 'test-bucket';
  
  // Rate limiting
  process.env.THROTTLE_TTL = '60000';
  process.env.THROTTLE_LIMIT = '10';
  
  // Disable logging during tests
  process.env.LOG_LEVEL = 'error';
});

// Global test teardown
afterAll(async () => {
  // Cleanup any remaining connections
  await new Promise(resolve => setTimeout(resolve, 1000));
});

// Global beforeEach to ensure clean state
beforeEach(async () => {
  // Add small delay to prevent race conditions
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Global afterEach to ensure cleanup
afterEach(async () => {
  // Add small delay to ensure proper cleanup
  await new Promise(resolve => setTimeout(resolve, 100));
}); 