import React, { createContext, useContext, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updatePreferences } = useSettingsStore();
  const theme = settings.preferences.theme;

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  };

  const [effectiveTheme, setEffectiveTheme] = React.useState(getEffectiveTheme);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme: newTheme });
  };

  useEffect(() => {
    const updateTheme = () => {
      const newEffectiveTheme = getEffectiveTheme();
      setEffectiveTheme(newEffectiveTheme);
      
      // Apply theme to document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newEffectiveTheme);
      
      // Update meta theme color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', newEffectiveTheme === 'dark' ? '#0f0f23' : '#ffffff');
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Apply other visual preferences
  useEffect(() => {
    const { preferences } = settings;
    const root = document.documentElement;
    
    // Apply glassmorphism preference
    root.style.setProperty('--glassmorphism-enabled', preferences.glassmorphism ? '1' : '0');
    
    // Apply animations preference
    root.style.setProperty('--animations-enabled', preferences.animations ? '1' : '0');
    if (!preferences.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // Apply compact mode
    if (preferences.compact_mode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Apply data saver mode
    if (preferences.data_saver) {
      root.classList.add('data-saver');
    } else {
      root.classList.remove('data-saver');
    }
  }, [settings.preferences]);

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}