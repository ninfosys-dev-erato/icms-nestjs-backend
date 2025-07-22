# Database Migration Guide

## Overview

This guide covers database migration practices, conflict resolution, and production deployment strategies for the ICMS backend system.

## Prisma Migration Commands

### Development Workflow

```bash
# Generate a new migration
npm run db:migrate

# Apply migrations to database
npm run db:migrate:deploy

# Reset database (development only)
npm run db:migrate:reset

# Check migration status
npm run db:migrate:status

# Generate Prisma client
npm run db:generate

# Push schema changes directly (development only)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

### Production Commands

```bash
# Deploy migrations to production
npm run db:migrate:deploy

# Check production migration status
npm run db:migrate:status

# Generate client for production
npm run db:generate
```

## Migration Best Practices

### 1. Migration Naming Convention

Use descriptive names for migrations:

```bash
# Good examples
npx prisma migrate dev --name add_user_verification_fields
npx prisma migrate dev --name create_content_attachments_table
npx prisma migrate dev --name add_audit_logging_system

# Bad examples
npx prisma migrate dev --name update_schema
npx prisma migrate dev --name fix_bug
npx prisma migrate dev --name changes
```

### 2. Migration Structure

Each migration should:
- Have a clear, single purpose
- Include both up and down migrations
- Be tested in development before production
- Include proper rollback strategies

### 3. Schema Changes Guidelines

#### Safe Changes (No Data Loss)
- Adding new tables
- Adding nullable columns
- Adding indexes
- Adding enums
- Adding default values

#### Potentially Breaking Changes
- Removing columns
- Changing column types
- Adding non-nullable columns
- Renaming tables/columns

#### Breaking Changes (Require Special Handling)
- Dropping tables
- Changing primary keys
- Modifying foreign key relationships

## Conflict Resolution

### 1. Merge Conflicts in Migration Files

When multiple developers create migrations simultaneously:

```bash
# 1. Check current migration status
npm run db:migrate:status

# 2. Reset to a clean state (development only)
npm run db:migrate:reset

# 3. Create a new migration with all changes
npx prisma migrate dev --name resolve_conflicts

# 4. Test the migration thoroughly
npm run test

# 5. Commit the resolved migration
git add .
git commit -m "Resolve migration conflicts"
```

### 2. Production Migration Conflicts

If migrations conflict in production:

```bash
# 1. Stop the application
# 2. Backup the database
pg_dump -h localhost -U icmsdev -d icmslocal > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Check migration status
npm run db:migrate:status

# 4. Manually resolve conflicts in migration files
# 5. Apply the resolved migration
npm run db:migrate:deploy

