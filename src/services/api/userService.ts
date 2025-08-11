import { BaseApiService, ServiceResponse } from './baseService';
export interface UserProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  birth_date?: string | null;
  role: string | null;
  verification_status: string | null;
  verification_required_until?: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface UserList {
  id: string;
  user_id: string;
  title_id: string;
  status_id: string;
  score?: number | null;
  episodes_watched?: number | null;
  chapters_read?: number | null;
  volumes_read?: number | null;
  start_date?: string | null;
  finish_date?: string | null;
  notes?: string | null;
  media_type: string;
  created_at: string | null;
  updated_at: string | null;
}
export interface UserPreferences {
  id: string;
  user_id: string | null;
  preferred_genres: string[] | null;
  excluded_genres: string[] | null;
  show_adult_content: boolean | null;
  auto_add_sequels: boolean | null;
  list_visibility: string | null;
  privacy_level: string | null;
  notification_settings: Record<string, unknown>; // JSON type for notification settings
  created_at: string | null;
  updated_at: string | null;
}
class UserApiService extends BaseApiService {
  // Get user profile
  async getUserProfile(userId: string): Promise<ServiceResponse<UserProfile | null>> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return this.handleSuccess(data);
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'fetch user profile');
    }
  }
  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<ServiceResponse<UserProfile | null>> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return this.handleSuccess(data, 'Profile updated successfully');
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'update user profile');
    }
  }
  // Get user preferences
  async getUserPreferences(userId: string): Promise<ServiceResponse<UserPreferences | null>> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return this.handleSuccess(data);
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'fetch user preferences');
    }
  }
  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<ServiceResponse<UserPreferences | null>> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .upsert({ user_id: userId, ...preferences })
        .select()
        .single();
      if (error) {
        throw error;
      }
      return this.handleSuccess(data, 'Preferences updated successfully');
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'update user preferences');
    }
  }
  // Get user's anime/manga list
  async getUserList(userId: string, mediaType: 'anime' | 'manga'): Promise<ServiceResponse<UserList[]>> {
    try {
      const { data, error } = await this.supabase
        .from('user_title_lists')
        .select(`
          *,
          titles(*),
          list_statuses(*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) {
        throw error;
      }
      return this.handleSuccess((data || []) as unknown as UserList[]);
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, `fetch user's ${mediaType} list`);
    }
  }
  // Add item to user's list
  async addToUserList(listItem: {
    user_id: string;
    title_id: string;
    status_id: string;
    media_type: string;
    score?: number | null;
    episodes_watched?: number | null;
    chapters_read?: number | null;
    volumes_read?: number | null;
    start_date?: string | null;
    finish_date?: string | null;
    notes?: string | null;
  }): Promise<ServiceResponse<UserList | null>> {
    try {
      const { data, error } = await this.supabase
        .from('user_title_lists')
        .insert(listItem)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return this.handleSuccess(data as unknown as UserList, 'Added to your list');
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'add to list');
    }
  }
  // Update list item
  async updateListItem(listId: string, updates: Partial<UserList>): Promise<ServiceResponse<UserList | null>> {
    try {
      const { data, error } = await this.supabase
        .from('user_title_lists')
        .update(updates)
        .eq('id', listId)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return this.handleSuccess(data as unknown as UserList, 'List updated');
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'update list item');
    }
  }
  // Remove from user's list
  async removeFromUserList(listId: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('user_title_lists')
        .delete()
        .eq('id', listId);
      if (error) {
        throw error;
      }
      return this.handleSuccess(true, 'Removed from your list');
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'remove from list');
    }
  }
  // Get user's reviews
  async getUserReviews(userId: string): Promise<ServiceResponse<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .select(`
          *,
          titles(title, image_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return this.handleSuccess(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'fetch user reviews');
    }
  }
  // Create review
  async createReview(review: {
    title_id: string;
    user_id: string;
    title?: string;
    content: string;
    rating?: number;
    spoiler_warning?: boolean;
  }): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return this.handleSuccess(data, 'Review posted successfully');
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'create review');
    }
  }
  // Follow/unfollow user
  async toggleFollow(followerId: string, followingId: string): Promise<ServiceResponse<boolean>> {
    try {
      // Check if already following
      const { data: existing } = await this.supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();
      if (existing) {
        // Unfollow
        const { error } = await this.supabase
          .from('user_follows')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return this.handleSuccess(false, 'Unfollowed user');
      } else {
        // Follow
        const { error } = await this.supabase
          .from('user_follows')
          .insert({ follower_id: followerId, following_id: followingId });
        if (error) throw error;
        return this.handleSuccess(true, 'Following user');
      }
    } catch (err: unknown) {
      const error = err as Error;
      return this.handleError(error, 'update follow status');
    }
  }
}
export const userService = new UserApiService();