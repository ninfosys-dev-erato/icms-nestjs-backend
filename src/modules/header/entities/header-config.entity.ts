import { TranslatableEntity } from '../../../common/types/translatable.entity';

export class HeaderConfig {
  id: string;
  name: any; // JsonValue from Prisma
  order: number;
  isActive: boolean;
  isPublished: boolean;
  typography: any; // JsonValue from Prisma
  alignment: any; // HeaderAlignment from Prisma
  logo: any; // JsonValue from Prisma
  layout: any; // JsonValue from Prisma
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (for future implementation)
  createdBy?: any;
  updatedBy?: any;
}

export interface TypographySettings {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
  color: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface LogoConfiguration {
  leftLogo?: {
    mediaId: string;
    media?: {
      presignedUrl?: string;
      url?: string;
      id?: string;
      originalName?: string;
      mimetype?: string;
      size?: number;
      error?: string;
    };
    altText: TranslatableEntity;
    width: number;
    height: number;
  };
  rightLogo?: {
    mediaId: string;
    media?: {
      presignedUrl?: string;
      url?: string;
      id?: string;
      originalName?: string;
      mimetype?: string;
      size?: number;
      error?: string;
    };
    altText: TranslatableEntity;
    width: number;
    height: number;
  };
  logoAlignment: 'left' | 'center' | 'right';
  logoSpacing: number;
}

export interface LayoutConfiguration {
  headerHeight: number;
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  responsive?: {
    mobile?: Partial<LayoutConfiguration>;
    tablet?: Partial<LayoutConfiguration>;
    desktop?: Partial<LayoutConfiguration>;
  };
} 