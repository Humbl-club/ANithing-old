import React from 'react';
import { createRoot } from 'react-dom/client';
// Bundle size analysis removed
import App from './App.tsx';
import './index.css';
import './native.css';
// Bundle analysis removed for compatibility
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { initSentry } from '@/lib/sentry';
import { setupApiErrorTracking } from '@/lib/api-error-handler';
// Lazy load mobile optimizations to reduce main bundle size
const initializeMobileOptimizations = () => {
  if (typeof window !== 'undefined') {
    import('@/utils/mobileOptimizations').then(module => {
      module.initializeMobileOptimizations();
    });
  }
};
// Ensure React is available globally for development
if (typeof window !== 'undefined') {
  (window as any).React = React;
}
// Enhanced Service Worker registration with comprehensive offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        // Listen for updates - new version available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - show update notification
                toast({
                  title: 'New version available! 🚀',
                  description: 'Click to reload and get the latest features.',
                  action: (
                    <ToastAction altText="Update Now" onClick={() => {
                      window.location.reload();
                    }}>
                      Update Now
                    </ToastAction>
                  ),
                  duration: 10000, // Show for 10 seconds
                });
              } else if (newWorker.state === 'activated') {
                toast({
                  title: 'App updated! ✨',
                  description: 'You\'re now using the latest version.',
                  duration: 3000,
                });
              }
            });
          }
        });
        // Handle successful installation
        if (registration.active && !navigator.serviceWorker.controller) {
          toast({
            title: 'Offline support enabled! 📱',
            description: 'The app will now work offline with cached content.',
            duration: 5000,
          });
        }
      })
      .catch(error => {
        // Error logged silently
        toast({
          title: 'Offline mode unavailable',
          description: 'Some features may not work without internet.',
          variant: 'destructive',
          duration: 5000,
        });
      });
  });
  // Listen for Service Worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_UPDATED') {
      toast({
        title: 'Content updated',
        description: 'Fresh content has been cached for offline use.',
        duration: 3000,
      });
    } else if (event.data.type === 'OFFLINE_READY') {
      toast({
        title: 'Ready for offline use',
        description: 'Your content is now available offline.',
        duration: 3000,
      });
    }
  });
  // Handle online/offline status
  const updateOnlineStatus = () => {
    if (navigator.onLine) {
      toast({
        title: 'Connection restored! 🌐',
        description: 'Syncing latest content...',
        duration: 3000,
      });
    } else {
      toast({
        title: 'You\'re offline 📴',
        description: 'Using cached content. Some features may be limited.',
        duration: 5000,
      });
    }
  };
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
}
// Initialize Sentry before rendering (async for bundle optimization)
initSentry().catch(console.error);
// Setup API error tracking
setupApiErrorTracking();
// Initialize mobile optimizations
initializeMobileOptimizations();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
