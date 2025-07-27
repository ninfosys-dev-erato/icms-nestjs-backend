import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

import { UsersRepository } from '../users/repositories/users.repository';
import { AuditLogRepository } from '../auth/repositories/audit-log.repository';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async onModuleInit() {
    await this.initializeAdminUser();
  }

  async initializeAdminUser(): Promise<void> {
    try {
      this.logger.log('🚀 Starting admin user initialization...');

      // Get bootstrap configuration
      const userEmail = this.configService.get<string>('app.bootstrap.userEmail');
      const userPassword = this.configService.get<string>('app.bootstrap.userPassword');
      const defaultEmail = this.configService.get<string>('app.bootstrap.defaultEmail');
      const defaultPassword = this.configService.get<string>('app.bootstrap.defaultPassword');

      let email: string;
      let password: string;
      let isDefaultCredentials = false;

      // Determine which credentials to use
      if (userEmail && userPassword) {
        email = userEmail;
        password = userPassword;
        this.logger.log(`✅ Using provided credentials for user: ${email}`);
      } else {
        email = defaultEmail;
        password = defaultPassword;
        isDefaultCredentials = true;
        this.logger.warn('⚠️  USEREMAIL and/or USERPASSWORD not found in environment variables');
        this.logger.warn(`⚠️  Using default credentials: ${email} / ${password}`);
        this.logger.warn('⚠️  Consider setting USEREMAIL and USERPASSWORD in your .env file for production');
        
        // Add default credentials to .env file for better readability
        await this.addDefaultCredentialsToEnvFile(defaultEmail, defaultPassword);
      }

      // Check if user already exists
      const existingUser = await this.usersRepository.findByEmail(email);
      
      if (existingUser) {
        this.logger.log(`✅ Admin user already exists: ${email}`);
        return;
      }

      // Hash password using the same method as UsersService
      const hashedPassword = await this.hashPassword(password);

      // Create the admin user
      const newUser = await this.usersRepository.create({
        email,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        isActive: true,
      });

      // Log audit event
      await this.logAuditEvent({
        action: 'BOOTSTRAP_USER_CREATED',
        resource: 'USER',
        resourceId: newUser.id,
        details: { 
          email: newUser.email, 
          role: newUser.role,
          isDefaultCredentials 
        },
        ipAddress: 'system',
        userAgent: 'bootstrap',
      });

      this.logger.log(`✅ Admin user created successfully: ${email}`);
      
      if (isDefaultCredentials) {
        this.logger.warn('⚠️  Default credentials were used. Please change the password after first login.');
      }

    } catch (error) {
      this.logger.error(`❌ Failed to initialize admin user: ${error.message}`, error.stack);
      // Don't throw the error to prevent application startup failure
      // The application should continue to run even if bootstrap fails
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('app.security.bcryptRounds', 12);
    return bcrypt.hash(password, saltRounds);
  }

  private async addDefaultCredentialsToEnvFile(defaultEmail: string, defaultPassword: string): Promise<void> {
    try {
      const envPath = path.join(process.cwd(), '.env');
      
      // Check if .env file exists
      if (!fs.existsSync(envPath)) {
        this.logger.log('📝 Creating new .env file with default credentials...');
        const envContent = `# ========================================
# BOOTSTRAP CONFIGURATION
# ========================================
# Default admin user credentials (auto-generated)
# You can modify these values and restart the application
USEREMAIL=${defaultEmail}
USERPASSWORD=${defaultPassword}

`;
        fs.writeFileSync(envPath, envContent, 'utf8');
        this.logger.log('✅ Created .env file with default credentials');
        return;
      }

      // Read existing .env file
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if USEREMAIL and USERPASSWORD already exist (even if commented)
      const hasUserEmail = /^[\s]*USEREMAIL\s*=/m.test(envContent);
      const hasUserPassword = /^[\s]*USERPASSWORD\s*=/m.test(envContent);
      
      if (!hasUserEmail || !hasUserPassword) {
        this.logger.log('📝 Adding default credentials to existing .env file...');
        
        let newContent = envContent;
        
        // Ensure the file ends with a newline before adding new content
        if (!newContent.endsWith('\n')) {
          newContent += '\n';
        }
        
        // Add bootstrap section header if it doesn't exist
        if (!envContent.includes('# BOOTSTRAP CONFIGURATION')) {
          newContent += `
# ========================================
# BOOTSTRAP CONFIGURATION
# ========================================
# Default admin user credentials (auto-generated)
# You can modify these values and restart the application
`;
        }
        
        // Add USEREMAIL if missing
        if (!hasUserEmail) {
          newContent += `USEREMAIL=${defaultEmail}\n`;
        }
        
        // Add USERPASSWORD if missing
        if (!hasUserPassword) {
          newContent += `USERPASSWORD=${defaultPassword}\n`;
        }
        
        fs.writeFileSync(envPath, newContent, 'utf8');
        this.logger.log('✅ Added default credentials to .env file');
        this.logger.log('💡 You can now modify USEREMAIL and USERPASSWORD in your .env file and restart the application');
      } else {
        this.logger.log('ℹ️  USEREMAIL and USERPASSWORD entries already exist in .env file');
      }
      
    } catch (error) {
      this.logger.error(`❌ Failed to update .env file: ${error.message}`);
      // Don't throw - .env file update failure shouldn't break bootstrap
    }
  }

  private async logAuditEvent(data: any): Promise<void> {
    try {
      await this.auditLogRepository.create(data);
    } catch (error) {
      this.logger.error('Failed to create bootstrap audit log:', error);
      // Don't throw - audit logging failure shouldn't break bootstrap
    }
  }
} 