import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useAgeVerification() {
  const { user } = useAuth();
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showAgePrompt, setShowAgePrompt] = useState(false);

  useEffect(() => {
    // Check if user has verified their age
    const ageVerified = localStorage.getItem('age-verified');
    if (ageVerified === 'true') {
      setIsAgeVerified(true);
    } else {
      setShowAgePrompt(true);
    }
  }, []);

  const verifyAge = (isOfAge: boolean) => {
    if (isOfAge) {
      localStorage.setItem('age-verified', 'true');
      setIsAgeVerified(true);
      setShowAgePrompt(false);
    } else {
      // Handle underage user
      setShowAgePrompt(false);
    }
  };

  const resetAgeVerification = () => {
    localStorage.removeItem('age-verified');
    setIsAgeVerified(false);
    setShowAgePrompt(true);
  };

  return {
    isAgeVerified,
    showAgePrompt,
    verifyAge,
    resetAgeVerification
  };
}