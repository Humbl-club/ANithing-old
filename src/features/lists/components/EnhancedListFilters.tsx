import { memo, useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Tags,
  Star,
  BarChart3,
  Clock
} from 'lucide-react';
import { type ListStatus, type ListFilter, type ListSort } from '@/types/userLists';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EnhancedListFiltersProps {
  filters: ListFilter;
  onFiltersChange: (filters: ListFilter) => void;
  sortConfig: ListSort;
  onSortChange: (sort: ListSort) => void;
  listStatuses: ListStatus[];
  contentType: 'anime' | 'manga' | 'both';
  totalItems: number;
  filteredCount: number;
  availableTags: string[];
  showAdvanced?: boolean;
}

const sortOptions = [
  { value: 'title', label: 'Title', icon: '📝' },
  { value: 'status', label: 'Status', icon: '📊' },
  { value: 'progress', label: 'Progress', icon: '📈' },
  { value: 'rating', label: 'Rating', icon: '⭐' },
  { value: 'updated_at', label: 'Last Updated', icon: '🕒' },
  { value: 'created_at', label: 'Date Added', icon: '📅' },
  { value: 'sort_order', label: 'Custom Order', icon: '🔢' }
];

const EnhancedListFiltersComponent = ({
  filters,
  onFiltersChange,
  sortConfig,
  onSortChange,
  listStatuses,
  contentType,
  totalItems,
  filteredCount,
  availableTags,
  showAdvanced = true
}: EnhancedListFiltersProps) => {
  const [internalSearch, setInternalSearch] = useState(filters.search || '');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  const [ratingRange, setRatingRange] = useState([
    filters.rating?.min || 0,
    filters.rating?.max || 10
  ]);
  const [progressRange, setProgressRange] = useState([
    filters.progress?.min || 0,
    filters.progress?.max || 100
  ]);

  // Debounce search to avoid excessive filtering
  const debouncedSearch = useDebounce(internalSearch, 300);
  
  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch || undefined
      });
    }
  }, [debouncedSearch, filters, onFiltersChange]);
  
  // Update internal search when external search changes
  useEffect(() => {
    if (filters.search !== internalSearch) {
      setInternalSearch(filters.search || '');
    }
  }, [filters.search]);

  // Update internal state when filters change externally
  useEffect(() => {
    setSelectedTags(filters.tags || []);
    setRatingRange([
      filters.rating?.min || 0,
      filters.rating?.max || 10
    ]);
    setProgressRange([
      filters.progress?.min || 0,
      filters.progress?.max || 100
    ]);
  }, [filters]);

  const availableStatuses = useMemo(() => 
    listStatuses.filter(status => 
      status.media_type === contentType || status.media_type === 'both'
    ),
    [listStatuses, contentType]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.mediaType && filters.mediaType !== 'both') count++;
    if (filters.rating && (filters.rating.min > 0 || filters.rating.max < 10)) count++;
    if (filters.progress && (filters.progress.min > 0 || filters.progress.max < 100)) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) count++;
    return count;
  }, [filters]);

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : status
    });
  };

  const handleMediaTypeChange = (mediaType: string) => {
    onFiltersChange({
      ...filters,
      mediaType: mediaType === 'both' ? undefined : mediaType as 'anime' | 'manga'
    });
  };

  const handleRatingRangeChange = (values: number[]) => {
    setRatingRange(values);
    const [min, max] = values;
    onFiltersChange({
      ...filters,
      rating: (min === 0 && max === 10) ? undefined : { min, max }
    });
  };

  const handleProgressRangeChange = (values: number[]) => {
    setProgressRange(values);
    const [min, max] = values;
    onFiltersChange({
      ...filters,
      progress: (min === 0 && max === 100) ? undefined : { min, max }
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | undefined) => {
    const dateString = date ? date.toISOString().split('T')[0] : undefined;
    const newDateRange = {
      ...filters.dateRange,
      [field]: dateString
    };
    
    // Remove dateRange if both start and end are undefined
    if (!newDateRange.start && !newDateRange.end) {
      const { dateRange, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({
        ...filters,
        dateRange: newDateRange
      });
    }
  };

  const clearFilters = () => {
    setInternalSearch('');
    setSelectedTags([]);
    setRatingRange([0, 10]);
    setProgressRange([0, 100]);
    onFiltersChange({});
  };

  const clearFilter = (filterType: keyof ListFilter) => {
    const { [filterType]: removed, ...rest } = filters;
    
    // Reset internal state for specific filters
    switch (filterType) {
      case 'search':
        setInternalSearch('');
        break;
      case 'tags':
        setSelectedTags([]);
        break;
      case 'rating':
        setRatingRange([0, 10]);
        break;
      case 'progress':
        setProgressRange([0, 100]);
        break;
    }
    
    onFiltersChange(rest);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {filteredCount} of {totalItems} items
            </Badge>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <X className="w-4 h-4 mr-1" />
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Basic Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search your ${contentType} list...`}
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {internalSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInternalSearch('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select 
              value={filters.status || 'all'} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableStatuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Media Type Filter (only for 'both' content type) */}
          {contentType === 'both' && (
            <div className="w-full sm:w-36">
              <Select 
                value={filters.mediaType || 'both'} 
                onValueChange={handleMediaTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="manga">Manga</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Sort Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={sortConfig.field} 
              onValueChange={(field) => onSortChange({ 
                ...sortConfig, 
                field: field as ListSort['field'] 
              })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={sortConfig.direction} 
              onValueChange={(direction) => onSortChange({ 
                ...sortConfig, 
                direction: direction as 'asc' | 'desc' 
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">A-Z / Low-High</SelectItem>
                <SelectItem value="desc">Z-A / High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Toggle */}
          {showAdvanced && (
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Advanced Filters
                  {isAdvancedOpen ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleContent className="space-y-4 pt-4 border-t">
              {/* Rating Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rating Range
                  </label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {ratingRange[0]} - {ratingRange[1]}
                    {(ratingRange[0] !== 0 || ratingRange[1] !== 10) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter('rating')}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <Slider
                  value={ratingRange}
                  onValueChange={handleRatingRangeChange}
                  max={10}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Progress Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Progress Range (%)
                  </label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {progressRange[0]}% - {progressRange[1]}%
                    {(progressRange[0] !== 0 || progressRange[1] !== 100) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter('progress')}
                        className="h-4 w-4 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <Slider
                  value={progressRange}
                  onValueChange={handleProgressRangeChange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Tags className="w-4 h-4" />
                      Tags
                    </label>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearFilter('tags')}
                        className="h-6 text-xs"
                      >
                        Clear tags
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {availableTags.slice(0, 20).map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className={cn(
                            'text-xs px-2 py-1 rounded-full border cursor-pointer transition-colors',
                            selectedTags.includes(tag)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background hover:bg-muted'
                          )}
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                    {availableTags.length > 20 && (
                      <div className="text-xs text-muted-foreground">
                        +{availableTags.length - 20} more tags...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Date Range Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Date Added
                  </label>
                  {(filters.dateRange?.start || filters.dateRange?.end) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('dateRange')}
                      className="h-6 text-xs"
                    >
                      Clear dates
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.start ? (
                          format(new Date(filters.dateRange.start), 'PPP')
                        ) : (
                          'From date...'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange?.start ? new Date(filters.dateRange.start) : undefined}
                        onSelect={(date) => handleDateRangeChange('start', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <span className="text-muted-foreground">to</span>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.end ? (
                          format(new Date(filters.dateRange.end), 'PPP')
                        ) : (
                          'To date...'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined}
                        onSelect={(date) => handleDateRangeChange('end', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('search')}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.status && filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Status: {availableStatuses.find(s => s.id === filters.status)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter('status')}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                Tag: {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTagToggle(tag)}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Memoize component for performance optimization
export const EnhancedListFilters = memo(EnhancedListFiltersComponent);