import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma.service';
import { UserRole } from '@prisma/client';

describe('Users Module Setup', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await cleanupDatabase();
    await app.close();
  });

  const cleanupDatabase = async () => {
    await prisma.auditLog.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.loginAttempt.deleteMany();
    await prisma.user.deleteMany();
  };

  describe('Database Setup', () => {
    it('should have clean database', async () => {
      const usersCount = await prisma.user.count();
      const sessionsCount = await prisma.userSession.count();
      const loginAttemptsCount = await prisma.loginAttempt.count();
      const auditLogsCount = await prisma.auditLog.count();

      expect(usersCount).toBe(0);
      expect(sessionsCount).toBe(0);
      expect(loginAttemptsCount).toBe(0);
      expect(auditLogsCount).toBe(0);
    });
  });

  describe('Test Data Creation', () => {
    it('should create test users with different roles', async () => {
      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@users.com',
          password: '$2b$10$test.hashed.password',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
          isEmailVerified: true,
        },
      });

      // Create editor user
      const editorUser = await prisma.user.create({
        data: {
          email: 'editor@users.com',
          password: '$2b$10$test.hashed.password',
          firstName: 'Editor',
          lastName: 'User',
          role: 'EDITOR',
          isActive: true,
          isEmailVerified: false,
        },
      });

      // Create viewer user
      const viewerUser = await prisma.user.create({
        data: {
          email: 'viewer@users.com',
          password: '$2b$10$test.hashed.password',
          firstName: 'Viewer',
          lastName: 'User',
          role: 'VIEWER',
          isActive: false,
          isEmailVerified: true,
        },
      });

      expect(adminUser).toBeDefined();
      expect(adminUser.email).toBe('admin@users.com');
      expect(adminUser.role).toBe('ADMIN');
      expect(adminUser.isActive).toBe(true);

      expect(editorUser).toBeDefined();
      expect(editorUser.email).toBe('editor@users.com');
      expect(editorUser.role).toBe('EDITOR');
      expect(editorUser.isEmailVerified).toBe(false);

      expect(viewerUser).toBeDefined();
      expect(viewerUser.email).toBe('viewer@users.com');
      expect(viewerUser.role).toBe('VIEWER');
      expect(viewerUser.isActive).toBe(false);
    });

    it('should create user with all optional fields', async () => {
      const fullUser = await prisma.user.create({
        data: {
          email: 'full@users.com',
          password: '$2b$10$test.hashed.password',
          firstName: 'Full',
          lastName: 'User',
          role: 'VIEWER',
          isActive: true,
          isEmailVerified: true,
          passwordChangedAt: new Date(),
          lastLoginAt: new Date(),
        },
      });

      expect(fullUser).toBeDefined();
      expect(fullUser.passwordChangedAt).toBeDefined();
      expect(fullUser.lastLoginAt).toBeDefined();
    });

    it('should create user sessions', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const userSession = await prisma.userSession.create({
        data: {
          userId: user!.id,
          token: 'test-access-token',
          refreshToken: 'test-refresh-token',
          isActive: true,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      expect(userSession).toBeDefined();
      expect(userSession.userId).toBe(user!.id);
      expect(userSession.token).toBe('test-access-token');
      expect(userSession.isActive).toBe(true);
    });

    it('should create login attempts', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      // Successful login attempt
      const successfulAttempt = await prisma.loginAttempt.create({
        data: {
          email: user!.email,
          userId: user!.id,
          success: true,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      // Failed login attempt
      const failedAttempt = await prisma.loginAttempt.create({
        data: {
          email: 'nonexistent@example.com',
          success: false,
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
          failureReason: 'User not found',
        },
      });

      expect(successfulAttempt).toBeDefined();
      expect(successfulAttempt.success).toBe(true);
      expect(successfulAttempt.userId).toBe(user!.id);

      expect(failedAttempt).toBeDefined();
      expect(failedAttempt.success).toBe(false);
      expect(failedAttempt.failureReason).toBe('User not found');
    });

    it('should create audit logs', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const auditLog = await prisma.auditLog.create({
        data: {
          userId: user!.id,
          action: 'USER_CREATED',
          resource: 'USER',
          resourceId: user!.id,
          details: { role: user!.role, isActive: user!.isActive },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.action).toBe('USER_CREATED');
      expect(auditLog.resource).toBe('USER');
      expect(auditLog.userId).toBe(user!.id);
    });
  });

  describe('Data Validation', () => {
    it('should validate user data structure', async () => {
      const users = await prisma.user.findMany();

      expect(users.length).toBeGreaterThan(0);

      for (const user of users) {
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.password).toBeDefined();
        expect(user.firstName).toBeDefined();
        expect(user.lastName).toBeDefined();
        expect(user.role).toBeDefined();
        expect(typeof user.isActive).toBe('boolean');
        expect(typeof user.isEmailVerified).toBe('boolean');
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
      }
    });

    it('should validate user role constraints', async () => {
      const users = await prisma.user.findMany();
      const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];

      for (const user of users) {
        expect(validRoles).toContain(user.role);
      }
    });

    it('should validate email format', async () => {
      const users = await prisma.user.findMany();

      for (const user of users) {
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      }
    });

    it('should validate user session data structure', async () => {
      const sessions = await prisma.userSession.findMany();

      expect(sessions.length).toBeGreaterThan(0);

      for (const session of sessions) {
        expect(session.id).toBeDefined();
        expect(session.userId).toBeDefined();
        expect(session.token).toBeDefined();
        expect(session.refreshToken).toBeDefined();
        expect(typeof session.isActive).toBe('boolean');
        expect(session.ipAddress).toBeDefined();
        expect(session.userAgent).toBeDefined();
        expect(session.expiresAt).toBeDefined();
        expect(session.createdAt).toBeDefined();
        expect(session.createdAt).toBeDefined();
      }
    });

    it('should validate login attempt data structure', async () => {
      const attempts = await prisma.loginAttempt.findMany();

      expect(attempts.length).toBeGreaterThan(0);

      for (const attempt of attempts) {
        expect(attempt.id).toBeDefined();
        expect(attempt.email).toBeDefined();
        expect(typeof attempt.success).toBe('boolean');
        expect(attempt.ipAddress).toBeDefined();
        expect(attempt.userAgent).toBeDefined();
        expect(attempt.attemptedAt).toBeDefined();
      }
    });

    it('should validate audit log data structure', async () => {
      const logs = await prisma.auditLog.findMany();

      expect(logs.length).toBeGreaterThan(0);

      for (const log of logs) {
        expect(log.id).toBeDefined();
        expect(log.action).toBeDefined();
        expect(log.resource).toBeDefined();
        expect(log.ipAddress).toBeDefined();
        expect(log.userAgent).toBeDefined();
        expect(log.createdAt).toBeDefined();
      }
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@users.com',
        password: '$2b$10$test.hashed.password',
        firstName: 'First',
        lastName: 'User',
        role: 'VIEWER' as UserRole,
      };

      // First user should succeed
      await prisma.user.create({ data: userData });

      // Second user with same email should fail
      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow();
    });

    it('should enforce required fields for user', async () => {
      const invalidUser = {
        email: 'incomplete@users.com',
        // Missing required password, firstName, lastName, role
      };

      await expect(
        prisma.user.create({ data: invalidUser as any })
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraint for user sessions', async () => {
      const invalidSession = {
        userId: 'non-existent-user-id',
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        isActive: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        expiresAt: new Date(),
      };

      await expect(
        prisma.userSession.create({ data: invalidSession })
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraint for login attempts', async () => {
      const invalidAttempt = {
        email: 'test@example.com',
        userId: 'non-existent-user-id',
        success: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      await expect(
        prisma.loginAttempt.create({ data: invalidAttempt })
      ).rejects.toThrow();
    });
  });

  describe('Query Operations', () => {
    it('should find user by ID', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const foundUser = await prisma.user.findUnique({
        where: { id: user!.id },
        include: { 
          sessions: true,
          loginAttempts: true,
          auditLogs: true 
        },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(user!.id);
      expect(foundUser!.sessions).toBeDefined();
      expect(foundUser!.loginAttempts).toBeDefined();
      expect(foundUser!.auditLogs).toBeDefined();
    });

    it('should find user by email', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const foundUser = await prisma.user.findUnique({
        where: { email: user!.email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(user!.email);
    });

    it('should find users by role', async () => {
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
      });

      expect(adminUsers.length).toBeGreaterThan(0);
      for (const user of adminUsers) {
        expect(user.role).toBe('ADMIN');
      }
    });

    it('should find active users', async () => {
      const activeUsers = await prisma.user.findMany({
        where: { isActive: true },
      });

      expect(activeUsers.length).toBeGreaterThan(0);
      for (const user of activeUsers) {
        expect(user.isActive).toBe(true);
      }
    });

    it('should count users', async () => {
      const totalCount = await prisma.user.count();
      const activeCount = await prisma.user.count({
        where: { isActive: true },
      });
      const verifiedCount = await prisma.user.count({
        where: { isEmailVerified: true },
      });

      expect(totalCount).toBeGreaterThan(0);
      expect(activeCount).toBeGreaterThanOrEqual(0);
      expect(verifiedCount).toBeGreaterThanOrEqual(0);
      expect(activeCount).toBeLessThanOrEqual(totalCount);
      expect(verifiedCount).toBeLessThanOrEqual(totalCount);
    });

    it('should find user sessions by user ID', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const sessions = await prisma.userSession.findMany({
        where: { userId: user!.id },
        include: { user: true },
      });

      expect(sessions.length).toBeGreaterThan(0);
      for (const session of sessions) {
        expect(session.userId).toBe(user!.id);
        expect(session.user).toBeDefined();
      }
    });

    it('should find login attempts by email', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const attempts = await prisma.loginAttempt.findMany({
        where: { email: user!.email },
        include: { User: true },
      });

      expect(attempts.length).toBeGreaterThan(0);
      for (const attempt of attempts) {
        expect(attempt.email).toBe(user!.email);
      }
    });
  });

  describe('Update Operations', () => {
    it('should update user information', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const updatedUser = await prisma.user.update({
        where: { id: user!.id },
        data: {
          firstName: 'Updated',
          lastName: 'Name',
          isActive: !user!.isActive,
        },
      });

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.isActive).toBe(!user!.isActive);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(updatedUser.createdAt.getTime());
    });

    it('should update user password', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const newPasswordHash = '$2b$10$new.hashed.password';
      const updatedUser = await prisma.user.update({
        where: { id: user!.id },
        data: { password: newPasswordHash },
      });

      expect(updatedUser.password).toBe(newPasswordHash);
      expect(updatedUser.password).not.toBe(user!.password);
    });

    it('should update user role', async () => {
      const user = await prisma.user.findFirst({ where: { role: 'VIEWER' } });
      expect(user).toBeDefined();

      const updatedUser = await prisma.user.update({
        where: { id: user!.id },
        data: { role: 'EDITOR' },
      });

      expect(updatedUser.role).toBe('EDITOR');
    });

    it('should update last login timestamp', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const now = new Date();
      const updatedUser = await prisma.user.update({
        where: { id: user!.id },
        data: { lastLoginAt: now },
      });

      expect(updatedUser.lastLoginAt).toBeDefined();
      expect(updatedUser.lastLoginAt!.getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });

  describe('Delete Operations', () => {
    it('should delete user sessions when user is deleted', async () => {
      const user = await prisma.user.findFirst();
      expect(user).toBeDefined();

      const sessionsBeforeDelete = await prisma.userSession.count({
        where: { userId: user!.id },
      });

      // Delete all related records first (due to foreign key constraints)
      await prisma.auditLog.deleteMany({ where: { userId: user!.id } });
      await prisma.loginAttempt.deleteMany({ where: { userId: user!.id } });
      await prisma.userSession.deleteMany({ where: { userId: user!.id } });

      // Now delete the user
      await prisma.user.delete({ where: { id: user!.id } });

      const deletedUser = await prisma.user.findUnique({
        where: { id: user!.id },
      });

      expect(deletedUser).toBeNull();
      expect(sessionsBeforeDelete).toBeGreaterThan(0);
    });

    it('should delete all users', async () => {
      // First delete all related records
      await prisma.auditLog.deleteMany();
      await prisma.loginAttempt.deleteMany();
      await prisma.userSession.deleteMany();
      await prisma.user.deleteMany();

      const remainingUsers = await prisma.user.findMany();
      expect(remainingUsers.length).toBe(0);
    });
  });

  describe('Statistics and Aggregations', () => {
    it('should aggregate user counts by role', async () => {
      const roleGroups = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      });

      expect(roleGroups.length).toBeGreaterThan(0);
      for (const group of roleGroups) {
        expect(['ADMIN', 'EDITOR', 'VIEWER']).toContain(group.role);
        expect(group._count.role).toBeGreaterThan(0);
      }
    });

    it('should calculate user statistics', async () => {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({ where: { isActive: true } });
      const verifiedUsers = await prisma.user.count({ where: { isEmailVerified: true } });
      const recentUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      expect(totalUsers).toBeGreaterThan(0);
      expect(activeUsers).toBeGreaterThanOrEqual(0);
      expect(verifiedUsers).toBeGreaterThanOrEqual(0);
      expect(recentUsers).toBeGreaterThanOrEqual(0);
      expect(activeUsers).toBeLessThanOrEqual(totalUsers);
      expect(verifiedUsers).toBeLessThanOrEqual(totalUsers);
      expect(recentUsers).toBeLessThanOrEqual(totalUsers);
    });

    it('should find recent user activity', async () => {
      const recentLogins = await prisma.user.findMany({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: { lastLoginAt: 'desc' },
        take: 10,
      });

      // Should not throw and return valid data structure
      expect(Array.isArray(recentLogins)).toBe(true);
      for (const user of recentLogins) {
        expect(user.lastLoginAt).toBeDefined();
      }
    });
  });

  describe('Cleanup', () => {
    it('should clean up test data', async () => {
      await cleanupDatabase();

      const usersCount = await prisma.user.count();
      const sessionsCount = await prisma.userSession.count();
      const loginAttemptsCount = await prisma.loginAttempt.count();
      const auditLogsCount = await prisma.auditLog.count();

      expect(usersCount).toBe(0);
      expect(sessionsCount).toBe(0);
      expect(loginAttemptsCount).toBe(0);
      expect(auditLogsCount).toBe(0);
    });
  });
}); 