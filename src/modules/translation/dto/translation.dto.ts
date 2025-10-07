import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';

export class CreateTranslationDto {
  @ApiProperty() @IsString() key: string;
  @ApiProperty() @IsString() enValue: string;
  @ApiProperty() @IsString() neValue: string;
  @ApiProperty() @IsString() groupName: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
}

export class UpdateTranslationDto {
  @ApiPropertyOptional() @IsString() @IsOptional() enValue?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() neValue?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() groupName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
}

export class TranslationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() key: string;
  @ApiProperty() enValue: string;
  @ApiProperty() neValue: string;
  @ApiProperty() groupName: string;
  @ApiPropertyOptional() description?: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isPublished: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: any;
  @ApiProperty() updatedBy: any;
}

export class TranslationQueryDto {
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional({ example: 10 }) @IsOptional() @IsNumber() limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() groupName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() sort?: string;
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsEnum(['asc', 'desc']) order?: 'asc' | 'desc';
}

export class PaginatedTranslationResponse {
  @ApiProperty({ type: [TranslationResponseDto] }) data: TranslationResponseDto[];
  @ApiProperty() pagination: any;
}

export class ValidationError {
  @ApiProperty() field: string;
  @ApiProperty() message: string;
  @ApiProperty() code: string;
}

export class ValidationResult {
  @ApiProperty() isValid: boolean;
  @ApiProperty({ type: [ValidationError] }) errors: ValidationError[];
}

export class ImportResult {
  @ApiProperty() success: number;
  @ApiProperty() failed: number;
  @ApiProperty({ type: [String] }) errors: string[];
}

export class BulkOperationResult {
  @ApiProperty() success: number;
  @ApiProperty() failed: number;
  @ApiProperty({ type: [String] }) errors: string[];
} 