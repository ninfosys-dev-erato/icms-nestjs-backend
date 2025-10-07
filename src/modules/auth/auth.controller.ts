import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
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
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ApiResponseBuilder } from '@/common/types/api-response';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() data: LoginDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.get('User-Agent') || 'unknown';

    const result = await this.authService.login(data, ipAddress, userAgent);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(result),
    );
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'Registration successful', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() data: RegisterDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.authService.register(data);

    response.status(HttpStatus.CREATED).json(
      ApiResponseBuilder.success(result),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const userId = (request.user as any).id;
    await this.authService.logout(userId);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Logged out successfully' }),
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() data: RefreshTokenDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.authService.refreshToken(data.refreshToken);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(result),
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  async forgotPassword(
    @Body() data: ForgotPasswordDto,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.forgotPassword(data);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Password reset email sent' }),
    );
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token or passwords do not match' })
  async resetPassword(
    @Body() data: ResetPasswordDto,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.resetPassword(data);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Password reset successful' }),
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password incorrect or passwords do not match' })
  async changePassword(
    @Body() data: ChangePasswordDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const userId = (request.user as any).id;
    await this.authService.changePassword(userId, data);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Password changed successfully' }),
    );
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification token' })
  async verifyEmail(
    @Param('token') token: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.verifyEmail(token);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Email verified successfully' }),
    );
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerificationEmail(
    @Body() data: { email: string },
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.resendVerificationEmail(data.email);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Verification email sent' }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user info', type: UserResponseDto })
  async getCurrentUser(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const user = request.user as UserResponseDto;

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiResponse({ status: 200, description: 'User sessions', type: [SessionResponseDto] })
  async getUserSessions(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const userId = (request.user as any).id;
    const sessions = await this.authService.getUserSessions(userId);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(sessions),
    );
  }

  @Post('sessions/:sessionId/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const userId = (request.user as any).id;
    await this.authService.revokeSession(userId, sessionId);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Session revoked successfully' }),
    );
  }

  @Post('sessions/revoke-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all user sessions' })
  @ApiResponse({ status: 200, description: 'All sessions revoked' })
  async revokeAllSessions(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const userId = (request.user as any).id;
    await this.authService.revokeAllSessions(userId);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'All sessions revoked successfully' }),
    );
  }
} 