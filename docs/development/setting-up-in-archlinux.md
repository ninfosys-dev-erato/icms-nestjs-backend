# Setting Up Development Environment in Arch Linux

This guide will help you set up a complete development environment for the ICMS (Integrated Content Management System) project on Arch Linux.

## Table of Contents

1. [System Update](#system-update)
2. [Node.js and Package Managers](#nodejs-and-package-managers)
3. [PostgreSQL Database](#postgresql-database)
4. [Redis Cache](#redis-cache)
5. [MinIO Object Storage](#minio-object-storage)
6. [S3-Compatible Storage Configuration](#s3-compatible-storage-configuration)
7. [Development Tools](#development-tools)
8. [Environment Configuration](#environment-configuration)
9. [Database Synchronization](#database-synchronization)
10. [Verification](#verification)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

- Arch Linux system with sudo privileges
- Internet connection
- Basic knowledge of terminal commands

## System Update

First, let's ensure your system is up to date:

```bash
# Update system packages
sudo pacman -Syuu

# Install essential development tools
sudo pacman -S base-devel git curl wget
```

## Node.js and Package Managers

### Installing Node.js

```bash
# Install Node.js and npm
sudo pacman -S nodejs npm

# Verify installation
node --version
npm --version
```

### Installing Package Managers

You can choose between Yarn, pnpm, or use npm. Here are all three options:

#### Option 1: Yarn (Recommended)

```bash
# Install Yarn
sudo pacman -S yarn

# Verify installation
yarn --version

# Set Yarn as the default package manager
yarn config set init-author-name "Your Name"
yarn config set init-author-email "your.email@example.com"
```

#### Option 2: pnpm (Fast and Efficient)

```bash
# Install pnpm using npm
sudo npm install -g pnpm

# Verify installation
pnpm --version

# Set pnpm as the default package manager
pnpm config set store-dir ~/.pnpm-store
```

#### Option 3: npm (Default)

npm comes with Node.js, so no additional installation is needed.

## PostgreSQL Database

### Installation and Setup

```bash
# Install PostgreSQL
sudo pacman -S postgresql

# Initialize the database
sudo -u postgres initdb -D /var/lib/postgres/data --locale=en_US.UTF-8 --encoding=UTF8

# Start and enable PostgreSQL service
sudo systemctl enable --now postgresql.service

# Verify service is running
sudo systemctl status postgresql.service
```

### Database Configuration

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# In the PostgreSQL prompt, run these commands:
```

```sql
-- Create the development user
CREATE USER cmsadmin WITH PASSWORD 'dev123';

-- Create the development database
CREATE DATABASE cmsdb OWNER cmsadmin;

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE cmsdb TO cmsadmin;

-- Connect to the new database
\c cmsdb

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO cmsadmin;

ALTER USER cmsadmin CREATEDB;

-- Exit PostgreSQL
\q
```

'postgresql://test:test@localhost:5432/icms_test'

### Test Database Connection

```bash
# Test connection with the new user
psql -U icmsdev -d icmslocal -h localhost

# You should be prompted for the password: dev@123
# Type \q to exit
```

## Redis Cache

### Installation and Setup

```bash
# Install Redis (Valkey in Arch Linux)
sudo pacman -S redis

# Start and enable Redis service
sudo systemctl enable --now valkey

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### Redis Configuration

```bash
# Edit Redis configuration
sudo vim /etc/valkey.conf

# Add or modify these lines:
# requirepass dev@123
# bind 127.0.0.1
# port 6379

# Restart Redis to apply changes
sudo systemctl restart valkey

# Test Redis with authentication
redis-cli
AUTH dev@123
PING
# Should return: PONG
```

## MinIO Object Storage

### Installation and Setup

```bash
# Install MinIO server and client
sudo pacman -S minio minio-client

# Start and enable MinIO service
sudo systemctl enable --now minio

# Verify MinIO is running
sudo systemctl status minio
```

### MinIO Configuration

MinIO runs on port 9000 by default with these credentials:

- **Username**: `minioadmin`
- **Password**: `minioadmin`
- **Access URL**: `http://localhost:9000`
- **Console URL**: `http://localhost:9001`

### Create Development Bucket

```bash
# Configure MinIO client
mcli alias set local http://localhost:9000 minioadmin minioadmin

# Create a bucket for development
mcli mb local/icms-dev

# List buckets to verify
mcli ls local
```

## S3-Compatible Storage Configuration

The ICMS project supports both local file storage and S3-compatible storage (MinIO/AWS S3). The configuration is handled through environment variables.

### Storage Provider Options

The `STORAGE_PROVIDER` environment variable controls which storage system to use:

- `local`: Uses local file system storage
- `s3`: Uses S3-compatible storage (MinIO or AWS S3)

### S3 Configuration for MinIO

When using MinIO as your S3-compatible storage, ensure these environment variables are set:

```bash
# Storage provider
STORAGE_PROVIDER=s3

# S3-compatible storage configuration
STORAGE_S3_ENDPOINT=http://localhost:9000
STORAGE_S3_REGION=us-east-1
STORAGE_S3_BUCKET=icms-dev
STORAGE_S3_ACCESS_KEY_ID=minioadmin
STORAGE_S3_SECRET_ACCESS_KEY=minioadmin
STORAGE_S3_FORCE_PATH_STYLE=true
STORAGE_S3_SIGNED_URL_EXPIRES=3600
```

### S3 Configuration for AWS S3

If you want to use AWS S3 instead of MinIO:

```bash
# Storage provider
STORAGE_PROVIDER=s3

# AWS S3 configuration
STORAGE_S3_ENDPOINT=  # Leave empty for AWS S3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_BUCKET=your-s3-bucket-name
STORAGE_S3_ACCESS_KEY_ID=your-aws-access-key
STORAGE_S3_SECRET_ACCESS_KEY=your-aws-secret-key
STORAGE_S3_FORCE_PATH_STYLE=false
STORAGE_S3_SIGNED_URL_EXPIRES=3600
```

### Local Storage Configuration

For local file storage (alternative to S3):

```bash
# Storage provider
STORAGE_PROVIDER=local

# Local storage configuration
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_BASE_URL=http://localhost:3000/uploads
```

### Testing Storage Configuration

After setting up your storage configuration, test it:

```bash
# Test MinIO connection
mcli ls local

# Test S3 bucket access
mcli ls local/icms-dev

# Upload a test file
echo "test" > test.txt
mcli cp test.txt local/icms-dev/
mcli ls local/icms-dev/
rm test.txt
```

### Storage Configuration Verification

When you start the application, it will automatically:

1. Connect to the configured storage provider
2. Create the bucket if it doesn't exist (for S3)
3. Set up the necessary storage directories (for local)

You can verify the storage is working by:

```bash
# Check application logs for storage initialization
npm run start:dev

# Look for messages like:
# "Storage provider initialized: s3"
# "Bucket 'icms-dev' is ready"
```

## Development Tools

### Essential Development Packages

```bash
# Install additional development tools
sudo pacman -S vim neovim htop tree jq

# Install Docker (optional, for containerized development)
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker.service
sudo usermod -aG docker $USER
```

### IDE and Extensions

Recommended IDEs for this project:

- **VS Code**: `sudo pacman -S code`
- **WebStorm**: Available from JetBrains website
- **Vim/Neovim**: Already installed above

## Environment Configuration

### Project Setup

```bash
# Clone the project (if not already done)
git clone <your-repository-url>
cd csiodadeldhura-nest-js-backend

# Install dependencies (choose your package manager)
# With Yarn:
yarn install

# With pnpm:
pnpm install

# With npm:
npm install
```

### Environment Variables

Create a `.env` file in your project root:

```bash
# ========================================
# APPLICATION CONFIGURATION
# ========================================
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
APP_NAME=ICMS Backend
APP_VERSION=1.0.0

# ========================================
# DATABASE CONFIGURATION
# ========================================
DATABASE_URL="postgresql://icmsdev:dev@123@localhost:5432/icmslocal?schema=public"

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# ========================================
# REDIS CONFIGURATION
# ========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=dev@123
REDIS_DB=0

# ========================================
# STORAGE CONFIGURATION
# ========================================
# Storage provider: 'local' for file system, 's3' for S3-compatible storage (MinIO/AWS S3)
STORAGE_PROVIDER=s3

# ========================================
# LOCAL STORAGE CONFIGURATION
# ========================================
# Used when STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_LOCAL_BASE_URL=http://localhost:3000/uploads

# ========================================
# S3-COMPATIBLE STORAGE CONFIGURATION
# ========================================
# Used when STORAGE_PROVIDER=s3
# For MinIO: http://localhost:9000
# For AWS S3: leave empty
STORAGE_S3_ENDPOINT=http://localhost:9000
STORAGE_S3_REGION=us-east-1
STORAGE_S3_BUCKET=icms-dev
STORAGE_S3_ACCESS_KEY_ID=minioadmin
STORAGE_S3_SECRET_ACCESS_KEY=minioadmin
# Required for MinIO: true, for AWS S3: false
STORAGE_S3_FORCE_PATH_STYLE=true
# URL expiration in seconds for signed URLs
STORAGE_S3_SIGNED_URL_EXPIRES=3600

# ========================================
# LEGACY MINIO CONFIGURATION (Deprecated)
# ========================================
# These are kept for backward compatibility but not used by the new storage system
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=icms-dev
MINIO_REGION=us-east-1

# ========================================
# EMAIL CONFIGURATION
# ========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@icms.gov.np

# ========================================
# SECURITY CONFIGURATION
# ========================================
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
SLOW_DOWN_DELAY=1000

# ========================================
# FILE UPLOAD CONFIGURATION
# ========================================
MAX_FILE_SIZE=10485760 # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document
UPLOAD_PATH=uploads

# ========================================
# LOGGING CONFIGURATION
# ========================================
LOG_LEVEL=info
LOG_FILE_PATH=logs
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# ========================================
# CORS CONFIGURATION
# ========================================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# ========================================
# SESSION CONFIGURATION
# ========================================
SESSION_SECRET=your-session-secret-change-this-in-production
SESSION_COOKIE_MAX_AGE=86400000 # 24 hours

# ========================================
# FEATURE FLAGS
# ========================================
ENABLE_SWAGGER=true
ENABLE_RATE_LIMITING=true
ENABLE_COMPRESSION=true
ENABLE_HELMET=true
ENABLE_CORS=true
```

## Database Synchronization

After setting up your environment variables, you need to synchronize your database schema with the Prisma schema.

### Prisma Setup and Database Sync

```bash
# Install Prisma CLI globally (if not already installed)
npm install -g prisma

# Generate Prisma client
npm run db:generate
# or
yarn db:generate
# or
pnpm db:generate

# Push the schema to the database (creates/updates tables)
npm run db:push
# or
yarn db:push
# or
pnpm db:push
```

### Alternative Database Commands

The project includes several database management commands in `package.json`:

```bash
# Generate Prisma client from schema
npm run db:generate

# Push schema changes to database (for development)
npm run db:push

# Create and apply migrations (for production)
npm run db:migrate

# Deploy migrations to production
npm run db:migrate:deploy

# Reset database (WARNING: This will delete all data)
npm run db:migrate:reset

# Check migration status
npm run db:migrate:status

# Seed the database with initial data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Format Prisma schema
npm run db:format

# Validate Prisma schema
npm run db:validate

# Show differences between schema and database
npm run db:diff

# Drop and recreate database
npm run db:drop
```

### Database Schema Verification

After running the database commands, verify that your tables are created:

```bash
# Connect to PostgreSQL
psql -U icmsdev -d icmslocal -h localhost

# List all tables
\dt

# Check specific tables (example)
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

# Exit PostgreSQL
\q
```

### Troubleshooting Database Issues

If you encounter database connection issues:

```bash
# Check if the DATABASE_URL is correct
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# If using separate environment variables, test with:
psql -U icmsdev -d icmslocal -h localhost -c "SELECT version();"

# Reset database if needed (WARNING: This deletes all data)
npm run db:migrate:reset
```

## Verification

### Test All Services

```bash
# Test PostgreSQL
psql -U icmsdev -d icmslocal -h localhost -c "SELECT version();"

# Test Redis
redis-cli -a dev@123 ping

# Test MinIO
mcli ls local

# Test Node.js
node --version
npm --version
# or
yarn --version
# or
pnpm --version
```

### Test Database Schema

```bash
# Verify database tables are created
psql -U icmsdev -d icmslocal -h localhost -c "\dt"

# Check if Prisma client is generated
ls -la node_modules/.prisma/client/

# Test Prisma connection
npx prisma db pull
```

### Test Storage Configuration

```bash
# Test MinIO bucket access
mcli ls local/icms-dev

# Test file upload to MinIO
echo "test content" > test-upload.txt
mcli cp test-upload.txt local/icms-dev/
mcli ls local/icms-dev/
rm test-upload.txt

# Verify storage configuration in application
npm run start:dev
# Look for storage initialization messages in logs
```

### Run the Application

```bash
# Start the development server
# With Yarn:
yarn start:dev

# With pnpm:
pnpm start:dev

# With npm:
npm run start:dev
```

## Troubleshooting

### Common Issues

#### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo journalctl -u postgresql

# Reset PostgreSQL password if needed
sudo -u postgres psql -c "ALTER USER icmsdev PASSWORD 'dev@123';"
```

#### Redis Connection Issues

```bash
# Check if Redis is running
sudo systemctl status valkey

# Check Redis logs
sudo journalctl -u valkey

# Test Redis connection
redis-cli -a dev@123 ping
```

#### MinIO Issues

```bash
# Check if MinIO is running
sudo systemctl status minio

# Check MinIO logs
sudo journalctl -u minio

# Access MinIO web interface
# Open http://localhost:9000 in your browser
# Access MinIO console at http://localhost:9001
```

#### Node.js/Package Manager Issues

```bash
# Clear npm cache
npm cache clean --force

# Clear Yarn cache
yarn cache clean

# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
# or
yarn install
# or
pnpm install
```

### Service Management

```bash
# Start all services
sudo systemctl start postgresql valkey minio

# Stop all services
sudo systemctl stop postgresql valkey minio

# Restart all services
sudo systemctl restart postgresql valkey minio

# Check status of all services
sudo systemctl status postgresql valkey minio
```

### Network and Firewall

```bash
# Check if ports are open
sudo netstat -tlnp | grep -E ':(5432|6379|9000|9001)'

# If using iptables firewall, allow necessary ports
sudo iptables -A INPUT -p tcp --dport 5432 -j ACCEPT  # PostgreSQL
sudo iptables -A INPUT -p tcp --dport 6379 -j ACCEPT  # Redis
sudo iptables -A INPUT -p tcp --dport 9000 -j ACCEPT  # MinIO
sudo iptables -A INPUT -p tcp --dport 9001 -j ACCEPT  # MinIO Console

# If using ufw (if installed)
sudo ufw allow 5432/tcp  # PostgreSQL
sudo ufw allow 6379/tcp  # Redis
sudo ufw allow 9000/tcp  # MinIO
sudo ufw allow 9001/tcp  # MinIO Console

# Save iptables rules (if using iptables)
sudo iptables-save > /etc/iptables/iptables.rules
```

## Next Steps

1. **Configure your IDE** with appropriate extensions for Node.js, TypeScript, and PostgreSQL
2. **Set up Git hooks** for code quality checks
3. **Configure linting and formatting** tools
4. **Set up testing environment**
5. **Configure debugging** in your IDE

## Additional Resources

- [Arch Linux Wiki - PostgreSQL](https://wiki.archlinux.org/title/PostgreSQL)
- [Arch Linux Wiki - Redis](https://wiki.archlinux.org/title/Redis)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Yarn Documentation](https://yarnpkg.com/getting-started)
- [pnpm Documentation](https://pnpm.io/)

---

**Note**: Remember to change default passwords in production environments. The passwords used in this guide are for development purposes only.
