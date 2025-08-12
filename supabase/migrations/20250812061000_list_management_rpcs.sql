-- ============================================================================
-- LIST MANAGEMENT RPCS
-- Functions for enhanced list operations with optimizations
-- ============================================================================

-- Function: Bulk update user list items
CREATE OR REPLACE FUNCTION bulk_update_user_list_items(
  item_ids UUID[],
  update_data JSONB
)
RETURNS TABLE(
  id UUID,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  allowed_fields TEXT[] := ARRAY[
    'status_id', 'score', 'progress', 'progress_volumes', 
    'start_date', 'finish_date', 'notes', 'is_favorite', 
    'is_private', 'rewatch_count', 'tags', 'custom_status',
    'priority', 'visibility'
  ];
  field_name TEXT;
  update_query TEXT := 'UPDATE user_lists SET updated_at = NOW()';
  where_clause TEXT := ' WHERE id = ANY($1) AND user_id = auth.uid()';
BEGIN
  -- Build dynamic update query with only allowed fields
  FOREACH field_name IN ARRAY array_agg(jsonb_object_keys(update_data))
  LOOP
    IF field_name = ANY(allowed_fields) THEN
      update_query := update_query || ', ' || field_name || ' = ($2->>''' || field_name || ''')';
      
      -- Handle special data type conversions
      IF field_name IN ('score', 'personal_rating') THEN
        update_query := update_query || '::decimal(3,1)';
      ELSIF field_name IN ('progress', 'progress_volumes', 'priority', 'rewatch_count') THEN
        update_query := update_query || '::integer';
      ELSIF field_name IN ('start_date', 'finish_date') THEN
        update_query := update_query || '::date';
      ELSIF field_name IN ('is_favorite', 'is_private') THEN
        update_query := update_query || '::boolean';
      ELSIF field_name = 'tags' THEN
        update_query := update_query || '::text[]';
      END IF;
    END IF;
  END LOOP;
  
  update_query := update_query || where_clause || ' RETURNING user_lists.id, user_lists.updated_at';
  
  RETURN QUERY EXECUTE update_query USING item_ids, update_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Bulk update list sort order
CREATE OR REPLACE FUNCTION bulk_update_list_sort_order(
  updates JSONB
)
RETURNS VOID AS $$
DECLARE
  update_record JSONB;
BEGIN
  FOR update_record IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE user_lists 
    SET 
      sort_order = (update_record->>'sort_order')::integer,
      updated_at = NOW()
    WHERE 
      id = (update_record->>'id')::uuid 
      AND user_id = auth.uid();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Import user list from external source
CREATE OR REPLACE FUNCTION import_user_list(
  user_id UUID,
  import_data JSONB
)
RETURNS TABLE(
  success_count INTEGER,
  error_count INTEGER,
  errors JSONB
) AS $$
DECLARE
  item JSONB;
  error_list JSONB[] := '{}';
  success_cnt INTEGER := 0;
  error_cnt INTEGER := 0;
  title_exists BOOLEAN;
  status_id UUID;
BEGIN
  -- Create import record
  INSERT INTO list_imports (
    user_id, 
    source_type, 
    import_status, 
    total_items,
    import_data
  ) VALUES (
    user_id,
    import_data->>'source_type',
    'processing',
    jsonb_array_length(import_data->'data'),
    import_data
  );

  -- Process each item
  FOR item IN SELECT * FROM jsonb_array_elements(import_data->'data')
  LOOP
    BEGIN
      -- Check if title exists
      SELECT EXISTS (
        SELECT 1 FROM titles WHERE id = (item->>'title_id')::uuid
      ) INTO title_exists;
      
      IF NOT title_exists THEN
        error_list := error_list || jsonb_build_object(
          'item', item,
          'error', 'Title not found'
        );
        error_cnt := error_cnt + 1;
        CONTINUE;
      END IF;
      
      -- Get status ID
      SELECT ls.id INTO status_id
      FROM list_statuses ls
      WHERE ls.name = item->>'status'
        AND (ls.media_type = item->>'media_type' OR ls.media_type = 'both');
      
      IF status_id IS NULL THEN
        error_list := error_list || jsonb_build_object(
          'item', item,
          'error', 'Invalid status'
        );
        error_cnt := error_cnt + 1;
        CONTINUE;
      END IF;
      
      -- Insert or update list entry
      INSERT INTO user_lists (
        user_id,
        title_id,
        status_id,
        score,
        progress,
        progress_volumes,
        start_date,
        finish_date,
        notes,
        rewatch_count
      ) VALUES (
        user_id,
        (item->>'title_id')::uuid,
        status_id,
        CASE WHEN item->>'score' != '' THEN (item->>'score')::decimal(3,1) ELSE NULL END,
        CASE WHEN item->>'progress' != '' THEN (item->>'progress')::integer ELSE 0 END,
        CASE WHEN item->>'progress_volumes' != '' THEN (item->>'progress_volumes')::integer ELSE 0 END,
        CASE WHEN item->>'start_date' != '' THEN (item->>'start_date')::date ELSE NULL END,
        CASE WHEN item->>'finish_date' != '' THEN (item->>'finish_date')::date ELSE NULL END,
        item->>'notes',
        CASE WHEN item->>'rewatch_count' != '' THEN (item->>'rewatch_count')::integer ELSE 0 END
      )
      ON CONFLICT (user_id, title_id) 
      DO UPDATE SET
        status_id = EXCLUDED.status_id,
        score = COALESCE(EXCLUDED.score, user_lists.score),
        progress = GREATEST(EXCLUDED.progress, user_lists.progress),
        progress_volumes = GREATEST(EXCLUDED.progress_volumes, user_lists.progress_volumes),
        start_date = COALESCE(EXCLUDED.start_date, user_lists.start_date),
        finish_date = COALESCE(EXCLUDED.finish_date, user_lists.finish_date),
        notes = COALESCE(EXCLUDED.notes, user_lists.notes),
        rewatch_count = GREATEST(EXCLUDED.rewatch_count, user_lists.rewatch_count),
        updated_at = NOW();
      
      success_cnt := success_cnt + 1;
      
    EXCEPTION WHEN OTHERS THEN
      error_list := error_list || jsonb_build_object(
        'item', item,
        'error', SQLERRM
      );
      error_cnt := error_cnt + 1;
    END;
  END LOOP;
  
  -- Update import record
  UPDATE list_imports 
  SET 
    import_status = CASE WHEN error_cnt = 0 THEN 'completed' ELSE 'completed' END,
    processed_items = success_cnt + error_cnt,
    success_count = success_cnt,
    error_count = error_cnt,
    error_log = array_to_json(error_list)::jsonb,
    completed_at = NOW()
  WHERE list_imports.user_id = import_user_list.user_id
    AND created_at = (
      SELECT MAX(created_at) FROM list_imports li2 
      WHERE li2.user_id = import_user_list.user_id
    );
  
  RETURN QUERY SELECT success_cnt, error_cnt, array_to_json(error_list)::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Export user list
CREATE OR REPLACE FUNCTION export_user_list(
  user_id UUID,
  content_type TEXT DEFAULT 'both',
  export_format TEXT DEFAULT 'json'
)
RETURNS JSONB AS $$
DECLARE
  export_data JSONB;
  total_count INTEGER;
BEGIN
  -- Get list data
  WITH list_data AS (
    SELECT 
      ul.*,
      ls.name as status_name,
      t.title as title_info,
      CASE 
        WHEN ul.media_type = 'anime' THEN 
          jsonb_build_object(
            'type', 'anime',
            'episodes', COALESCE(ad.episodes, 0),
            'duration', ad.duration,
            'season', ad.season,
            'year', ad.year
          )
        WHEN ul.media_type = 'manga' THEN
          jsonb_build_object(
            'type', 'manga',
            'chapters', COALESCE(md.chapters, 0),
            'volumes', COALESCE(md.volumes, 0),
            'status', md.status
          )
        ELSE NULL
      END as media_details
    FROM user_lists ul
    LEFT JOIN list_statuses ls ON ul.status_id = ls.id
    LEFT JOIN titles t ON ul.title_id = t.id
    LEFT JOIN anime_details ad ON t.id = ad.title_id
    LEFT JOIN manga_details md ON t.id = md.title_id
    WHERE ul.user_id = export_user_list.user_id
      AND (content_type = 'both' OR ul.media_type = content_type)
    ORDER BY ul.updated_at DESC
  )
  SELECT 
    jsonb_build_object(
      'format', export_format,
      'exported_at', NOW(),
      'content_type', content_type,
      'total_items', COUNT(*),
      'data', 
        CASE 
          WHEN export_format = 'json' THEN
            jsonb_agg(
              jsonb_build_object(
                'title_id', title_id,
                'title', title_info,
                'media_type', media_type,
                'status', status_name,
                'score', score,
                'progress', progress,
                'progress_volumes', progress_volumes,
                'start_date', start_date,
                'finish_date', finish_date,
                'notes', notes,
                'rewatch_count', rewatch_count,
                'is_favorite', is_favorite,
                'tags', tags,
                'created_at', created_at,
                'updated_at', updated_at,
                'media_details', media_details
              )
            )
          ELSE
            jsonb_agg(
              ARRAY[
                title_id::text,
                (title_info->>'title'),
                media_type,
                status_name,
                COALESCE(score::text, ''),
                COALESCE(progress::text, '0'),
                COALESCE(progress_volumes::text, '0'),
                COALESCE(start_date::text, ''),
                COALESCE(finish_date::text, ''),
                COALESCE(notes, ''),
                COALESCE(rewatch_count::text, '0'),
                is_favorite::text,
                array_to_string(tags, ';'),
                created_at::text,
                updated_at::text
              ]
            )
        END
    )
  INTO export_data, total_count
  FROM list_data;
  
  RETURN export_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get list statistics
CREATE OR REPLACE FUNCTION get_user_list_stats(
  user_id UUID,
  content_type TEXT DEFAULT 'both'
)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  WITH list_stats AS (
    SELECT 
      COUNT(*) as total_items,
      COUNT(*) FILTER (WHERE ul.media_type = 'anime') as anime_count,
      COUNT(*) FILTER (WHERE ul.media_type = 'manga') as manga_count,
      AVG(ul.score) FILTER (WHERE ul.score > 0) as avg_rating,
      SUM(CASE 
        WHEN ul.media_type = 'anime' AND ul.progress > 0 THEN 
          ul.progress * COALESCE(ad.duration, 24) 
        ELSE 0 
      END) / 60.0 as total_watch_time_hours,
      SUM(CASE 
        WHEN ul.media_type = 'manga' AND ul.progress > 0 THEN ul.progress
        ELSE 0
      END) as total_chapters_read,
      jsonb_object_agg(
        ls.name, 
        COUNT(*) FILTER (WHERE ul.status_id = ls.id)
      ) as status_counts
    FROM user_lists ul
    LEFT JOIN list_statuses ls ON ul.status_id = ls.id
    LEFT JOIN titles t ON ul.title_id = t.id
    LEFT JOIN anime_details ad ON t.id = ad.title_id AND ul.media_type = 'anime'
    WHERE ul.user_id = get_user_list_stats.user_id
      AND (content_type = 'both' OR ul.media_type = content_type)
    GROUP BY ()
  )
  SELECT jsonb_build_object(
    'total_items', COALESCE(total_items, 0),
    'anime_count', COALESCE(anime_count, 0),
    'manga_count', COALESCE(manga_count, 0),
    'average_rating', ROUND(COALESCE(avg_rating, 0)::numeric, 2),
    'total_watch_time_hours', ROUND(COALESCE(total_watch_time_hours, 0)::numeric, 1),
    'total_chapters_read', COALESCE(total_chapters_read, 0),
    'status_counts', COALESCE(status_counts, '{}'::jsonb),
    'last_updated', NOW()
  )
  INTO stats
  FROM list_stats;
  
  RETURN COALESCE(stats, '{
    "total_items": 0,
    "anime_count": 0,
    "manga_count": 0,
    "average_rating": 0,
    "total_watch_time_hours": 0,
    "total_chapters_read": 0,
    "status_counts": {},
    "last_updated": "' || NOW()::text || '"
  }'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search user lists with advanced filters
CREATE OR REPLACE FUNCTION search_user_lists(
  user_id UUID,
  search_params JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(
  id UUID,
  title_id UUID,
  media_type TEXT,
  status_id UUID,
  score DECIMAL(3,1),
  progress INTEGER,
  progress_volumes INTEGER,
  notes TEXT,
  tags TEXT[],
  is_favorite BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  title_info JSONB,
  status_info JSONB,
  media_details JSONB
) AS $$
DECLARE
  base_query TEXT;
  where_conditions TEXT[] := ARRAY['ul.user_id = $1'];
  order_clause TEXT := 'ORDER BY ul.updated_at DESC';
  limit_clause TEXT := '';
  param_count INTEGER := 1;
BEGIN
  base_query := '
    SELECT 
      ul.id,
      ul.title_id,
      ul.media_type,
      ul.status_id,
      ul.score,
      ul.progress,
      ul.progress_volumes,
      ul.notes,
      ul.tags,
      ul.is_favorite,
      ul.created_at,
      ul.updated_at,
      to_jsonb(t.*) as title_info,
      to_jsonb(ls.*) as status_info,
      CASE 
        WHEN ul.media_type = ''anime'' THEN to_jsonb(ad.*)
        WHEN ul.media_type = ''manga'' THEN to_jsonb(md.*)
        ELSE NULL
      END as media_details
    FROM user_lists ul
    LEFT JOIN titles t ON ul.title_id = t.id
    LEFT JOIN list_statuses ls ON ul.status_id = ls.id
    LEFT JOIN anime_details ad ON t.id = ad.title_id AND ul.media_type = ''anime''
    LEFT JOIN manga_details md ON t.id = md.title_id AND ul.media_type = ''manga''
  ';
  
  -- Add search conditions based on parameters
  IF search_params ? 'status' AND search_params->>'status' != 'all' THEN
    where_conditions := where_conditions || 'ul.status_id = $' || (param_count + 1);
    param_count := param_count + 1;
  END IF;
  
  IF search_params ? 'media_type' AND search_params->>'media_type' != 'both' THEN
    where_conditions := where_conditions || 'ul.media_type = $' || (param_count + 1);
    param_count := param_count + 1;
  END IF;
  
  IF search_params ? 'search' AND length(search_params->>'search') > 0 THEN
    where_conditions := where_conditions || 'LOWER(t.title->>''title'') LIKE LOWER($' || (param_count + 1) || ')';
    param_count := param_count + 1;
  END IF;
  
  IF search_params ? 'is_favorite' THEN
    where_conditions := where_conditions || 'ul.is_favorite = $' || (param_count + 1);
    param_count := param_count + 1;
  END IF;
  
  IF search_params ? 'min_score' THEN
    where_conditions := where_conditions || 'ul.score >= $' || (param_count + 1);
    param_count := param_count + 1;
  END IF;
  
  IF search_params ? 'max_score' THEN
    where_conditions := where_conditions || 'ul.score <= $' || (param_count + 1);
    param_count := param_count + 1;
  END IF;
  
  -- Add sorting
  IF search_params ? 'sort_by' THEN
    CASE search_params->>'sort_by'
      WHEN 'title' THEN 
        order_clause := 'ORDER BY t.title->>''title'' ' || COALESCE(search_params->>'sort_order', 'ASC');
      WHEN 'score' THEN 
        order_clause := 'ORDER BY ul.score ' || COALESCE(search_params->>'sort_order', 'DESC') || ' NULLS LAST';
      WHEN 'progress' THEN 
        order_clause := 'ORDER BY ul.progress ' || COALESCE(search_params->>'sort_order', 'DESC');
      WHEN 'updated_at' THEN 
        order_clause := 'ORDER BY ul.updated_at ' || COALESCE(search_params->>'sort_order', 'DESC');
      WHEN 'created_at' THEN 
        order_clause := 'ORDER BY ul.created_at ' || COALESCE(search_params->>'sort_order', 'DESC');
      ELSE
        order_clause := 'ORDER BY ul.updated_at DESC';
    END CASE;
  END IF;
  
  -- Add limit
  IF search_params ? 'limit' THEN
    limit_clause := 'LIMIT ' || (search_params->>'limit')::integer;
  END IF;
  
  -- Combine query parts
  base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ') || ' ' || order_clause || ' ' || limit_clause;
  
  -- Execute dynamic query - simplified version for now
  RETURN QUERY EXECUTE base_query USING user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION bulk_update_user_list_items(UUID[], JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_list_sort_order(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION import_user_list(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION export_user_list(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_list_stats(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_user_lists(UUID, JSONB) TO authenticated;