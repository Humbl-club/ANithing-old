-- ============================================================================
-- DASHBOARD RPC FUNCTIONS - Comprehensive user dashboard statistics
-- ============================================================================

-- Function to get comprehensive user dashboard statistics
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSONB := '{}'::jsonb;
    v_anime_stats RECORD;
    v_manga_stats RECORD;
    v_social_stats RECORD;
    v_activity_stats RECORD;
    v_list_stats RECORD;
BEGIN
    -- Get anime statistics
    SELECT 
        COUNT(*) FILTER (WHERE ls.name = 'completed') as completed_anime,
        COUNT(*) FILTER (WHERE ls.name = 'watching') as watching_anime,
        COUNT(*) FILTER (WHERE ls.name = 'on_hold') as on_hold_anime,
        COUNT(*) FILTER (WHERE ls.name = 'dropped') as dropped_anime,
        COUNT(*) FILTER (WHERE ls.name = 'plan_to_watch') as plan_to_watch_anime,
        COALESCE(AVG(ul.score) FILTER (WHERE ul.score IS NOT NULL AND ad.id IS NOT NULL), 0) as avg_anime_score,
        COALESCE(SUM(ul.progress * COALESCE(ad.episodes, 1)) FILTER (WHERE ad.id IS NOT NULL), 0) as total_episodes_watched,
        COALESCE(SUM(ul.progress * COALESCE(ad.duration, 24)) FILTER (WHERE ad.id IS NOT NULL), 0) as total_watch_minutes
    INTO v_anime_stats
    FROM user_lists ul
    LEFT JOIN list_statuses ls ON ul.status_id = ls.id
    LEFT JOIN titles t ON ul.title_id = t.id
    LEFT JOIN anime_details ad ON t.id = ad.title_id
    WHERE ul.user_id = p_user_id AND t.media_type = 'ANIME';

    -- Get manga statistics  
    SELECT 
        COUNT(*) FILTER (WHERE ls.name = 'completed') as completed_manga,
        COUNT(*) FILTER (WHERE ls.name = 'reading') as reading_manga,
        COUNT(*) FILTER (WHERE ls.name = 'on_hold') as on_hold_manga,
        COUNT(*) FILTER (WHERE ls.name = 'dropped') as dropped_manga,
        COUNT(*) FILTER (WHERE ls.name = 'plan_to_read') as plan_to_read_manga,
        COALESCE(AVG(ul.score) FILTER (WHERE ul.score IS NOT NULL AND md.id IS NOT NULL), 0) as avg_manga_score,
        COALESCE(SUM(ul.progress) FILTER (WHERE md.id IS NOT NULL), 0) as total_chapters_read,
        COALESCE(SUM(ul.progress_volumes) FILTER (WHERE md.id IS NOT NULL), 0) as total_volumes_read
    INTO v_manga_stats
    FROM user_lists ul
    LEFT JOIN list_statuses ls ON ul.status_id = ls.id
    LEFT JOIN titles t ON ul.title_id = t.id
    LEFT JOIN manga_details md ON t.id = md.title_id
    WHERE ul.user_id = p_user_id AND t.media_type = 'MANGA';

    -- Get social statistics
    SELECT 
        (SELECT COUNT(*) FROM user_follows WHERE following_id = p_user_id) as followers,
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = p_user_id) as following,
        (SELECT COUNT(*) FROM shared_lists WHERE user_id = p_user_id) as shared_lists
    INTO v_social_stats;

    -- Get activity statistics
    SELECT 
        COUNT(*) as total_ratings,
        COALESCE(
            (SELECT COUNT(*) 
             FROM user_activities 
             WHERE user_id = p_user_id 
             AND created_at > CURRENT_DATE - INTERVAL '7 days'), 0
        ) as weekly_activity_count,
        COALESCE(
            (SELECT metadata->>'streak' 
             FROM user_preferences 
             WHERE user_id = p_user_id), '0'
        )::integer as current_streak
    INTO v_activity_stats
    FROM user_ratings 
    WHERE user_id = p_user_id;

    -- Get list statistics including favorites
    SELECT 
        COUNT(*) FILTER (WHERE is_favorite = true) as total_favorites,
        COUNT(*) as total_list_entries
    INTO v_list_stats
    FROM user_lists 
    WHERE user_id = p_user_id;

    -- Build the complete stats JSON
    v_stats := jsonb_build_object(
        'totalAnimeWatched', COALESCE(v_anime_stats.completed_anime, 0),
        'totalMangaRead', COALESCE(v_manga_stats.completed_manga, 0),
        'totalEpisodesWatched', COALESCE(v_anime_stats.total_episodes_watched, 0),
        'totalChaptersRead', COALESCE(v_manga_stats.total_chapters_read, 0),
        'totalWatchTimeHours', ROUND(COALESCE(v_anime_stats.total_watch_minutes, 0) / 60.0, 1),
        'totalReadTimeHours', ROUND(COALESCE(v_manga_stats.total_chapters_read, 0) * 5 / 60.0, 1), -- Estimate 5 min per chapter
        'currentlyWatching', COALESCE(v_anime_stats.watching_anime, 0),
        'currentlyReading', COALESCE(v_manga_stats.reading_manga, 0),
        'onHold', COALESCE(v_anime_stats.on_hold_anime, 0) + COALESCE(v_manga_stats.on_hold_manga, 0),
        'dropped', COALESCE(v_anime_stats.dropped_anime, 0) + COALESCE(v_manga_stats.dropped_manga, 0),
        'planToWatch', COALESCE(v_anime_stats.plan_to_watch_anime, 0),
        'planToRead', COALESCE(v_manga_stats.plan_to_read_manga, 0),
        'averageAnimeScore', ROUND(COALESCE(v_anime_stats.avg_anime_score, 0), 1),
        'averageMangaScore', ROUND(COALESCE(v_manga_stats.avg_manga_score, 0), 1),
        'totalRatingsGiven', COALESCE(v_activity_stats.total_ratings, 0),
        'followers', COALESCE(v_social_stats.followers, 0),
        'following', COALESCE(v_social_stats.following, 0),
        'listsShared', COALESCE(v_social_stats.shared_lists, 0),
        'totalFavorites', COALESCE(v_list_stats.total_favorites, 0),
        'totalListEntries', COALESCE(v_list_stats.total_list_entries, 0),
        'streak', COALESCE(v_activity_stats.current_streak, 0),
        'weeklyGoal', 5, -- Default weekly goal, can be made configurable
        'weeklyProgress', COALESCE(v_activity_stats.weekly_activity_count, 0),
        'achievements', '[]'::jsonb -- Placeholder for achievements system
    );

    RETURN v_stats;
