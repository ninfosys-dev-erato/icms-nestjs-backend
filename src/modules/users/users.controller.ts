import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';
import {
  UserQueryDto,
  UserResponseDto,
  UserProfileDto,
  UpdateUserProfileDto,
  UserActivityDto,
} from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiResponseBuilder } from '@/common/types/api-response';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: UserProfileDto })
  async getCurrentUserProfile(
    @CurrentUser() user: any,
    @Res() response: Response,
  ): Promise<void> {
    const profile = await this.usersService.getUserProfile(user.id);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(profile),
    );
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated', type: UserProfileDto })
  async updateCurrentUserProfile(
    @CurrentUser() user: any,
    @Body() data: UpdateUserProfileDto,
    @Res() response: Response,
  ): Promise<void> {
    const profile = await this.usersService.updateUserProfile(user.id, data);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.success(profile),
    );
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
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



  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active users' })
  @ApiResponse({ status: 200, description: 'Active users' })
  async getActiveUsers(
    @Res() response: Response,
    @Query() query: UserQueryDto = {},
  ): Promise<void> {
    const result = await this.usersService.getActiveUsers(query);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.paginated(result.data, result.pagination),
    );
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({ status: 200, description: 'Users by role' })
  async getUsersByRole(
    @Res() response: Response,
    @Param('role') role: string,
    @Query() query: UserQueryDto = {},
  ): Promise<void> {
    const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      response.status(HttpStatus.BAD_REQUEST).json(
        ApiResponseBuilder.validationError('Invalid role', [
          { field: 'role', message: 'Role must be one of: ADMIN, EDITOR, VIEWER', code: 'INVALID_ROLE', value: role }
        ]),
      );
      return;
    }

    const result = await this.usersService.getUsersByRole(role, query);

    response.status(HttpStatus.OK).json(
      ApiResponseBuilder.paginated(result.data, result.pagination),
    );
  }
} 