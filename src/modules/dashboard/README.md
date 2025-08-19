# Dashboard Module

## Overview

The Dashboard Module provides comprehensive analytics and insights for the iCMS system, offering role-based access to system metrics, content analytics, user behavior, HR statistics, and marketing performance.

## Features

### 🎯 **Core Dashboard Features**
- **System Overview**: Total users, documents, media, system health, storage metrics
- **Content Analytics**: Top content, growth trends, engagement metrics
- **User Analytics**: User growth, role distribution, active users, session data
- **HR Analytics**: Employee statistics, department metrics, compliance tracking
- **Marketing Analytics**: Slider performance, search trends, click-through rates

### 🚀 **Advanced Features**
- **Role-based Access Control**: Different dashboard views for different user roles
- **Real-time Data**: Live metrics with configurable refresh intervals
- **Caching System**: Performance optimization with intelligent caching
- **Export Functionality**: JSON, CSV, and PDF export options
- **Customizable Widgets**: Configurable dashboard layouts and components
- **Health Monitoring**: System health status and performance metrics

## Architecture

### **Module Structure**
```
src/modules/dashboard/
├── dashboard.module.ts          # Main module configuration
├── services/
│   ├── dashboard.service.ts     # Main dashboard orchestration
│   ├── metrics.service.ts       # Data collection and aggregation
│   └── cache.service.ts        # Performance optimization
├── controllers/
│   ├── admin-dashboard.controller.ts    # Admin endpoints
│   ├── manager-dashboard.controller.ts  # Manager endpoints
│   └── public-dashboard.controller.ts   # Public endpoints
├── dto/
│   └── dashboard.dto.ts        # Data transfer objects
└── index.ts                    # Module exports
```

### **Service Layer**
- **DashboardService**: High-level dashboard operations and role-based filtering
- **MetricsService**: Data collection from various system modules
- **CacheService**: Performance optimization with configurable TTL

## API Endpoints

### **Admin Dashboard** (`/api/v1/admin/dashboard`)

#### **Overview & Analytics**
- `GET /overview` - Comprehensive dashboard overview
- `GET /overview/:role` - Role-based dashboard preview
- `GET /system/overview` - System metrics
- `GET /content/analytics` - Content performance
- `GET /users/analytics` - User behavior analytics
- `GET /hr/analytics` - HR metrics and statistics
- `GET /marketing/analytics` - Marketing performance

#### **Configuration & Management**
- `GET /config/:role` - Get dashboard configuration for role
- `PUT /config/:role` - Update dashboard configuration
- `GET /widget/:widgetId` - Get specific widget data
- `GET /health` - Dashboard system health

#### **Data Operations**
- `GET /export` - Export dashboard data (JSON/CSV/PDF)
- `POST /refresh` - Refresh dashboard data
- `GET /cache/stats` - Cache performance statistics
- `POST /cache/clear` - Clear dashboard cache

### **Manager Dashboard** (`/api/v1/manager/dashboard`)
- Role-based access for managers and department heads
- Limited system information for security
- Focus on operational metrics

### **Editor Dashboard** (`/api/v1/editor/dashboard`)
- Content-focused analytics
- User engagement metrics
- Limited administrative access

### **User Dashboard** (`/api/v1/user/dashboard`)
- Basic content overview
- Personal usage statistics
- Minimal system information

## Role-Based Access Control

### **Admin Role**
- Full access to all dashboard features
- System health and performance monitoring
- User management analytics
- HR and financial metrics
- Marketing campaign performance

### **Manager Role**
- Department-specific metrics
- Team performance analytics
- Limited system information
- HR metrics for their department

### **Editor Role**
- Content performance analytics
- User engagement metrics
- Publication statistics
- No access to system or HR data

### **User Role**
- Basic content overview
- Personal usage statistics
- No access to sensitive metrics
- Privacy-focused data display

## Data Sources

### **System Metrics**
- User management system
- Document management system
- Media management system
- Content management system
- Database performance metrics

### **Content Analytics**
- Document download statistics
- Media view counts
- Article engagement metrics
- Search query analysis
- User interaction patterns

