import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TranslatableEntityDto } from './create-office-settings.dto';

export class UpdateOfficeSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  directorate?: TranslatableEntityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  officeName?: TranslatableEntityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  officeAddress?: TranslatableEntityDto;

  @IsOptional()
  @IsString()
  backgroundPhoto?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TranslatableEntityDto)
  phoneNumber?: TranslatableEntityDto;

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