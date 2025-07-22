export interface Language {
  id: string;
  code: string;
  name: any;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  direction: 'ltr' | 'rtl';
  createdAt: Date;
  updatedAt: Date;
} 