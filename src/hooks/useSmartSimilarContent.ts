import { useState, useEffect } from 'react';
import type { BaseContent } from '@/types/content';

interface SimilarContent extends BaseContent {
  similarity: number;
}

export function useSmartSimilarContent(titleId: string, contentType: 'anime' | 'manga') {
  const [similar, setSimilar] = useState<SimilarContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!titleId) {
      setLoading(false);
      return;
    }

    // Mock similar content
    setTimeout(() => {
      setSimilar([
        {
          id: '1',
          title: `Similar ${contentType} 1`,
          image_url: 'https://via.placeholder.com/300x400',
          score: 8.5,
          similarity: 0.95,
          content_type: contentType,
          status: 'completed'
        },
        {
          id: '2', 
          title: `Similar ${contentType} 2`,
          image_url: 'https://via.placeholder.com/300x400',
          score: 8.2,
          similarity: 0.87,
          content_type: contentType,
          status: 'ongoing'
        }
      ]);
      setLoading(false);
    }, 500);
  }, [titleId, contentType]);

  return {
    similar,
    loading,
    error
  };
}