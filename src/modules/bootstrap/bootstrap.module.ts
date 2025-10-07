import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BootstrapService } from './bootstrap.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';

@Module({
  imports: [ConfigModule],
  providers: [
    BootstrapService,
    UsersRepository,
    AuditLogRepository,
  ],
  exports: [BootstrapService],
})
export class BootstrapModule {} 