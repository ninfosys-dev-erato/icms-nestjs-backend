# Deployment & DevOps

## Overview

This document outlines the deployment strategy, CI/CD pipeline, and DevOps practices for the Government CMS Backend. The system is designed for containerized deployment with automated testing and deployment pipelines.

## Environment Strategy

### 1. Environment Types

#### Development Environment
- **Purpose:** Local development and testing
- **Database:** Local PostgreSQL or Docker container
- **File Storage:** Local file system or MinIO
- **Configuration:** Environment variables and .env files
- **Access:** Developers only

#### Staging Environment
- **Purpose:** Pre-production testing and validation
- **Database:** Staging PostgreSQL instance
- **File Storage:** Staging S3 bucket
- **Configuration:** Environment-specific configuration
- **Access:** Development team and stakeholders

#### Production Environment
- **Purpose:** Live application serving end users
- **Database:** Production PostgreSQL cluster
- **File Storage:** Production S3 bucket with CDN
- **Configuration:** Production-optimized configuration
- **Access:** Public users and authorized administrators

### 2. Environment Configuration

#### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_CDN_URL=https://cdn.example.com

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

#### Configuration Files

##### .env.development
```bash
NODE_ENV=development
DATABASE_URL=postgresql://dev:dev@localhost:5432/cms_dev
AWS_S3_BUCKET=cms-dev-bucket
LOG_LEVEL=debug
```

##### .env.staging
```bash
NODE_ENV=staging
DATABASE_URL=postgresql://staging:staging@staging-db:5432/cms_staging
AWS_S3_BUCKET=cms-staging-bucket
LOG_LEVEL=info
```

##### .env.production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod:prod@prod-db:5432/cms_production
AWS_S3_BUCKET=cms-production-bucket
LOG_LEVEL=warn
```

## Container Strategy

### 1. Docker Configuration

#### Dockerfile
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
```

#### .dockerignore
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
coverage.json
*.md
.vscode
.idea
*.log
dist
build
.DS_Store
```

### 2. Docker Compose

#### docker-compose.yml (Development)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/cms_dev
    depends_on:
      - db
      - redis
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run start:dev

  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_DB=cms_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_DB=cms_production
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## CI/CD Pipeline

### 1. GitHub Actions Workflow

#### .github/workflows/ci.yml
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run tests
      run: npm run test:ci
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379

    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build:
    name: Build and Push
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=semver,pattern={{major}}.{{minor}}
          type=sha

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Add staging deployment commands here

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production environment"
        # Add production deployment commands here
```

### 2. Deployment Scripts

#### scripts/deploy.sh
```bash
#!/bin/bash

set -e

# Configuration
ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
    echo "Usage: $0 <environment> <version>"
    echo "Example: $0 staging v1.0.0"
    exit 1
fi

echo "Deploying version $VERSION to $ENVIRONMENT environment"

# Load environment-specific configuration
source ".env.$ENVIRONMENT"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Deploy application
echo "Deploying application..."
docker-compose -f docker-compose.$ENVIRONMENT.yml up -d

# Health check
echo "Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "Application is healthy"
        break
    fi
    echo "Waiting for application to be ready... ($i/30)"
    sleep 2
done

echo "Deployment completed successfully"
```

#### scripts/rollback.sh
```bash
#!/bin/bash

set -e

ENVIRONMENT=$1
PREVIOUS_VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$PREVIOUS_VERSION" ]; then
    echo "Usage: $0 <environment> <previous-version>"
    exit 1
fi

echo "Rolling back to version $PREVIOUS_VERSION in $ENVIRONMENT environment"

# Rollback database if needed
echo "Rolling back database..."
npx prisma migrate reset --force

# Rollback application
echo "Rolling back application..."
docker-compose -f docker-compose.$ENVIRONMENT.yml down
docker-compose -f docker-compose.$ENVIRONMENT.yml up -d

echo "Rollback completed successfully"
```

## Kubernetes Deployment

### 1. Kubernetes Manifests

#### k8s/namespace.yaml
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: cms-backend
  labels:
    name: cms-backend
```

#### k8s/configmap.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cms-backend-config
  namespace: cms-backend
data:
  NODE_ENV: "production"
  API_VERSION: "v1"
  PORT: "3000"
  LOG_LEVEL: "info"
  RATE_LIMIT_WINDOW: "15m"
  RATE_LIMIT_MAX: "100"
  MAX_FILE_SIZE: "5242880"
  ALLOWED_FILE_TYPES: "image/jpeg,image/png,application/pdf"
```

#### k8s/secret.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: cms-backend-secrets
  namespace: cms-backend
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  AWS_ACCESS_KEY_ID: <base64-encoded-aws-key>
  AWS_SECRET_ACCESS_KEY: <base64-encoded-aws-secret>
  REDIS_PASSWORD: <base64-encoded-redis-password>
