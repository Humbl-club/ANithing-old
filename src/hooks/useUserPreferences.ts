import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  autoPlay: boolean;
  showAdultContent: boolean;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    notifications: true,
    autoPlay: false,
    showAdultContent: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user preferences
    const saved = localStorage.getItem('user-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
    setLoading(false);
  }, [user]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    localStorage.setItem('user-preferences', JSON.stringify(newPrefs));
  };

  return { preferences, updatePreferences, loading };
}
