import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { MenuItemType } from '@prisma/client';

export { MenuItemType };

export class CreateMenuItemDto {
  @ApiProperty() @IsString() menuId: string;
  @ApiPropertyOptional() @IsString() @IsOptional() parentId?: string;
  @ApiProperty() title: any;
  @ApiPropertyOptional() description?: any;
  @ApiPropertyOptional() @IsString() @IsOptional() url?: string;
  @ApiPropertyOptional({ enum: ['self', '_blank', '_parent', '_top'] }) @IsOptional() @IsEnum(['self', '_blank', '_parent', '_top']) target?: 'self' | '_blank' | '_parent' | '_top';
  @ApiPropertyOptional() @IsString() @IsOptional() icon?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() order?: number;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
  @ApiProperty({ enum: MenuItemType }) @IsEnum(MenuItemType) itemType: MenuItemType;
  @ApiPropertyOptional() @IsString() @IsOptional() itemId?: string;
}

export class UpdateMenuItemDto {
  @ApiPropertyOptional() @IsString() @IsOptional() parentId?: string;
  @ApiPropertyOptional() title?: any;
  @ApiPropertyOptional() description?: any;
  @ApiPropertyOptional() @IsString() @IsOptional() url?: string;
  @ApiPropertyOptional({ enum: ['self', '_blank', '_parent', '_top'] }) @IsOptional() @IsEnum(['self', '_blank', '_parent', '_top']) target?: 'self' | '_blank' | '_parent' | '_top';
  @ApiPropertyOptional() @IsString() @IsOptional() icon?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() order?: number;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
  @ApiPropertyOptional({ enum: MenuItemType }) @IsOptional() @IsEnum(MenuItemType) itemType?: MenuItemType;
  @ApiPropertyOptional() @IsString() @IsOptional() itemId?: string;
}

export class MenuItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() menuId: string;
  @ApiPropertyOptional() parentId?: string;
  @ApiProperty() title: any;
  @ApiPropertyOptional() description?: any;
  @ApiPropertyOptional() url?: string;
  @ApiProperty() target: 'self' | '_blank' | '_parent' | '_top';
  @ApiPropertyOptional() icon?: string;
  @ApiProperty() order: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isPublished: boolean;
  @ApiProperty({ enum: MenuItemType }) itemType: MenuItemType;
  @ApiPropertyOptional() itemId?: string;
  @ApiProperty({ type: [Object] }) children: MenuItemResponseDto[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: any;
  @ApiProperty() updatedBy: any;
}

export class MenuItemQueryDto {
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional({ example: 10 }) @IsOptional() @IsNumber() limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() menuId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() parentId?: string;
  @ApiPropertyOptional({ enum: MenuItemType }) @IsOptional() @IsEnum(MenuItemType) itemType?: MenuItemType;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() sort?: string;
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsEnum(['asc', 'desc']) order?: 'asc' | 'desc';
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