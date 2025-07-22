import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { MenuLocation } from '@prisma/client';

export { MenuLocation };

export class CreateMenuDto {
  @ApiProperty() name: any;
  @ApiPropertyOptional() description?: any;
  @ApiProperty({ enum: MenuLocation }) @IsEnum(MenuLocation) location: MenuLocation;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
}

export class UpdateMenuDto {
  @ApiPropertyOptional() name?: any;
  @ApiPropertyOptional() description?: any;
  @ApiPropertyOptional({ enum: MenuLocation }) @IsEnum(MenuLocation) @IsOptional() location?: MenuLocation;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isPublished?: boolean;
}

export class MenuResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: any;
  @ApiPropertyOptional() description?: any;
  @ApiProperty({ enum: MenuLocation }) location: MenuLocation;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isPublished: boolean;
  @ApiProperty() menuItemCount: number;
  @ApiProperty({ type: [Object] }) menuItems: any[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: any;
  @ApiProperty() updatedBy: any;
}

export class MenuQueryDto {
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @IsNumber() page?: number;
  @ApiPropertyOptional({ example: 10 }) @IsOptional() @IsNumber() limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: MenuLocation }) @IsOptional() @IsEnum(MenuLocation) location?: MenuLocation;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() sort?: string;
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsEnum(['asc', 'desc']) order?: 'asc' | 'desc';
}

export class PaginatedMenuResponse {
  @ApiProperty({ type: [MenuResponseDto] }) data: MenuResponseDto[];
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

export class MenuTreeResponse {
  @ApiProperty() menu: MenuResponseDto;
  @ApiProperty({ type: [Object] }) items: MenuItemTreeResponse[];
}

export class MenuItemTreeResponse {
  @ApiProperty() id: string;
  @ApiProperty() menuId: string;
  @ApiPropertyOptional() parentId?: string;
  @ApiProperty() title: any;
  @ApiPropertyOptional() description?: any;
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