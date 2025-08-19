import { Injectable, Logger } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CacheService } from './cache.service';
import {
  DashboardOverviewDto,
  DashboardQueryDto,
  DashboardConfigDto,
  DashboardWidgetDto,
  DashboardExportDto,
} from '../dto/dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get comprehensive dashboard overview
   */
  async getDashboardOverview(query: DashboardQueryDto = {}): Promise<DashboardOverviewDto> {
    try {
      this.logger.log('Generating dashboard overview');
      return await this.metricsService.getDashboardOverview(query);
    } catch (error) {
      this.logger.error('Failed to get dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get dashboard overview for specific role
   */
  async getRoleBasedDashboard(role: string, query: DashboardQueryDto = {}): Promise<DashboardOverviewDto> {
    try {
      this.logger.log(`Generating dashboard overview for role: ${role}`);
      
      // Get full overview first
      const overview = await this.metricsService.getDashboardOverview(query);
      
      // Filter based on role permissions
      return this.filterDashboardByRole(overview, role);
    } catch (error) {
      this.logger.error(`Failed to get role-based dashboard for ${role}:`, error);
      throw error;
    }
  }

  /**
   * Get dashboard configuration for a specific role
   */
  async getDashboardConfig(role: string): Promise<DashboardConfigDto> {
    try {
      this.logger.log(`Getting dashboard configuration for role: ${role}`);
      
      const cacheKey = this.cacheService.generateKey('dashboard', 'config', role);
      const cached = this.cacheService.get<DashboardConfigDto>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const config = this.generateDefaultConfig(role);
      
      // Cache the configuration for 1 hour
      this.cacheService.set(cacheKey, config, { ttl: 60 * 60 * 1000 });
      
      return config;
    } catch (error) {
      this.logger.error(`Failed to get dashboard config for role ${role}:`, error);
      throw error;
    }
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(role: string, config: Partial<DashboardConfigDto>): Promise<DashboardConfigDto> {
    try {
      this.logger.log(`Updating dashboard configuration for role: ${role}`);
      
      const existingConfig = await this.getDashboardConfig(role);
      const updatedConfig = { ...existingConfig, ...config };
      
      // Update cache
      const cacheKey = this.cacheService.generateKey('dashboard', 'config', role);
      this.cacheService.set(cacheKey, updatedConfig, { ttl: 60 * 60 * 1000 });
      
      return updatedConfig;
    } catch (error) {
      this.logger.error(`Failed to update dashboard config for role ${role}:`, error);
      throw error;
    }
  }

  /**
   * Get specific dashboard widget data
   */
  async getWidgetData(widgetId: string, query: DashboardQueryDto = {}): Promise<any> {
    try {
      this.logger.log(`Getting widget data for: ${widgetId}`);
      
      const cacheKey = this.cacheService.generateKey('dashboard', 'widget', widgetId, JSON.stringify(query));
      const cached = this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      let data: any;
      
      switch (widgetId) {
        case 'system-overview':
          data = await this.metricsService.getSystemOverview();
          break;
        case 'content-analytics':
          data = await this.metricsService.getContentAnalytics(query);
          break;
        case 'user-analytics':
          data = await this.metricsService.getUserAnalytics(query);
          break;
        case 'hr-analytics':
          data = await this.metricsService.getHrAnalytics(query);
          break;
        case 'marketing-analytics':
          data = await this.metricsService.getMarketingAnalytics(query);
          break;
        default:
          throw new Error(`Unknown widget: ${widgetId}`);
      }

      // Cache widget data for 1 minute
      this.cacheService.set(cacheKey, data, { ttl: 60 * 1000 });
      
      return data;
    } catch (error) {
      this.logger.error(`Failed to get widget data for ${widgetId}:`, error);
      throw error;
    }
  }

  /**
   * Export dashboard data
   */
  async exportDashboard(
    query: DashboardQueryDto = {},
    format: 'json' | 'csv' | 'pdf' = 'json',
    userId: string = 'system'
  ): Promise<DashboardExportDto> {
    try {
      this.logger.log(`Exporting dashboard data in ${format} format`);
      
      const data = await this.metricsService.getDashboardOverview(query);
      let exportData: Buffer;
      let contentType: string;
      let filename: string;
      
      switch (format) {
        case 'json':
          exportData = Buffer.from(JSON.stringify(data, null, 2));
          contentType = 'application/json';
          filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'csv':
          exportData = this.convertToCSV(data);
          contentType = 'text/csv';
          filename = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'pdf':
          // TODO: Implement PDF export
          throw new Error('PDF export not implemented yet');
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      const exportResult: DashboardExportDto = {
        filename,
        contentType,
        size: exportData.length,
        exportedAt: new Date(),
        exportedBy: userId,
      };

      // Store export metadata in cache
      const cacheKey = this.cacheService.generateKey('dashboard', 'exports', userId, Date.now());
      this.cacheService.set(cacheKey, exportResult, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours

      return exportResult;
    } catch (error) {
      this.logger.error('Failed to export dashboard:', error);
      throw error;
    }
  }

  /**
   * Get dashboard cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      return this.cacheService.getStats();
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      throw error;
    }
  }

  /**
   * Clear dashboard cache
   */
  async clearCache(category?: string): Promise<{ cleared: number }> {
    try {
      if (category) {
        const cleared = this.cacheService.invalidateCategory(category);
        this.logger.log(`Cleared ${cleared} cache items for category: ${category}`);
        return { cleared };
      } else {
        this.cacheService.clear();
        this.logger.log('Cleared all dashboard cache');
        return { cleared: -1 }; // -1 indicates all cleared
      }
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(query: DashboardQueryDto = {}): Promise<DashboardOverviewDto> {
    try {
      this.logger.log('Refreshing dashboard data');
      
      // Clear relevant cache
      this.cacheService.invalidateCategory('dashboard');
      
      // Get fresh data
      return await this.metricsService.getDashboardOverview(query);
    } catch (error) {
      this.logger.error('Failed to refresh dashboard:', error);
      throw error;
    }
  }

  /**
   * Get dashboard health status
   */
  async getDashboardHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    cacheHealth: boolean;
    lastUpdated: Date;
  }> {
    try {
      const cacheHealth = this.cacheService.isHealthy();
      const lastUpdated = new Date();
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let message = 'Dashboard is operating normally';
      
      if (!cacheHealth) {
        status = 'degraded';
        message = 'Cache performance is degraded';
      }
      
      return {
        status,
        message,
        cacheHealth,
        lastUpdated,
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard health:', error);
      return {
        status: 'unhealthy',
        message: 'Unable to determine dashboard health',
        cacheHealth: false,
        lastUpdated: new Date(),
      };
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Filter dashboard data based on user role
   */
  private filterDashboardByRole(overview: DashboardOverviewDto, role: string): DashboardOverviewDto {
    switch (role.toLowerCase()) {
      case 'admin':
        // Admin gets full access
        return overview;
      
      case 'manager':
        // Manager gets most data but limited system info
        return {
          ...overview,
          system: {
            ...overview.system,
            systemHealth: {
              ...overview.system.systemHealth,
              message: 'System health information limited for managers',
            },
          },
        };
      
      case 'editor':
        // Editor gets content and user analytics
        return {
          ...overview,
          system: {
            totalUsers: overview.system.totalUsers,
            activeUsers: overview.system.activeUsers,
            totalDocuments: overview.system.totalDocuments,
            totalMedia: overview.system.totalMedia,
            totalArticles: overview.system.totalArticles,
            totalDepartments: 0, // Limited access
            storage: {
              used: 'Limited',
              total: 'Limited',
              usedPercentage: 0,
              largestConsumer: 'Limited',
              monthlyGrowth: 'Limited',
            },
            systemHealth: {
              status: 'unknown',
              uptime: 0,
              recentErrors: 0,
              message: 'System health information not available for editors',
              lastChecked: new Date(),
            },
            lastUpdated: overview.system.lastUpdated,
          },
          hr: {
            totalEmployees: 0,
            departments: [],
            metrics: {
              turnoverRate: 0,
              averageTenure: 0,
              recentHires: 0,
              pendingApprovals: 0,
              documentCompliance: 0,
            },
            openPositions: 0,
            trainingPrograms: 0,
            employeeSatisfaction: 0,
          },
        };
      
      case 'user':
        // Regular users get very limited information
        return {
          ...overview,
          system: {
            totalUsers: overview.system.totalUsers,
            activeUsers: overview.system.activeUsers,
            totalDocuments: overview.system.totalDocuments,
            totalMedia: overview.system.totalMedia,
            totalArticles: overview.system.totalArticles,
            totalDepartments: 0,
            storage: {
              used: 'Not available',
              total: 'Not available',
              usedPercentage: 0,
              largestConsumer: 'Not available',
              monthlyGrowth: 'Not available',
            },
            systemHealth: {
              status: 'unknown',
              uptime: 0,
              recentErrors: 0,
              message: 'System health information not available for users',
              lastChecked: new Date(),
            },
            lastUpdated: overview.system.lastUpdated,
          },
          users: {
            ...overview.users,
            roleDistribution: {
              admin: 0,
              editor: 0,
              user: overview.users.roleDistribution.user,
              manager: 0,
            },
            topActiveUsers: [], // Limited for privacy
          },
          hr: {
            totalEmployees: 0,
            departments: [],
            metrics: {
              turnoverRate: 0,
              averageTenure: 0,
              recentHires: 0,
              pendingApprovals: 0,
              documentCompliance: 0,
            },
            openPositions: 0,
            trainingPrograms: 0,
            employeeSatisfaction: 0,
          },
        };
      
      default:
        // Unknown role gets minimal access
        return {
          ...overview,
          system: {
            totalUsers: 0,
            activeUsers: 0,
            totalDocuments: 0,
            totalMedia: 0,
            totalArticles: 0,
            totalDepartments: 0,
            storage: {
              used: 'Not available',
              total: 'Not available',
              usedPercentage: 0,
              largestConsumer: 'Not available',
              monthlyGrowth: 'Not available',
            },
            systemHealth: {
              status: 'unknown',
              uptime: 0,
              recentErrors: 0,
              message: 'Access denied for unknown role',
              lastChecked: new Date(),
            },
            lastUpdated: new Date(),
          },
          content: {
            topDocuments: [],
            topMedia: [],
            topArticles: [],
            documentGrowth: { monthly: 0, trend: '0%', weekly: 0, daily: 0 },
            mediaGrowth: { monthly: 0, trend: '0%', weekly: 0, daily: 0 },
            articleGrowth: { monthly: 0, trend: '0%', weekly: 0, daily: 0 },
            totalDownloads: 0,
            totalViews: 0,
            averageEngagement: 0,
          },
          users: {
            userGrowth: { monthly: 0, trend: '0%', weekly: 0, daily: 0 },
            roleDistribution: { admin: 0, editor: 0, user: 0, manager: 0 },
            dailyActiveUsers: 0,
            weeklyActiveUsers: 0,
            monthlyActiveUsers: 0,
            topActiveUsers: [],
            averageSessionDuration: 0,
            averageActionsPerSession: 0,
          },
          hr: {
            totalEmployees: 0,
            departments: [],
            metrics: {
              turnoverRate: 0,
              averageTenure: 0,
              recentHires: 0,
              pendingApprovals: 0,
              documentCompliance: 0,
            },
            openPositions: 0,
            trainingPrograms: 0,
            employeeSatisfaction: 0,
          },
          marketing: {
            topSliders: [],
            topSearches: [],
            averageClickThroughRate: 0,
            totalBannerViews: 0,
            totalBannerClicks: 0,
            uniqueVisitors: 0,
          },
          generatedAt: new Date(),
        };
    }
  }

  /**
   * Generate default dashboard configuration for a role
   */
  private generateDefaultConfig(role: string): DashboardConfigDto {
    const baseWidgets: DashboardWidgetDto[] = [
      {
        id: 'system-overview',
        title: 'System Overview',
        type: 'widget',
        enabled: true,
        order: 1,
        data: {},
      },
      {
        id: 'content-analytics',
        title: 'Content Analytics',
        type: 'chart',
        enabled: true,
        order: 2,
        data: {},
      },
      {
        id: 'user-analytics',
        title: 'User Analytics',
        type: 'chart',
        enabled: true,
        order: 3,
        data: {},
      },
    ];

    switch (role.toLowerCase()) {
      case 'admin':
        return {
          id: 'admin-dashboard',
          name: 'Admin Dashboard',
          role: 'admin',
          widgets: [
            ...baseWidgets,
            {
              id: 'hr-analytics',
              title: 'HR Analytics',
              type: 'widget',
              enabled: true,
              order: 4,
              data: {},
            },
            {
              id: 'marketing-analytics',
              title: 'Marketing Analytics',
              type: 'chart',
              enabled: true,
              order: 5,
              data: {},
            },
          ],
          layout: 'grid',
          autoRefresh: true,
          refreshInterval: 30000, // 30 seconds
        };

      case 'manager':
        return {
          id: 'manager-dashboard',
          name: 'Manager Dashboard',
          role: 'manager',
          widgets: [
            ...baseWidgets,
            {
              id: 'hr-analytics',
              title: 'HR Analytics',
              type: 'widget',
              enabled: true,
              order: 4,
              data: {},
            },
          ],
          layout: 'grid',
          autoRefresh: true,
          refreshInterval: 60000, // 1 minute
        };

      case 'editor':
        return {
          id: 'editor-dashboard',
          name: 'Editor Dashboard',
          role: 'editor',
          widgets: [
            {
              id: 'content-analytics',
              title: 'Content Analytics',
              type: 'chart',
              enabled: true,
              order: 1,
              data: {},
            },
            {
              id: 'user-analytics',
              title: 'User Analytics',
              type: 'chart',
              enabled: true,
              order: 2,
              data: {},
            },
          ],
          layout: 'list',
          autoRefresh: false,
          refreshInterval: 300000, // 5 minutes
        };

      case 'user':
        return {
          id: 'user-dashboard',
          name: 'User Dashboard',
          role: 'user',
          widgets: [
            {
              id: 'content-analytics',
              title: 'Content Overview',
              type: 'widget',
              enabled: true,
              order: 1,
              data: {},
            },
          ],
          layout: 'list',
          autoRefresh: false,
          refreshInterval: 600000, // 10 minutes
        };

      default:
        return {
          id: 'default-dashboard',
          name: 'Default Dashboard',
          role: 'unknown',
          widgets: [
            {
              id: 'system-overview',
              title: 'System Overview',
              type: 'widget',
              enabled: true,
              order: 1,
              data: {},
            },
          ],
          layout: 'list',
          autoRefresh: false,
          refreshInterval: 600000, // 10 minutes
        };
    }
  }

  /**
   * Convert dashboard data to CSV format
   */
  private convertToCSV(data: any): Buffer {
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
      
      return Buffer.from(csvRows.join('\n'), 'utf-8');
    } catch (error) {
      this.logger.error('Failed to convert data to CSV:', error);
      throw new Error('Failed to convert dashboard data to CSV format');
    }
  }
}
