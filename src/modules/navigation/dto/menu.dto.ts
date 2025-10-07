import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MenuLocation } from '@prisma/client';
import { TranslatableEntity } from '@/common/types/translatable.entity';

export { MenuLocation };

// Custom validation decorator for translatable entities
export class TranslatableEntityDto {
  @IsString()
  en: string;

  @IsString()
  ne: string;
}

export class CreateMenuDto {
  @ApiProperty({ 
    description: 'Menu name in multiple languages',
    example: { en: 'Main Menu', ne: 'मुख्य मेनु' },
    type: TranslatableEntityDto
  }) 
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name: TranslatableEntity;
  
  @ApiPropertyOptional({ 
    description: 'Menu description in multiple languages',
    example: { en: 'Main navigation menu', ne: 'मुख्य नेविगेशन मेनु' },
    type: TranslatableEntityDto
  }) 
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntity;
  
  @ApiProperty({ enum: MenuLocation }) 
  @IsEnum(MenuLocation) 
  location: MenuLocation;
  
  @ApiPropertyOptional({ description: 'Display order for the menu (lower numbers appear first)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  order?: number;
  
  @ApiPropertyOptional() 
  @IsBoolean() 
  @IsOptional() 
  isActive?: boolean;
  
  @ApiPropertyOptional() 
  @IsBoolean() 
  @IsOptional() 
  isPublished?: boolean;
  
  @ApiPropertyOptional({ description: 'Category slug for the menu' })
  @IsString() 
  @IsOptional()
  categorySlug?: string;
}

export class UpdateMenuDto {
  @ApiPropertyOptional({ 
    description: 'Menu name in multiple languages',
    example: { en: 'Main Menu', ne: 'मुख्य मेनु' },
    type: TranslatableEntityDto
  }) 
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  name?: TranslatableEntity;
  
  @ApiPropertyOptional({ 
    description: 'Menu description in multiple languages',
    example: { en: 'Main navigation menu', ne: 'मुख्य नेविगेशन मेनु' },
    type: TranslatableEntityDto
  }) 
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntity;
  
  @ApiPropertyOptional({ enum: MenuLocation }) 
  @IsEnum(MenuLocation) 
  @IsOptional() 
  location?: MenuLocation;
  
  @ApiPropertyOptional({ description: 'Display order for the menu (lower numbers appear first)' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  order?: number;
  
  @ApiPropertyOptional() 
  @IsBoolean() 
  @IsOptional() 
  isActive?: boolean;
  
  @ApiPropertyOptional() 
  @IsBoolean() 
  @IsOptional() 
  isPublished?: boolean;
  
  @ApiPropertyOptional({ description: 'Category slug for the menu' })
  @IsString() 
  @IsOptional()
  categorySlug?: string;
}

export class MenuResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ type: TranslatableEntityDto }) name: TranslatableEntity;
  @ApiPropertyOptional({ type: TranslatableEntityDto }) description?: TranslatableEntity;
  @ApiProperty({ enum: MenuLocation }) location: MenuLocation;
  @ApiProperty() order: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isPublished: boolean;
  @ApiPropertyOptional() categorySlug?: string;
  @ApiProperty({ description: 'Pre-computed URL for the menu category' }) resolvedUrl?: string;
  @ApiProperty() menuItemCount: number;
  @ApiProperty({ type: [Object] }) menuItems: any[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: any;
  @ApiProperty() updatedBy: any;
}

export class MenuQueryDto {
  @ApiPropertyOptional({ example: 1 }) 
  @IsOptional() 
  @Transform(({ value }) => parseInt(value))
  @IsNumber() 
  page?: number;
  
  @ApiPropertyOptional({ example: 10 }) 
  @IsOptional() 
  @Transform(({ value }) => parseInt(value))
  @IsNumber() 
  limit?: number;
  
  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  search?: string;
  
  @ApiPropertyOptional({ enum: MenuLocation }) 
  @IsOptional() 
  @IsEnum(MenuLocation) 
  location?: MenuLocation;
  
  @ApiPropertyOptional() 
  @IsOptional() 
  @Transform(({ value }) => parseInt(value))
  @IsNumber() 
  order?: number;
  
  @ApiPropertyOptional() 
  @IsOptional() 
  @Transform(({ value }) => value === 'true')
  @IsBoolean() 
  isActive?: boolean;
  
  @ApiPropertyOptional() 
  @IsOptional() 
  @Transform(({ value }) => value === 'true')
  @IsBoolean() 
  isPublished?: boolean;
  
  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  sort?: string;
  
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) 
  @IsOptional() 
  @IsEnum(['asc', 'desc']) 
  sortOrder?: 'asc' | 'desc';
}

export class PaginatedMenuResponse {
  @ApiProperty({ type: [MenuResponseDto] }) data: MenuResponseDto[];
  @ApiProperty() pagination: any;
}

export class MenuArrayResponse {
  @ApiProperty({ type: [MenuResponseDto] }) data: MenuResponseDto[];
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

export class MenuTreeResponse {
  @ApiProperty() menu: MenuResponseDto;
  @ApiProperty({ type: [Object] }) items: MenuItemTreeResponse[];
}

export class MenuItemTreeResponse {
  @ApiProperty() id: string;
  @ApiProperty() menuId: string;
  @ApiPropertyOptional() parentId?: string;
  @ApiProperty({ type: TranslatableEntityDto }) title: TranslatableEntity;
  @ApiPropertyOptional({ type: TranslatableEntityDto }) description?: TranslatableEntity;
  @ApiPropertyOptional() url?: string;
  @ApiProperty() target: string;
  @ApiPropertyOptional() icon?: string;
  @ApiProperty() order: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isPublished: boolean;
  @ApiProperty() itemType: string;
  @ApiPropertyOptional() itemId?: string;
  @ApiProperty({ type: [Object] }) children: MenuItemTreeResponse[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: any;
  @ApiProperty() updatedBy: any;
} 