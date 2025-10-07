# ICMS Backend - Integrated Content Management System

A robust, scalable NestJS backend for government content management with bilingual support (English/Nepali), SEO optimization, and comprehensive content management capabilities.

## 🚀 Features

- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control
- **🌐 Bilingual Support**: Full English/Nepali content management
- **📝 Content Management**: Hierarchical categories, rich content, file attachments
- **📁 Media Management**: S3/MinIO integration with image processing
- **👥 User Management**: Multi-role user system with audit logging
- **🔍 Search & SEO**: Advanced search with SEO optimization
- **📊 Analytics**: Comprehensive audit and activity tracking
- **🔄 API Documentation**: Auto-generated Swagger documentation
- **🛡️ Security**: Rate limiting, input validation, CORS protection
- **📱 Real-time**: WebSocket support for real-time features

## 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session and data caching
- **Storage**: MinIO/S3 for file storage
- **Authentication**: JWT with refresh tokens
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with E2E testing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- MinIO (or AWS S3)
- Yarn, pnpm, or npm

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd csiodadeldhura-nest-js-backend
```

### 2. Install Dependencies

```bash
# Using Yarn (recommended)
yarn install

# Using pnpm
pnpm install

# Using npm
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 5. Start Development Server

```bash
# Start in development mode
npm run start:dev

# Start with debugging
npm run start:debug
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```env
# Database
DATABASE_URL="postgresql://icmsdev:dev@123@localhost:5432/icmslocal?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=dev@123

# MinIO/S3
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=icms-dev
```

### Database Configuration

Follow the [Arch Linux setup guide](docs/development/setting-up-in-archlinux.md) for complete database setup instructions.

## 📚 API Documentation

Once the server is running, access the API documentation at:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## 🗄️ Database Management

### Migration Commands

```bash
# Generate new migration
npm run db:migrate

# Apply migrations
npm run db:migrate:deploy

# Reset database (development only)
npm run db:migrate:reset

# Check migration status
npm run db:migrate:status

# Open Prisma Studio
npm run db:studio
```

### Seeding

```bash
# Seed initial data
npm run db:seed

# Seed with custom data
npx ts-node prisma/seed.ts
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:cov
```

## 📦 Available Scripts

```bash
# Development
npm run start:dev          # Start development server
npm run start:debug        # Start with debugging
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Create new migration
npm run db:migrate:deploy  # Apply migrations
npm run db:seed            # Seed database
npm run db:studio          # Open Prisma Studio

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
npm run typecheck          # TypeScript type checking

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run E2E tests
npm run test:cov           # Generate coverage
```

## 🏛️ Project Structure

```
src/
├── common/                 # Shared utilities and types
│   ├── filters/           # Exception filters
│   ├── interceptors/      # Response interceptors
│   └── types/             # Common type definitions
├── config/                # Configuration files
├── database/              # Database setup and services
├── modules/               # Feature modules
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── content/           # Content management
│   ├── media/             # Media management
│   ├── translation/       # Translation system
│   └── ...                # Other modules
├── app.module.ts          # Main application module
└── main.ts               # Application entry point
```

## 🔐 Authentication

The system uses JWT-based authentication with the following features:

- **Access Tokens**: Short-lived tokens for API access
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Role-Based Access**: ADMIN, EDITOR, VIEWER roles
- **Session Management**: Multiple active sessions per user
- **Audit Logging**: Complete authentication event tracking

### Default Admin User

After seeding, you can login with:

- **Email**: admin@icms.gov.np
- **Password**: admin@123

## 🌐 Bilingual Support

The system supports full bilingual content management:

- **Translatable Entities**: All content supports English/Nepali
- **Fallback Mechanism**: Automatic language fallback
- **Translation Management**: Centralized translation system
- **SEO Optimization**: Language-specific URLs and meta tags

## 📝 Content Management

### Features

- **Hierarchical Categories**: Unlimited nested categories
- **Rich Content**: Support for formatted text and media
- **File Attachments**: Multiple file types per content
- **Publishing Workflow**: Draft → Published → Archived
- **SEO Optimization**: Automatic slug generation and meta tags
- **Search**: Full-text search across all content

### Content Types

1. **Legal Documents**: Acts, policies, directives
2. **News & Information**: News articles, press releases
3. **Publications**: Progress reports, official publications
4. **Downloads**: Downloadable documents and resources

## 🗄️ Database Schema

The system uses a comprehensive database schema with:

- **User Management**: Users, sessions, audit logs
- **Content System**: Categories, content, attachments
- **Media Management**: Media files, albums, sliders
- **Settings**: Office settings, translations, configurations
- **HR System**: Departments, employees, organizational structure

See [Database Documentation](docs/database/README.md) for detailed schema information.

## 🔧 Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive tests
- Document all public APIs

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Testing Strategy

- **Unit Tests**: Test individual components
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test complete workflows
- **Performance Tests**: Load testing for critical paths

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   DATABASE_URL="postgresql://..."
   REDIS_URL="redis://..."
   ```

2. **Database Migration**
   ```bash
   npm run db:migrate:deploy
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm run start:prod
   ```

### Docker Deployment

```bash
# Build Docker image
docker build -t icms-backend .

# Run container
docker run -p 3000:3000 icms-backend
```

## 📊 Monitoring

### Health Checks

- **Application Health**: `/api/v1/health`
- **Database Health**: `/api/v1/health/database`
- **Redis Health**: `/api/v1/health/redis`

### Logging

The application uses structured logging with:

- **Request Logging**: All API requests and responses
- **Error Logging**: Detailed error tracking
- **Audit Logging**: User actions and system events
- **Performance Logging**: Response times and resource usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Setup

```bash
# Install dependencies
npm install

# Setup pre-commit hooks
npm run prepare

# Start development server
npm run start:dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🔗 Related Projects

- **Frontend**: [ICMS Frontend](https://github.com/your-repo/icms-frontend)
- **Admin Panel**: [ICMS Admin](https://github.com/your-repo/icms-admin)
- **Mobile App**: [ICMS Mobile](https://github.com/your-repo/icms-mobile)

---

**Built with ❤️ for the Government of Nepal**