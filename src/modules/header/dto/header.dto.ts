import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsNotEmpty, IsEnum, IsObject, IsUrl, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ========================================
// COMMON TYPES
// ========================================

export class PaddingDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  top: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  right: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  bottom: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  left: number;
}

export class MarginDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  top: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  right: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  bottom: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  left: number;
}

export class LogoConfigurationResponseDto {
  @ApiPropertyOptional()
  leftLogo?: {
    mediaId: string;
    media?: {
      presignedUrl: string;
      url?: string;
      id?: string;
      originalName?: string;
      mimetype?: string;
      size?: number;
      error?: string;
    };
    altText: TranslatableEntityDto;
    width: number;
    height: number;
  };

  @ApiPropertyOptional()
  rightLogo?: {
    mediaId: string;
    media?: {
      presignedUrl: string;
      url?: string;
      id?: string;
      originalName?: string;
      mimetype?: string;
      size?: number;
      error?: string;
    };
    altText: TranslatableEntityDto;
    width: number;
    height: number;
  };

  @ApiProperty({ example: 'left' })
  logoAlignment: 'left' | 'center' | 'right';

  @ApiProperty({ example: 20 })
  logoSpacing: number;
}

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

export class OptionalTranslatableEntityDto {
  @ApiPropertyOptional({ example: 'English text' })
  @IsOptional()
  @IsString()
  en?: string;

  @ApiPropertyOptional({ example: 'नेपाली पाठ' })
  @IsOptional()
  @IsString()
  ne?: string;
}

export enum HeaderAlignment {
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
  JUSTIFY = 'JUSTIFY'
}

export class TypographySettingsDto {
  @ApiProperty({ example: 'Arial, sans-serif' })
  @IsString()
  @IsNotEmpty()
  fontFamily: string;

  @ApiProperty({ example: 16 })
  @IsNumber()
  fontSize: number;

  @ApiProperty({ example: 'normal' })
  @IsString()
  fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | number;

  @ApiProperty({ example: '#333333' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  lineHeight: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  letterSpacing: number;
}

export class LogoItemDto {
  @ApiProperty({ example: 'media_id' })
  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  altText: TranslatableEntityDto;

  @ApiProperty({ example: 150 })
  @IsNumber()
  width: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  height: number;
}

export class LogoItemOptionalDto {
  @ApiPropertyOptional({ example: 'media_id' })
  @IsOptional()
  @IsString()
  mediaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => OptionalTranslatableEntityDto)
  altText?: OptionalTranslatableEntityDto;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  height?: number;
}

// For cases where logo items might be completely null
export class LogoItemNullableDto {
  @ApiPropertyOptional({ example: 'media_id' })
  @IsOptional()
  @IsString()
  mediaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => OptionalTranslatableEntityDto)
  altText?: OptionalTranslatableEntityDto;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  height?: number;
}

// Custom validator for logo configuration that allows null/undefined values
export class LogoConfigurationFlexibleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoItemNullableDto)
  leftLogo?: LogoItemNullableDto | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoItemNullableDto)
  rightLogo?: LogoItemNullableDto | null;

  @ApiPropertyOptional({ example: 'left' })
  @IsOptional()
  @IsString()
  logoAlignment?: 'left' | 'center' | 'right';

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  logoSpacing?: number;
}

// Most permissive logo configuration - allows any structure
export class LogoConfigurationPermissiveDto {
  @ApiPropertyOptional()
  @IsOptional()
  leftLogo?: any;

  @ApiPropertyOptional()
  @IsOptional()
  rightLogo?: any;

  @ApiPropertyOptional({ example: 'left' })
  @IsOptional()
  @IsString()
  logoAlignment?: 'left' | 'center' | 'right';

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  logoSpacing?: number;
}



export class LogoConfigurationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoItemOptionalDto)
  leftLogo?: LogoItemOptionalDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoItemOptionalDto)
  rightLogo?: LogoItemOptionalDto;

  @ApiPropertyOptional({ example: 'left' })
  @IsOptional()
  @IsString()
  logoAlignment?: 'left' | 'center' | 'right';

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  logoSpacing?: number;
}

