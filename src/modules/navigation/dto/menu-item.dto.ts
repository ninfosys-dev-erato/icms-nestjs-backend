import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MenuItemType } from '@prisma/client';
import { TranslatableEntity } from '@/common/types/translatable.entity';

export { MenuItemType };

// Custom validation decorator for translatable entities
export class TranslatableEntityDto {
  @IsString()
  en: string;

  @IsString()
  ne: string;
}

export class CreateMenuItemDto {
  @ApiProperty() @IsString() menuId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() parentId?: string;
  @ApiProperty({ 
    description: 'Menu item title in multiple languages',
    example: { en: 'Home', ne: 'गृह' },
    type: TranslatableEntityDto
  }) 
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title: TranslatableEntity;
  
  @ApiPropertyOptional({ 
    description: 'Menu item description in multiple languages',
    example: { en: 'Home page', ne: 'गृह पृष्ठ' },
    type: TranslatableEntityDto
  }) 
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntity;
  
  @ApiPropertyOptional() @IsString() @IsOptional() url?: string;
  @ApiPropertyOptional({ enum: ['self', '_blank', '_parent', '_top'] }) @IsOptional() @IsEnum(['self', '_blank', '_parent', '_top']) target?: 'self' | '_blank' | '_parent' | '_top';
  @ApiPropertyOptional() @IsString() @IsOptional() icon?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() order?: number;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
  @ApiProperty({ enum: MenuItemType }) @IsEnum(MenuItemType) itemType: MenuItemType;
  @ApiPropertyOptional() @IsString() @IsOptional() itemId?: string;
  
  @ApiPropertyOptional({ description: 'Category slug for CATEGORY type or to override parent menu category' })
  @IsString() 
  @IsOptional()
  categorySlug?: string;
  
  @ApiPropertyOptional({ description: 'Content slug for CONTENT type menu items' })
  @IsString() 
  @IsOptional()
  contentSlug?: string;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional() @IsString() @IsOptional() parentId?: string;
  @ApiPropertyOptional({ 
    description: 'Menu item title in multiple languages',
    example: { en: 'Home', ne: 'गृह' },
    type: TranslatableEntityDto
  }) 
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  title?: TranslatableEntity;
  
  @ApiPropertyOptional({ 
    description: 'Menu item description in multiple languages',
    example: { en: 'Home page', ne: 'गृह पृष्ठ' },
    type: TranslatableEntityDto
  }) 
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  description?: TranslatableEntity;
  
  @ApiPropertyOptional() @IsString() @IsOptional() url?: string;
  @ApiPropertyOptional({ enum: ['self', '_blank', '_parent', '_top'] }) @IsOptional() @IsEnum(['self', '_blank', '_parent', '_top']) target?: 'self' | '_blank' | '_parent' | '_top';
  @ApiPropertyOptional() @IsString() @IsOptional() icon?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() order?: number;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
  @ApiPropertyOptional({ enum: MenuItemType }) @IsOptional() @IsEnum(MenuItemType) itemType?: MenuItemType;
  @ApiPropertyOptional() @IsString() @IsOptional() itemId?: string;
  
  @ApiPropertyOptional({ description: 'Category slug for CATEGORY type or to override parent menu category' })
  @IsString() 
  @IsOptional()
  categorySlug?: string;
  
  @ApiPropertyOptional({ description: 'Content slug for CONTENT type menu items' })
  @IsString() 
  @IsOptional()
  contentSlug?: string;
}

export class MenuItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() menuId: string;
  @ApiPropertyOptional() parentId?: string;
  @ApiProperty({ type: TranslatableEntityDto }) title: TranslatableEntity;
  @ApiPropertyOptional({ type: TranslatableEntityDto }) description?: TranslatableEntity;
  @ApiPropertyOptional() url?: string;
  @ApiProperty() target: 'self' | '_blank' | '_parent' | '_top';
  @ApiPropertyOptional() icon?: string;
  @ApiProperty() order: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isPublished: boolean;
  @ApiProperty({ enum: MenuItemType }) itemType: MenuItemType;
  @ApiPropertyOptional() itemId?: string;
  @ApiPropertyOptional() categorySlug?: string;
  @ApiPropertyOptional() contentSlug?: string;
  @ApiProperty({ description: 'Pre-computed URL for the menu item' }) resolvedUrl: string;
  @ApiProperty({ type: [Object] }) children: MenuItemResponseDto[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: any;
  @ApiProperty() updatedBy: any;
}

export class MenuItemQueryDto {
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
  
  @ApiPropertyOptional() 
  @IsString() 
  @IsOptional() 
  menuId?: string;
  
  @ApiPropertyOptional() 
  @IsString() 
  @IsOptional() 
  parentId?: string;
  
  @ApiPropertyOptional({ enum: MenuItemType }) 
  @IsOptional() 
  @IsEnum(MenuItemType) 
  itemType?: MenuItemType;
  
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
  order?: 'asc' | 'desc';
}

export class PaginatedMenuItemResponse {
  @ApiProperty({ type: [MenuItemResponseDto] }) data: MenuItemResponseDto[];
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