```

#### k8s/deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cms-backend
  namespace: cms-backend
  labels:
    app: cms-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cms-backend
  template:
    metadata:
      labels:
        app: cms-backend
    spec:
      containers:
      - name: cms-backend
        image: ghcr.io/your-org/cms-backend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: cms-backend-config
        - secretRef:
            name: cms-backend-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: tmp
        emptyDir: {}
```

#### k8s/service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: cms-backend-service
  namespace: cms-backend
spec:
  selector:
    app: cms-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

#### k8s/ingress.yaml
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cms-backend-ingress
  namespace: cms-backend
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: cms-backend-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: cms-backend-service
            port:
              number: 80
```

#### k8s/hpa.yaml
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cms-backend-hpa
  namespace: cms-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cms-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Helm Chart

#### helm/cms-backend/Chart.yaml
```yaml
apiVersion: v2
name: cms-backend
description: Government CMS Backend
type: application
version: 0.1.0
appVersion: "1.0.0"
```

#### helm/cms-backend/values.yaml
```yaml
replicaCount: 3

image:
  repository: ghcr.io/your-org/cms-backend
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: cms-backend-tls
      hosts:
        - api.example.com

resources:
  requests:
    memory: 512Mi
    cpu: 500m
  limits:
    memory: 1Gi
    cpu: 1000m

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

env:
  NODE_ENV: production
  API_VERSION: v1
  PORT: 3000
  LOG_LEVEL: info

secrets:
  DATABASE_URL: ""
  JWT_SECRET: ""
  AWS_ACCESS_KEY_ID: ""
  AWS_SECRET_ACCESS_KEY: ""
  REDIS_PASSWORD: ""
```

## Monitoring and Observability

### 1. Application Monitoring

#### Health Check Endpoint
```typescript
@Controller('health')
export class HealthController {
  @Get()
  async check() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Get('detailed')
  async detailedCheck() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      s3: await this.checkS3(),
    };

    const isHealthy = Object.values(checks).every(check => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 2. Logging Strategy

#### Winston Configuration
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

### 3. Metrics Collection

#### Prometheus Metrics
```typescript
import { PrometheusController } from '@willsoto/nestjs-prometheus';

@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Get()
  async getMetrics() {
    return super.index();
  }
}
```

## Security Considerations

### 1. Container Security

#### Security Scanning
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'ghcr.io/${{ github.repository }}:latest'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
```

### 2. Network Security

#### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: cms-backend-network-policy
  namespace: cms-backend
spec:
  podSelector:
    matchLabels:
      app: cms-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector:
        matchLabels:
          name: redis
    ports:
    - protocol: TCP
      port: 6379
```

## Backup and Disaster Recovery

### 1. Database Backup

#### Backup Script
```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="cms_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://backup-bucket/database/

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### 2. Disaster Recovery Plan

#### Recovery Procedures
1. **Database Recovery**
   - Restore from latest backup
   - Run database migrations
   - Verify data integrity

2. **Application Recovery**
   - Deploy to backup infrastructure
   - Update DNS records
   - Verify application health

3. **Data Recovery**
   - Restore S3 bucket from backup
   - Verify file integrity
   - Update CDN cache

## Performance Optimization

### 1. Application Optimization

#### Performance Monitoring
```typescript
import { PerformanceInterceptor } from './performance.interceptor';

@UseInterceptors(PerformanceInterceptor)
export class AppController {
  // Controller methods
}
```

### 2. Infrastructure Optimization

#### Resource Optimization
- **CPU and Memory limits** based on usage patterns
- **Horizontal Pod Autoscaling** for traffic spikes
- **CDN integration** for static assets
- **Database connection pooling** optimization

## Troubleshooting

### 1. Common Issues

#### Application Issues
- **Memory leaks:** Monitor memory usage and implement proper cleanup
- **Database connections:** Implement connection pooling and monitoring
- **File uploads:** Monitor S3 upload performance and implement retry logic

#### Infrastructure Issues
- **Kubernetes pod restarts:** Check resource limits and health checks
- **Database performance:** Monitor query performance and implement indexing
- **Network connectivity:** Verify network policies and service discovery

### 2. Debugging Tools

#### Debugging Commands
```bash
# Check pod status
kubectl get pods -n cms-backend

# Check pod logs
kubectl logs -f deployment/cms-backend -n cms-backend

# Check resource usage
kubectl top pods -n cms-backend

# Access pod shell
kubectl exec -it deployment/cms-backend -n cms-backend -- /bin/sh

# Check service endpoints
kubectl get endpoints -n cms-backend
``` 