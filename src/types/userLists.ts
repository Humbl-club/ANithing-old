// Types for offline sync operations and user lists
export interface UserTitleListItem {
  id: string;
  user_id: string;
  title_id: string;
  media_type: 'anime' | 'manga';
  status_id: string;
  rating?: number;
  progress?: number;
  notes?: string;
  added_at: string;
  updated_at: string;
  sort_order?: number;
}
export interface OfflineActionData {
  add_to_list: {
    user_id: string;
    title_id: string;
    media_type: 'anime' | 'manga';
    status_id: string;
  };
  update_progress: {
    list_item_id: string;
    progress: number;
  };
  rate_title: {
    list_item_id: string;
    rating: number;
  };
  write_review: {
    title_id: string;
    user_id: string;
    content: string;
    rating?: number;
    spoiler_warning?: boolean;
    title?: string;
  };
  update_status: {
    list_item_id: string;
    status_id: string;
  };
  update_notes: {
    list_item_id: string;
    notes: string;
  };
}
export interface SyncableUserListItem {
  id: string;
  title_id: string;
  user_id: string;
  status_id: string;
  media_type: 'anime' | 'manga';
  rating?: number;
  progress?: number;
  notes?: string;
  cached_at: number;
  sync_status: 'synced' | 'pending' | 'failed';
  sort_order?: number;
}
export interface OfflineActionBase {
  id: string;
  timestamp: number;
  retry_count: number;
}
export interface OfflineAction<T extends keyof OfflineActionData = keyof OfflineActionData> extends OfflineActionBase {
  type: T;
  data: OfflineActionData[T];
}
export interface SyncError {
  action_id: string;
  error_message: string;
  timestamp: number;
  retry_count: number;
}
export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors: SyncError[];
}
// Legacy types for backward compatibility
export interface UserAnimeListEntry extends UserTitleListItem {
  media_type: 'anime';
  episodes_watched?: number;
  score?: number;
  status?: string;
  start_date?: string;
  finish_date?: string;
  created_at?: string;
  anime_details?: any;
  title?: any;
}
export interface UserMangaListEntry extends UserTitleListItem {
  media_type: 'manga';
  chapters_read?: number;
  volumes_read?: number;
  score?: number;
  status?: string;
  start_date?: string;
  finish_date?: string;
  created_at?: string;
  manga_details?: any;
  title?: any;
}
export interface UserTitleListEntry extends UserTitleListItem {
  episodes_watched?: number;
  chapters_read?: number;
  volumes_read?: number;
  score?: number;
  status?: string;
  start_date?: string;
  finish_date?: string;
  created_at?: string;
  anime_details?: any;
  manga_details?: any;
  title?: any;
}
export interface ListStatus {
  id: string;
  name: string;
  label: string;
  media_type: 'anime' | 'manga' | 'both';
  sort_order: number;
}
export type AnimeStatus = string;
export type MangaStatus = string;
export const STATUS_LABELS = {
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch',
  reading: 'Reading',
  plan_to_read: 'Plan to Read'
} as const;
export const STATUS_MAPPING = {
  anime: {
    watching: 'watching',
    completed: 'completed',
    on_hold: 'on_hold',
    dropped: 'dropped',
    plan_to_watch: 'plan_to_watch'
  },
  manga: {
    reading: 'reading',
    completed: 'completed',
    on_hold: 'on_hold',
    dropped: 'dropped',
    plan_to_read: 'plan_to_read'
  }
} as const;

// Enhanced types for advanced list management
export interface CustomListType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  list_type_id?: string;
  is_public: boolean;
  is_collaborative: boolean;
  share_token: string;
  sort_order: number;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  list_type?: CustomListType;
  items?: CustomListItem[];
  collaborators?: ListCollaborator[];
}

export interface CustomListItem {
  id: string;
  list_id: string;
  title_id: string;
  sort_order: number;
  notes?: string;
  personal_rating?: number;
  date_added: string;
  added_by_user_id?: string;
  is_pinned: boolean;
  tags: string[];
  title?: any;
}

export interface ListCollaborator {
  id: string;
  list_id: string;
  user_id: string;
  permission_level: 'owner' | 'editor' | 'viewer';
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
}

export interface ListLike {
  id: string;
  list_id: string;
  user_id: string;
  created_at: string;
}

export interface ListImport {
  id: string;
  user_id: string;
  source_type: 'myanimelist' | 'anilist' | 'kitsu' | 'csv' | 'json';
  import_status: 'pending' | 'processing' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  success_count: number;
  error_count: number;
  import_data?: any;
  error_log?: any;
  created_at: string;
  completed_at?: string;
}

export interface ListImportData {
  source_type: 'myanimelist' | 'anilist' | 'kitsu' | 'csv' | 'json';
  data: any;
  options?: {
    merge_duplicates?: boolean;
    update_existing?: boolean;
    import_ratings?: boolean;
    import_progress?: boolean;
    import_dates?: boolean;
  };
}

export interface ListExportData {
  format: 'json' | 'csv';
  data: any;
  metadata: {
    exported_at: string;
    total_items: number;
    content_type: 'anime' | 'manga' | 'both';
  };
}

export interface BulkListOperation {
  ids: string[];
  updates: Partial<UserTitleListEntry>;
}

export interface ListStats {
  total: number;
  statusCounts: Record<string, number>;
  averageRating: number;
  totalHours: number;
}

export interface ListFilter {
  status?: string;
  mediaType?: 'anime' | 'manga' | 'both';
  rating?: {
    min?: number;
    max?: number;
  };
  progress?: {
    min?: number;
    max?: number;
  };
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
}

export interface ListSort {
  field: 'title' | 'status' | 'rating' | 'progress' | 'updated_at' | 'created_at' | 'sort_order';
  direction: 'asc' | 'desc';
}

// Enhanced user list entry with additional fields
export interface EnhancedUserTitleListEntry extends UserTitleListEntry {
  sort_order: number;
  tags: string[];
  custom_status?: string;
  priority: number;
  visibility: 'public' | 'friends' | 'private';
  last_activity_at: string;
  is_pinned?: boolean;
  personal_notes?: string;
}