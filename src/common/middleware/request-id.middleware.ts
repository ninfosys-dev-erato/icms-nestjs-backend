import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate a unique request ID if not provided
    const requestId = req.headers['x-request-id'] as string || this.generateRequestId();
    
    // Set the request ID on the request object
    (req as any).id = requestId;
    
    // Set the request ID in the response headers
    res.setHeader('x-request-id', requestId);
    
    next();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 