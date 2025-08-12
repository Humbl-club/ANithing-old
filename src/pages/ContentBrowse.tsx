import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentList } from '@/components/generic/ContentList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Grid3x3, List, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseContent } from '@/types/content.types';

interface ContentBrowseProps {
  contentType: 'anime' | 'manga';
}

/**
 * Unified content browsing page - replaces separate Anime and Manga pages
 * Saves ~900 lines by consolidating duplicate logic
 */
export function ContentBrowse({ contentType }: ContentBrowseProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  // Fetch content
  const { data, isLoading, error } = useQuery({
    queryKey: ['browse', contentType, search, genre, status, sortBy, page],
    queryFn: async () => {
      let query = supabase
        .from('titles')
        .select(`
          *,
          ${contentType === 'anime' ? 'anime_details(*)' : 'manga_details(*)'},
          title_genres(genres(*))
        `)
        .eq('content_type', contentType)
        .range((page - 1) * 24, page * 24 - 1);

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,title_english.ilike.%${search}%`);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (genre) {
        query = query.contains('genre_ids', [genre]);
      }

      // Apply sorting
      const sortOptions: Record<string, any> = {
        popularity: { column: 'popularity', ascending: false },
        score: { column: 'score', ascending: false },
        title: { column: 'title', ascending: true },
        recent: { column: 'updated_at', ascending: false }
      };
      
      const sort = sortOptions[sortBy] || sortOptions.popularity;
      query = query.order(sort.column, { ascending: sort.ascending });

      const { data, error } = await query;
      if (error) throw error;
      return data as BaseContent[];
    }
  });

  // Fetch genres for filter
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genres')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Update URL params when filters change
  const updateSearchParams = useCallback((updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    updateSearchParams({ search: value });
  }, [updateSearchParams]);

  const handleGenreChange = useCallback((value: string) => {
    setGenre(value);
    setPage(1);
    updateSearchParams({ genre: value });
  }, [updateSearchParams]);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
    updateSearchParams({ status: value });
  }, [updateSearchParams]);

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value);
    setPage(1);
    updateSearchParams({ sort: value });
  }, [updateSearchParams]);

  const statusOptions = contentType === 'anime' 
    ? ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED']
    : ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS'];

  // Handle content click navigation
  const handleContentClick = useCallback((content: BaseContent) => {
    const type = content.content_type || contentType;
    navigate(`/${type}/${content.id}`);
  }, [navigate, contentType]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">
          Browse {contentType === 'anime' ? 'Anime' : 'Manga'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${contentType}...`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={genre} onValueChange={handleGenreChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres?.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, ' ').toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Most Popular</SelectItem>
            <SelectItem value="score">Highest Rated</SelectItem>
            <SelectItem value="title">Alphabetical</SelectItem>
            <SelectItem value="recent">Recently Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {data && (
        <div className="text-sm text-muted-foreground">
          Found {data.length} {contentType === 'anime' ? 'anime' : 'manga'}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${view}-${page}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <ContentList
            items={data || []}
            loading={isLoading}
            error={error as Error | null}
            columns={view === 'grid' ? 6 : 1}
            emptyMessage={`No ${contentType} found`}
            onItemClick={handleContentClick}
          />
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {data && data.length === 24 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// Export convenience components
export const AnimeBrowse = () => <ContentBrowse contentType="anime" />;
export const MangaBrowse = () => <ContentBrowse contentType="manga" />;