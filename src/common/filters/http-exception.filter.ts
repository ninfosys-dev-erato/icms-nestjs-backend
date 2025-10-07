import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseBuilder } from '@/common/types/api-response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      
      message = exceptionResponse.message || exception.message;
      code = this.getErrorCode(status);
      
      // Handle validation errors
      if (Array.isArray(exceptionResponse.message)) {
        details = exceptionResponse.message.map((error: string) => ({
          field: 'unknown',
          message: error,
          code: 'VALIDATION_ERROR',
        }));
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = 'UNKNOWN_ERROR';
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorResponse = ApiResponseBuilder.error(
      code,
      message,
      details,
      {
        requestId: request.headers['x-request-id'] as string,
      },
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED_ERROR';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN_ERROR';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND_ERROR';
      case HttpStatus.CONFLICT:
        return 'CONFLICT_ERROR';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'VALIDATION_ERROR';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_ERROR';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
} 