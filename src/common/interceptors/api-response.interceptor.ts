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
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const processingTime = Date.now() - startTime;
        
        const meta: Partial<ApiMeta> = {
          requestId: request.id || request.headers['x-request-id'],
          processingTime,
        };

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