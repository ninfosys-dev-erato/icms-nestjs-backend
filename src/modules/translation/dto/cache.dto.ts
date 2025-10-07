import { ApiProperty } from '@nestjs/swagger';

export class CreateCacheDto {
  @ApiProperty() language: string;
  @ApiProperty() groupName: string;
  @ApiProperty() cacheKey: string;
  @ApiProperty() cacheValue: string;
  @ApiProperty() expiresAt: Date;
}

export class UpdateCacheDto {
  @ApiProperty() cacheValue: string;
  @ApiProperty() expiresAt: Date;
}

export class CacheResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() language: string;
  @ApiProperty() groupName: string;
  @ApiProperty() cacheKey: string;
  @ApiProperty() cacheValue: string;
  @ApiProperty() expiresAt: Date;
  @ApiProperty() createdAt: Date;
} 