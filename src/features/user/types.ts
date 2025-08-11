// User feature types
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  preferences: UserPreferences;
}
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  emailVerified: boolean;
}
export interface ActivityFeedItem {
  id: string;
  type: 'watched' | 'completed' | 'rated' | 'added';
  contentId: string;
  contentTitle: string;
  contentType: 'anime' | 'manga';
  timestamp: string;
  details?: any;
}
export interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
}