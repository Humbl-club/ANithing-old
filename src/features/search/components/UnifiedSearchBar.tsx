import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Loader2, 
  X, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Mic, 
  MicOff,
  Filter,
  Grid3x3,
  List,
  LayoutGrid,
  Star,
  Calendar,
  Building2,
  Hash,
  ArrowUp,
  ArrowDown,
  Eye,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useSearch } from '../hooks/useSearch';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchFilters } from './SearchFilters';
import { VoiceSearch } from './VoiceSearch';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDebounce } from '@/hooks/useDebounce';
export interface SearchFilters {
  year?: { min?: number; max?: number };
  score?: { min?: number; max?: number };
  genres?: string[];
  studios?: string[];
  status?: string[];
  format?: string[];
  sortBy?: 'relevance' | 'popularity' | 'score' | 'title' | 'year';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'anime' | 'manga' | 'character' | 'studio' | 'genre';
  popularity?: number;
  image_url?: string;
}

interface UnifiedSearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  onSelect?: (item: any) => void;
  showDropdown?: boolean;
  autoFocus?: boolean;
  contentType?: 'anime' | 'manga' | 'all';
  variant?: 'default' | 'compact' | 'hero';
  enableVoiceSearch?: boolean;
  enableAdvancedFilters?: boolean;
  enableSuggestions?: boolean;
  enableAnalytics?: boolean;
  viewMode?: 'grid' | 'list' | 'compact';
  onViewModeChange?: (mode: 'grid' | 'list' | 'compact') => void;
}
export const UnifiedSearchBar = ({ 
  placeholder = "Search anime, manga...", 
  className,
  onSearch,
  onSelect,
  showDropdown = true,
  autoFocus = false,
  contentType = 'all',
  variant = 'default',
  enableVoiceSearch = true,
  enableAdvancedFilters = true,
  enableSuggestions = true,
  enableAnalytics = true,
  viewMode = 'grid',
  onViewModeChange
}: UnifiedSearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { trackEvent } = useAnalytics();
  const { 
    results,
    searchQuery,
    setSearchQuery,
    clearSearch,
    refetch
  } = useSearch({ 
    contentType: contentType === 'all' ? 'both' : contentType, 
    limit: showDropdown ? 8 : 20,
    sortBy: filters.sortBy || 'relevance'
  });
  
  const isLoading = results.isSearching;
  const hasResults = results.items.length > 0;
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory();
  
  // Debounce search query for suggestions
  const debouncedQuery = useDebounce(searchQuery, 150);
  // Memoize popular searches and trending
  const popularSearches = useMemo(() => [
    'One Piece', 'Naruto', 'Attack on Titan', 
    'My Hero Academia', 'Demon Slayer', 'Jujutsu Kaisen',
    'Dragon Ball', 'Death Note', 'Fullmetal Alchemist',
    'Tokyo Ghoul', 'Hunter x Hunter', 'Mob Psycho 100'
  ], []);
  
  const trendingSearches = useMemo(() => [
    'Chainsaw Man', 'Spy x Family', 'Frieren',
    'Dandadan', 'Blue Lock', 'Vinland Saga'
  ], []);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  // Fetch suggestions based on query
  useEffect(() => {
    if (enableSuggestions && debouncedQuery.length >= 1) {
      // Simulate fetching suggestions (in real app, this would be an API call)
      const mockSuggestions: SearchSuggestion[] = [
        ...popularSearches
          .filter(s => s.toLowerCase().includes(debouncedQuery.toLowerCase()))
          .slice(0, 3)
          .map(title => ({ id: title, title, type: 'anime' as const, popularity: Math.floor(Math.random() * 100000) }))
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, enableSuggestions, popularSearches]);
  
  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    
    if (enableAnalytics && value.length >= 2) {
      trackEvent('search_query_typed', { query: value, length: value.length });
    }
    
    if (showDropdown) {
      setIsOpen(true);
    }
  };
  // Search handler
  const handleSearch = useCallback((query: string, searchFilters?: SearchFilters) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    setIsOpen(false);
    addToHistory(trimmedQuery);
    
    if (enableAnalytics) {
      trackEvent('search_executed', { 
        query: trimmedQuery, 
        contentType,
        hasFilters: Object.keys(searchFilters || filters).length > 0,
        viewMode
      });
    }
    
    const finalFilters = searchFilters || filters;
    if (onSearch) {
      onSearch(trimmedQuery, finalFilters);
    } else {
      const params = new URLSearchParams({ search: trimmedQuery });
      if (finalFilters.sortBy && finalFilters.sortBy !== 'relevance') {
        params.set('sortBy', finalFilters.sortBy);
      }
      if (finalFilters.year?.min) params.set('yearMin', finalFilters.year.min.toString());
      if (finalFilters.year?.max) params.set('yearMax', finalFilters.year.max.toString());
      if (finalFilters.score?.min) params.set('scoreMin', finalFilters.score.min.toString());
      if (finalFilters.genres?.length) params.set('genres', finalFilters.genres.join(','));
      
      navigate(`/${contentType === 'all' ? 'anime' : contentType}?${params.toString()}`);
    }
  }, [filters, onSearch, contentType, navigate, addToHistory, trackEvent, enableAnalytics, viewMode]);
  // Voice search handlers
  const handleVoiceStart = () => {
    setIsVoiceActive(true);
    if (enableAnalytics) {
      trackEvent('voice_search_started', { contentType });
    }
  };
  
  const handleVoiceResult = (transcript: string) => {
    setSearchQuery(transcript);
    setIsVoiceActive(false);
    if (transcript.trim()) {
      handleSearch(transcript);
    }
    if (enableAnalytics) {
      trackEvent('voice_search_completed', { query: transcript, contentType });
    }
  };
  
  const handleVoiceError = () => {
    setIsVoiceActive(false);
    if (enableAnalytics) {
      trackEvent('voice_search_error', { contentType });
    }
  };
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalOptions = results.items.length + suggestions.length + searchHistory.length + popularSearches.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < totalOptions - 1 ? prev + 1 : -1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : totalOptions - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      let currentIndex = 0;
      
      // Check results
      if (selectedIndex >= currentIndex && selectedIndex < currentIndex + results.items.length) {
        handleResultClick(results.items[selectedIndex - currentIndex]);
        return;
      }
      currentIndex += results.items.length;
      
      // Check suggestions
      if (selectedIndex >= currentIndex && selectedIndex < currentIndex + suggestions.length) {
        const suggestion = suggestions[selectedIndex - currentIndex];
        setSearchQuery(suggestion.title);
        handleSearch(suggestion.title);
        return;
      }
      currentIndex += suggestions.length;
      
      // Check history
      if (selectedIndex >= currentIndex && selectedIndex < currentIndex + searchHistory.length) {
        const term = searchHistory[selectedIndex - currentIndex];
        setSearchQuery(term);
        handleSearch(term);
        return;
      }
      currentIndex += searchHistory.length;
      
      // Check popular searches
      if (selectedIndex >= currentIndex && selectedIndex < currentIndex + popularSearches.length) {
        const term = popularSearches[selectedIndex - currentIndex];
        setSearchQuery(term);
        handleSearch(term);
        return;
      }
      
      // Default to current query
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
      setShowFilters(false);
      inputRef.current?.blur();
    } else if (e.ctrlKey || e.metaKey) {
      // Keyboard shortcuts
      if (e.key === 'f') {
        e.preventDefault();
        setShowFilters(!showFilters);
      } else if (e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
  };
  const handleResultClick = (result: any) => {
    setIsOpen(false);
    
    if (enableAnalytics) {
      trackEvent('search_result_clicked', { 
        resultId: result.id, 
        resultTitle: result.title,
        resultType: result.type || 'anime',
        position: results.items.findIndex(item => item.id === result.id)
      });
    }
    
    if (onSelect) {
      onSelect(result);
    } else {
      const contentType = result.type || (result.manga_details ? 'manga' : 'anime');
      const path = contentType === 'manga' ? `/manga/${result.id}` : `/anime/${result.id}`;
      navigate(path);
    }
  };
  
  // Filter handlers
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchQuery.trim()) {
      handleSearch(searchQuery, newFilters);
    }
  };
  
  const clearAllFilters = () => {
    setFilters({});
    if (enableAnalytics) {
      trackEvent('search_filters_cleared', { contentType });
    }
  };
  
  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });
  const variantStyles = {
    default: 'w-full',
    compact: 'w-64',
    hero: 'w-full max-w-2xl'
  };
  return (
    <div ref={searchRef} className={cn('relative', variantStyles[variant], className)}>
      <div className="relative">
        <div className="flex items-center gap-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="search-input"
              ref={inputRef}
              type="search"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              className={cn(
                'pl-10',
                enableVoiceSearch ? 'pr-20' : 'pr-10',
                variant === 'hero' && 'h-12 text-lg',
                isVoiceActive && 'ring-2 ring-red-500'
              )}
            />
            
            {/* Voice Search Button */}
            {enableVoiceSearch && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <VoiceSearch
                  onStart={handleVoiceStart}
                  onResult={handleVoiceResult}
                  onError={handleVoiceError}
                  isActive={isVoiceActive}
                />
              </div>
            )}
            
            {/* Loading/Clear Button */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : searchQuery ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearSearch();
                    setIsOpen(false);
                    setSuggestions([]);
                  }}
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </Button>
              ) : null}
            </div>
          </div>
          
          {/* Advanced Filters Toggle */}
          {enableAdvancedFilters && (
            <Button
              variant={showFilters || hasActiveFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative",
                variant === 'hero' && 'h-12'
              )}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          )}
          
          {/* View Mode Toggle */}
          {onViewModeChange && variant !== 'compact' && (
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none px-2"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-none px-2 border-x"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('compact')}
                className="rounded-l-none px-2"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {enableAdvancedFilters && showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 border rounded-lg bg-muted/30">
              <SearchFilters
                filters={filters}
                contentType={contentType}
                onChange={handleFiltersChange}
                onClear={clearAllFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDropdown && isOpen && createPortal(
          <motion.div
            data-testid="search-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: searchRef.current?.getBoundingClientRect().bottom || 0,
              left: searchRef.current?.getBoundingClientRect().left || 0,
              width: searchRef.current?.getBoundingClientRect().width || 0,
              marginTop: '8px',
              zIndex: 9999
            }}
            className="bg-background border rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search Results */}
            {hasResults && searchQuery.length >= 2 && (
              <div className="p-2" data-testid="search-results">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Search Results
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {results.total} total
                  </Badge>
                </div>
                {results.items.slice(0, 6).map((result: any, index: number) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <motion.div
                      data-testid="search-option"
                      key={result.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                        "hover:bg-muted/80 hover:shadow-sm",
                        isSelected && "bg-primary/10 ring-1 ring-primary/20"
                      )}
                    >
                      {result.image_url && (
                        <div className="relative flex-shrink-0">
                          <img 
                            src={result.image_url} 
                            alt={result.title}
                            className="w-12 h-16 object-cover rounded-md"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-md" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{result.title}</div>
                        {result.title_english && result.title_english !== result.title && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.title_english}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" size="sm">
                            {result.type === 'manga' ? '📚' : '🎬'} {result.type || 'Anime'}
                          </Badge>
                          {result.score && (
                            <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {result.score}
                            </Badge>
                          )}
                          {result.year && (
                            <Badge variant="outline" size="sm" className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {result.year}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <ArrowUp className="w-4 h-4 text-primary animate-bounce" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {results.items.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 hover:bg-primary/5"
                    onClick={() => handleSearch(searchQuery)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View all {results.total} results
                  </Button>
                )}
              </div>
            )}
            
            {/* Search Suggestions */}
            {enableSuggestions && suggestions.length > 0 && searchQuery.length >= 1 && searchQuery.length < 3 && (
              <div className="p-2 border-t">
                <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Suggestions
                </div>
                <div className="flex flex-wrap gap-1 p-1">
                  {suggestions.slice(0, 6).map((suggestion, index) => {
                    const actualIndex = results.items.length + index;
                    const isSelected = selectedIndex === actualIndex;
                    return (
                      <Badge
                        key={suggestion.id}
                        variant={isSelected ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => {
                          setSearchQuery(suggestion.title);
                          handleSearch(suggestion.title);
                        }}
                      >
                        {suggestion.title}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Loading State */}
            {isLoading && searchQuery.length >= 2 && (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">Searching...</div>
              </div>
            )}
            {/* Recent Searches */}
            {!hasResults && !isLoading && searchQuery.length < 2 && searchHistory.length > 0 && (
              <div className="p-2 border-t">
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Recent Searches
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-6 text-xs px-2"
                  >
                    Clear
                  </Button>
                </div>
                {searchHistory.slice(0, 5).map((term, index) => {
                  const actualIndex = results.items.length + suggestions.length + index;
                  const isSelected = selectedIndex === actualIndex;
                  return (
                    <motion.div
                      data-testid="search-option"
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/80 rounded-lg cursor-pointer transition-all",
                        isSelected && "bg-primary/10 ring-1 ring-primary/20"
                      )}
                    >
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="flex-1">{term}</span>
                      {isSelected && <ArrowUp className="w-3 h-3 text-primary" />}
                    </motion.div>
                  );
                })}
              </div>
            )}
            {/* Trending & Popular Searches */}
            {!hasResults && !isLoading && !searchQuery && (
              <div className="p-2 border-t">
                {/* Trending Searches */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending Now
                  </div>
                  <div className="flex flex-wrap gap-1 p-1">
                    {trendingSearches.slice(0, 3).map((term, index) => {
                      const actualIndex = results.items.length + suggestions.length + searchHistory.length + index;
                      const isSelected = selectedIndex === actualIndex;
                      return (
                        <Badge
                          data-testid="search-option"
                          key={term}
                          variant={isSelected ? "default" : "secondary"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearch(term);
                          }}
                        >
                          <BarChart3 className="w-3 h-3" />
                          {term}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                {/* Popular Searches */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground px-2 py-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Popular Searches
                  </div>
                  <div className="flex flex-wrap gap-1 p-1">
                    {popularSearches.slice(0, 8).map((term, index) => {
                      const actualIndex = results.items.length + suggestions.length + searchHistory.length + trendingSearches.length + index;
                      const isSelected = selectedIndex === actualIndex;
                      return (
                        <Badge
                          data-testid="search-option"
                          key={term}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearch(term);
                          }}
                        >
                          {term}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* No Results */}
            {searchQuery && searchQuery.length >= 2 && !hasResults && !isLoading && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                  <Search className="w-6 h-6 opacity-50" />
                </div>
                <p className="font-medium">No results found for "{searchQuery}"</p>
                <p className="text-xs mt-1 text-muted-foreground/70">
                  Try adjusting your search or filters
                </p>
                <div className="mt-3 flex flex-wrap gap-1 justify-center">
                  {popularSearches.slice(0, 3).map(term => (
                    <Badge
                      key={term}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
      
      {/* Keyboard Shortcuts Help */}
      {variant === 'hero' && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> to focus • 
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+F</kbd> for filters • 
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑↓</kbd> to navigate
        </div>
      )}
    </div>
  );
};
