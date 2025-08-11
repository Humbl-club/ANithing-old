import { useState, useEffect, useCallback } from 'react';

interface OfflineContentState {
  hasOfflineContent: boolean;
  offlineCount: number;
  isLoading: boolean;
}

export function useOfflineContent() {
  const [state, setState] = useState<OfflineContentState>({
    hasOfflineContent: false,
    offlineCount: 0,
    isLoading: true
  });

  // Load offline content count from localStorage/IndexedDB
  useEffect(() => {
    const loadOfflineContent = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Check for cached content in localStorage
        const cachedContent = localStorage.getItem('offline-content');
        const parsedContent = cachedContent ? JSON.parse(cachedContent) : [];
        
        setState({
          hasOfflineContent: parsedContent.length > 0,
          offlineCount: parsedContent.length,
          isLoading: false
        });
      } catch (error) {
        setState({
          hasOfflineContent: false,
          offlineCount: 0,
          isLoading: false
        });
      }
    };

    loadOfflineContent();
  }, []);

  const addToOffline = useCallback(async (contentId: string, contentData: any) => {
    try {
      const existingContent = JSON.parse(localStorage.getItem('offline-content') || '[]');
      const updatedContent = [...existingContent, { id: contentId, data: contentData, cached_at: new Date().toISOString() }];
      
      localStorage.setItem('offline-content', JSON.stringify(updatedContent));
      
      setState(prev => ({
        ...prev,
        hasOfflineContent: true,
        offlineCount: updatedContent.length
      }));
    } catch (error) {
      console.error('Failed to add content to offline cache:', error);
    }
  }, []);

  const removeFromOffline = useCallback(async (contentId: string) => {
    try {
      const existingContent = JSON.parse(localStorage.getItem('offline-content') || '[]');
      const updatedContent = existingContent.filter((item: any) => item.id !== contentId);
      
      localStorage.setItem('offline-content', JSON.stringify(updatedContent));
      
      setState(prev => ({
        ...prev,
        hasOfflineContent: updatedContent.length > 0,
        offlineCount: updatedContent.length
      }));
    } catch (error) {
      console.error('Failed to remove content from offline cache:', error);
    }
  }, []);

  const clearOfflineContent = useCallback(async () => {
    try {
      localStorage.removeItem('offline-content');
      setState({
        hasOfflineContent: false,
        offlineCount: 0,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to clear offline content:', error);
    }
  }, []);

  const getOfflineContent = useCallback(async (contentId: string) => {
    try {
      const existingContent = JSON.parse(localStorage.getItem('offline-content') || '[]');
      const content = existingContent.find((item: any) => item.id === contentId);
      return content?.data || null;
    } catch (error) {
      console.error('Failed to get offline content:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    addToOffline,
    removeFromOffline,
    clearOfflineContent,
    getOfflineContent
  };
}