import { memo, useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { type ListStatus } from '@/types/userLists';
import { useDebounce } from '@/utils/performance';

interface ListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  listStatuses: ListStatus[];
  contentType: 'anime' | 'manga' | 'both';
  totalItems: number;
  filteredCount: number;
}

const sortOptions = [
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'progress', label: 'Progress' },
  { value: 'rating', label: 'Rating' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'added_at', label: 'Date Added' }
];

const ListFiltersComponent = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  listStatuses,
  contentType,
  totalItems,
  filteredCount
}: ListFiltersProps) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm);
  
  // Debounce search to avoid excessive filtering
  const debouncedSearchChange = useDebounce(onSearchChange, 300);
  
  // Update internal search when external searchTerm changes
  useEffect(() => {
    setInternalSearchTerm(searchTerm);
  }, [searchTerm]);
  
  // Handle internal search change with debouncing
  const handleSearchChange = (value: string) => {
    setInternalSearchTerm(value);
    debouncedSearchChange(value);
  };

  const availableStatuses = useMemo(() => 
    listStatuses.filter(status => 
      status.media_type === contentType || status.media_type === 'both'
    ),
    [listStatuses, contentType]
  );

  return (
    <div className="space-y-4">
      {/* Search and Status Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search your ${contentType} list...`}
            value={internalSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
      </div>
      
      {/* Sort Controls and Count Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-40">
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
          
          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">A-Z / Low-High</SelectItem>
              <SelectItem value="desc">Z-A / High-Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Count */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredCount} of {totalItems}
          </Badge>
          {filteredCount !== totalItems && (
            <span className="text-sm text-muted-foreground">
              (filtered)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize component for performance optimization
export const ListFilters = memo(ListFiltersComponent);