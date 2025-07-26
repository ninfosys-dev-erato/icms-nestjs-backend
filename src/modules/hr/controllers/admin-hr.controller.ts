import { 
  Controller, 
  Get, 
  Res,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DepartmentService } from '../services/department.service';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin HR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/hr')
export class AdminHRController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get HR statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @Roles('ADMIN', 'EDITOR')
  async getHRStatistics(@Res() response: Response): Promise<void> {
    try {
      const statistics = await this.departmentService.getHRStatistics();
      const apiResponse = ApiResponseBuilder.success(statistics);
      response.status(200).json(apiResponse);
    } catch (error) {
      const apiResponse = ApiResponseBuilder.error('HR_STATISTICS_ERROR', error.message);
      response.status(500).json(apiResponse);
    }
  }
} 