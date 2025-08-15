import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UsersRepository } from './repositories/users.repository';
import { UserSessionRepository } from '../auth/repositories/user-session.repository';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  PaginatedUserResult,
  UserResponseDto,
  UserStatistics,
  UserActivityDto,
  BulkOperationDto,
  BulkOperationResult,
  ImportResult,
  ValidationResult,
  UserProfileDto,
  UpdateUserProfileDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToResponse(user);
  }

  async getAllUsers(query: UserQueryDto): Promise<PaginatedUserResult> {
    const result = await this.usersRepository.findAll(query);
    return {
      ...result,
      data: result.data.map(user => this.mapUserToResponse(user)),
    };
  }

  async getActiveUsers(query: UserQueryDto): Promise<PaginatedUserResult> {
    const result = await this.usersRepository.findActive(query);
    return {
      ...result,
      data: result.data.map(user => this.mapUserToResponse(user)),
    };
  }

  async getUsersByRole(role: string, query: UserQueryDto): Promise<PaginatedUserResult> {
    const result = await this.usersRepository.findByRole(role as any, query);
    return {
      ...result,
      data: result.data.map(user => this.mapUserToResponse(user)),
    };
  }

  async searchUsers(searchTerm: string, query: UserQueryDto): Promise<PaginatedUserResult> {
    const result = await this.usersRepository.search(searchTerm, query);
    return {
      ...result,
      data: result.data.map(user => this.mapUserToResponse(user)),
    };
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    // Validate user data
    const validation = await this.validateUser(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_CREATED',
      resource: 'USER',
      resourceId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return this.mapUserToResponse(user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate user data
    const validation = await this.validateUser(data);
    if (!validation.isValid) {
      throw new BadRequestException('Validation failed', { cause: validation.errors });
    }

    // Update user
    const updatedUser = await this.usersRepository.update(id, data);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_UPDATED',
      resource: 'USER',
      resourceId: id,
      details: { updatedFields: Object.keys(data) },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return this.mapUserToResponse(updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Deactivate all user sessions
    await this.userSessionRepository.deactivateAllUserSessions(id);

    // Delete user
    await this.usersRepository.delete(id);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_DELETED',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  async activateUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activatedUser = await this.usersRepository.activate(id);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_ACTIVATED',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return this.mapUserToResponse(activatedUser);
  }

  async deactivateUser(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Deactivate all user sessions
    await this.userSessionRepository.deactivateAllUserSessions(id);

    const deactivatedUser = await this.usersRepository.deactivate(id);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_DEACTIVATED',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return this.mapUserToResponse(deactivatedUser);
  }

  async updateUserRole(id: string, role: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersRepository.updateRole(id, role as any);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_ROLE_UPDATED',
      resource: 'USER',
      resourceId: id,
      details: { oldRole: user.role, newRole: role },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return this.mapUserToResponse(updatedUser);
  }

  async validateUser(data: CreateUserDto | UpdateUserDto): Promise<ValidationResult> {
    return this.usersRepository.validateUser(data);
  }

  async getUserStatistics(): Promise<UserStatistics> {
    return this.usersRepository.getStatistics();
  }

  async getRecentActivity(limit?: number): Promise<UserActivityDto[]> {
    return this.usersRepository.getRecentActivity(limit);
  }

  async exportUsers(query: UserQueryDto, format: 'json' | 'csv' | 'pdf'): Promise<Buffer> {
    const result = await this.getAllUsers({ ...query, limit: 1000 }); // Export up to 1000 users

    switch (format) {
      case 'json':
        return Buffer.from(JSON.stringify(result.data, null, 2));
      
      case 'csv':
        const csvHeaders = 'ID,Email,FirstName,LastName,Role,IsActive,IsEmailVerified,LastLoginAt,CreatedAt\n';
        const csvRows = result.data.map(user => 
          `${user.id},${user.email},${user.firstName},${user.lastName},${user.role},${user.isActive},${user.isEmailVerified},${user.lastLoginAt || ''},${user.createdAt}`
        ).join('\n');
        return Buffer.from(csvHeaders + csvRows);
      
      case 'pdf':
        // TODO: Implement PDF generation
        throw new BadRequestException('PDF export not implemented yet');
      
      default:
        throw new BadRequestException('Unsupported export format');
    }
  }

  async importUsers(file: Express.Multer.File): Promise<ImportResult> {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const content = file.buffer.toString();
      const lines = content.split('\n').filter(line => line.trim());

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const [email, firstName, lastName, role, password] = line.split(',');

        try {
          // Generate a random password if not provided
          const userPassword = password || this.generateRandomPassword();

          await this.createUser({
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role: (role.trim() as any) || 'VIEWER',
            password: userPassword,
            isActive: true,
          });

          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Line ${i + 1}: ${error.message}`);
        }
      }
    } catch (error) {
      result.failed++;
      result.errors.push(`File processing error: ${error.message}`);
    }

    return result;
  }

  async bulkActivate(ids: string[]): Promise<BulkOperationResult> {
    const result = await this.usersRepository.bulkActivate(ids);

    // Log audit event
    await this.logAuditEvent({
      action: 'BULK_USER_ACTIVATED',
      resource: 'USER',
      details: { userIds: ids, success: result.success, failed: result.failed },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return result;
  }

  async bulkDeactivate(ids: string[]): Promise<BulkOperationResult> {
    const result = await this.usersRepository.bulkDeactivate(ids);

    // Deactivate all sessions for these users
    for (const id of ids) {
      await this.userSessionRepository.deactivateAllUserSessions(id);
    }

    // Log audit event
    await this.logAuditEvent({
      action: 'BULK_USER_DEACTIVATED',
      resource: 'USER',
      details: { userIds: ids, success: result.success, failed: result.failed },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return result;
  }

  async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
    const result = await this.usersRepository.bulkDelete(ids);

    // Deactivate all sessions for these users
    for (const id of ids) {
      await this.userSessionRepository.deactivateAllUserSessions(id);
    }

    // Log audit event
    await this.logAuditEvent({
      action: 'BULK_USER_DELETED',
      resource: 'USER',
      details: { userIds: ids, success: result.success, failed: result.failed },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return result;
  }

  async getUserProfile(id: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...this.mapUserToResponse(user),
      fullName: `${user.firstName} ${user.lastName}`,
      username: user.email.split('@')[0],
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
    };
  }

  async updateUserProfile(id: string, data: UpdateUserProfileDto): Promise<UserProfileDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersRepository.update(id, data);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_PROFILE_UPDATED',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email, updatedFields: Object.keys(data) },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return {
      ...this.mapUserToResponse(updatedUser),
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
      username: updatedUser.email.split('@')[0],
      phoneNumber: updatedUser.phoneNumber,
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  async sendVerificationEmail(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Implement actual email sending logic
    // This would typically involve:
    // 1. Generating a verification token
    // 2. Sending an email with the verification link
    // 3. Updating the user record with the token

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_VERIFICATION_EMAIL_SENT',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  async sendPasswordResetEmail(id: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // TODO: Implement actual password reset email logic
    // This would typically involve:
    // 1. Generating a password reset token
    // 2. Setting an expiration time
    // 3. Sending an email with the reset link
    // 4. Updating the user record with the token and expiration

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_PASSWORD_RESET_EMAIL_SENT',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  // Utility methods
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private generateRandomPassword(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  private mapUserToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async logAuditEvent(data: any): Promise<void> {
    try {
      await this.auditLogRepository.create(data);
    } catch (error) {
      // Log the audit failure but don't throw - audit logging shouldn't break the main operation
      console.error('Failed to create audit log:', error);
    }
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user with new password
    await this.usersRepository.update(id, { password: hashedPassword } as any);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_PASSWORD_RESET',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email },
      ipAddress: 'system',
      userAgent: 'system',
    });
  }

  async updateEmailVerification(id: string, isEmailVerified: boolean): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersRepository.update(id, { isEmailVerified } as any);

    // Log audit event
    await this.logAuditEvent({
      action: 'USER_EMAIL_VERIFICATION_UPDATED',
      resource: 'USER',
      resourceId: id,
      details: { email: user.email, isEmailVerified },
      ipAddress: 'system',
      userAgent: 'system',
    });

    return this.mapUserToResponse(updatedUser);
  }
} 