import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateLanguageDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() name: any;
  @ApiProperty() @IsString() nativeName: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isDefault?: boolean;
  @ApiPropertyOptional({ enum: ['ltr', 'rtl'] }) @IsOptional() @IsEnum(['ltr', 'rtl']) direction?: 'ltr' | 'rtl';
}

export class UpdateLanguageDto {
  @ApiPropertyOptional() name?: any;
  @ApiPropertyOptional() @IsString() @IsOptional() nativeName?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isDefault?: boolean;
  @ApiPropertyOptional({ enum: ['ltr', 'rtl'] }) @IsOptional() @IsEnum(['ltr', 'rtl']) direction?: 'ltr' | 'rtl';
}

export class LanguageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: any;
  @ApiProperty() nativeName: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() isDefault: boolean;
  @ApiProperty() direction: 'ltr' | 'rtl';
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
} 