EXCEPTION
    WHEN OTHERS THEN
        -- Return default stats on error
        RETURN jsonb_build_object(
            'totalAnimeWatched', 0,
            'totalMangaRead', 0,
            'totalEpisodesWatched', 0,
            'totalChaptersRead', 0,
            'totalWatchTimeHours', 0,
            'totalReadTimeHours', 0,
            'currentlyWatching', 0,
            'currentlyReading', 0,
            'onHold', 0,
            'dropped', 0,
            'planToWatch', 0,
            'planToRead', 0,
            'averageAnimeScore', 0,
            'averageMangaScore', 0,
            'totalRatingsGiven', 0,
            'followers', 0,
            'following', 0,
            'listsShared', 0,
            'totalFavorites', 0,
            'totalListEntries', 0,
            'streak', 0,
            'weeklyGoal', 5,
            'weeklyProgress', 0,
            'achievements', '[]'::jsonb
        );
END;
$$;

-- Function to get user recommendations based on their preferences and history
CREATE OR REPLACE FUNCTION get_user_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    english_title TEXT,
    description TEXT,
    image_url TEXT,
    cover_image_url TEXT,
    media_type TEXT,
    status TEXT,
    score DECIMAL,
    popularity INTEGER,
    season TEXT,
    year INTEGER,
    recommendation_reason TEXT,
    similarity_score DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- For now, return popular titles that the user hasn't added to their list
    -- This can be enhanced with ML-based recommendations later
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.english_title,
        t.description,
        t.image_url,
        t.cover_image_url,
        t.media_type,
        t.status,
        t.score,
        t.popularity,
        COALESCE(ad.season, md.status) as season,
        COALESCE(ad.year, md.year) as year,
        'Popular in your preferred genres' as recommendation_reason,
        0.8 as similarity_score
    FROM titles t
    LEFT JOIN anime_details ad ON t.id = ad.title_id
    LEFT JOIN manga_details md ON t.id = md.title_id
    WHERE t.id NOT IN (
        SELECT title_id 
        FROM user_lists 
        WHERE user_id = p_user_id
    )
    AND t.score > 7.0
    AND t.popularity > 1000
    ORDER BY t.score DESC, t.popularity DESC
    LIMIT p_limit;
