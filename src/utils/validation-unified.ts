/**
 * UNIFIED VALIDATION MODULE
 * Consolidates all validation functions across the app
 * Saves ~300 lines by removing duplicates
 */

// ============= EMAIL VALIDATION =============
export const emailValidation = {
  isValid: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  getMessage: (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!emailValidation.isValid(email)) return 'Invalid email format';
    return null;
  }
};

// ============= PASSWORD VALIDATION =============
export const passwordValidation = {
  minLength: 8,
  
  isValid: (password: string): boolean => {
    return password.length >= passwordValidation.minLength;
  },
  
  isStrong: (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && password.length >= 8;
  },
  
  getMessage: (password: string): string | null => {
    if (!password) return 'Password is required';
    if (!passwordValidation.isValid(password)) return `Password must be at least ${passwordValidation.minLength} characters`;
    return null;
  },
  
  getStrengthMessage: (password: string): string => {
    if (!password) return 'Enter a password';
    if (password.length < 6) return 'Too short';
    if (password.length < 8) return 'Weak';
    if (passwordValidation.isStrong(password)) return 'Strong';
    return 'Medium';
  }
};

// ============= SCORE VALIDATION =============
export const scoreValidation = {
  min: 0,
  max: 10,
  
  isValid: (score: number): boolean => {
    return score >= scoreValidation.min && score <= scoreValidation.max;
  },
  
  normalize: (score: number): number => {
    return Math.max(scoreValidation.min, Math.min(scoreValidation.max, score));
  },
  
  getMessage: (score: number): string | null => {
    if (score < scoreValidation.min || score > scoreValidation.max) {
      return `Score must be between ${scoreValidation.min} and ${scoreValidation.max}`;
    }
    return null;
  }
};

// ============= TEXT VALIDATION =============
export const textValidation = {
  isRequired: (value: string, fieldName = 'Field'): string | null => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  },
  
  minLength: (value: string, min: number, fieldName = 'Field'): string | null => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },
  
  maxLength: (value: string, max: number, fieldName = 'Field'): string | null => {
    if (value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  },
  
  alphanumeric: (value: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(value);
  },
  
  noSpecialChars: (value: string): boolean => {
    return /^[a-zA-Z0-9\s]+$/.test(value);
  }
};

// ============= NUMBER VALIDATION =============
export const numberValidation = {
  isPositive: (value: number): boolean => value > 0,
  
  isInteger: (value: number): boolean => Number.isInteger(value),
  
  inRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },
  
  getMessage: (value: number, min?: number, max?: number): string | null => {
    if (min !== undefined && value < min) {
      return `Value must be at least ${min}`;
    }
    if (max !== undefined && value > max) {
      return `Value must be at most ${max}`;
    }
    return null;
  }
};

// ============= DATE VALIDATION =============
export const dateValidation = {
  isValid: (date: string | Date): boolean => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  },
  
  isFuture: (date: string | Date): boolean => {
    return new Date(date) > new Date();
  },
  
  isPast: (date: string | Date): boolean => {
    return new Date(date) < new Date();
  },
  
  isAdult: (birthDate: string | Date): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  },
  
  getMessage: (date: string | Date, type?: 'future' | 'past' | 'adult'): string | null => {
    if (!dateValidation.isValid(date)) return 'Invalid date';
    
    switch (type) {
      case 'future':
        if (!dateValidation.isFuture(date)) return 'Date must be in the future';
        break;
      case 'past':
        if (!dateValidation.isPast(date)) return 'Date must be in the past';
        break;
      case 'adult':
        if (!dateValidation.isAdult(date)) return 'You must be 18 or older';
        break;
    }
    
    return null;
  }
};

// ============= FORM VALIDATION =============
export class FormValidator<T extends Record<string, any>> {
  private rules: Map<keyof T, Array<(value: any) => string | null>>;
  
  constructor() {
    this.rules = new Map();
  }
  
  addRule(field: keyof T, validator: (value: any) => string | null) {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(validator);
    return this;
  }
  
  required(field: keyof T, message = 'Field is required') {
    return this.addRule(field, (value) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message;
      }
      return null;
    });
  }
  
  email(field: keyof T) {
    return this.addRule(field, emailValidation.getMessage);
  }
  
  password(field: keyof T) {
    return this.addRule(field, passwordValidation.getMessage);
  }
  
  minLength(field: keyof T, min: number) {
    return this.addRule(field, (value) => 
      textValidation.minLength(value, min, String(field))
    );
  }
  
  maxLength(field: keyof T, max: number) {
    return this.addRule(field, (value) => 
      textValidation.maxLength(value, max, String(field))
    );
  }
  
  validate(data: T): Record<keyof T, string | null> {
    const errors: Record<keyof T, string | null> = {} as Record<keyof T, string | null>;
    
    this.rules.forEach((validators, field) => {
      for (const validator of validators) {
        const error = validator(data[field]);
        if (error) {
          errors[field] = error;
          break;
        }
      }
      if (!errors[field]) {
        errors[field] = null;
      }
    });
    
    return errors;
  }
  
  isValid(data: T): boolean {
    const errors = this.validate(data);
    return Object.values(errors).every(error => error === null);
  }
}

// ============= COMMON VALIDATORS =============

export const authFormValidator = new FormValidator<{
  email: string;
  password: string;
}>()
  .email('email')
  .password('password');

export const profileFormValidator = new FormValidator<{
  username: string;
  bio: string;
  birthDate: string;
}>()
  .required('username', 'Username is required')
  .minLength('username', 3)
  .maxLength('username', 20)
  .maxLength('bio', 500)
  .addRule('birthDate', (value) => dateValidation.getMessage(value, 'adult'));

export const reviewFormValidator = new FormValidator<{
  rating: number;
  review: string;
}>()
  .addRule('rating', (value) => scoreValidation.getMessage(value))
  .required('review', 'Review text is required')
  .minLength('review', 10)
  .maxLength('review', 2000);

// Export convenience functions
export const validateEmail = emailValidation.isValid;
export const validatePassword = passwordValidation.isValid;
export const validateScore = scoreValidation.isValid;
export const validateRequired = (value: any) => !!value && (typeof value !== 'string' || value.trim().length > 0);