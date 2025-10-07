import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { AdminUserController } from './admin-user.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { UserSessionRepository } from '../auth/repositories/user-session.repository';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';

@Module({
  controllers: [UsersController, AdminUserController],
  providers: [
    UsersService,
    UsersRepository,
    UserSessionRepository,
    AuditLogRepository,
  ],
  exports: [UsersService],
})
export class UsersModule {} 