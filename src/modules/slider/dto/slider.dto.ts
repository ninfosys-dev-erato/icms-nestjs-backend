import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsUrl, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COMMON TYPES
// ========================================

export class TranslatableEntityDto {
  @ApiProperty({ example: 'English text' })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty({ example: 'नेपाली पाठ' })
  @IsString()
  @IsNotEmpty()
  ne: string;
}

// ========================================
// SLIDER DTOs
// ========================================

export class CreateSliderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title?: TranslatableEntityDto;

  @ApiProperty({ example: 1 })
  @IsNumber()
  position: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  displayTime: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 'media_id' })
  @IsString()
  @IsNotEmpty()
  mediaId: string;
}

export class UpdateSliderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  displayTime?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'media_id' })
  @IsOptional()
  @IsString()
  mediaId?: string;
}

export class SliderResponseDto {
  @ApiProperty({ example: 'slider_id' })
  id: string;

  @ApiPropertyOptional()
  title?: TranslatableEntityDto;

  @ApiProperty({ example: 1 })
  position: number;

  @ApiProperty({ example: 5000 })
  displayTime: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: 'object', additionalProperties: true })
  media: any;

  @ApiProperty({ example: 150 })
  clickCount: number;

  @ApiProperty({ example: 2500 })
  viewCount: number;

  @ApiProperty({ example: 6.0 })
  clickThroughRate: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class SliderQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ example: 'welcome' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const v = value.toLowerCase().trim();
      if (['true', '1', 'yes', 'on'].includes(v)) return true;
      if (['false', '0', 'no', 'off'].includes(v)) return false;
    }
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;
}

// ========================================
// SLIDER CLICK DTOs
// ========================================

export class CreateSliderClickDto {
  @ApiProperty({ example: 'slider_id' })
  @IsString()
  @IsNotEmpty()
  sliderId: string;

  @ApiPropertyOptional({ example: 'user_id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  @IsString()
  @IsNotEmpty()
  userAgent: string;
}

export class ClickQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;
}

// ========================================
// SLIDER VIEW DTOs
// ========================================

export class CreateSliderViewDto {
  @ApiProperty({ example: 'slider_id' })
  @IsString()
  @IsNotEmpty()
  sliderId: string;

  @ApiPropertyOptional({ example: 'user_id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiProperty({ example: 'Mozilla/5.0...' })
  @IsString()
  @IsNotEmpty()
  userAgent: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  viewDuration?: number;
}

export class ViewQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: Date;
}

// ========================================
// STATISTICS DTOs
// ========================================

export class SliderStatistics {
  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 30 })
  active: number;

  @ApiProperty({ example: 25 })
  published: number;

  @ApiProperty({ example: 1500 })
  totalClicks: number;

  @ApiProperty({ example: 25000 })
  totalViews: number;

  @ApiProperty({ example: 6.0 })
  averageClickThroughRate: number;

  @ApiProperty({ example: { 1: 10, 2: 8, 3: 5 } })
  byPosition: Record<number, number>;
}

export class SliderAnalytics {
  @ApiProperty({ example: 'slider_id' })
  sliderId: string;

  @ApiProperty({ example: 150 })
  totalClicks: number;

  @ApiProperty({ example: 2500 })
  totalViews: number;

  @ApiProperty({ example: 6.0 })
  clickThroughRate: number;

  @ApiProperty({ example: 5000 })
  averageViewDuration: number;

  @ApiProperty({ example: { '2024-01-01': 10, '2024-01-02': 15 } })
  clicksByDate: Record<string, number>;

  @ApiProperty({ example: { '2024-01-01': 200, '2024-01-02': 250 } })
  viewsByDate: Record<string, number>;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  topReferrers: Array<{ referrer: string; count: number }>;

  @ApiProperty({ example: { desktop: 60, mobile: 30, tablet: 10 } })
  deviceBreakdown: Record<string, number>;
}

// ========================================
// COMMON DTOs
// ========================================

export class ValidationError {
  @ApiProperty({ example: 'title' })
  field: string;

  @ApiProperty({ example: 'Title is required' })
  message: string;

  @ApiProperty({ example: 'REQUIRED_FIELD' })
  code: string;
}

export class ValidationResult {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ type: [ValidationError] })
  errors: ValidationError[];
}

export class BulkOperationResult {
  @ApiProperty({ example: 5 })
  success: number;

  @ApiProperty({ example: 1 })
  failed: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class ImportResult {
  @ApiProperty({ example: 10 })
  success: number;

  @ApiProperty({ example: 2 })
  failed: number;

  @ApiProperty({ type: [String] })
  errors: string[];
}

export class PaginationInfo {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

// ========================================
// SLIDER IMAGE UPLOAD DTOs
// ========================================

export class CreateSliderWithImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title?: TranslatableEntityDto;

  @ApiProperty({ example: 1 })
  @IsNumber()
  position: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  displayTime: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SliderImageUploadResponseDto extends SliderResponseDto {
  @ApiProperty({ example: 'https://f003.backblazeb2.com/file/iCMS-bucket/sliders/...' })
  imageUrl: string;
} 