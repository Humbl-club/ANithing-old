import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EnhancedEmailInputProps {
  value: string;
  onChange: (value: string) => void;
  validation: { isValid: boolean; errors: string[] };
  showValidation: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function EnhancedEmailInput({
  value,
  onChange,
  validation,
  showValidation,
  disabled = false,
  placeholder = 'Email'
}: EnhancedEmailInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">{placeholder}</Label>
      <Input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={showValidation && !validation.isValid ? 'border-red-500' : ''}
      />
      {showValidation && !validation.isValid && (
        <p className="text-sm text-red-500">{validation.errors[0]}</p>
      )}
    </div>
  );
}