// For cases where logos might be null or undefined
export class LogoConfigurationOptionalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoItemNullableDto)
  leftLogo?: LogoItemNullableDto | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LogoItemNullableDto)
  rightLogo?: LogoItemNullableDto | null;

  @ApiPropertyOptional({ example: 'left' })
  @IsOptional()
  @IsString()
  logoAlignment?: 'left' | 'center' | 'right';

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  logoSpacing?: number;
}

export class LayoutConfigurationDto {
  @ApiProperty({ example: 80 })
  @IsNumber()
  headerHeight: number;

  @ApiProperty({ example: '#ffffff' })
  @IsString()
  @IsNotEmpty()
  backgroundColor: string;

  @ApiPropertyOptional({ example: '#e0e0e0' })
  @IsOptional()
  @IsString()
  borderColor?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  borderWidth?: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => PaddingDto)
  padding: PaddingDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => MarginDto)
  margin: MarginDto;

  @ApiPropertyOptional()
  @IsOptional()
  responsive?: {
    mobile?: Partial<LayoutConfigurationDto>;
    tablet?: Partial<LayoutConfigurationDto>;
    desktop?: Partial<LayoutConfigurationDto>;
  };
}

// ========================================
// HEADER CONFIG DTOs
// ========================================

export class CreateHeaderConfigDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TypographySettingsDto)
  typography?: TypographySettingsDto;

  @ApiPropertyOptional({ enum: HeaderAlignment })
  @IsOptional()
  @IsEnum(HeaderAlignment)
  alignment?: HeaderAlignment;

  @ApiPropertyOptional()
  @IsOptional()
  logo?: LogoConfigurationPermissiveDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutConfigurationDto)
  layout?: LayoutConfigurationDto;
}

export class UpdateHeaderConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name?: TranslatableEntityDto;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => TypographySettingsDto)
  typography?: TypographySettingsDto;

  @ApiPropertyOptional({ enum: HeaderAlignment })
  @IsOptional()
  @IsEnum(HeaderAlignment)
  alignment?: HeaderAlignment;

  @ApiPropertyOptional()
  @IsOptional()
  logo?: LogoConfigurationPermissiveDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutConfigurationDto)
  layout?: LayoutConfigurationDto;
}

export class HeaderConfigResponseDto {
  @ApiProperty({ example: 'header_config_id' })
  id: string;

  @ApiProperty()
  name: TranslatableEntityDto;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  isPublished: boolean;

  @ApiProperty()
  typography: TypographySettingsDto;

  @ApiProperty({ enum: HeaderAlignment })
  alignment: HeaderAlignment;

  @ApiProperty()
  logo: LogoConfigurationResponseDto;

  @ApiProperty()
  layout: LayoutConfigurationDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  createdBy?: any;

  @ApiPropertyOptional()
  updatedBy?: any;
}

export class HeaderConfigQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'Main Header' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

export class HeaderConfigSearchDto {
  @ApiProperty({ example: 'Main Header' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}

// ========================================
// STATISTICS DTOs
// ========================================

export class HeaderConfigStatistics {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 8 })
  active: number;

  @ApiProperty({ example: 5 })
  published: number;

  @ApiProperty({ example: { 'LEFT': 3, 'CENTER': 4, 'RIGHT': 2, 'JUSTIFY': 1 } })
  byAlignment: Record<HeaderAlignment, number>;

  @ApiProperty({ example: 2.5 })
  averageOrder: number;
}

// ========================================
// COMMON DTOs
// ========================================

export class ValidationError {
  @ApiProperty({ example: 'name' })
  field: string;

  @ApiProperty({ example: 'Header name is required' })
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

export class HeaderPreview {
  @ApiProperty({ example: '.header { background: #fff; }' })
  css: string;

  @ApiProperty({ example: '<header class="header">...</header>' })
  html: string;

  @ApiProperty()
  config: HeaderConfigResponseDto;
}

export class LogoUploadDto {
  @ApiPropertyOptional({ example: 'Header Logo' })
  @IsOptional()
  @IsString()
  'altText[en]'?: string;

  @ApiProperty({ example: 'हेडर लोगो' })
  @IsOptional()
  @IsString()
  'altText[ne]'?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ example: 50 })
  @IsOptional()
  @IsNumber()
  height?: number;
}

export class LogoUploadResponseDto extends HeaderConfigResponseDto {
  @ApiProperty({ example: 'https://f003.backblazeb2.com/file/iCMS-bucket/logos/...' })
  logoUrl?: string;
} 