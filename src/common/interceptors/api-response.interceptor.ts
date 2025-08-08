import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, ApiResponseBuilder, ApiMeta } from '@/common/types/api-response';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const processingTime = Date.now() - startTime;
        
        const meta: Partial<ApiMeta> = {
          requestId: request.id || request.headers['x-request-id'],
          processingTime,
        };

        // If response already sent (e.g., manual file download via @Res), do nothing
        if (response && response.headersSent) {
          return data as any;
        }

        // Bypass wrapping for raw/binary/stream responses
        const isBuffer = Buffer.isBuffer(data);
        const isStream = data && typeof (data as any).pipe === 'function';
        const isStreamableFile = data && data.constructor && data.constructor.name === 'StreamableFile';
        if (isBuffer || isStream || isStreamableFile) {
          return data as any;
        }

        // If data is already an ApiResponse (has boolean success property), return it
        if (data && typeof data === 'object' && 'success' in data && typeof data.success === 'boolean') {
          return {
            ...data,
            meta: {
              ...data.meta,
              ...meta,
            },
          };
        }

        // If data has pagination info, create paginated response
        if (data && typeof data === 'object' && 'data' in data && 'pagination' in data) {
          return ApiResponseBuilder.paginated(data.data, data.pagination, meta);
        }

        // Create success response
        return ApiResponseBuilder.success(data, meta);
      }),
    );
  }
} 