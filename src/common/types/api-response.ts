export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ApiMeta {
  timestamp: string;
  version: string;
  requestId?: string;
  processingTime?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: Partial<ApiMeta>): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        ...meta,
      },
    };
  }

  static error(
    code: string,
    message: string,
    details?: ValidationError[],
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        ...meta,
      },
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationInfo,
    meta?: Partial<ApiMeta>,
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
        ...meta,
      },
    };
  }

  static validationError(
    message: string,
    details: ValidationError[],
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return this.error('VALIDATION_ERROR', message, details, meta);
  }

  static notFoundError(
    message: string = 'Resource not found',
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return this.error('NOT_FOUND_ERROR', message, undefined, meta);
  }

  static unauthorizedError(
    message: string = 'Unauthorized access',
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return this.error('UNAUTHORIZED_ERROR', message, undefined, meta);
  }

  static forbiddenError(
    message: string = 'Forbidden access',
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return this.error('FORBIDDEN_ERROR', message, undefined, meta);
  }

  static internalServerError(
    message: string = 'Internal server error',
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return this.error('INTERNAL_SERVER_ERROR', message, undefined, meta);
  }

  static badRequestError(
    message: string = 'Bad request',
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return this.error('BAD_REQUEST_ERROR', message, undefined, meta);
  }

  static conflictError(
    message: string = 'Resource conflict',
    meta?: Partial<ApiMeta>,
  ): ApiResponse {
    return this.error('CONFLICT_ERROR', message, undefined, meta);
  }
}

export class PaginationHelper {
  static createPagination(
    page: number,
    limit: number,
    total: number,
  ): PaginationInfo {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static validatePagination(page: number, limit: number): {
    page: number;
    limit: number;
  } {
    return {
      page: Math.max(1, page || 1),
      limit: Math.min(100, Math.max(1, limit || 10)),
    };
  }
}

export class ValidationErrorBuilder {
  static create(
    field: string,
    message: string,
    code: string,
    value?: any,
  ): ValidationError {
    return {
      field,
      message,
      code,
      value,
    };
  }

  static required(field: string, value?: any): ValidationError {
    return this.create(field, `${field} is required`, 'REQUIRED_FIELD', value);
  }

  static invalid(field: string, message: string, value?: any): ValidationError {
    return this.create(field, message, 'INVALID_FIELD', value);
  }

  static tooLong(field: string, maxLength: number, value?: any): ValidationError {
    return this.create(
      field,
      `${field} must not exceed ${maxLength} characters`,
      'FIELD_TOO_LONG',
      value,
    );
  }

  static tooShort(field: string, minLength: number, value?: any): ValidationError {
    return this.create(
      field,
      `${field} must be at least ${minLength} characters`,
      'FIELD_TOO_SHORT',
      value,
    );
  }

  static invalidFormat(field: string, format: string, value?: any): ValidationError {
    return this.create(
      field,
      `${field} must be in ${format} format`,
      'INVALID_FORMAT',
      value,
    );
  }

  static notUnique(field: string, value?: any): ValidationError {
    return this.create(
      field,
      `${field} must be unique`,
      'NOT_UNIQUE',
      value,
    );
  }
} 