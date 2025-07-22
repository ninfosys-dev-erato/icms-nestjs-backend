import { IsEmail, IsOptional, IsString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class TranslatableEntityDto {
  @IsString()
  @IsNotEmpty()
  en: string;

  @IsString()
  @IsNotEmpty()
  ne: string;
}

export class CreateOfficeSettingsDto {
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  directorate: TranslatableEntityDto;

  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  officeName: TranslatableEntityDto;

  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  officeAddress: TranslatableEntityDto;

  @IsOptional()
  @IsString()
  backgroundPhoto?: string;

  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  phoneNumber: TranslatableEntityDto;

  @IsOptional()
  @IsString()
  xLink?: string;

  @IsOptional()
  @IsString()
  mapIframe?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  youtube?: string;
} 