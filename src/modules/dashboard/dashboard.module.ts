import { Module } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service';
import { MetricsService } from './services/metrics.service';
import { CacheService } from './services/cache.service';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { DatabaseModule } from '../../database/database.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    DatabaseModule,
    DocumentsModule,
  ],
  controllers: [
    AdminDashboardController,
  ],
  providers: [
    DashboardService,
    MetricsService,
    CacheService,
  ],
  exports: [
    DashboardService,
    MetricsService,
    CacheService,
  ],
})
export class DashboardModule {}
