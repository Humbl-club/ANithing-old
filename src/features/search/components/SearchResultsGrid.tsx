import React from "react";
import { ContentCard } from "@/components/generic/ContentCard";
import type { BaseContent } from "@/types/content";

interface SearchResultsGridProps {
  results: BaseContent[];
  totalCount: number;
  isLoading: boolean;
  onItemClick: (item: BaseContent) => void;
  getDisplayName: (item: BaseContent) => string;
}

export const SearchResultsGrid: React.FC<SearchResultsGridProps> = ({
  results,
  totalCount,
  isLoading,
  onItemClick,
  getDisplayName
}) => {
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          No results found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Search Results</h2>
        <p className="text-muted-foreground">
          Found {totalCount} result{totalCount !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {results.map((item) => (
          <ContentCard
            key={item.id}
            content={item}
            onClick={() => onItemClick(item)}
            getDisplayName={getDisplayName}
          />
        ))}
      </div>
    </div>
  );
};