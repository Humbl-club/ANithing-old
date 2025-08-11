# AniList GraphQL Import System Documentation

## 📋 Overview

This document outlines the comprehensive data import system for anime and manga data from the AniList GraphQL API, including all limitations, best practices, and ongoing maintenance requirements.

## 🔗 AniList API Details

### Rate Limits & Constraints
- **Current Rate Limit**: 30 requests/minute (degraded state)
- **Normal Rate Limit**: 90 requests/minute  
- **Burst Protection**: Active - prevents rapid consecutive requests
- **Max Items Per Page**: 50 items
- **Authentication**: Not required for public data access
- **API Endpoint**: `https://graphql.anilist.co`

### Response Headers
```
X-RateLimit-Limit: 90
X-RateLimit-Remaining: 59
Retry-After: 30 (when rate limited)
X-RateLimit-Reset: 1502035959 (Unix timestamp)
```

### Error Handling
- **429 Too Many Requests**: Includes retry-after header
- **403 Forbidden**: API temporarily unavailable
- **Manual IP Blocking**: Rare, for excessive usage

## 🏗️ Implementation Architecture

### Core Components

#### 1. Import Functions
- **`import-anime`**: Handles anime data import from AniList
- **`import-manga`**: Handles manga data import from AniList  
- **`import-data`**: Orchestrates both imports with rate limiting

#### 2. Database Schema
```sql
-- Core tables
titles (id, anilist_id, title, synopsis, image_url, score, etc.)
anime_details (title_id, episodes, aired_from, status, etc.)
manga_details (title_id, chapters, volumes, status, etc.)

-- Relationship tables
title_genres (title_id, genre_id)
title_studios (title_id, studio_id)
title_authors (title_id, author_id)
```

#### 3. RPC Functions
```sql
get_trending_anime(limit_param INT)
get_trending_manga(limit_param INT)
get_recent_anime(limit_param INT)
get_recent_manga(limit_param INT)
```

## 📊 Data Flow & Structure

### GraphQL Queries

#### Anime Query
```graphql
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total, currentPage, lastPage, hasNextPage }
    media(type: ANIME, sort: POPULARITY_DESC) {
      id, title { romaji, english, native }
      description, coverImage { large, color }
      averageScore, popularity, favourites, episodes
      status, format, season, seasonYear
      startDate { year, month, day }
      endDate { year, month, day }
      nextAiringEpisode { airingAt, episode }
      genres, studios(isMain: true) { nodes { name } }
      trailer { id, site }
    }
  }
}
```

#### Manga Query
```graphql
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total, currentPage, lastPage, hasNextPage }
    media(type: MANGA, sort: POPULARITY_DESC) {
      id, title { romaji, english, native }
      description, coverImage { large, color }
      averageScore, popularity, favourites
      chapters, volumes, status, format
      startDate { year, month, day }
      endDate { year, month, day }
      genres, staff(perPage: 10) {
        edges { role, node { name { full } } }
      }
    }
  }
}
```

## ⚙️ Configuration & Settings

### Optimal Import Parameters
```javascript
const importConfig = {
  itemsPerPage: 25,        // Balanced for rate limits
  maxPages: 3,             // Conservative for single run
  delayBetweenRequests: 2500, // 2.5 seconds
  maxRetries: 3,           // For failed requests
  retryDelay: 5000         // 5 seconds between retries
}
```

### Rate Limiting Implementation
```javascript
// Built-in rate limiting in import functions
const rateLimit = {
  maxRequestsPerMinute: 25,  // Conservative limit
  burstProtection: true,     // Wait between requests
  exponentialBackoff: true   // For 429 errors
}
```

## 🚀 Usage Guide

### Manual Import
```bash
# Run comprehensive import
node bulk-import.js

# Check database status
node check-data.js

# Verify frontend connections
node frontend-verification.js
```

### Programmatic Import
```javascript
// Via edge function
const response = await fetch('/functions/v1/import-data', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'both',     // 'anime', 'manga', or 'both'
    pages: 3,         // Number of pages
    itemsPerPage: 25  // Items per page
  })
});
```

## 📈 Ongoing Data Population Strategy

### Recommended Schedule
- **Initial Population**: Run bulk import 2-3 times with delays
- **Regular Updates**: Once per hour maximum
- **Incremental Updates**: Use `last_sync_check` field for efficiency
- **Peak Hours**: Avoid during high AniList usage (weekends, evenings JST)

