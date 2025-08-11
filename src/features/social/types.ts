// Shared social feature types
export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  lists_count: number;
  is_following?: boolean;
}

export interface UserList {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private' | 'friends';
  items_count: number;
  created_at: string;
  user_id: string;
  user_profile?: {
    username?: string;
    avatar_url?: string;
  };
  list_items?: Array<{
    title: {
      id: string;
      title: string;
      image_url?: string;
      content_type: string;
      score?: number;
    };
  }>;
}