export interface TranslatableEntity {
  en: string;
  ne: string;
}

export interface TranslatableEntityOptional {
  en?: string;
  ne?: string;
}

export type Language = 'en' | 'ne';

export interface TranslatableEntityWithFallback extends TranslatableEntity {
  fallback?: string;
}

export interface TranslatableEntityValidation {
  en: { required: boolean; minLength?: number; maxLength?: number };
  ne: { required: boolean; minLength?: number; maxLength?: number };
}

export class TranslatableEntityHelper {
  static create(en: string, ne: string): TranslatableEntity {
    return { en, ne };
  }

  static createOptional(en?: string, ne?: string): TranslatableEntityOptional {
    return { en, ne };
  }

  static getValue(entity: TranslatableEntity, language: Language, fallback?: string): string {
    const value = entity[language];
    if (value && value.trim()) {
      return value;
    }
    
    // Fallback to other language if current is empty
    const otherLanguage = language === 'en' ? 'ne' : 'en';
    const otherValue = entity[otherLanguage];
    if (otherValue && otherValue.trim()) {
      return otherValue;
    }
    
    // Return provided fallback or empty string
    return fallback || '';
  }

  static isEmpty(entity: TranslatableEntity): boolean {
    return (!entity.en || !entity.en.trim()) && (!entity.ne || !entity.ne.trim());
  }

  static isComplete(entity: TranslatableEntity): boolean {
    return !!(entity.en && entity.en.trim() && entity.ne && entity.ne.trim());
  }

  static validate(entity: TranslatableEntity, validation: TranslatableEntityValidation): string[] {
    const errors: string[] = [];

    // Validate English
    if (validation.en.required && (!entity.en || !entity.en.trim())) {
      errors.push('English content is required');
    } else if (entity.en) {
      if (validation.en.minLength && entity.en.length < validation.en.minLength) {
        errors.push(`English content must be at least ${validation.en.minLength} characters`);
      }
      if (validation.en.maxLength && entity.en.length > validation.en.maxLength) {
        errors.push(`English content must not exceed ${validation.en.maxLength} characters`);
      }
    }

    // Validate Nepali
    if (validation.ne.required && (!entity.ne || !entity.ne.trim())) {
      errors.push('Nepali content is required');
    } else if (entity.ne) {
      if (validation.ne.minLength && entity.ne.length < validation.ne.minLength) {
        errors.push(`Nepali content must be at least ${validation.ne.minLength} characters`);
      }
      if (validation.ne.maxLength && entity.ne.length > validation.ne.maxLength) {
        errors.push(`Nepali content must not exceed ${validation.ne.maxLength} characters`);
      }
    }

    return errors;
  }

  static sanitize(entity: TranslatableEntity): TranslatableEntity {
    return {
      en: entity.en ? entity.en.trim() : '',
      ne: entity.ne ? entity.ne.trim() : '',
    };
  }

  static merge(base: TranslatableEntity, update: TranslatableEntityOptional): TranslatableEntity {
    return {
      en: update.en !== undefined ? update.en : base.en,
      ne: update.ne !== undefined ? update.ne : base.ne,
    };
  }
} 