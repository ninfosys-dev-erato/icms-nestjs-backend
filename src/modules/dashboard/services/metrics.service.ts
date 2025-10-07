import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DocumentRepository } from '../../documents/repositories/document.repository';
import { CacheService } from './cache.service';
import {
  SystemOverviewDto,
  ContentAnalyticsDto,
  UserAnalyticsDto,
  HrAnalyticsDto,
  MarketingAnalyticsDto,
  DashboardOverviewDto,
  SystemHealthDto,
  StorageMetricsDto,
  TopContentDto,
  ContentGrowthDto,
  UserGrowthDto,
  RoleDistributionDto,
  ActiveUserDto,
  DepartmentMetricsDto,
  HrMetricsDto,
  SliderPerformanceDto,
  SearchTrendsDto,
  MarketingAnalyticsDto as MarketingAnalyticsDtoType,
} from '../dto/dashboard.dto';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly documentRepository: DocumentRepository,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get comprehensive dashboard overview
   */
  async getDashboardOverview(query: any = {}): Promise<DashboardOverviewDto> {
    const cacheKey = this.cacheService.generateKey('dashboard', 'overview', JSON.stringify(query));
    
    // Try to get from cache first
    const cached = this.cacheService.get<DashboardOverviewDto>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const [system, content, users, hr, marketing] = await Promise.all([
        this.getSystemOverview(),
        this.getContentAnalytics(query),
        this.getUserAnalytics(query),
        this.getHrAnalytics(query),
        this.getMarketingAnalytics(query),
      ]);

      const overview: DashboardOverviewDto = {
        system,
        content,
        users,
        hr,
        marketing,
        generatedAt: new Date(),
      };

      // Cache the result for 2 minutes
      this.cacheService.set(cacheKey, overview, { ttl: 2 * 60 * 1000 });

      return overview;
    } catch (error) {
      this.logger.error('Failed to get dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get system overview metrics
   */
  async getSystemOverview(): Promise<SystemOverviewDto> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalDocuments,
        totalMedia,
        totalArticles,
        totalDepartments,
        storageMetrics,
        systemHealth,
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getTotalDocuments(),
        this.getTotalMedia(),
        this.getTotalArticles(),
        this.getTotalDepartments(),
        this.getStorageMetrics(),
        this.getSystemHealth(),
      ]);

      return {
        totalUsers,
        activeUsers,
        totalDocuments,
        totalMedia,
        totalArticles,
        totalDepartments,
        storage: storageMetrics,
        systemHealth,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get system overview:', error);
      throw error;
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(query: any = {}): Promise<ContentAnalyticsDto> {
    try {
      const [
        topDocuments,
        topMedia,
        topArticles,
        documentGrowth,
        mediaGrowth,
        articleGrowth,
        totalDownloads,
        totalViews,
      ] = await Promise.all([
        this.getTopDocuments(query.limit || 5),
        this.getTopMedia(query.limit || 5),
        this.getTopArticles(query.limit || 5),
        this.getContentGrowth('documents', query),
        this.getContentGrowth('media', query),
        this.getContentGrowth('articles', query),
        this.getTotalDownloads(),
        this.getTotalViews(),
      ]);

      const averageEngagement = totalViews > 0 ? (totalDownloads / totalViews) * 100 : 0;

      return {
        topDocuments,
        topMedia,
        topArticles,
        documentGrowth,
        mediaGrowth,
        articleGrowth,
        totalDownloads,
        totalViews,
        averageEngagement,
      };
    } catch (error) {
      this.logger.error('Failed to get content analytics:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(query: any = {}): Promise<UserAnalyticsDto> {
    try {
      const [
        userGrowth,
        roleDistribution,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        topActiveUsers,
        averageSessionDuration,
        averageActionsPerSession,
      ] = await Promise.all([
        this.getUserGrowth(query),
        this.getRoleDistribution(),
        this.getDailyActiveUsers(),
        this.getWeeklyActiveUsers(),
        this.getMonthlyActiveUsers(),
        this.getTopActiveUsers(query.limit || 10),
        this.getAverageSessionDuration(),
        this.getAverageActionsPerSession(),
      ]);

      return {
        userGrowth,
        roleDistribution,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        topActiveUsers,
        averageSessionDuration,
        averageActionsPerSession,
      };
    } catch (error) {
      this.logger.error('Failed to get user analytics:', error);
      throw error;
    }
  }

  /**
   * Get HR analytics
   */
  async getHrAnalytics(query: any = {}): Promise<HrAnalyticsDto> {
    try {
      const [
        totalEmployees,
        departments,
        metrics,
        openPositions,
        trainingPrograms,
        employeeSatisfaction,
      ] = await Promise.all([
        this.getTotalEmployees(),
        this.getDepartmentMetrics(),
        this.getHrMetrics(),
        this.getOpenPositions(),
        this.getTrainingPrograms(),
        this.getEmployeeSatisfaction(),
      ]);

      return {
        totalEmployees,
        departments,
        metrics,
        openPositions,
        trainingPrograms,
        employeeSatisfaction,
      };
    } catch (error) {
      this.logger.error('Failed to get HR analytics:', error);
      throw error;
    }
  }

  /**
   * Get marketing analytics
   */
  async getMarketingAnalytics(query: any = {}): Promise<MarketingAnalyticsDtoType> {
    try {
      const [
        topSliders,
        topSearches,
        averageClickThroughRate,
        totalBannerViews,
        totalBannerClicks,
        uniqueVisitors,
      ] = await Promise.all([
        this.getTopSliders(query.limit || 5),
        this.getTopSearches(query.limit || 5),
        this.getAverageClickThroughRate(),
        this.getTotalBannerViews(),
        this.getTotalBannerClicks(),
        this.getUniqueVisitors(),
      ]);

      return {
        topSliders,
        topSearches,
        averageClickThroughRate,
        totalBannerViews,
        totalBannerClicks,
        uniqueVisitors,
      };
    } catch (error) {
      this.logger.error('Failed to get marketing analytics:', error);
      throw error;
    }
  }

  // ========================================
  // PRIVATE METHODS FOR INDIVIDUAL METRICS
  // ========================================

  private async getTotalUsers(): Promise<number> {
    try {
      return await this.prisma.user.count();
    } catch (error) {
      this.logger.warn('Failed to get total users:', error);
      return 0;
    }
  }

  private async getActiveUsers(): Promise<number> {
    try {
      // Users active in the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: thirtyDaysAgo,
          },
        },
      });
    } catch (error) {
      this.logger.warn('Failed to get active users:', error);
      return 0;
    }
  }

  private async getTotalDocuments(): Promise<number> {
    try {
      return await this.prisma.document.count();
    } catch (error) {
      this.logger.warn('Failed to get total documents:', error);
      return 0;
    }
  }

  private async getTotalMedia(): Promise<number> {
    try {
      return await this.prisma.media.count();
    } catch (error) {
      this.logger.warn('Failed to get total media:', error);
      return 0;
    }
  }

  private async getTotalArticles(): Promise<number> {
    try {
      return await this.prisma.content?.count() || 0;
    } catch (error) {
      this.logger.warn('Failed to get total articles:', error);
      return 0;
    }
  }

  private async getTotalDepartments(): Promise<number> {
    try {
      return await this.prisma.department?.count() || 0;
    } catch (error) {
      this.logger.warn('Failed to get total departments:', error);
      return 0;
    }
  }

  private async getStorageMetrics(): Promise<StorageMetricsDto> {
    try {
      // This would typically come from your storage service
      // For now, returning mock data
      return {
        used: '45.2 GB',
        total: '100 GB',
        usedPercentage: 45.2,
        largestConsumer: 'documents',
        monthlyGrowth: '2.1 GB',
      };
    } catch (error) {
      this.logger.warn('Failed to get storage metrics:', error);
      return {
        used: '0 GB',
        total: '0 GB',
        usedPercentage: 0,
        largestConsumer: 'unknown',
        monthlyGrowth: '0 GB',
      };
    }
  }

  private async getSystemHealth(): Promise<SystemHealthDto> {
    try {
      // Check various system health indicators
      const uptime = 99.9; // This would be calculated from system start time
      const recentErrors = 0; // This would come from error logging
      
      let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
      let message = 'All systems operational';

      if (uptime < 95) {
        status = 'critical';
        message = 'System uptime below acceptable threshold';
      } else if (uptime < 98) {
        status = 'warning';
        message = 'System uptime below optimal level';
      } else if (uptime < 99.5) {
        status = 'good';
        message = 'System operating normally';
      }

      return {
        status,
        uptime,
        recentErrors,
        message,
        lastChecked: new Date(),
      };
    } catch (error) {
      this.logger.warn('Failed to get system health:', error);
      return {
        status: 'warning',
        uptime: 0,
        recentErrors: 0,
        message: 'Unable to determine system health',
        lastChecked: new Date(),
      };
    }
  }

  private async getTopDocuments(limit: number): Promise<TopContentDto[]> {
    try {
      const documents = await this.prisma.document.findMany({
        take: limit,
        orderBy: {
          downloadCount: 'desc',
        },
        select: {
          id: true,
          title: true,
          downloadCount: true,
          updatedAt: true,
        },
      });

      return documents.map((doc, index) => ({
        id: doc.id,
        title: typeof doc.title === 'object' && doc.title !== null && 'en' in doc.title ? (doc.title as any).en || 'Untitled' : 'Untitled',
        views: doc.downloadCount || 0,
        trend: index < 2 ? '+12%' : index < 4 ? '+5%' : '+2%', // Mock trend data
        type: 'documents',
        lastAccessed: doc.updatedAt,
      }));
    } catch (error) {
      this.logger.warn('Failed to get top documents:', error);
      return [];
    }
  }

  private async getTopMedia(limit: number): Promise<TopContentDto[]> {
    try {
      const media = await this.prisma.media.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      });

      return media.map((item, index) => ({
        id: item.id,
        title: item.title || 'Untitled',
        views: Math.floor(Math.random() * 100) + 50, // Mock view data
        trend: index < 2 ? '+18%' : index < 4 ? '+8%' : '+3%', // Mock trend data
        type: 'media',
        lastAccessed: item.createdAt,
      }));
    } catch (error) {
      this.logger.warn('Failed to get top media:', error);
      return [];
    }
  }

  private async getTopArticles(limit: number): Promise<TopContentDto[]> {
    try {
      // This would come from your content management service
      // For now, returning mock data
      return Array.from({ length: limit }, (_, index) => ({
        id: `article-${index + 1}`,
        title: `Sample Article ${index + 1}`,
        views: Math.floor(Math.random() * 200) + 100,
        trend: index < 2 ? '+15%' : index < 4 ? '+7%' : '+2%',
        type: 'articles',
        lastAccessed: new Date(),
      }));
    } catch (error) {
      this.logger.warn('Failed to get top articles:', error);
      return [];
    }
  }

  private async getContentGrowth(type: string, query: any): Promise<ContentGrowthDto> {
    try {
      // This would calculate actual growth from historical data
      // For now, returning mock data
      const baseGrowth = type === 'documents' ? 45 : type === 'media' ? 120 : 15;
      const trend = type === 'documents' ? '+15%' : type === 'media' ? '+22%' : '+8%';

      return {
        monthly: baseGrowth,
        trend,
        weekly: Math.floor(baseGrowth / 4),
        daily: Math.floor(baseGrowth / 30),
      };
    } catch (error) {
      this.logger.warn(`Failed to get ${type} growth:`, error);
      return {
        monthly: 0,
        trend: '0%',
        weekly: 0,
        daily: 0,
      };
    }
  }

  private async getTotalDownloads(): Promise<number> {
    try {
      const result = await this.prisma.document.aggregate({
        _sum: {
          downloadCount: true,
        },
      });
      return result._sum.downloadCount || 0;
    } catch (error) {
      this.logger.warn('Failed to get total downloads:', error);
      return 0;
    }
  }

  private async getTotalViews(): Promise<number> {
    try {
      // This would come from your analytics service
      // For now, returning mock data
      return 2340;
    } catch (error) {
      this.logger.warn('Failed to get total views:', error);
      return 0;
    }
  }

  private async getUserGrowth(query: any): Promise<UserGrowthDto> {
    try {
      // This would calculate actual user growth from historical data
      // For now, returning mock data
      return {
        monthly: 23,
        trend: '+8%',
        weekly: 5,
        daily: 1,
      };
    } catch (error) {
      this.logger.warn('Failed to get user growth:', error);
      return {
        monthly: 0,
        trend: '0%',
        weekly: 0,
        daily: 0,
      };
    }
  }

  private async getRoleDistribution(): Promise<RoleDistributionDto> {
    try {
      const [admin, editor, user, manager] = await Promise.all([
        this.prisma.user.count({ where: { role: 'ADMIN' } }),
        this.prisma.user.count({ where: { role: 'EDITOR' } }),
        this.prisma.user.count({ where: { role: 'VIEWER' } }),
        this.prisma.user.count({ where: { role: 'EDITOR' } }),
      ]);

      return { admin, editor, user, manager };
    } catch (error) {
      this.logger.warn('Failed to get role distribution:', error);
      return { admin: 0, editor: 0, user: 0, manager: 0 };
    }
  }

  private async getDailyActiveUsers(): Promise<number> {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: yesterday,
          },
        },
      });
    } catch (error) {
      this.logger.warn('Failed to get daily active users:', error);
      return 0;
    }
  }

  private async getWeeklyActiveUsers(): Promise<number> {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: weekAgo,
          },
        },
      });
    } catch (error) {
      this.logger.warn('Failed to get weekly active users:', error);
      return 0;
    }
  }

  private async getMonthlyActiveUsers(): Promise<number> {
    try {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: monthAgo,
          },
        },
      });
    } catch (error) {
      this.logger.warn('Failed to get monthly active users:', error);
      return 0;
    }
  }

  private async getTopActiveUsers(limit: number): Promise<ActiveUserDto[]> {
    try {
      const users = await this.prisma.user.findMany({
        take: limit,
        orderBy: {
          lastLoginAt: 'desc',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          lastLoginAt: true,
        },
      });

      return users.map((user, index) => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        actions: Math.floor(Math.random() * 200) + 50, // Mock action count
        lastActive: this.formatTimeAgo(user.lastLoginAt),
        role: user.role || 'user',
      }));
    } catch (error) {
      this.logger.warn('Failed to get top active users:', error);
      return [];
    }
  }

  private async getAverageSessionDuration(): Promise<number> {
    try {
      // This would come from your analytics service
      // For now, returning mock data
      return 12.5;
    } catch (error) {
      this.logger.warn('Failed to get average session duration:', error);
      return 0;
    }
  }

  private async getAverageActionsPerSession(): Promise<number> {
    try {
      // This would come from your analytics service
      // For now, returning mock data
      return 3.2;
    } catch (error) {
      this.logger.warn('Failed to get average actions per session:', error);
      return 0;
    }
  }

  private async getTotalEmployees(): Promise<number> {
    try {
      return await this.prisma.employee?.count() || 0;
    } catch (error) {
      this.logger.warn('Failed to get total employees:', error);
      return 0;
    }
  }

  private async getDepartmentMetrics(): Promise<DepartmentMetricsDto[]> {
    try {
      // This would come from your HR service
      // For now, returning mock data
      return [
        { name: 'Engineering', count: 25, growth: '+3', satisfaction: 85.5, status: 'Active' },
        { name: 'Marketing', count: 15, growth: '+1', satisfaction: 88.2, status: 'Active' },
        { name: 'Sales', count: 20, growth: '+2', satisfaction: 82.1, status: 'Active' },
        { name: 'HR', count: 8, growth: '+0', satisfaction: 90.0, status: 'Active' },
      ];
    } catch (error) {
      this.logger.warn('Failed to get department metrics:', error);
      return [];
    }
  }

  private async getHrMetrics(): Promise<HrMetricsDto> {
    try {
      // This would come from your HR service
      // For now, returning mock data
      return {
        turnoverRate: 2.3,
        averageTenure: 3.2,
        recentHires: 8,
        pendingApprovals: 2,
        documentCompliance: 98.5,
      };
    } catch (error) {
      this.logger.warn('Failed to get HR metrics:', error);
      return {
        turnoverRate: 0,
        averageTenure: 0,
        recentHires: 0,
        pendingApprovals: 0,
        documentCompliance: 0,
      };
    }
  }

  private async getOpenPositions(): Promise<number> {
    try {
      // This would come from your HR service
      // For now, returning mock data
      return 15;
    } catch (error) {
      this.logger.warn('Failed to get open positions:', error);
      return 0;
    }
  }

  private async getTrainingPrograms(): Promise<number> {
    try {
      // This would come from your HR service
      // For now, returning mock data
      return 23;
    } catch (error) {
      this.logger.warn('Failed to get training programs:', error);
      return 0;
    }
  }

  private async getEmployeeSatisfaction(): Promise<number> {
    try {
      // This would come from your HR service
      // For now, returning mock data
      return 95.2;
    } catch (error) {
      this.logger.warn('Failed to get employee satisfaction:', error);
      return 0;
    }
  }

  private async getTopSliders(limit: number): Promise<SliderPerformanceDto[]> {
    try {
      // This would come from your slider service
      // For now, returning mock data
      return Array.from({ length: limit }, (_, index) => ({
        id: `slider-${index + 1}`,
        title: `Banner ${index + 1}`,
        views: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 50) + 10,
        clickThroughRate: Math.random() * 20 + 5,
        trend: index < 2 ? '+8%' : index < 4 ? '+3%' : '+1%',
      }));
    } catch (error) {
      this.logger.warn('Failed to get top sliders:', error);
      return [];
    }
  }

  private async getTopSearches(limit: number): Promise<SearchTrendsDto[]> {
    try {
      // This would come from your search service
      // For now, returning mock data
      return [
        { query: 'employee handbook', searches: 45, trend: '+12%', successRate: 0.8 },
        { query: 'policy guide', searches: 32, trend: '+8%', successRate: 0.9 },
        { query: 'training materials', searches: 28, trend: '+5%', successRate: 0.7 },
        { query: 'office hours', searches: 22, trend: '+3%', successRate: 0.95 },
        { query: 'contact information', searches: 18, trend: '+1%', successRate: 0.85 },
      ].slice(0, limit);
    } catch (error) {
      this.logger.warn('Failed to get top searches:', error);
      return [];
    }
  }

  private async getAverageClickThroughRate(): Promise<number> {
    try {
      // This would come from your slider service
      // For now, returning mock data
      return 6.5;
    } catch (error) {
      this.logger.warn('Failed to get average click-through rate:', error);
      return 0;
    }
  }

  private async getTotalBannerViews(): Promise<number> {
    try {
      // This would come from your slider service
      // For now, returning mock data
      return 2340;
    } catch (error) {
      this.logger.warn('Failed to get total banner views:', error);
      return 0;
    }
  }

  private async getTotalBannerClicks(): Promise<number> {
    try {
      // This would come from your slider service
      // For now, returning mock data
      return 156;
    } catch (error) {
      this.logger.warn('Failed to get total banner clicks:', error);
      return 0;
    }
  }

  private async getUniqueVisitors(): Promise<number> {
    try {
      // This would come from your analytics service
      // For now, returning mock data
      return 89;
    } catch (error) {
      this.logger.warn('Failed to get unique visitors:', error);
      return 0;
    }
  }

  /**
   * Helper method to format time ago
   */
  private formatTimeAgo(date: Date | null): string {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  }
}
