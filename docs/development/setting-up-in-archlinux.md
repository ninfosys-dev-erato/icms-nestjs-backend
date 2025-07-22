# Setting Up Development Environment in Arch Linux

This guide will help you set up a complete development environment for the ICMS (Integrated Content Management System) project on Arch Linux.

## Table of Contents

1. [System Update](#system-update)
2. [Node.js and Package Managers](#nodejs-and-package-managers)
3. [PostgreSQL Database](#postgresql-database)
4. [Redis Cache](#redis-cache)
5. [MinIO Object Storage](#minio-object-storage)
6. [Development Tools](#development-tools)
7. [Environment Configuration](#environment-configuration)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

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
CREATE USER icmsdev WITH PASSWORD 'dev@123';

-- Create the development database
CREATE DATABASE icmslocal OWNER icmsdev;

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE icmslocal TO icmsdev;

-- Connect to the new database
\c icmslocal

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO icmsdev;

-- Exit PostgreSQL
\q
```

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

### Create Development Bucket

```bash
# Configure MinIO client
mcli alias set local http://localhost:9000 minioadmin minioadmin

# Create a bucket for development
mcli mb local/icms-dev

# List buckets to verify
mcli ls local
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
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=icmslocal
DATABASE_USERNAME=icmsdev
DATABASE_PASSWORD=dev@123

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=dev@123

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=icms-dev
MINIO_USE_SSL=false

# Application Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Verification

### Test All Services

```bash
# Test PostgreSQL
psql -U icmsdev -d icmslocal -h localhost -c "SELECT version();"

# Test Redis
redis-cli -a dev@123 ping

# Test MinIO
mc ls local

# Test Node.js
node --version
npm --version
# or
yarn --version
# or
pnpm --version
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
