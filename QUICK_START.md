# 🚀 Quick Start Guide

## Immediate Setup

### 1. Install Dependencies
```bash
# Using Yarn (recommended)
yarn install

# Using pnpm
pnpm install

# Using npm
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your database credentials
nano .env
```

### 3. Database Setup
```bash
# Generate Prisma client (this will resolve the import error in seed.ts)
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

### 4. Start Development Server
```bash
# Start the development server
npm run start:dev
```

## 🎯 What's Ready

✅ **Foundation Complete:**
- NestJS application structure
- Prisma database schema with all models
- Standardized API responses
- Error handling and validation
- Configuration management
- Database seeding with sample data

✅ **Database Models:**
- User management with roles
- Content management system
- Media management
- Translation system
- Office settings
- FAQ system
- HR management
- Navigation system

✅ **Development Tools:**
- ESLint and Prettier configuration
- TypeScript setup
- Testing framework (Jest)
- Database migration system
- API documentation (Swagger)

## 🔐 Default Login

After seeding, you can login with:
- **Email**: `admin@icms.gov.np`
- **Password**: `admin@123`

## 📚 API Documentation

Once running, visit: http://localhost:3000/api/docs

## 🗄️ Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Check migration status
npm run db:migrate:status

# Reset database (development only)
npm run db:migrate:reset
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── common/           # Shared utilities
├── config/          # Configuration
├── database/        # Database setup
├── modules/         # Feature modules (to be implemented)
├── app.module.ts    # Main module
└── main.ts         # Entry point
```

## 🔄 Next Steps

1. **Implement Core Modules:**
   - Authentication module
   - User management
   - Content management
   - Media management
   - Translation system

2. **Add Business Logic:**
   - Service implementations
   - Repository patterns
   - Validation rules

3. **Enhance Security:**
   - JWT authentication
   - Role-based access control
   - Rate limiting

4. **Add Features:**
   - File upload handling
   - Search functionality
   - Caching strategies

## 🛠️ Development Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Create migration
npm run db:seed            # Seed database
npm run db:studio          # Open database GUI

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code
npm run typecheck          # TypeScript check

# Testing
npm run test               # Run tests
npm run test:watch         # Watch mode
npm run test:e2e           # E2E tests
```

## 🐛 Troubleshooting

### Prisma Client Import Error
This is normal before generating the client:
```bash
npm run db:generate
```

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check your `.env` file configuration
3. Verify database credentials

### Port Already in Use
Change the port in `.env`:
```env
PORT=3001
```

## 📞 Support

- Check the [main README](README.md) for detailed documentation
- Review [Arch Linux setup guide](docs/development/setting-up-in-archlinux.md)
- See [database migration guide](docs/database/migration-guide.md)

---

**Happy Coding! 🎉** 