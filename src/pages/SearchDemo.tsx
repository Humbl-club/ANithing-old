import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  UnifiedSearchBar,
  SearchFilters,
  SearchResults,
  VoiceSearch,
  type ViewMode,
  type SearchFilters as SearchFiltersType
} from '@/features/search/components';
import { useSearch } from '@/features/search/hooks/useSearch';
import { useSearchAnalytics } from '@/hooks/useSearchAnalytics';
import { 
  Search, 
  Mic, 
  Filter, 
  Grid3x3, 
  List, 
  LayoutGrid, 
  Star, 
  TrendingUp, 
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function SearchDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [contentType, setContentType] = useState<'anime' | 'manga' | 'all'>('all');
  const [showAdvancedExample, setShowAdvancedExample] = useState(false);
  
  const { trackSearchStart, trackSearchResults } = useSearchAnalytics();
  
  const { results, setSearchQuery: performSearch } = useSearch({
    contentType,
    sortBy: filters.sortBy || 'relevance'
  });

  const handleSearch = useCallback((query: string, searchFilters?: SearchFiltersType) => {
    setSearchQuery(query);
    setFilters(searchFilters || {});
    
    // Track search start
    trackSearchStart({
      query,
      type: 'manual',
      contentType,
      hasFilters: Object.keys(searchFilters || {}).length > 0,
      filterTypes: Object.keys(searchFilters || {})
    });
    
    // Perform search
    performSearch(query);
    
    // Simulate tracking results (in real app, this would be in a useEffect)
    setTimeout(() => {
      trackSearchResults({
        query,
        contentType,
        resultCount: results.items.length,
        loadTime: Math.random() * 1000 + 200, // Simulate load time
        hasFilters: Object.keys(searchFilters || {}).length > 0,
        viewMode
      });
    }, 500);
  }, [contentType, trackSearchStart, trackSearchResults, performSearch, results.items.length, viewMode]);

  const handleVoiceResult = useCallback((transcript: string) => {
    handleSearch(transcript);
  }, [handleSearch]);

  const handleResultClick = useCallback((result: any) => {
    // Navigate to result detail page
    // In a real app, this would navigate to the detail page
  }, []);

  const mockSearchResults = [
    {
      id: '1',
      title: 'Attack on Titan',
      title_english: 'Attack on Titan',
      image_url: 'https://via.placeholder.com/300x400/0066cc/ffffff?text=AOT',
      score: 9.0,
      type: 'anime',
      year: 2013,
      episodes: 75,
      status: 'Finished Airing',
      genres: [{ name: 'Action' }, { name: 'Drama' }, { name: 'Fantasy' }],
      description: 'Humanity fights for survival against giant humanoid Titans.'
    },
    {
      id: '2',
      title: 'One Piece',
      title_english: 'One Piece',
      image_url: 'https://via.placeholder.com/300x400/ff6600/ffffff?text=OP',
      score: 8.9,
      type: 'anime',
      year: 1999,
      episodes: 1000,
      status: 'Currently Airing',
      genres: [{ name: 'Adventure' }, { name: 'Comedy' }, { name: 'Shounen' }],
      description: 'A pirate adventure to find the legendary treasure, One Piece.'
    },
    {
      id: '3',
      title: 'Death Note',
      title_english: 'Death Note',
      image_url: 'https://via.placeholder.com/300x400/333333/ffffff?text=DN',
      score: 9.0,
      type: 'anime',
      year: 2006,
      episodes: 37,
      status: 'Finished Airing',
      genres: [{ name: 'Supernatural' }, { name: 'Thriller' }, { name: 'Psychological' }],
      description: 'A high school student discovers a supernatural notebook.'
    }
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Enhanced Search System Demo</h1>
        <p className="text-lg text-muted-foreground">
          Production-ready search with advanced filtering, voice input, and analytics
        </p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Search</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Basic Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <UnifiedSearchBar
                    placeholder={`Search ${contentType === 'all' ? 'anime & manga' : contentType}...`}
                    onSearch={handleSearch}
                    contentType={contentType}
                    variant="hero"
                    enableVoiceSearch={true}
                    enableAdvancedFilters={true}
                    enableSuggestions={true}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {(['all', 'anime', 'manga'] as const).map((type) => (
                  <Badge
                    key={type}
                    variant={contentType === type ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setContentType(type)}
                  >
                    {type === 'all' ? 'All Content' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>

              {searchQuery && (
                <SearchResults
                  query={searchQuery}
                  isSearching={results.isSearching}
                  searchResults={mockSearchResults}
                  onResultClick={handleResultClick}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  totalResults={mockSearchResults.length}
                  showStats={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SearchFilters
                  filters={filters}
                  contentType={contentType}
                  onChange={setFilters}
                  onClear={() => setFilters({})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Click the microphone to start voice search:
                </div>
                <div className="flex gap-4 items-center">
                  <VoiceSearch
                    onStart={() => {/* Voice search started */}}
                    onResult={handleVoiceResult}
                    onError={(error) => console.error('Voice search error:', error)}
                    variant="floating"
                    showTranscript={true}
                  />
                  <div className="text-sm text-muted-foreground">
                    Try saying: "Search for Attack on Titan"
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                View Modes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                {(['grid', 'list', 'compact'] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="flex items-center gap-2"
                  >
                    {mode === 'grid' && <Grid3x3 className="w-4 h-4" />}
                    {mode === 'list' && <List className="w-4 h-4" />}
                    {mode === 'compact' && <LayoutGrid className="w-4 h-4" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Switch between different result layouts for optimal viewing experience.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Instant Search</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Real-time search with 300ms debouncing for optimal performance.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Smart Suggestions</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Autocomplete with popular and trending search suggestions.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Search History</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Persistent search history with user-specific storage.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mic className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Voice Input</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Speech recognition with error handling and visual feedback.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Advanced Filters</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive filtering by year, score, genre, studio, and more.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Analytics Tracking</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detailed search analytics for optimization and insights.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Focus search</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Toggle filters</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+F</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Navigate results</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Select result</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Close search</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Clear input</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+U</kbd>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Search Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">1,234</div>
                    <div className="text-sm text-muted-foreground">Total Searches</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">2.3s</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Tracked Events</h3>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted/30 rounded">
                        <span>Search Started</span>
                        <Badge variant="outline">Event</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/30 rounded">
                        <span>Search Completed</span>
                        <Badge variant="outline">Event</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/30 rounded">
                        <span>Result Clicked</span>
                        <Badge variant="outline">Event</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/30 rounded">
                        <span>Voice Search Used</span>
                        <Badge variant="outline">Event</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/30 rounded">
                        <span>Filters Applied</span>
                        <Badge variant="outline">Event</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/30 rounded">
                        <span>View Mode Changed</span>
                        <Badge variant="outline">Event</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Search Response Time</span>
                    <span className="text-green-600">Tracked ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>No Results Rate</span>
                    <span className="text-green-600">Tracked ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Click-through Rate</span>
                    <span className="text-green-600">Tracked ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Voice Search Accuracy</span>
                    <span className="text-green-600">Tracked ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filter Usage Patterns</span>
                    <span className="text-green-600">Tracked ✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}