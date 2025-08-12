import { useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

interface SearchAnalyticsEvent {
  searchQuery: string;
  searchType: 'instant' | 'manual' | 'voice' | 'suggestion';
  contentType: 'anime' | 'manga' | 'all';
  resultCount?: number;
  loadTime?: number;
  hasFilters?: boolean;
  filterTypes?: string[];
  viewMode?: 'grid' | 'list' | 'compact';
  position?: number; // For result clicks
  sessionId?: string;
}

interface SearchPerformanceMetrics {
  averageSearchTime: number;
  popularQueries: string[];
  searchConversionRate: number; // Searches that lead to clicks
  noResultsRate: number;
  voiceSearchUsage: number;
  filterUsage: number;
}

export const useSearchAnalytics = () => {
  const { trackEvent, trackTiming } = useAnalytics();

  // Track search query initiated
  const trackSearchStart = useCallback((params: {
    query: string;
    type: SearchAnalyticsEvent['searchType'];
    contentType: SearchAnalyticsEvent['contentType'];
    hasFilters?: boolean;
    filterTypes?: string[];
  }) => {
    trackEvent('search_started', {
      search_query: params.query,
      search_type: params.type,
      content_type: params.contentType,
      query_length: params.query.length,
      has_filters: params.hasFilters || false,
      filter_count: params.filterTypes?.length || 0,
      filter_types: params.filterTypes?.join(',') || '',
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track search results received
  const trackSearchResults = useCallback((params: {
    query: string;
    contentType: SearchAnalyticsEvent['contentType'];
    resultCount: number;
    loadTime: number;
    hasFilters?: boolean;
    viewMode?: SearchAnalyticsEvent['viewMode'];
  }) => {
    trackEvent('search_completed', {
      search_query: params.query,
      content_type: params.contentType,
      result_count: params.resultCount,
      load_time_ms: params.loadTime,
      has_results: params.resultCount > 0,
      has_filters: params.hasFilters || false,
      view_mode: params.viewMode || 'grid',
      timestamp: Date.now()
    });

    // Track search timing
    trackTiming('search_performance', params.loadTime, {
      search_query: params.query,
      content_type: params.contentType,
      result_count: params.resultCount
    });
  }, [trackEvent, trackTiming]);

  // Track search result clicked
  const trackSearchResultClick = useCallback((params: {
    query: string;
    resultId: string;
    resultTitle: string;
    resultType: 'anime' | 'manga';
    position: number;
    viewMode?: SearchAnalyticsEvent['viewMode'];
  }) => {
    trackEvent('search_result_clicked', {
      search_query: params.query,
      result_id: params.resultId,
      result_title: params.resultTitle,
      result_type: params.resultType,
      click_position: params.position,
      view_mode: params.viewMode || 'grid',
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track search refinement (filters applied)
  const trackSearchRefinement = useCallback((params: {
    query: string;
    filterType: string;
    filterValue: string | number;
    previousResultCount?: number;
    newResultCount?: number;
  }) => {
    trackEvent('search_refined', {
      search_query: params.query,
      filter_type: params.filterType,
      filter_value: params.filterValue.toString(),
      previous_result_count: params.previousResultCount || 0,
      new_result_count: params.newResultCount || 0,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track voice search usage
  const trackVoiceSearch = useCallback((params: {
    action: 'started' | 'completed' | 'error';
    query?: string;
    confidence?: number;
    errorType?: string;
    duration?: number;
  }) => {
    trackEvent('voice_search', {
      voice_action: params.action,
      search_query: params.query || '',
      confidence_score: params.confidence || 0,
      error_type: params.errorType || '',
      duration_ms: params.duration || 0,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track search suggestions interaction
  const trackSearchSuggestion = useCallback((params: {
    originalQuery: string;
    suggestedQuery: string;
    suggestionType: 'popular' | 'trending' | 'history' | 'autocomplete';
    position: number;
    action: 'viewed' | 'clicked';
  }) => {
    trackEvent('search_suggestion', {
      original_query: params.originalQuery,
      suggested_query: params.suggestedQuery,
      suggestion_type: params.suggestionType,
      suggestion_position: params.position,
      suggestion_action: params.action,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track search session metrics
  const trackSearchSession = useCallback((params: {
    sessionId: string;
    totalSearches: number;
    uniqueQueries: number;
    totalResults: number;
    totalClicks: number;
    sessionDuration: number;
    exitType: 'result_click' | 'new_search' | 'page_leave';
  }) => {
    const conversionRate = params.totalClicks / Math.max(params.totalSearches, 1);
    
    trackEvent('search_session_completed', {
      session_id: params.sessionId,
      total_searches: params.totalSearches,
      unique_queries: params.uniqueQueries,
      total_results: params.totalResults,
      total_clicks: params.totalClicks,
      session_duration_ms: params.sessionDuration,
      conversion_rate: conversionRate,
      exit_type: params.exitType,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track search performance issues
  const trackSearchError = useCallback((params: {
    query: string;
    errorType: 'timeout' | 'network' | 'server' | 'parsing';
    errorMessage: string;
    retryAttempt?: number;
  }) => {
    trackEvent('search_error', {
      search_query: params.query,
      error_type: params.errorType,
      error_message: params.errorMessage,
      retry_attempt: params.retryAttempt || 0,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track search filters usage
  const trackFilterUsage = useCallback((params: {
    query: string;
    filterType: 'year' | 'score' | 'genre' | 'studio' | 'status' | 'format';
    filterAction: 'applied' | 'removed' | 'cleared';
    filterValue?: string | number;
    resultImpact?: 'increased' | 'decreased' | 'no_change';
  }) => {
    trackEvent('search_filter_used', {
      search_query: params.query,
      filter_type: params.filterType,
      filter_action: params.filterAction,
      filter_value: params.filterValue?.toString() || '',
      result_impact: params.resultImpact || 'unknown',
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track view mode changes
  const trackViewModeChange = useCallback((params: {
    query: string;
    fromMode: SearchAnalyticsEvent['viewMode'];
    toMode: SearchAnalyticsEvent['viewMode'];
    resultCount: number;
  }) => {
    trackEvent('search_view_mode_changed', {
      search_query: params.query,
      from_view_mode: params.fromMode || 'grid',
      to_view_mode: params.toMode || 'grid',
      result_count: params.resultCount,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  // Track keyboard navigation usage
  const trackKeyboardNavigation = useCallback((params: {
    query: string;
    action: 'arrow_up' | 'arrow_down' | 'enter' | 'escape' | 'tab';
    currentPosition?: number;
    totalOptions?: number;
  }) => {
    trackEvent('search_keyboard_navigation', {
      search_query: params.query,
      keyboard_action: params.action,
      current_position: params.currentPosition || 0,
      total_options: params.totalOptions || 0,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  return {
    trackSearchStart,
    trackSearchResults,
    trackSearchResultClick,
    trackSearchRefinement,
    trackVoiceSearch,
    trackSearchSuggestion,
    trackSearchSession,
    trackSearchError,
    trackFilterUsage,
    trackViewModeChange,
    trackKeyboardNavigation
  };
};