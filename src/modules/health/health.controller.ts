import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '@/database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            },
            memory_heap: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            },
            memory_rss: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            },
            storage: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' }
              }
            }
          }
        },
        error: { type: 'object' },
        details: { type: 'object' }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Application is unhealthy'
  })
  async check() {
    return this.health.check([
      // Database health check
      () => this.prisma.pingCheck('database', this.prismaService),
      
      // Memory health checks
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
      
      // Disk storage health check
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 // Alert if disk usage > 90%
      }),
    ]);
  }
}