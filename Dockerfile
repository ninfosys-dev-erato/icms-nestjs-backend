# ========================================
# PRODUCTION DOCKERFILE FOR NEST.JS APPLICATION
# ========================================
# Single-stage build for simplicity and reliability

FROM node:20-alpine

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/* \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV API_PREFIX=api/v1

# Create app directory with proper permissions
WORKDIR /app

# Copy package files
COPY --chown=nestjs:nodejs package.json yarn.lock ./

# Switch to non-root user
USER nestjs

# Install all dependencies
RUN --mount=type=cache,target=/home/nestjs/.cache/yarn \
    yarn install --frozen-lockfile --no-audit --prefer-offline

# Copy source code and configuration files
COPY --chown=nestjs:nodejs tsconfig*.json ./
COPY --chown=nestjs:nodejs src ./src
COPY --chown=nestjs:nodejs prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# Create directories for logs and uploads
RUN mkdir -p logs uploads && chown -R nestjs:nodejs logs uploads

# Copy environment template (not the actual .env file)
COPY --chown=nestjs:nodejs env.example ./env.example

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