### Monitoring & Maintenance
```javascript
// Monitor rate limit headers
const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
const rateLimitReset = response.headers.get('X-RateLimit-Reset');

// Track import success rates
const successRate = (imported / (imported + errors)) * 100;

// Monitor database growth
SELECT COUNT(*) FROM titles WHERE created_at > NOW() - INTERVAL '1 hour';
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Rate Limiting (429 Errors)
```javascript
// Solution: Implement exponential backoff
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await new Promise(resolve => 
    setTimeout(resolve, parseInt(retryAfter) * 1000)
  );
}
```

#### 2. API Unavailable (403 Errors)
- **Cause**: AniList API temporarily down
- **Solution**: Wait and retry later, monitor AniList Discord

#### 3. Duplicate Data
- **Cause**: Running imports too frequently
- **Solution**: Use `anilist_id` for deduplication

#### 4. Missing Detail Records
- **Cause**: Failed upsert operations
- **Solution**: Use explicit insert/update pattern (already implemented)

## 📊 Performance Optimization

### Database Indexing
```sql
-- Essential indexes for performance
CREATE INDEX idx_titles_anilist_id ON titles(anilist_id);
CREATE INDEX idx_titles_content_type ON titles(content_type);
CREATE INDEX idx_titles_popularity ON titles(popularity DESC);
CREATE INDEX idx_titles_score ON titles(score DESC);
```

### Caching Strategy
- **Frontend**: React Query with 5-minute stale time
- **Database**: RPC functions for complex joins
- **CDN**: Image URLs from AniList (external caching)

### Query Optimization
```sql
-- Use indexed queries
SELECT * FROM titles 
WHERE content_type = 'anime' 
ORDER BY popularity DESC 
LIMIT 20;

-- Avoid expensive joins for listing
SELECT t.*, ad.episodes, ad.status 
FROM titles t 
INNER JOIN anime_details ad ON t.id = ad.title_id 
WHERE t.content_type = 'anime';
```

## 🔐 Security & Compliance

### Data Privacy
- **Public Data Only**: No user-specific information
- **Adult Content**: Filtered where possible
- **Attribution**: Credit AniList as data source

### API Compliance
- **Terms of Service**: Follow AniList ToS
- **Rate Limiting**: Never exceed limits
- **Error Handling**: Graceful degradation
- **Monitoring**: Track usage patterns

### Content Filtering
```javascript
// Filter adult content for app stores
const isAdultContent = media.isAdult || 
  media.genres?.includes('Hentai') ||
  media.genres?.includes('Ecchi');

if (isAdultContent && FILTER_ADULT_CONTENT) {
  continue; // Skip this entry
}
```

## 📱 Frontend Integration

### Components Connected
- ✅ **Home Page**: Trending/recent content via RPC functions
- ✅ **Anime List**: Direct table queries with joins
- ✅ **Manga List**: Direct table queries with joins  
- ✅ **Detail Pages**: Edge functions for comprehensive data
- ✅ **Search**: Full-text search across titles

### Data Transformation
```javascript
// Frontend expects specific format
const transformedAnime = {
  id: data.id,
  title: data.title,
  episodes: data.anime_details?.episodes,
  score: data.score,
  image_url: data.image_url,
  genres: data.genres?.map(g => g.name) || []
};
```

## 🎯 Success Metrics

### Current Status (Post-Implementation)
- **Database Records**: 50+ titles (25 anime, 25 manga)
- **Success Rate**: 100% for recent imports
- **Frontend**: All components connected and working
- **Rate Limit Compliance**: Full compliance with 2.5s delays
- **Error Handling**: Comprehensive 429/503 handling

### Growth Targets
- **Short Term**: 500+ titles within first week
- **Medium Term**: 2000+ titles within first month
- **Long Term**: Incremental updates for new releases

## 🔄 Future Enhancements

### Planned Features
1. **Incremental Updates**: Only sync changed data
2. **Image Caching**: Local storage for faster loading
3. **Real-time Updates**: WebSocket for airing episodes
4. **Advanced Filtering**: Genre combinations, studios
5. **User Synchronization**: Personal lists (requires OAuth)

### Scaling Considerations
1. **Rate Limit Increase**: Request higher limits from AniList
2. **Multiple Sources**: Integrate additional APIs
3. **Distributed Imports**: Multiple edge functions
4. **Database Sharding**: Separate anime/manga databases

---

## 📞 Support & Resources

- **AniList API Docs**: https://docs.anilist.co/
- **GraphQL Playground**: https://studio.apollographql.com/sandbox/explorer?endpoint=https://graphql.anilist.co
- **Rate Limit Requests**: contact@anilist.co
- **Community Discord**: AniList Discord server

**Last Updated**: August 8, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
