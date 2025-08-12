import React, { useMemo } from "react";
import { Loader2, Search, Grid3x3, List, LayoutGrid, Star, Calendar, Building2, Play, BookOpen, Eye, Heart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNamePreference } from "@/hooks/useNamePreference";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  title_english?: string;
  title_japanese?: string;
  image_url?: string;
  score?: number;
  type?: string;
  popularity?: number;
  year?: number;
  episodes?: number;
  chapters?: number;
  status?: string;
  format?: string;
  genres?: Array<{ name: string }>;
  studios?: Array<{ name: string }>;
  description?: string;
  averageScore?: number;
  meanScore?: number;
  favourites?: number;
  isAdult?: boolean;
}

export type ViewMode = 'grid' | 'list' | 'compact';

interface SearchResultsProps {
  query: string;
  isSearching: boolean;
  searchResults: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onBackdropClick?: () => void;
  viewMode?: ViewMode;
  showViewControls?: boolean;
  onViewModeChange?: (mode: ViewMode) => void;
  totalResults?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
  showStats?: boolean;
  enableInfiniteScroll?: boolean;
}

export const SearchResults = ({
  query,
  isSearching,
  searchResults,
  onResultClick,
  onBackdropClick,
  viewMode = 'grid',
  showViewControls = true,
  onViewModeChange,
  totalResults,
  hasMore = false,
  onLoadMore,
  className,
  showStats = true,
  enableInfiniteScroll = false
}: SearchResultsProps) => {
  const { getDisplayName } = useNamePreference();
  
  // Memoize search statistics
  const searchStats = useMemo(() => {
    if (!searchResults.length) return null;
    
    const anime = searchResults.filter(r => r.type === 'anime' || !r.type);
    const manga = searchResults.filter(r => r.type === 'manga');
    const avgScore = searchResults
      .filter(r => r.score || r.averageScore || r.meanScore)
      .reduce((sum, r) => sum + (r.score || r.averageScore || r.meanScore || 0), 0) / searchResults.length;
    
    return {
      anime: anime.length,
      manga: manga.length,
      avgScore: avgScore ? avgScore.toFixed(1) : null
    };
  }, [searchResults]);
  
  // Render result card based on view mode
  const renderResultCard = (result: SearchResult, index: number) => {
    const displayName = getDisplayName(result);
    const score = result.score || result.averageScore || result.meanScore;
    const isAnime = result.type === 'anime' || !result.type;
    
    const baseClasses = "group cursor-pointer transition-all duration-200 hover:shadow-md";
    const selectedClasses = "hover:scale-[1.02] hover:bg-accent/50";
    
    if (viewMode === 'grid') {
      return (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className={cn(baseClasses, selectedClasses)}
          onClick={() => onResultClick(result)}
        >
          <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                {result.image_url ? (
                  <>
                    <img 
                      src={result.image_url} 
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {score && (
                        <Badge className="bg-black/60 text-white border-0 text-xs flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {score}
                        </Badge>
                      )}
                      {result.year && (
                        <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs">
                          {result.year}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                          {isAnime ? '🎬' : '📚'} {result.type || 'Anime'}
                        </Badge>
                        {result.status && (
                          <span className="text-white/80 text-xs">{result.status}</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    {isAnime ? <Play className="w-12 h-12 text-muted-foreground" /> : <BookOpen className="w-12 h-12 text-muted-foreground" />}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }
    
    if (viewMode === 'list') {
      return (
        <motion.div
          key={result.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={cn(baseClasses, "border rounded-lg p-4 mb-3", selectedClasses)}
          onClick={() => onResultClick(result)}
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {result.image_url ? (
                <img 
                  src={result.image_url} 
                  alt={displayName}
                  className="w-16 h-20 object-cover rounded-md"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-20 bg-muted rounded-md flex items-center justify-center">
                  {isAnime ? <Play className="w-6 h-6 text-muted-foreground" /> : <BookOpen className="w-6 h-6 text-muted-foreground" />}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">{displayName}</h3>
                  {result.title_english && result.title_english !== result.title && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {result.title_english}
                    </p>
                  )}
                </div>
                {score && (
                  <Badge className="flex items-center gap-1 ml-4">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {score}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {isAnime ? '🎬' : '📚'} {result.type || 'Anime'}
                </Badge>
                {result.year && (
                  <Badge variant="secondary">
                    <Calendar className="w-3 h-3 mr-1" />
                    {result.year}
                  </Badge>
                )}
                {result.status && (
                  <Badge variant="outline">{result.status}</Badge>
                )}
                {result.episodes && (
                  <span className="text-xs text-muted-foreground">
                    {result.episodes} episodes
                  </span>
                )}
                {result.chapters && (
                  <span className="text-xs text-muted-foreground">
                    {result.chapters} chapters
                  </span>
                )}
              </div>
              
              {result.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {result.description}
                </p>
              )}
              
              {result.genres && result.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.genres.slice(0, 3).map((genre, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                  {result.genres.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{result.genres.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }
    
    // Compact view
    return (
      <motion.div
        key={result.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.02, duration: 0.2 }}
        className={cn(baseClasses, "flex items-center gap-3 p-2 border-b border-border/50 last:border-b-0", selectedClasses)}
        onClick={() => onResultClick(result)}
      >
        <div className="flex-shrink-0">
          {result.image_url ? (
            <img 
              src={result.image_url} 
              alt={displayName}
              className="w-10 h-12 object-cover rounded"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-12 bg-muted rounded flex items-center justify-center">
              {isAnime ? <Play className="w-4 h-4 text-muted-foreground" /> : <BookOpen className="w-4 h-4 text-muted-foreground" />}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-1">{displayName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" size="sm">
              {result.type || 'Anime'}
            </Badge>
            {score && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {score}
              </div>
            )}
            {result.year && (
              <span className="text-xs text-muted-foreground">{result.year}</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };
  
  if (onBackdropClick) {
    // Dropdown overlay version
    return (
      <>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998]" onClick={onBackdropClick} />
        <div className="absolute top-full left-0 right-0 mt-3 glass-dropdown rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-[999] animate-fade-in border border-primary/20"
             style={{ backgroundColor: 'hsl(var(--background) / 0.95)' }}>
          {isSearching && searchResults.length === 0 ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">Searching for "{query}"...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50 flex items-center justify-between">
                <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
                <span className="text-primary">"{query}"</span>
              </div>
              {searchResults.map((result, index) => renderResultCard(result, index))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <p>No results found for "{query}"</p>
              <div className="mt-2 text-xs text-muted-foreground/70">
                Try searching for popular titles like:<br />
                "Naruto", "Attack on Titan", "One Piece", "Dragon Ball"
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }

  // Full page search results version
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header with Stats */}
      {showStats && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
              {searchResults.length > 0 ? `Results for "${query}"` : 'Search Results'}
            </h2>
            {searchStats && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Found {totalResults || searchResults.length} results</span>
                {searchStats.anime > 0 && <span>• {searchStats.anime} anime</span>}
                {searchStats.manga > 0 && <span>• {searchStats.manga} manga</span>}
                {searchStats.avgScore && <span>• Avg score: {searchStats.avgScore}</span>}
              </div>
            )}
          </div>
          
          {/* View Controls */}
          {showViewControls && onViewModeChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">View:</span>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                  className="rounded-r-none px-3"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  className="rounded-none border-x px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('compact')}
                  className="rounded-l-none px-3"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Loading State */}
      {isSearching && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Searching for "{query}"...</p>
          <p className="text-sm text-muted-foreground">Please wait while we find the best results</p>
        </div>
      )}
      
      {/* Results Grid/List */}
      {searchResults.length > 0 && (
        <>
          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
              >
                {searchResults.map((result, index) => renderResultCard(result, index))}
              </motion.div>
            )}
            
            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-0"
              >
                {searchResults.map((result, index) => renderResultCard(result, index))}
              </motion.div>
            )}
            
            {viewMode === 'compact' && (
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border rounded-lg divide-y"
              >
                {searchResults.map((result, index) => renderResultCard(result, index))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Load More Button */}
          {hasMore && onLoadMore && !enableInfiniteScroll && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={onLoadMore}
                disabled={isSearching}
                size="lg"
                className="min-w-[200px]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Load More Results
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* No Results */}
      {!isSearching && searchResults.length === 0 && query.length >= 2 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">No results found for "{query}". Try adjusting your search terms.</p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Popular searches:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['One Piece', 'Naruto', 'Attack on Titan', 'Dragon Ball'].map(term => (
                <Badge key={term} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && query.length < 2 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Start searching</h3>
          <p className="text-muted-foreground">Enter at least 2 characters to search for anime and manga</p>
        </div>
      )}
    </div>
  );
};

// Export view mode type for other components
export type { ViewMode };