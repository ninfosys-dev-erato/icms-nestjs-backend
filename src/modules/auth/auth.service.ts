import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { AuthRepository } from './repositories/auth.repository';
import { UserSessionRepository } from './repositories/user-session.repository';
import { LoginAttemptRepository } from './repositories/login-attempt.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
  UserResponseDto,
  SessionResponseDto,
  AuditLogQueryDto,
  PaginatedAuditLogResult,
  ValidationResult,
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  PaginatedUserResult,
  UserStatistics,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly loginAttemptRepository: LoginAttemptRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async login(data: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponseDto> {
    // Validate login attempt (rate limiting)
    const validation = await this.validateLoginAttempt(data.email, ipAddress);
    if (!validation.isValid) {
      throw new UnauthorizedException('Too many failed attempts. Please try again later.');
    }

    // Find user
    const user = await this.authRepository.findByEmail(data.email);
    if (!user || !user.isActive) {
      await this.recordLoginAttempt(data.email, ipAddress, userAgent, false, 'Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.validatePassword(data.password, user.password);
    if (!isPasswordValid) {
      await this.recordLoginAttempt(data.email, ipAddress, userAgent, false, 'Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.authRepository.updateLastLogin(user.id);

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.generateTokens(user.id);

    // Create session
    const expiresAt = new Date(Date.now() + (data.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
    await this.userSessionRepository.create({
      userId: user.id,
      token: accessToken,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Record successful login
    await this.recordLoginAttempt(data.email, ipAddress, userAgent, true);

    // Log audit event
    await this.logAuditEvent({
      userId: user.id,
      action: 'LOGIN',
      resource: 'AUTH',
      details: { ipAddress, userAgent },
      ipAddress,
      userAgent,
    });

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(data.password)) {
      throw new BadRequestException('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await this.authRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || 'VIEWER',
      isActive: true,
    });

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await this.generateTokens(user.id);

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      await this.userSessionRepository.deactivate(sessionId);
    } else {
      await this.userSessionRepository.deactivateAllUserSessions(userId);
    }

    // Log audit event
    await this.logAuditEvent({
      userId,
      action: 'LOGOUT',
      resource: 'AUTH',
      details: { sessionId },
      ipAddress: 'unknown',
      userAgent: 'unknown',
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const session = await this.userSessionRepository.findByRefreshToken(refreshToken);
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.authRepository.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = await this.generateTokens(user.id);

    // Update session
    await this.userSessionRepository.update(session.id, {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });

    return {
      user: this.mapUserToResponse(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  async validateToken(token: string): Promise<UserResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.authRepository.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.mapUserToResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.authRepository.setPasswordResetToken(data.email, resetToken, expiresAt);

    // TODO: Send email with reset token
    console.log(`Password reset token for ${data.email}: ${resetToken}`);
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.authRepository.findByResetToken(data.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(data.password);
    await this.authRepository.resetPassword(data.token, hashedPassword);

    // Deactivate all sessions
    await this.userSessionRepository.deactivateAllUserSessions(user.id);
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await this.validatePassword(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(data.newPassword);
    await this.authRepository.updatePassword(userId, hashedPassword);

    // Deactivate all sessions except current
    await this.userSessionRepository.deactivateAllUserSessions(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.authRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.authRepository.verifyEmail(token);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);
    if (!user || user.isEmailVerified) {
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.authRepository.update(user.id, { emailVerificationToken: verificationToken });

    // TODO: Send verification email
    console.log(`Verification token for ${email}: ${verificationToken}`);
  }

  async validateLoginAttempt(email: string, ipAddress: string): Promise<ValidationResult> {
    const maxAttempts = 5;
    const timeWindow = 15 * 60 * 1000; // 15 minutes

    const [emailAttempts, ipAttempts] = await Promise.all([
      this.loginAttemptRepository.getFailedAttemptsCount(email, timeWindow),
      this.loginAttemptRepository.getIPFailedAttemptsCount(ipAddress, timeWindow),
    ]);

    if (emailAttempts >= maxAttempts || ipAttempts >= maxAttempts) {
      return {
        isValid: false,
        errors: [{ field: 'login', message: 'Too many failed attempts', code: 'TOO_MANY_ATTEMPTS' }],
      };
    }

    return { isValid: true, errors: [] };
  }

  async getUserSessions(userId: string): Promise<SessionResponseDto[]> {
    const sessions = await this.userSessionRepository.findActiveByUser(userId);
    return sessions.map(session => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isActive: session.isActive,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.userSessionRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Session not found');
    }

    await this.userSessionRepository.deactivate(sessionId);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.userSessionRepository.deactivateAllUserSessions(userId);
  }

  async getAuditLogs(query: AuditLogQueryDto): Promise<PaginatedAuditLogResult> {
    return this.auditLogRepository.search('', query);
  }

  async logAuditEvent(data: any): Promise<void> {
    await this.auditLogRepository.create(data);
  }

  // Password utilities
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Token generation
  private async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = { 
      sub: userId,
      iat: Math.floor(Date.now() / 1000), // Add current timestamp to ensure uniqueness
      jti: crypto.randomBytes(16).toString('hex'), // Add unique identifier
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 3600);

    return { accessToken, refreshToken, expiresIn };
  }

  // User mapping
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

  // Record login attempt
  private async recordLoginAttempt(email: string, ipAddress: string, userAgent: string, success: boolean, failureReason?: string): Promise<void> {
    await this.loginAttemptRepository.create({
      email,
      ipAddress,
      userAgent,
      success,
      failureReason,
    });
  }
} 