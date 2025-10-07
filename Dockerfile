# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies for build
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy source code and build
COPY . .
RUN npx prisma generate && \
    yarn build && \
    yarn install --frozen-lockfile --production=true

# Production stage
FROM node:22-alpine AS production

# Install only essential packages
RUN apk add --no-cache curl && \
    addgroup -g 1001 nestjs && \
    adduser -S -u 1001 -G nestjs nestjs

WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Verify dist directory contents
RUN ls -la dist/


# Environment configuration
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start the application with the correct path
CMD ["node", "dist/src/main.js"]
