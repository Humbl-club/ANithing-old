import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  Star,
  Building2,
  Tag,
  TrendingUp,
  RotateCcw,
  Filter,
  X,
  Search,
  Clock,
  Users,
  Play,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchFilters } from './UnifiedSearchBar';

interface SearchFiltersProps {
  filters: SearchFilters;
  contentType: 'anime' | 'manga' | 'all';
  onChange: (filters: SearchFilters) => void;
  onClear: () => void;
  className?: string;
}

export const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  contentType,
  onChange,
  onClear,
  className
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(localFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localFilters, onChange]);

  // Popular genres based on content type
  const popularGenres = useMemo(() => {
    const baseGenres = [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
      'Romance', 'Sci-Fi', 'Thriller', 'Horror', 'Mystery'
    ];
    
    if (contentType === 'anime') {
      return [...baseGenres, 'Mecha', 'Slice of Life', 'Sports', 'Supernatural', 'School'];
    } else if (contentType === 'manga') {
      return [...baseGenres, 'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Yaoi'];
    }
    
    return baseGenres;
  }, [contentType]);

  // Popular studios (anime only)
  const popularStudios = useMemo(() => [
    'Studio Ghibli', 'Toei Animation', 'Madhouse', 'Bones', 'Mappa',
    'Pierrot', 'A-1 Pictures', 'Trigger', 'Wit Studio', 'Kyoto Animation',
    'Production I.G', 'Sunrise', 'Shaft', 'Deen', 'Gainax'
  ], []);

  // Status options
  const statusOptions = useMemo(() => {
    if (contentType === 'anime') {
      return ['Finished Airing', 'Currently Airing', 'Not Yet Aired'];
    } else if (contentType === 'manga') {
      return ['Finished', 'Publishing', 'On Hiatus', 'Cancelled', 'Not Yet Published'];
    }
    return ['Finished', 'Ongoing', 'Upcoming'];
  }, [contentType]);

  // Format options
  const formatOptions = useMemo(() => {
    if (contentType === 'anime') {
      return ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];
    } else if (contentType === 'manga') {
      return ['Manga', 'Light Novel', 'One Shot', 'Doujinshi', 'Manhwa', 'Manhua'];
    }
    return ['TV', 'Movie', 'Manga', 'Light Novel'];
  }, [contentType]);

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleGenre = (genre: string) => {
    const currentGenres = localFilters.genres || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    
    updateFilter('genres', newGenres.length > 0 ? newGenres : undefined);
  };

  const toggleStudio = (studio: string) => {
    const currentStudios = localFilters.studios || [];
    const newStudios = currentStudios.includes(studio)
      ? currentStudios.filter(s => s !== studio)
      : [...currentStudios, studio];
    
    updateFilter('studios', newStudios.length > 0 ? newStudios : undefined);
  };

  const toggleStatus = (status: string) => {
    const currentStatuses = localFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('status', newStatuses.length > 0 ? newStatuses : undefined);
  };

  const toggleFormat = (format: string) => {
    const currentFormats = localFilters.format || [];
    const newFormats = currentFormats.includes(format)
      ? currentFormats.filter(f => f !== format)
      : [...currentFormats, format];
    
    updateFilter('format', newFormats.length > 0 ? newFormats : undefined);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onClear();
  };

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof SearchFilters];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-medium">Advanced Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="text-xs">
              {Object.keys(localFilters).length} active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Year Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Release Year</Label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="number"
              placeholder="1990"
              value={localFilters.year?.min || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateFilter('year', {
                  ...localFilters.year,
                  min: value ? parseInt(value) : undefined
                });
              }}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="number"
              placeholder="2024"
              value={localFilters.year?.max || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateFilter('year', {
                  ...localFilters.year,
                  max: value ? parseInt(value) : undefined
                });
              }}
              className="h-8"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Score Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Score Range</Label>
        </div>
        <div className="px-2">
          <Slider
            value={[localFilters.score?.min || 0, localFilters.score?.max || 10]}
            onValueChange={([min, max]) => {
              updateFilter('score', { min: min || undefined, max: max === 10 ? undefined : max });
            }}
            max={10}
            min={0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{localFilters.score?.min || 0}</span>
            <span>{localFilters.score?.max || 10}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Genres */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Genres</Label>
          {localFilters.genres && localFilters.genres.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {localFilters.genres.length} selected
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {popularGenres.map(genre => {
            const isSelected = localFilters.genres?.includes(genre) || false;
            return (
              <Badge
                key={genre}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => toggleGenre(genre)}
              >
                {genre}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Studios (Anime only) */}
      {contentType !== 'manga' && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Studios</Label>
              {localFilters.studios && localFilters.studios.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {localFilters.studios.length} selected
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {popularStudios.slice(0, 10).map(studio => {
                const isSelected = localFilters.studios?.includes(studio) || false;
                return (
                  <Badge
                    key={studio}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                    onClick={() => toggleStudio(studio)}
                  >
                    {studio}
                    {isSelected && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Status */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {contentType === 'anime' ? <Play className="w-4 h-4 text-muted-foreground" /> : <BookOpen className="w-4 h-4 text-muted-foreground" />}
          <Label className="text-sm font-medium">Status</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(status => {
            const isSelected = localFilters.status?.includes(status) || false;
            return (
              <Badge
                key={status}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => toggleStatus(status)}
              >
                {status}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Format */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Format</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {formatOptions.map(format => {
            const isSelected = localFilters.format?.includes(format) || false;
            return (
              <Badge
                key={format}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => toggleFormat(format)}
              >
                {format}
                {isSelected && <X className="w-3 h-3 ml-1" />}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Sort Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Sort By</Label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={localFilters.sortBy || 'relevance'}
            onValueChange={(value) => updateFilter('sortBy', value as SearchFilters['sortBy'])}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={localFilters.sortOrder || 'desc'}
            onValueChange={(value) => updateFilter('sortOrder', value as SearchFilters['sortOrder'])}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Order..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Filter Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">Quick Filters</Label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => {
              updateFilter('score', { min: 8, max: undefined });
              updateFilter('sortBy', 'score');
            }}
          >
            <Star className="w-3 h-3 mr-1" />
            High Rated
          </Badge>
          
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => {
              updateFilter('year', { min: 2020, max: undefined });
              updateFilter('sortBy', 'year');
            }}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Recent
          </Badge>
          
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => {
              updateFilter('sortBy', 'popularity');
              updateFilter('sortOrder', 'desc');
            }}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Popular
          </Badge>
          
          {contentType !== 'manga' && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => {
                updateFilter('format', ['Movie']);
                updateFilter('sortBy', 'score');
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Movies
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// Export with a different name to avoid confusion
export { SearchFiltersComponent as SearchFilters };