import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { useSearchStore, useUIStore } from '@/store';
import { FilterPresets } from './FilterPresets';
import { GenreFilter } from './GenreFilter';
import { RangeFilters } from './RangeFilters';
import { StreamingPlatformFilter } from '@/shared/components/StreamingPlatformFilter';

interface AdvancedFilteringProps {
  contentType: 'anime' | 'manga';
  availableGenres: string[];
  availableStudios?: string[];
  availableAuthors?: string[];
}

const animeStatuses = ['Currently Airing', 'Finished Airing', 'Not Yet Aired', 'Cancelled'];
const mangaStatuses = ['Publishing', 'Finished', 'On Hiatus', 'Cancelled', 'Not Yet Published'];
const animeTypes = ['TV', 'Movie', 'OVA', 'ONA', 'Special', 'Music'];
const mangaTypes = ['Manga', 'Light Novel', 'One-shot', 'Doujinshi', 'Manhwa', 'Manhua'];
const sortOptions = [
  { value: 'score', label: 'Rating' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'year', label: 'Year' },
  { value: 'title', label: 'Title' },
  { value: 'members', label: 'Members' },
  { value: 'favorites', label: 'Favorites' }
];

export function AdvancedFilteringRefactored({
  contentType,
  availableGenres,
  availableStudios = [],
  availableAuthors = []
}: AdvancedFilteringProps) {
  const { filters, setFilters } = useSearchStore();
  const { modals, setModal } = useUIStore();
  const isOpen = modals.filterModal;
  const setIsOpen = (open: boolean) => setModal('filterModal', open);

  // Local state for filter inputs
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStudios, setSelectedStudios] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 10]);
  const [yearRange, setYearRange] = useState<[number, number]>([1960, new Date().getFullYear()]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const statuses = contentType === 'anime' ? animeStatuses : mangaStatuses;
  const types = contentType === 'anime' ? animeTypes : mangaTypes;

  // Apply filters
  const applyFilters = () => {
    setFilters({
      genres: selectedGenres,
      ...(contentType === 'anime' && { studios: selectedStudios }),
      ...(contentType === 'manga' && { authors: selectedAuthors }),
      score_min: scoreRange[0],
      score_max: scoreRange[1],
      year_min: yearRange[0],
      year_max: yearRange[1],
      status: selectedStatus,
      type: selectedType,
      sort_by: sortBy,
      order: sortOrder
    });
    setIsOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedStudios([]);
    setSelectedAuthors([]);
    setScoreRange([0, 10]);
    setYearRange([1960, new Date().getFullYear()]);
    setSelectedStatus('');
    setSelectedType('');
    setSortBy('score');
    setSortOrder('desc');
    setFilters({});
  };

  // Load preset
  const handleLoadPreset = (presetFilters: Record<string, any>) => {
    setSelectedGenres(presetFilters.genres || []);
    setSelectedStudios(presetFilters.studios || []);
    setSelectedAuthors(presetFilters.authors || []);
    setScoreRange([presetFilters.score_min || 0, presetFilters.score_max || 10]);
    setYearRange([presetFilters.year_min || 1960, presetFilters.year_max || new Date().getFullYear()]);
    setSelectedStatus(presetFilters.status || '');
    setSelectedType(presetFilters.type || '');
    setSortBy(presetFilters.sort_by || 'score');
    setSortOrder(presetFilters.order || 'desc');
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedGenres.length > 0) count++;
    if (contentType === 'anime' && selectedStudios.length > 0) count++;
    if (contentType === 'manga' && selectedAuthors.length > 0) count++;
    if (scoreRange[0] > 0 || scoreRange[1] < 10) count++;
    if (yearRange[0] > 1960 || yearRange[1] < new Date().getFullYear()) count++;
    if (selectedStatus) count++;
    if (selectedType) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const currentFilters = {
    genres: selectedGenres,
    ...(contentType === 'anime' && { studios: selectedStudios }),
    ...(contentType === 'manga' && { authors: selectedAuthors }),
    score_min: scoreRange[0],
    score_max: scoreRange[1],
    year_min: yearRange[0],
    year_max: yearRange[1],
    status: selectedStatus,
    type: selectedType,
    sort_by: sortBy,
    order: sortOrder
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Filter className="w-4 h-4" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-hidden">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <div className="space-y-6 mt-6">
            {/* Filter Presets */}
            <FilterPresets 
              contentType={contentType}
              currentFilters={currentFilters}
              onLoadPreset={handleLoadPreset}
            />

            <Separator />

            {/* Genres */}
            <GenreFilter
              availableGenres={availableGenres}
              selectedGenres={selectedGenres}
              onGenreChange={setSelectedGenres}
            />

            <Separator />

            {/* Score & Year Ranges */}
            <RangeFilters
              scoreRange={scoreRange}
              yearRange={yearRange}
              onScoreChange={setScoreRange}
              onYearChange={setYearRange}
            />

            <Separator />

            {/* Status & Type */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    {types.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Sort by</label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
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

            {/* Streaming Platforms */}
            {contentType === 'anime' && (
              <>
                <Separator />
                <StreamingPlatformFilter
                  selectedPlatforms={[]}
                  onPlatformChange={() => {}}
                />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}