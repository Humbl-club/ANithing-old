import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  validation: { isValid: boolean; score: number; errors: string[] };
  showValidation: boolean;
  disabled?: boolean;
  placeholder?: string;
  isSignUp?: boolean;
  hideStrengthMeter?: boolean;
}

export function EnhancedPasswordInput({
  value,
  onChange,
  validation,
  showValidation,
  disabled = false,
  placeholder = 'Password',
  isSignUp = false,
  hideStrengthMeter = false
}: EnhancedPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password">{placeholder}</Label>
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={showValidation && !validation.isValid ? 'border-red-500' : ''}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {isSignUp && !hideStrengthMeter && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-2 flex-1 rounded ${
                  level <= validation.score ? getStrengthColor(validation.score) : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      {showValidation && !validation.isValid && (
        <p className="text-sm text-red-500">{validation.errors[0]}</p>
      )}
    </div>
  );
}