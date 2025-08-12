import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/layouts/components/Navigation';
import { EmailVerificationBanner } from '@/features/user/components/EmailVerificationBanner';
import { useSearch } from '@/features/search/hooks/useSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Film, 
  BookOpen, 
  Star,
  Calendar,
  Users,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const tags = [
  'School', 'Magic', 'Demons', 'Military', 'Space', 'Historical', 
  'Martial Arts', 'Super Power', 'Vampire', 'Game', 'Music', 'Parody'
];

const statuses = ['Completed', 'Ongoing', 'Upcoming', 'Hiatus'];
const years = Array.from({ length: 30 }, (_, i) => 2024 - i);

// Mock content data
const mockContent = [
  {
    id: 1,
    title: 'Attack on Titan',
    type: 'anime',
    genres: ['Action', 'Drama', 'Fantasy'],
    year: 2013,
    status: 'Completed',
    rating: 9.0,
    image: '/placeholder.jpg'
  },
  {
    id: 2,
    title: 'One Piece',
    type: 'manga',
    genres: ['Action', 'Adventure', 'Comedy'],
    year: 1997,
    status: 'Ongoing',
    rating: 9.2,
    image: '/placeholder.jpg'
  }
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(mockContent);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Use the existing search hook for actual search functionality
  const { 
    results, 
    loading: searchLoading, 
    handleSearch 
  } = useSearch();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');

  // Perform search when query changes
  const performSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        await handleSearch(searchQuery, selectedType as any);
        // Use search results if available, otherwise use mock data
        if (results && results.length > 0) {
          setContent(results);
        } else {
          // Filter mock content based on search query
          const filtered = mockContent.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setContent(filtered);
        }
      } catch (error) {
        console.error('Search error:', error);
        setContent(mockContent);
      } finally {
        setLoading(false);
      }
    } else {
      setContent(mockContent);
    }
  }, [searchQuery, selectedType, handleSearch, results]);

  // Update URL when filters change
  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedYear) params.set('year', selectedYear);
    if (minRating) params.set('rating', minRating);

    setSearchParams(params);
  }, [searchQuery, selectedType, selectedGenre, selectedTag, selectedStatus, selectedYear, minRating, setSearchParams]);

  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedGenre('');
    setSelectedTag('');
    setSelectedStatus('');
    setSelectedYear('');
    setMinRating('');
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedGenre,
    selectedTag,
    selectedStatus,
    selectedYear,
    minRating
  ].filter(Boolean).length;

  return (
    <>
      <Navigation />
      <EmailVerificationBanner />
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Browse Content
                </h1>
                <p className="text-muted-foreground">Discover anime and manga with advanced filters</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="bg-black/40 border-pink-500/20 mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-300" />
                  <Input
                    placeholder="Search anime, manga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-pink-500/20 text-white placeholder-pink-300/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-black/40 border-pink-500/20 mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Filter className="h-5 w-5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-pink-400">
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-pink-300 mb-2">Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-white/5 border-pink-500/20">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="manga">Manga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium text-pink-300 mb-2">Genre</label>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="bg-white/5 border-pink-500/20">
                      <SelectValue placeholder="Any Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Genre</SelectItem>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre.toLowerCase()}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-medium text-pink-300 mb-2">Tag</label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="bg-white/5 border-pink-500/20">
                      <SelectValue placeholder="Any Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Tag</SelectItem>
                      {tags.map((tag) => (
                        <SelectItem key={tag} value={tag.toLowerCase()}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-pink-300 mb-2">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="bg-white/5 border-pink-500/20">
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Status</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status.toLowerCase()}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-pink-300 mb-2">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-white/5 border-pink-500/20">
                      <SelectValue placeholder="Any Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Year</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-pink-300 mb-2">Min Rating</label>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger className="bg-white/5 border-pink-500/20">
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Rating</SelectItem>
                      <SelectItem value="9">9.0+</SelectItem>
                      <SelectItem value="8">8.0+</SelectItem>
                      <SelectItem value="7">7.0+</SelectItem>
                      <SelectItem value="6">6.0+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              <Card className="bg-black/40 border-pink-500/20">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Searching...</p>
                </CardContent>
              </Card>
            ) : content.length > 0 ? (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                  : "space-y-4"
              )}>
                {content.map((item) => (
                  <Card 
                    key={item.id}
                    className="bg-black/40 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-pink-500/10"
                    onClick={() => navigate(`/${item.type}/${item.id}`)}
                  >
                    <CardContent className={cn("p-4", viewMode === 'list' && "flex items-center gap-4")}>
                      <div className={cn(
                        "aspect-[3/4] bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-3",
                        viewMode === 'list' && "w-16 h-20 mb-0 flex-shrink-0"
                      )}>
                        {item.type === 'anime' ? (
                          <Film className="h-8 w-8 text-pink-300" />
                        ) : (
                          <BookOpen className="h-8 w-8 text-pink-300" />
                        )}
                      </div>
                      
                      <div className={cn("space-y-2", viewMode === 'list' && "flex-1")}>
                        <h3 className="font-semibold text-white text-sm line-clamp-2">{item.title}</h3>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs capitalize",
                              item.type === 'anime' 
                                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                : "bg-green-500/20 text-green-400 border-green-500/30"
                            )}
                          >
                            {item.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-3 w-3" />
                            <span className="text-xs">{item.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item.year}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {item.genres.slice(0, viewMode === 'list' ? 5 : 2).map((genre) => (
                            <Badge 
                              key={genre}
                              variant="outline" 
                              className="text-xs border-pink-500/30 text-pink-300"
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-black/40 border-pink-500/20">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Browse;