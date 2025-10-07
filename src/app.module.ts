import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '@/database/database.module';
import { FileStorageModule } from '@/common/services/file-storage/file-storage.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ContentManagementModule } from '@/modules/content-management/content-management.module';
import { OfficeSettingsModule } from '@/modules/office-settings/office-settings.module';
import { OfficeDescriptionModule } from '@/modules/office-description/office-description.module';
import { ImportantLinksModule } from '@/modules/important-links/important-links.module';
import { FAQModule } from '@/modules/faq/faq.module';
import { MediaModule } from '@/modules/media/media.module';
import { TranslationModule } from '@/modules/translation';
import { SearchModule } from '@/modules/search';
import { DocumentsModule } from '@/modules/documents';
import { HeaderModule } from '@/modules/header';
import { HRModule } from '@/modules/hr';
import { NavigationModule } from '@/modules/navigation';
import { SliderModule } from '@/modules/slider';
import { BootstrapModule } from '@/modules/bootstrap/bootstrap.module';
import { DashboardModule } from '@/modules/dashboard';
import { HealthModule } from '@/modules/health/health.module';
import { RequestIdMiddleware } from '@/common/middleware/request-id.middleware';
import configuration from '@/config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),

    // Health checks
    TerminusModule,

    // Database
    DatabaseModule,

    // File Storage
    FileStorageModule,

    // Auth Module
    AuthModule,
    
    // Users Module
    UsersModule,
    
    // Content Management Module
    ContentManagementModule,
    
    // Office Settings Module
    OfficeSettingsModule,
    
    // Office Description Module
    OfficeDescriptionModule,
    
    // Important Links Module
    ImportantLinksModule,
    
    // FAQ Module
    FAQModule,
    
    // Media Module
   MediaModule,
    
    // Translation Module
    TranslationModule,
    
    // Search Module
    SearchModule,
    
    // Documents Module
    DocumentsModule,
    
    // Header Module
    HeaderModule,
    
    // HR Module
    HRModule,
    
    // Navigation Module
    NavigationModule,
    
    // Slider Module
    SliderModule,
    
    // Bootstrap Module
    BootstrapModule,
    
    // Dashboard Module
    DashboardModule,
    
    // Health Module
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 