import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '@/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
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

    // Auth Module
    AuthModule,
    
    // Users Module
    UsersModule,
    
    // TODO: Add other modules here
    // ContentModule,
    // MediaModule,
    // SettingsModule,
    // TranslationModule,
    // SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 