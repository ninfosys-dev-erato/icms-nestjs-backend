import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserResponseDto,
  UserStatistics,
  UserActivityDto,
  BulkOperationDto,
  BulkOperationResult,
  ImportResult,
  ExportFormatDto,
  PaginatedUserResult,
  ResetPasswordDto,
  EmailVerificationDto,
} from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiResponseBuilder } from '@/common/types/api-response';

@ApiTags('Admin Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics', type: UserStatistics })
  async getUserStatistics(
    @Res() response: Response,
  ): Promise<void> {
    const statistics = await this.usersService.getUserStatistics();

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(statistics),
    );
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent user activity' })
  @ApiResponse({ status: 200, description: 'Recent activity', type: [UserActivityDto] })
  async getRecentActivity(
    @Res() response: Response,
    @Query('limit') limit?: number,
  ): Promise<void> {
    const activity = await this.usersService.getRecentActivity(limit);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(activity),
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export users' })
  @ApiResponse({ status: 200, description: 'Users exported' })
  async exportUsers(
    @Res() response: Response,
    @Query() query: UserQueryDto = {},
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
  ): Promise<void> {
    const data = await this.usersService.exportUsers(query, format);

    const contentType = format === 'json' ? 'application/json' : 
                       format === 'csv' ? 'text/csv' : 'application/pdf';
    
    const filename = `users-export-${new Date().toISOString().split('T')[0]}.${format}`;

    response.setHeader('Content-Type', contentType);
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.status(HttpStatus.OK).send(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  @ApiResponse({ status: 200, description: 'User details', type: UserResponseDto })
  async getUserById(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const user = await this.usersService.getUserById(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination (admin)' })
  @ApiResponse({ status: 200, description: 'Users list with pagination', type: PaginatedUserResult })
  async getUsersWithPagination(
    @Res() response: Response,
    @Query() query: UserQueryDto = {},
  ): Promise<void> {
    const result = await this.usersService.getAllUsers(query);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.paginated(result.data, result.pagination),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  async createUser(
    @Res() response: Response,
    @Body() data: CreateUserDto,
  ): Promise<void> {
    const user = await this.usersService.createUser(data);

    response.status(HttpStatus.CREATED).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  async updateUser(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<void> {
    const user = await this.usersService.updateUser(id, data);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.usersService.deleteUser(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'User deleted successfully' }),
    );
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiResponse({ status: 200, description: 'User activated', type: UserResponseDto })
  async activateUser(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const user = await this.usersService.activateUser(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated', type: UserResponseDto })
  async deactivateUser(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    const user = await this.usersService.deactivateUser(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated', type: UserResponseDto })
  async updateUserRole(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: { role: string },
  ): Promise<void> {
    const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
    if (!validRoles.includes(data.role)) {
      response.status(HttpStatus.BAD_REQUEST).json(
        ApiResponseBuilder.validationError('Invalid role', [
          { field: 'role', message: 'Role must be one of: ADMIN, EDITOR, VIEWER', code: 'INVALID_ROLE', value: data.role }
        ]),
      );
      return;
    }

    const user = await this.usersService.updateUserRole(id, data.role);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import users' })
  @ApiResponse({ status: 200, description: 'Users imported', type: ImportResult })
  async importUsers(
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    if (!file) {
      response.status(HttpStatus.BAD_REQUEST).json(
        ApiResponseBuilder.badRequestError('File is required'),
      );
      return;
    }

    const result = await this.usersService.importUsers(file);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(result),
    );
  }

  @Post('bulk-activate')
  @ApiOperation({ summary: 'Bulk activate users' })
  @ApiResponse({ status: 200, description: 'Users activated', type: BulkOperationResult })
  async bulkActivate(
    @Res() response: Response,
    @Body() data: BulkOperationDto,
  ): Promise<void> {
    const result = await this.usersService.bulkActivate(data.ids);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(result),
    );
  }

  @Post('bulk-deactivate')
  @ApiOperation({ summary: 'Bulk deactivate users' })
  @ApiResponse({ status: 200, description: 'Users deactivated', type: BulkOperationResult })
  async bulkDeactivate(
    @Res() response: Response,
    @Body() data: BulkOperationDto,
  ): Promise<void> {
    const result = await this.usersService.bulkDeactivate(data.ids);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(result),
    );
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete users' })
  @ApiResponse({ status: 200, description: 'Users deleted', type: BulkOperationResult })
  async bulkDelete(
    @Res() response: Response,
    @Body() data: BulkOperationDto,
  ): Promise<void> {
    const result = await this.usersService.bulkDelete(data.ids);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(result),
    );
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetUserPassword(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: ResetPasswordDto,
  ): Promise<void> {
    await this.usersService.resetUserPassword(id, data.newPassword);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Password reset successfully' }),
    );
  }

  @Put(':id/email-verification')
  @ApiOperation({ summary: 'Update email verification status' })
  @ApiResponse({ status: 200, description: 'Email verification status updated', type: UserResponseDto })
  async updateEmailVerification(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: EmailVerificationDto,
  ): Promise<void> {
    const user = await this.usersService.updateEmailVerification(id, data.isEmailVerified);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Put(':id/profile')
  @ApiOperation({ summary: 'Update user profile details' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: UserResponseDto })
  async updateUserProfile(
    @Res() response: Response,
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<void> {
    const user = await this.usersService.updateUserProfile(id, data);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(user),
    );
  }

  @Post(':id/send-verification-email')
  @ApiOperation({ summary: 'Send email verification to user' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendVerificationEmail(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.usersService.sendVerificationEmail(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Verification email sent successfully' }),
    );
  }

  @Post(':id/send-password-reset')
  @ApiOperation({ summary: 'Send password reset email to user' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async sendPasswordResetEmail(
    @Res() response: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.usersService.sendPasswordResetEmail(id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success({ message: 'Password reset email sent successfully' }),
    );
  }
} 