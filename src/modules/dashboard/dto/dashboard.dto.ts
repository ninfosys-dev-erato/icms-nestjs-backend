import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

// ========================================
// SYSTEM OVERVIEW DTOs
// ========================================

export class SystemHealthDto {
  @ApiProperty({ example: 'excellent' })
  @IsString()
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'unknown';

  @ApiProperty({ example: 99.9 })
  @IsNumber()
  uptime: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  recentErrors: number;

  @ApiProperty({ example: 'All systems operational' })
  @IsString()
  message: string;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDateString()
  lastChecked: Date;
}

export class StorageMetricsDto {
  @ApiProperty({ example: '45.2 GB' })
  @IsString()
  used: string;

  @ApiProperty({ example: '100 GB' })
  @IsString()
  total: string;

  @ApiProperty({ example: 45.2 })
  @IsNumber()
  usedPercentage: number;

  @ApiProperty({ example: 'documents' })
  @IsString()
  largestConsumer: string;

  @ApiProperty({ example: '2.1 GB' })
  @IsString()
  monthlyGrowth: string;
}

export class SystemOverviewDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  totalUsers: number;

  @ApiProperty({ example: 89 })
  @IsNumber()
  activeUsers: number;

  @ApiProperty({ example: 1250 })
  @IsNumber()
  totalDocuments: number;

  @ApiProperty({ example: 3400 })
  @IsNumber()
  totalMedia: number;

  @ApiProperty({ example: 45 })
  @IsNumber()
  totalArticles: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  totalDepartments: number;

  @ValidateNested()
  @Type(() => StorageMetricsDto)
  storage: StorageMetricsDto;

  @ValidateNested()
  @Type(() => SystemHealthDto)
  systemHealth: SystemHealthDto;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDateString()
  lastUpdated: Date;
}

// ========================================
// CONTENT ANALYTICS DTOs
// ========================================

export class TopContentDto {
  @ApiProperty({ example: 'doc123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Employee Handbook' })
  @IsString()
  title: string;

  @ApiProperty({ example: 156 })
  @IsNumber()
  views: number;

  @ApiProperty({ example: '+12%' })
  @IsString()
  trend: string;

  @ApiProperty({ example: 'documents' })
  @IsString()
  type: string;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDateString()
  lastAccessed: Date;
}

export class ContentGrowthDto {
  @ApiProperty({ example: 45 })
  @IsNumber()
  monthly: number;

  @ApiProperty({ example: '+15%' })
  @IsString()
  trend: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  weekly: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  daily: number;
}

export class ContentAnalyticsDto {
  @ApiProperty({ type: [TopContentDto] })
  @ValidateNested({ each: true })
  @Type(() => TopContentDto)
  topDocuments: TopContentDto[];

  @ApiProperty({ type: [TopContentDto] })
  @ValidateNested({ each: true })
  @Type(() => TopContentDto)
  topMedia: TopContentDto[];

  @ApiProperty({ type: [TopContentDto] })
  @ValidateNested({ each: true })
  @Type(() => TopContentDto)
  topArticles: TopContentDto[];

  @ValidateNested()
  @Type(() => ContentGrowthDto)
  documentGrowth: ContentGrowthDto;

  @ValidateNested()
  @Type(() => ContentGrowthDto)
  mediaGrowth: ContentGrowthDto;

  @ValidateNested()
  @Type(() => ContentGrowthDto)
  articleGrowth: ContentGrowthDto;

  @ApiProperty({ example: 89 })
  @IsNumber()
  totalDownloads: number;

  @ApiProperty({ example: 2340 })
  @IsNumber()
  totalViews: number;

  @ApiProperty({ example: 6.5 })
  @IsNumber()
  averageEngagement: number;
}

// ========================================
// USER ANALYTICS DTOs
// ========================================

export class UserGrowthDto {
  @ApiProperty({ example: 23 })
  @IsNumber()
  monthly: number;

  @ApiProperty({ example: '+8%' })
  @IsString()
  trend: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  weekly: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  daily: number;
}

export class RoleDistributionDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  admin: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  editor: number;

  @ApiProperty({ example: 133 })
  @IsNumber()
  user: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  manager: number;
}

export class ActiveUserDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 156 })
  @IsNumber()
  actions: number;

  @ApiProperty({ example: '2 hours ago' })
  @IsString()
  lastActive: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  role: string;
}

export class UserAnalyticsDto {
  @ValidateNested()
  @Type(() => UserGrowthDto)
  userGrowth: UserGrowthDto;

  @ValidateNested()
  @Type(() => RoleDistributionDto)
  roleDistribution: RoleDistributionDto;

  @ApiProperty({ example: 45 })
  @IsNumber()
  dailyActiveUsers: number;

  @ApiProperty({ example: 89 })
  @IsNumber()
  weeklyActiveUsers: number;

  @ApiProperty({ example: 134 })
  @IsNumber()
  monthlyActiveUsers: number;

  @ApiProperty({ type: [ActiveUserDto] })
  @ValidateNested({ each: true })
  @Type(() => ActiveUserDto)
  topActiveUsers: ActiveUserDto[];

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  averageSessionDuration: number;

  @ApiProperty({ example: 3.2 })
  @IsNumber()
  averageActionsPerSession: number;
}

// ========================================
// HR ANALYTICS DTOs
// ========================================

