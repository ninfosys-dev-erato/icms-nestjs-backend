// Module
export { AuthModule } from './auth.module';

// Services
export { AuthService } from './auth.service';

// Controllers
export { AuthController } from './auth.controller';

// Repositories
export { AuthRepository } from './repositories/auth.repository';
export { UserSessionRepository } from './repositories/user-session.repository';
export { LoginAttemptRepository } from './repositories/login-attempt.repository';
export { AuditLogRepository } from './repositories/audit-log.repository';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy';
export { LocalStrategy } from './strategies/local.strategy';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { LocalAuthGuard } from './guards/local-auth.guard';
export { RolesGuard } from './guards/roles.guard';

// Decorators
export { CurrentUser } from './decorators/current-user.decorator';
export { Roles, ROLES_KEY } from './decorators/roles.decorator';

// DTOs
export * from './dto/auth.dto'; 