### **User Analytics**
- Login patterns and frequency
- Feature usage statistics
- Session duration analysis
- Role-based activity tracking
- Geographic distribution (if available)

### **HR Analytics**
- Employee count and growth
- Department statistics
- Training program metrics
- Compliance tracking
- Employee satisfaction scores

### **Marketing Analytics**
- Slider/banner performance
- Click-through rates
- User engagement metrics
- Search trend analysis
- Campaign effectiveness

## Caching Strategy

### **Cache Levels**
- **Dashboard Overview**: 2 minutes TTL
- **Widget Data**: 1 minute TTL
- **Configuration**: 1 hour TTL
- **Export Metadata**: 24 hours TTL

### **Cache Categories**
- `dashboard:overview` - Main dashboard data
- `dashboard:widget:*` - Individual widget data
- `dashboard:config:*` - Role-based configurations
- `dashboard:exports:*` - Export metadata

### **Performance Features**
- Automatic cache cleanup
- LRU eviction policy
- Configurable TTL per data type
- Cache health monitoring

## Usage Examples

### **Get Dashboard Overview**
```bash
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/overview" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Role-Based Dashboard**
```bash
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/overview/manager" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Export Dashboard Data**
```bash
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/export?format=csv&dateFrom=2024-01-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Specific Widget Data**
```bash
curl -X GET "http://localhost:3000/api/v1/admin/dashboard/widget/content-analytics?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Update Dashboard Configuration**
```bash
curl -X PUT "http://localhost:3000/api/v1/admin/dashboard/config/editor" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoRefresh": true,
    "refreshInterval": 60000,
    "layout": "grid"
  }'
```

## Configuration

### **Environment Variables**
```bash
# Dashboard Configuration
DASHBOARD_CACHE_TTL=300000          # 5 minutes default
DASHBOARD_MAX_CACHE_SIZE=1000       # Maximum cache items
DASHBOARD_REFRESH_INTERVAL=30000    # 30 seconds default
```

### **Dashboard Widgets**
Each role has predefined widgets that can be customized:
- **System Overview**: Basic system metrics
- **Content Analytics**: Content performance charts
- **User Analytics**: User behavior insights
- **HR Analytics**: Employee and department metrics
- **Marketing Analytics**: Campaign and engagement data

## Performance Considerations

### **Optimization Strategies**
- Intelligent caching with configurable TTL
- Parallel data fetching for multiple metrics
- Lazy loading of widget data
- Background data refresh
- Cache invalidation strategies

### **Monitoring**
- Cache hit/miss ratios
- Response time metrics
- Memory usage tracking
- Error rate monitoring
- Performance degradation alerts

## Security Features

### **Access Control**
- JWT-based authentication
- Role-based authorization
- Data filtering by user permissions
- Audit logging for sensitive operations
- Rate limiting for API endpoints

### **Data Privacy**
- Role-based data filtering
- Sensitive information masking
- User privacy protection
- Compliance with data protection regulations

## Future Enhancements

### **Planned Features**
- Real-time WebSocket updates
- Advanced charting and visualization
- Custom dashboard builder
- Scheduled report generation
- Integration with external analytics tools
- Machine learning insights
- Predictive analytics

### **Performance Improvements**
- Redis caching backend
- Database query optimization
- Background job processing
- CDN integration for static assets
- Load balancing for high-traffic scenarios

## Troubleshooting

### **Common Issues**
1. **Cache Performance**: Monitor cache hit rates and adjust TTL values
2. **Data Accuracy**: Verify data source connections and refresh intervals
3. **Role Access**: Check user permissions and role assignments
4. **Export Failures**: Ensure proper file permissions and storage space

### **Debug Information**
- Enable debug logging for detailed operation tracking
- Monitor cache statistics for performance issues
- Check system health endpoint for overall status
- Review error logs for specific failure reasons

## Contributing

When contributing to the dashboard module:
1. Follow the established coding standards
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure proper error handling and logging
5. Consider performance implications of changes
6. Test with different user roles and permissions

## Support

For issues and questions related to the dashboard module:
1. Check the troubleshooting section
2. Review API documentation
3. Examine error logs and debug information
4. Contact the development team
5. Create detailed issue reports with reproduction steps
