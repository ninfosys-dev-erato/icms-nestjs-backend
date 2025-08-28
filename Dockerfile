# ========================================
# PRODUCTION DOCKERFILE FOR NEST.JS APPLICATION
# ========================================
# Multi-stage build for optimized production image
# Features: Layer caching, security hardening, minimal footprint

# ========================================
# STAGE 1: DEPENDENCIES
# ========================================
# Use specific Node.js version for consistency
FROM node:20-alpine AS dependencies

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory with proper permissions
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

# Copy package files for dependency installation
COPY --chown=node:node package*.json ./

# Switch to non-root user
USER node

# Install dependencies with npm ci for production builds
# Use cache mount for faster builds
RUN --mount=type=cache,target=/home/node/.npm \
    npm ci --only=production && npm cache clean --force

# ========================================
# STAGE 2: BUILD
# ========================================
FROM node:20-alpine AS build

# Install build dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Create app directory
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

# Copy package files
COPY --chown=node:node package*.json ./

# Switch to non-root user
USER node

# Install all dependencies (including dev dependencies for build)
RUN --mount=type=cache,target=/home/node/.npm \
    npm ci

# Copy source code
COPY --chown=node:node . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# ========================================
# STAGE 3: PRODUCTION RUNTIME
# ========================================
FROM node:20-alpine AS production

# Install security updates and runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/* \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV API_PREFIX=api/v1

# Create app directory with proper permissions
WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist

# Copy necessary files for runtime
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

# Copy environment template (not the actual .env file)
COPY --from=build --chown=nestjs:nodejs /app/env.example ./env.example

# Create directories for logs and uploads
RUN mkdir -p logs uploads && chown -R nestjs:nodejs logs uploads

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

# ========================================
# LABELS FOR METADATA
# ========================================
LABEL maintainer="ICMS Development Team" \
      description="ICMS Backend - Integrated Content Management System" \
      version="1.0.0" \
      org.opencontainers.image.title="ICMS Backend" \
      org.opencontainers.image.description="Production-ready NestJS backend for government CMS" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.created="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
      org.opencontainers.image.source="https://github.com/your-org/icms-backend"