import React, { useEffect } from 'react';
import { ContentCard } from '@/components/generic/ContentCard';
import { useSmartSimilarContent } from '@/hooks/useSmartSimilarContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import type { BaseContent } from '@/types/content';

// Update interface to match the hook's return type
interface SimilarContent extends BaseContent {
  similarity: number;
}

interface SimilarTitlesProps {
  contentId: string | number;
  contentType: 'anime' | 'manga';
}

export function SimilarTitles({ contentId, contentType }: SimilarTitlesProps) {
  const { similar, loading, error } = useSmartSimilarContent(contentId.toString(), contentType);

  if (loading) return <div>Loading similar titles...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!similar.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Similar Titles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {similar.map((item) => (
            <ContentCard 
              key={item.id}
              content={item}
              onClick={() => console.log('Navigate to', item.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