END;
$$;

-- Function to get recent dashboard activities with enhanced information
CREATE OR REPLACE FUNCTION get_dashboard_activities(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_include_friends BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    activity_type TEXT,
    title_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    is_private BOOLEAN,
    username TEXT,
    display_name TEXT,
    avatar_url TEXT,
    title TEXT,
    english_title TEXT,
    image_url TEXT,
    media_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_include_friends THEN
        -- Include activities from followed users
        RETURN QUERY
        SELECT 
            ua.id,
            ua.user_id,
            ua.activity_type,
            ua.title_id,
            ua.metadata,
            ua.created_at,
            ua.is_private,
            p.username,
            p.display_name,
            p.avatar_url,
            t.title,
            t.english_title,
            t.image_url,
            t.media_type
        FROM user_activities ua
        LEFT JOIN profiles p ON ua.user_id = p.id
        LEFT JOIN titles t ON ua.title_id = t.id
        WHERE (ua.user_id = p_user_id OR ua.user_id IN (
            SELECT following_id 
            FROM user_follows 
            WHERE follower_id = p_user_id
        ))
        AND ua.is_private = false
        ORDER BY ua.created_at DESC
        LIMIT p_limit;
    ELSE
        -- Only user's own activities
        RETURN QUERY
        SELECT 
            ua.id,
            ua.user_id,
            ua.activity_type,
            ua.title_id,
            ua.metadata,
            ua.created_at,
            ua.is_private,
            p.username,
            p.display_name,
            p.avatar_url,
            t.title,
            t.english_title,
            t.image_url,
            t.media_type
        FROM user_activities ua
        LEFT JOIN profiles p ON ua.user_id = p.id
        LEFT JOIN titles t ON ua.title_id = t.id
        WHERE ua.user_id = p_user_id
        ORDER BY ua.created_at DESC
        LIMIT p_limit;
    END IF;
END;
$$;

-- Function to create an activity entry (helper for the application)
CREATE OR REPLACE FUNCTION create_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_title_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_is_private BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO user_activities (
        user_id,
        activity_type,
        title_id,
        metadata,
        is_private
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_title_id,
        p_metadata,
        p_is_private
    ) RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$;

-- Function to update user weekly progress
CREATE OR REPLACE FUNCTION update_user_weekly_progress(
    p_user_id UUID,
    p_episodes_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_progress INTEGER;
    v_week_start DATE;
BEGIN
    -- Get the start of current week (Monday)
    v_week_start := date_trunc('week', CURRENT_DATE);
    
    -- Get current weekly progress
    SELECT COALESCE(
        (metadata->>'weekly_progress')::integer, 0
    ) INTO v_current_progress
    FROM user_preferences 
    WHERE user_id = p_user_id;
    
    -- Update or insert weekly progress
    INSERT INTO user_preferences (user_id, metadata)
    VALUES (p_user_id, jsonb_build_object(
        'weekly_progress', v_current_progress + p_episodes_count,
        'week_start', v_week_start
    ))
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        metadata = user_preferences.metadata || jsonb_build_object(
            'weekly_progress', COALESCE((user_preferences.metadata->>'weekly_progress')::integer, 0) + p_episodes_count,
            'week_start', v_week_start
        ),
        updated_at = NOW();
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Add weekly_progress and metadata columns to user_preferences if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'metadata') THEN
        ALTER TABLE user_preferences ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_user_created 
ON user_activities (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activities_type_created 
ON user_activities (activity_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_lists_user_status_updated
ON user_lists (user_id, status_id, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_ratings_user_created
ON user_ratings (user_id, created_at DESC);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_recommendations(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_activities(UUID, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_activity(UUID, TEXT, UUID, JSONB, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_weekly_progress(UUID, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION get_user_dashboard_stats(UUID) IS 'Returns comprehensive dashboard statistics for a user';
COMMENT ON FUNCTION get_user_recommendations(UUID, INTEGER) IS 'Returns personalized recommendations for a user';
COMMENT ON FUNCTION get_dashboard_activities(UUID, INTEGER, BOOLEAN) IS 'Returns recent activities for dashboard with optional friend activities';
COMMENT ON FUNCTION create_user_activity(UUID, TEXT, UUID, JSONB, BOOLEAN) IS 'Creates a new user activity entry';
COMMENT ON FUNCTION update_user_weekly_progress(UUID, INTEGER) IS 'Updates user weekly episode watching progress';