# 6. Restart the application
```

### 3. Data Migration Conflicts

For complex data migrations:

```typescript
// Example: Migrating translatable content
export async function migrateTranslatableContent() {
  const prisma = new PrismaClient();
  
  try {
    // 1. Create backup
    const oldContent = await prisma.$queryRaw`
      SELECT * FROM old_content_table
    `;
    
    // 2. Transform data
    const newContent = oldContent.map(item => ({
      title: { en: item.title_en, ne: item.title_ne },
      content: { en: item.content_en, ne: item.content_ne },
    }));
    
    // 3. Insert new data
    await prisma.content.createMany({
      data: newContent,
    });
    
    // 4. Verify migration
    const count = await prisma.content.count();
    console.log(`Migrated ${count} content items`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
```

## Database Reset Procedures

### Development Environment

```bash
# Complete reset (removes all data)
npm run db:migrate:reset

# Reset and seed with initial data
npm run db:migrate:reset && npm run db:seed

# Force reset (if normal reset fails)
npm run db:drop
npm run db:migrate
npm run db:seed
```

### Production Environment

**⚠️ WARNING: Never reset production database!**

```bash
# Instead, use selective data cleanup
npx prisma studio  # Manual cleanup via UI

# Or create a cleanup script
npx ts-node scripts/cleanup-production-data.ts
```

## Environment-Specific Configurations

### Development

```env
DATABASE_URL="postgresql://icmsdev:dev@123@localhost:5432/icmslocal?schema=public"
```

### Staging

```env
DATABASE_URL="postgresql://icmsstaging:staging@123@staging-db:5432/icmsstaging?schema=public"
```

### Production

```env
DATABASE_URL="postgresql://icmsprod:prod@123@prod-db:5432/icmsprod?schema=public"
```

## Backup and Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="icmslocal"

# Create backup
pg_dump -h localhost -U icmsdev -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Recovery Procedures

```bash
# Restore from backup
gunzip -c backup_20240101_120000.sql.gz | psql -h localhost -U icmsdev -d icmslocal

# Verify restoration
npm run db:migrate:status
```

## Monitoring and Maintenance

### Migration Health Checks

```typescript
// health-check.service.ts
@Injectable()
export class DatabaseHealthService {
  constructor(private prisma: PrismaService) {}

  async checkMigrationStatus() {
    try {
      const status = await this.prisma.$queryRaw`
        SELECT * FROM _prisma_migrations 
        ORDER BY finished_at DESC 
        LIMIT 1
      `;
      
      return {
        status: 'healthy',
        lastMigration: status[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

### Performance Monitoring

```sql
-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Common Issues

#### 1. Migration Lock Issues

```bash
# Check for migration locks
SELECT * FROM _prisma_migrations_lock;

# Clear migration lock (if stuck)
DELETE FROM _prisma_migrations_lock;
```

#### 2. Connection Issues

```bash
# Test database connection
psql -h localhost -U icmsdev -d icmslocal -c "SELECT 1;"

# Check connection pool
SELECT * FROM pg_stat_activity WHERE datname = 'icmslocal';
```

#### 3. Schema Validation Errors

```bash
# Validate schema
npm run db:validate

# Format schema
npm run db:format

# Generate client
npm run db:generate
```

### Emergency Procedures

#### Rollback Migration

```bash
# 1. Identify the problematic migration
npm run db:migrate:status

# 2. Create a rollback migration
npx prisma migrate dev --name rollback_problematic_changes

# 3. Apply rollback
npm run db:migrate:deploy
```

#### Database Recovery

```bash
# 1. Stop application
# 2. Restore from latest backup
gunzip -c latest_backup.sql.gz | psql -h localhost -U icmsdev -d icmslocal

# 3. Apply any pending migrations
npm run db:migrate:deploy

# 4. Restart application
```

## Security Considerations

### 1. Migration Permissions

```sql
-- Grant minimal required permissions
GRANT CONNECT ON DATABASE icmslocal TO icmsdev;
GRANT USAGE ON SCHEMA public TO icmsdev;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO icmsdev;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO icmsdev;
```

### 2. Sensitive Data Handling

```typescript
// Never log sensitive data in migrations
export async function migrateUserPasswords() {
  // ❌ Bad: Logging sensitive data
  console.log('Migrating password:', user.password);
  
  // ✅ Good: Logging only non-sensitive info
  console.log('Migrating user:', user.email);
}
```

### 3. Backup Security

```bash
# Encrypt backups
gpg --encrypt --recipient admin@icms.gov.np backup_20240101.sql

# Secure backup storage
chmod 600 backup_20240101.sql.gpg
```

## Testing Migrations

### Unit Testing

```typescript
// migration.test.ts
describe('User Migration', () => {
  it('should migrate user data correctly', async () => {
    const prisma = new PrismaClient();
    
    // Test migration logic
    const result = await migrateUserData();
    
    expect(result.success).toBe(true);
    expect(result.migratedCount).toBeGreaterThan(0);
    
    await prisma.$disconnect();
  });
});
```

### Integration Testing

```typescript
// integration.test.ts
describe('Database Integration', () => {
  it('should apply all migrations successfully', async () => {
    const result = await exec('npm run db:migrate:deploy');
    expect(result.code).toBe(0);
  });
});
```

## Documentation Standards

### Migration Documentation Template

```markdown
# Migration: add_user_verification_fields

## Purpose
Add email verification and password reset functionality to user management.

## Changes
- Added `isEmailVerified` boolean field to User model
- Added `emailVerificationToken` string field to User model
- Added `passwordResetToken` string field to User model
- Added `passwordResetExpires` DateTime field to User model

## Breaking Changes
None

## Rollback Strategy
Remove the added fields and related indexes.

## Testing
- [ ] Unit tests for new fields
- [ ] Integration tests for verification flow
- [ ] Manual testing of email verification
- [ ] Manual testing of password reset

## Deployment Notes
- Requires email service configuration
- Update environment variables for JWT secrets
```

This comprehensive migration guide ensures safe and efficient database management throughout the development lifecycle. 