export class DepartmentMetricsDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  name: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  count: number;

  @ApiProperty({ example: '+3' })
  @IsString()
  growth: string;

  @ApiProperty({ example: 85.5 })
  @IsNumber()
  satisfaction: number;

  @ApiProperty({ example: 'Active' })
  @IsString()
  status: string;
}

export class HrMetricsDto {
  @ApiProperty({ example: 2.3 })
  @IsNumber()
  turnoverRate: number;

  @ApiProperty({ example: 3.2 })
  @IsNumber()
  averageTenure: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  recentHires: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  pendingApprovals: number;

  @ApiProperty({ example: 98.5 })
  @IsNumber()
  documentCompliance: number;
}

export class HrAnalyticsDto {
  @ApiProperty({ example: 89 })
  @IsNumber()
  totalEmployees: number;

  @ApiProperty({ type: [DepartmentMetricsDto] })
  @ValidateNested({ each: true })
  @Type(() => DepartmentMetricsDto)
  departments: DepartmentMetricsDto[];

  @ValidateNested()
  @Type(() => HrMetricsDto)
  metrics: HrMetricsDto;

  @ApiProperty({ example: 15 })
  @IsNumber()
  openPositions: number;

  @ApiProperty({ example: 23 })
  @IsNumber()
  trainingPrograms: number;

  @ApiProperty({ example: 95.2 })
  @IsNumber()
  employeeSatisfaction: number;
}

// ========================================
// MARKETING & ENGAGEMENT DTOs
// ========================================

export class SliderPerformanceDto {
  @ApiProperty({ example: 'slider123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Welcome Banner' })
  @IsString()
  title: string;

  @ApiProperty({ example: 156 })
  @IsNumber()
  views: number;

  @ApiProperty({ example: 23 })
  @IsNumber()
  clicks: number;

  @ApiProperty({ example: 14.7 })
  @IsNumber()
  clickThroughRate: number;

  @ApiProperty({ example: '+8%' })
  @IsString()
  trend: string;
}

export class SearchTrendsDto {
  @ApiProperty({ example: 'employee handbook' })
  @IsString()
  query: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  searches: number;

  @ApiProperty({ example: '+12%' })
  @IsString()
  trend: string;

  @ApiProperty({ example: 0.8 })
  @IsNumber()
  successRate: number;
}

export class MarketingAnalyticsDto {
  @ApiProperty({ type: [SliderPerformanceDto] })
  @ValidateNested({ each: true })
  @Type(() => SliderPerformanceDto)
  topSliders: SliderPerformanceDto[];

  @ApiProperty({ type: [SearchTrendsDto] })
  @ValidateNested({ each: true })
  @Type(() => SearchTrendsDto)
  topSearches: SearchTrendsDto[];

  @ApiProperty({ example: 6.5 })
  @IsNumber()
  averageClickThroughRate: number;

  @ApiProperty({ example: 2340 })
  @IsNumber()
  totalBannerViews: number;

  @ApiProperty({ example: 156 })
  @IsNumber()
  totalBannerClicks: number;

  @ApiProperty({ example: 89 })
  @IsNumber()
  uniqueVisitors: number;
}

// ========================================
// DASHBOARD RESPONSE DTOs
// ========================================

export class DashboardOverviewDto {
  @ValidateNested()
  @Type(() => SystemOverviewDto)
  system: SystemOverviewDto;

  @ValidateNested()
  @Type(() => ContentAnalyticsDto)
  content: ContentAnalyticsDto;

  @ValidateNested()
  @Type(() => UserAnalyticsDto)
  users: UserAnalyticsDto;

  @ValidateNested()
  @Type(() => HrAnalyticsDto)
  hr: HrAnalyticsDto;

  @ValidateNested()
  @Type(() => MarketingAnalyticsDto)
  marketing: MarketingAnalyticsDto;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDateString()
  generatedAt: Date;
}

export class DashboardWidgetDto {
  @ApiProperty({ example: 'system-overview' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'System Overview' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'widget' })
  @IsString()
  type: 'widget' | 'chart' | 'table' | 'metric';

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ example: { totalUsers: 150, activeUsers: 89 } })
  data: any;
}

export class DashboardConfigDto {
  @ApiProperty({ example: 'admin-dashboard' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Admin Dashboard' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  role: string;

  @ApiProperty({ type: [DashboardWidgetDto] })
  @ValidateNested({ each: true })
  @Type(() => DashboardWidgetDto)
  widgets: DashboardWidgetDto[];

  @ApiProperty({ example: 'grid' })
  @IsString()
  layout: 'grid' | 'list' | 'custom';

  @ApiProperty({ example: true })
  @IsBoolean()
  autoRefresh: boolean;

  @ApiProperty({ example: 30000 })
  @IsNumber()
  refreshInterval: number;
}

// ========================================
// QUERY DTOs
// ========================================

export class DashboardQueryDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ example: 'daily' })
  @IsOptional()
  @IsString()
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'system' })
  @IsOptional()
  @IsString()
  category?: 'system' | 'content' | 'users' | 'hr' | 'marketing' | 'all';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  includeTrends?: boolean;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ========================================
// EXPORT DTOs
// ========================================

export class DashboardExportDto {
  @ApiProperty({ example: 'dashboard-export-2024-01-01.json' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 'application/json' })
  @IsString()
  contentType: string;

  @ApiProperty({ example: 1024 })
  @IsNumber()
  size: number;

  @ApiProperty({ example: new Date().toISOString() })
  @IsDateString()
  exportedAt: Date;

  @ApiProperty({ example: 'admin' })
  @IsString()
  exportedBy: string;
}
