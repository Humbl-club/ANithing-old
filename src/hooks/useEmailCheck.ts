// Simple email check hook
import { useState } from 'react';
import { checkEmailExists } from '@/utils/emailValidation';

export const useEmailCheck = () => {
  const [checking, setChecking] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);

  const check = async (email: string) => {
    setChecking(true);
    try {
      const result = await checkEmailExists(email);
      setExists(result);
    } catch {
      setExists(null);
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setExists(null);
    setChecking(false);
  };

  return { checking, exists, check, reset };
};