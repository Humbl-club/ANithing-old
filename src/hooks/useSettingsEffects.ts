import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Hook to apply settings effects across the application
 * This ensures that user preferences are reflected in app behavior
 */
export function useSettingsEffects() {
  const { settings } = useSettingsStore();
  const { preferences, notifications } = settings;

  // Apply theme and visual effects
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    const effectiveTheme = preferences.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preferences.theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#0f0f23' : '#ffffff');
    }
  }, [preferences.theme]);

  // Apply visual preferences
  useEffect(() => {
    const root = document.documentElement;
    
    // Glassmorphism
    root.style.setProperty('--glassmorphism-enabled', preferences.glassmorphism ? '1' : '0');
    
    // Animations
    root.style.setProperty('--animations-enabled', preferences.animations ? '1' : '0');
    if (!preferences.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // Compact mode
    if (preferences.compact_mode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Data saver mode
    if (preferences.data_saver) {
      root.classList.add('data-saver');
    } else {
      root.classList.remove('data-saver');
    }
  }, [preferences.glassmorphism, preferences.animations, preferences.compact_mode, preferences.data_saver]);

  // Apply content filters
  useEffect(() => {
    const root = document.documentElement;
    
    // Set content filter attributes for CSS and JS filtering
    root.setAttribute('data-content-filter', preferences.content_filter);
    root.setAttribute('data-show-spoilers', preferences.show_spoilers.toString());
    root.setAttribute('data-auto-play-trailers', preferences.auto_play_trailers.toString());
  }, [preferences.content_filter, preferences.show_spoilers, preferences.auto_play_trailers]);

  // Handle language preference
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', preferences.language);
    
    // You could extend this to load different language packs
    // or trigger re-renders of components that use i18n
  }, [preferences.language]);

  // Handle title language preference
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-title-language', preferences.title_language);
  }, [preferences.title_language]);

  // Handle notification preferences for runtime behavior
  useEffect(() => {
    // Check if browser notifications are supported and enabled
    if ('Notification' in window && notifications.push_notifications) {
      if (Notification.permission === 'default') {
        // Could prompt for permission here if needed
      }
    }
    
    // Store notification preferences in a global way for other components to access
    window.appNotificationSettings = {
      push: notifications.push_notifications && Notification.permission === 'granted',
      sound: notifications.sound_effects,
      inApp: notifications.in_app_notifications,
    };
  }, [notifications.push_notifications, notifications.sound_effects, notifications.in_app_notifications]);

  // Apply performance preferences
  useEffect(() => {
    if (preferences.data_saver) {
      // Disable unnecessary features for data saving
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        if (img instanceof HTMLImageElement) {
          img.loading = 'lazy';
        }
      });
      
      // Could also disable auto-playing videos, reduce image quality, etc.
    }
  }, [preferences.data_saver]);

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = () => {
        const root = document.documentElement;
        const effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(effectiveTheme);
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#0f0f23' : '#ffffff');
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [preferences.theme]);

  // Apply reduced motion preferences from system
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotionChange = () => {
      const root = document.documentElement;
      if (mediaQuery.matches || !preferences.animations) {
        root.classList.add('no-animations');
      } else {
        root.classList.remove('no-animations');
      }
    };

    handleReducedMotionChange();
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    return () => mediaQuery.removeEventListener('change', handleReducedMotionChange);
  }, [preferences.animations]);

  return {
    theme: preferences.theme,
    effectiveTheme: preferences.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preferences.theme,
    compactMode: preferences.compact_mode,
    dataSaver: preferences.data_saver,
    animations: preferences.animations,
    glassmorphism: preferences.glassmorphism,
    contentFilter: preferences.content_filter,
    titleLanguage: preferences.title_language,
    autoPlayTrailers: preferences.auto_play_trailers,
    showSpoilers: preferences.show_spoilers,
  };
}

// Utility function to get current settings without hook
export function getCurrentSettings() {
  const store = useSettingsStore.getState();
  return store.settings;
}

// Utility function to check if content should be filtered
export function shouldFilterContent(contentRating?: string, userAge?: number) {
  const settings = getCurrentSettings();
  const filter = settings.preferences.content_filter;
  
  if (filter === 'all') return false;
  if (filter === 'family_friendly') {
    return contentRating && ['R+', 'Rx', 'R'].includes(contentRating);
  }
  if (filter === 'no_adult') {
    return contentRating && ['Rx', 'R'].includes(contentRating);
  }
  
  return false;
}

// Utility function to get the appropriate title based on language preference
export function getPreferredTitle(titles: {
  english?: string;
  romaji?: string;
  native?: string;
}) {
  const settings = getCurrentSettings();
  const preference = settings.preferences.title_language;
  
  switch (preference) {
    case 'english':
      return titles.english || titles.romaji || titles.native || 'Unknown Title';
    case 'romaji':
      return titles.romaji || titles.english || titles.native || 'Unknown Title';
    case 'native':
      return titles.native || titles.romaji || titles.english || 'Unknown Title';
    default:
      return titles.english || titles.romaji || titles.native || 'Unknown Title';
  }
}

// Type augmentation for window object
declare global {
  interface Window {
    appNotificationSettings?: {
      push: boolean;
      sound: boolean;
      inApp: boolean;
    };
  }
}