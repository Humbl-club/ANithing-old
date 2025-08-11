import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Filter, X, ChevronDown, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchFilters {
  query: string;
  contentType: 'all' | 'anime' | 'manga';
  genres: string[];
  studios: string[];
  minScore: number;
  maxScore: number;
  minYear: number;
  maxYear: number;
  status: string[];
  sortBy: 'popularity' | 'score' | 'title' | 'year';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const AdvancedSearch = React.memo(({ onSearch, onReset, isLoading = false }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    contentType: 'all',
    genres: [],
    studios: [],
    minScore: 0,
    maxScore: 10,
    minYear: 1960,
    maxYear: new Date().getFullYear(),
    status: [],
    sortBy: 'popularity',
    sortOrder: 'desc'
  });

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableStudios, setAvailableStudios] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load available filters
  useEffect(() => {
    const loadFilters = async () => {
      // Load genres
      const { data: genres } = await supabase
        .from('genres')
        .select('name')
        .order('name');
      
      if (genres) {
        setAvailableGenres(genres.map(g => g.name));
      }

      // Load studios
      const { data: studios } = await supabase
        .from('studios')
        .select('name')
        .order('name')
        .limit(100); // Top 100 studios
      
      if (studios) {
        setAvailableStudios(studios.map(s => s.name));
      }
    };

    loadFilters();
  }, []);

  // Memoize filter change handler
  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Memoize genre toggle handler
  const handleGenreToggle = useCallback((genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  }, []);

  // Memoize studio toggle handler
  const handleStudioToggle = useCallback((studio: string) => {
    setFilters(prev => ({
      ...prev,
      studios: prev.studios.includes(studio)
        ? prev.studios.filter(s => s !== studio)
        : [...prev.studios, studio]
    }));
  }, []);

  // Memoize search handler
  const handleSearch = useCallback(() => {
    onSearch(filters);
  }, [onSearch, filters]);

  // Memoize reset handler with static reset filters
  const resetFiltersDefault = useMemo(() => ({
    query: '',
    contentType: 'all' as const,
    genres: [],
    studios: [],
    minScore: 0,
    maxScore: 10,
    minYear: 1960,
    maxYear: new Date().getFullYear(),
    status: [],
    sortBy: 'popularity' as const,
    sortOrder: 'desc' as const
  }), []);

  const handleReset = useCallback(() => {
    setFilters(resetFiltersDefault);
    onReset();
  }, [onReset, resetFiltersDefault]);

  // Memoize active filters check
  const hasActiveFilters = useMemo(() => 
    filters.query || 
    filters.contentType !== 'all' || 
    filters.genres.length > 0 || 
    filters.studios.length > 0 ||
    filters.minScore > 0 ||
    filters.maxScore < 10 ||
    filters.status.length > 0, [filters]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Search
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {[
                  filters.query && 'text',
                  filters.genres.length > 0 && `${filters.genres.length} genres`,
                  filters.studios.length > 0 && `${filters.studios.length} studios`,
                  filters.contentType !== 'all' && filters.contentType,
                ].filter(Boolean).join(', ')}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search anime, manga, characters..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Content Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Content Type</Label>
              <Select value={filters.contentType} onValueChange={(value) => handleFilterChange('contentType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="anime">Anime Only</SelectItem>
                  <SelectItem value="manga">Manga Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Score Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Score Range: {filters.minScore} - {filters.maxScore}
              </Label>
              <div className="px-2">
                <Slider
                  value={[filters.minScore, filters.maxScore]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minScore', min);
                    handleFilterChange('maxScore', max);
                  }}
                  max={10}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Year Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Year Range: {filters.minYear} - {filters.maxYear}
              </Label>
              <div className="px-2">
                <Slider
                  value={[filters.minYear, filters.maxYear]}
                  onValueChange={([min, max]) => {
                    handleFilterChange('minYear', min);
                    handleFilterChange('maxYear', max);
                  }}
                  max={new Date().getFullYear()}
                  min={1960}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Genres */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Genres ({filters.genres.length} selected)
              </Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableGenres.map(genre => (
                  <Badge
                    key={genre}
                    variant={filters.genres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                    {filters.genres.includes(genre) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Studios (for anime) */}
            {filters.contentType !== 'manga' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Studios ({filters.studios.length} selected)
                </Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableStudios.slice(0, 20).map(studio => (
                    <Badge
                      key={studio}
                      variant={filters.studios.includes(studio) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => handleStudioToggle(studio)}
                    >
                      {studio}
                      {filters.studios.includes(studio) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">High to Low</SelectItem>
                    <SelectItem value="asc">Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="flex-1"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
