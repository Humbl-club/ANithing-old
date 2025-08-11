export interface Profile {
  id: string;
  user_id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  role?: 'user' | 'moderator' | 'admin';
  verification_status?: 'unverified' | 'verified';
  created_at: string;
  updated_at?: string;
}
