import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useEmailVerification() {
  const { user } = useAuth();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      setIsEmailVerified(user.email_confirmed_at !== null);
      setShowEmailPrompt(!user.email_confirmed_at);
    } else {
      setIsEmailVerified(false);
      setShowEmailPrompt(false);
    }
  }, [user]);

  const dismissEmailPrompt = () => {
    setShowEmailPrompt(false);
  };

  return {
    isEmailVerified,
    showEmailPrompt,
    dismissEmailPrompt
  };
}