import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Query, 
  Param, 
  Res, 
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DashboardService } from '../services/dashboard.service';
import { 
  DashboardQueryDto, 
  DashboardConfigDto,
  DashboardOverviewDto
} from '../dto/dashboard.dto';
import { ApiResponseBuilder } from '../../../common/types/api-response';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get comprehensive dashboard overview (Admin)' })
  @ApiResponse({ status: 200, description: 'Dashboard overview retrieved successfully' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'category', required: false, enum: ['system', 'content', 'users', 'hr', 'marketing', 'all'] })
  @ApiQuery({ name: 'includeTrends', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async getDashboardOverview(
    @Res() response: Response,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const overview = await this.dashboardService.getDashboardOverview(query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(overview));
  }

  @Get('overview/:role')
  @ApiOperation({ summary: 'Get role-based dashboard overview (Admin)' })
  @ApiResponse({ status: 200, description: 'Role-based dashboard overview retrieved successfully' })
  @ApiParam({ name: 'role', description: 'User role for dashboard filtering' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'category', required: false, enum: ['system', 'content', 'users', 'hr', 'marketing', 'all'] })
  @ApiQuery({ name: 'includeTrends', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async getRoleBasedDashboard(
    @Res() response: Response,
    @Param('role') role: string,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const overview = await this.dashboardService.getRoleBasedDashboard(role, query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(overview));
  }

  @Get('config/:role')
  @ApiOperation({ summary: 'Get dashboard configuration for role (Admin)' })
  @ApiResponse({ status: 200, description: 'Dashboard configuration retrieved successfully' })
  @ApiParam({ name: 'role', description: 'User role' })
  @Roles('ADMIN')
  async getDashboardConfig(
    @Res() response: Response,
    @Param('role') role: string
  ): Promise<void> {
    const config = await this.dashboardService.getDashboardConfig(role);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(config));
  }

  @Put('config/:role')
  @ApiOperation({ summary: 'Update dashboard configuration for role (Admin)' })
  @ApiResponse({ status: 200, description: 'Dashboard configuration updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid configuration data' })
  @ApiParam({ name: 'role', description: 'User role' })
  @ApiBody({ type: DashboardConfigDto })
  @Roles('ADMIN')
  async updateDashboardConfig(
    @Res() response: Response,
    @Param('role') role: string,
    @Body() config: Partial<DashboardConfigDto>
  ): Promise<void> {
    const updatedConfig = await this.dashboardService.updateDashboardConfig(role, config);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(updatedConfig));
  }

  @Get('widget/:widgetId')
  @ApiOperation({ summary: 'Get specific widget data (Admin)' })
  @ApiResponse({ status: 200, description: 'Widget data retrieved successfully' })
  @ApiParam({ name: 'widgetId', description: 'Widget identifier' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'category', required: false, enum: ['system', 'content', 'users', 'hr', 'marketing', 'all'] })
  @ApiQuery({ name: 'includeTrends', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async getWidgetData(
    @Res() response: Response,
    @Param('widgetId') widgetId: string,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const data = await this.dashboardService.getWidgetData(widgetId, query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(data));
  }

  @Get('export')
  @ApiOperation({ summary: 'Export dashboard data (Admin)' })
  @ApiResponse({ status: 200, description: 'Dashboard data exported successfully' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'pdf'], default: 'json' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'category', required: false, enum: ['system', 'content', 'users', 'hr', 'marketing', 'all'] })
  @ApiQuery({ name: 'includeTrends', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async exportDashboard(
    @Res() response: Response,
    @Query('format') format: 'json' | 'csv' | 'pdf' = 'json',
    @Query() query: DashboardQueryDto,
    @CurrentUser() user: any
  ): Promise<void> {
    const exportResult = await this.dashboardService.exportDashboard(query, format, user.id);
    
    if (format === 'json') {
      response.status(HttpStatus.OK).json(ApiResponseBuilder.success(exportResult));
    } else {
      // For CSV and other formats, return the file
      const data = await this.dashboardService.getDashboardOverview(query);
      let exportData: Buffer;
      let contentType: string;
      let filename: string;
      
      switch (format) {
        case 'csv':
          exportData = Buffer.from(this.convertToCSV(data));
          contentType = 'text/csv';
          filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'pdf':
          // TODO: Implement PDF export
          throw new Error('PDF export not implemented yet');
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      response.setHeader('Content-Type', contentType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      response.status(HttpStatus.OK).send(exportData);
    }
  }

  @Get('cache/stats')
  @ApiOperation({ summary: 'Get dashboard cache statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Cache statistics retrieved successfully' })
  @Roles('ADMIN')
  async getCacheStats(@Res() response: Response): Promise<void> {
    const stats = await this.dashboardService.getCacheStats();
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(stats));
  }

  @Post('cache/clear')
  @ApiOperation({ summary: 'Clear dashboard cache (Admin)' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Specific cache category to clear' })
  @Roles('ADMIN')
  async clearCache(
    @Res() response: Response,
    @Query('category') category?: string
  ): Promise<void> {
    const result = await this.dashboardService.clearCache(category);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(result));
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh dashboard data (Admin)' })
  @ApiResponse({ status: 200, description: 'Dashboard data refreshed successfully' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hourly', 'daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'category', required: false, enum: ['system', 'content', 'users', 'hr', 'marketing', 'all'] })
  @ApiQuery({ name: 'includeTrends', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async refreshDashboard(
    @Res() response: Response,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const overview = await this.dashboardService.refreshDashboard(query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(overview));
  }

  @Get('health')
  @ApiOperation({ summary: 'Get dashboard health status (Admin)' })
  @ApiResponse({ status: 200, description: 'Dashboard health status retrieved successfully' })
  @Roles('ADMIN')
  async getDashboardHealth(@Res() response: Response): Promise<void> {
    const health = await this.dashboardService.getDashboardHealth();
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(health));
  }

  @Get('system/overview')
  @ApiOperation({ summary: 'Get system overview metrics (Admin)' })
  @ApiResponse({ status: 200, description: 'System overview retrieved successfully' })
  @Roles('ADMIN')
  async getSystemOverview(@Res() response: Response): Promise<void> {
    const overview = await this.dashboardService.getWidgetData('system-overview');
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(overview));
  }

  @Get('content/analytics')
  @ApiOperation({ summary: 'Get content analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'Content analytics retrieved successfully' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async getContentAnalytics(
    @Res() response: Response,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const analytics = await this.dashboardService.getWidgetData('content-analytics', query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(analytics));
  }

  @Get('users/analytics')
  @ApiOperation({ summary: 'Get user analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'User analytics retrieved successfully' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async getUserAnalytics(
    @Res() response: Response,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const analytics = await this.dashboardService.getWidgetData('user-analytics', query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(analytics));
  }

  @Get('hr/analytics')
  @ApiOperation({ summary: 'Get HR analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'HR analytics retrieved successfully' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async getHrAnalytics(
    @Res() response: Response,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const analytics = await this.dashboardService.getWidgetData('hr-analytics', query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(analytics));
  }

  @Get('marketing/analytics')
  @ApiOperation({ summary: 'Get marketing analytics (Admin)' })
  @ApiResponse({ status: 200, description: 'Marketing analytics retrieved successfully' })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Roles('ADMIN')
  async getMarketingAnalytics(
    @Res() response: Response,
    @Query() query: DashboardQueryDto
  ): Promise<void> {
    const analytics = await this.dashboardService.getWidgetData('marketing-analytics', query);
    response.status(HttpStatus.OK).json(ApiResponseBuilder.success(analytics));
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Convert dashboard data to CSV format
   */
  private convertToCSV(data: any): string {
    try {
      const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
        const flattened: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(obj)) {
          const newKey = prefix ? `${prefix}.${key}` : key;
          
          if (value === null || value === undefined) {
            flattened[newKey] = '';
          } else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            Object.assign(flattened, flattenObject(value, newKey));
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === 'object') {
                Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
              } else {
                flattened[`${newKey}[${index}]`] = String(item);
              }
            });
          } else if (value instanceof Date) {
            flattened[newKey] = value.toISOString();
          } else {
            flattened[newKey] = String(value);
          }
        }
        
        return flattened;
      };

      const flattened = flattenObject(data);
      const headers = Object.keys(flattened);
      const csvRows = [headers.join(',')];
      
      const values = headers.map(header => {
        const value = flattened[header];
        // Escape commas and quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      
      csvRows.push(values.join(','));
      
      return csvRows.join('\n');
    } catch (error) {
      throw new Error('Failed to convert dashboard data to CSV format');
    }
  }
}
