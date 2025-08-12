import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabaseClient';

// Profile settings
export interface ProfileSettings {
  avatar_url: string;
  display_name: string;
  bio: string;
  location: string;
  website: string;
  twitter_handle: string;
  favorite_genres: string[];
}

// Display preferences
export interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ja' | 'es' | 'fr' | 'de' | 'ko' | 'zh';
  title_language: 'english' | 'romaji' | 'native';
  content_filter: 'all' | 'no_adult' | 'family_friendly';
  default_list_view: 'grid' | 'list' | 'table';
  items_per_page: 12 | 24 | 48 | 96;
  auto_play_trailers: boolean;
  show_spoilers: boolean;
  compact_mode: boolean;
  glassmorphism: boolean;
  animations: boolean;
  data_saver: boolean;
}

// Notification settings
export interface NotificationSettings {
  email_notifications: boolean;
  email_on_episode_release: boolean;
  email_on_friend_activity: boolean;
  email_on_list_updates: boolean;
  email_weekly_digest: boolean;
  push_notifications: boolean;
  push_on_episode_release: boolean;
  push_on_friend_activity: boolean;
  push_on_achievements: boolean;
  in_app_notifications: boolean;
  sound_effects: boolean;
}

// Privacy settings
export interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  list_visibility: 'public' | 'friends' | 'private';
  activity_visibility: 'public' | 'friends' | 'private';
  show_progress: boolean;
  show_ratings: boolean;
  show_reviews: boolean;
  allow_friend_requests: boolean;
  show_online_status: boolean;
  data_collection: boolean;
}

// Account settings
export interface AccountSettings {
  email: string;
  username: string;
  two_factor_enabled: boolean;
  login_alerts: boolean;
  account_deletion_requested: boolean;
}

// Import/Export settings
export interface ImportExportSettings {
  mal_sync_enabled: boolean;
  mal_username: string;
  anilist_sync_enabled: boolean;
  anilist_username: string;
  auto_sync: boolean;
  sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  last_sync: string | null;
}

// Complete settings interface
interface AllSettings {
  profile: ProfileSettings;
  preferences: PreferenceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  account: AccountSettings;
  importExport: ImportExportSettings;
}

interface SettingsState {
  settings: AllSettings;
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
  updateProfile: (updates: Partial<ProfileSettings>) => Promise<void>;
  updatePreferences: (updates: Partial<PreferenceSettings>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacy: (updates: Partial<PrivacySettings>) => Promise<void>;
  updateAccount: (updates: Partial<AccountSettings>) => Promise<void>;
  updateImportExport: (updates: Partial<ImportExportSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  saveToSupabase: () => Promise<void>;
  resetCategory: (category: keyof AllSettings) => void;
  resetAllSettings: () => void;
  exportSettings: () => string;
  importSettings: (jsonString: string) => boolean;
  markSaved: () => void;
}

const defaultSettings: AllSettings = {
  profile: {
    avatar_url: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    twitter_handle: '',
    favorite_genres: []
  },
  preferences: {
    theme: 'system',
    language: 'en',
    title_language: 'english',
    content_filter: 'no_adult',
    default_list_view: 'grid',
    items_per_page: 24,
    auto_play_trailers: true,
    show_spoilers: false,
    compact_mode: false,
    glassmorphism: true,
    animations: true,
    data_saver: false
  },
  notifications: {
    email_notifications: true,
    email_on_episode_release: true,
    email_on_friend_activity: false,
    email_on_list_updates: false,
    email_weekly_digest: true,
    push_notifications: false,
    push_on_episode_release: false,
    push_on_friend_activity: false,
    push_on_achievements: true,
    in_app_notifications: true,
    sound_effects: true
  },
  privacy: {
    profile_visibility: 'public',
    list_visibility: 'public',
    activity_visibility: 'public',
    show_progress: true,
    show_ratings: true,
    show_reviews: true,
    allow_friend_requests: true,
    show_online_status: true,
    data_collection: true
  },
  account: {
    email: '',
    username: '',
    two_factor_enabled: false,
    login_alerts: true,
    account_deletion_requested: false
  },
  importExport: {
    mal_sync_enabled: false,
    mal_username: '',
    anilist_sync_enabled: false,
    anilist_username: '',
    auto_sync: false,
    sync_frequency: 'daily',
    last_sync: null
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      loading: false,
      error: null,
      hasChanges: false,

      updateProfile: async (updates: Partial<ProfileSettings>) => {
        const newSettings = { 
          ...get().settings, 
          profile: { ...get().settings.profile, ...updates } 
        };
        set({ settings: newSettings, hasChanges: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                display_name: newSettings.profile.display_name || null,
                avatar_url: newSettings.profile.avatar_url || null,
                bio: newSettings.profile.bio || null,
                location: newSettings.profile.location || null,
                website: newSettings.profile.website || null,
                twitter_handle: newSettings.profile.twitter_handle || null,
                favorite_genres: newSettings.profile.favorite_genres,
                updated_at: new Date().toISOString()
              });
          }
        } catch (error) {
          console.error('Failed to save profile:', error);
          set({ error: 'Failed to save profile settings' });
        }
      },

      updatePreferences: async (updates: Partial<PreferenceSettings>) => {
        const newSettings = { 
          ...get().settings, 
          preferences: { ...get().settings.preferences, ...updates } 
        };
        set({ settings: newSettings, hasChanges: true });
      },

      updateNotifications: async (updates: Partial<NotificationSettings>) => {
        const newSettings = { 
          ...get().settings, 
          notifications: { ...get().settings.notifications, ...updates } 
        };
        set({ settings: newSettings, hasChanges: true });
      },

      updatePrivacy: async (updates: Partial<PrivacySettings>) => {
        const newSettings = { 
          ...get().settings, 
          privacy: { ...get().settings.privacy, ...updates } 
        };
        set({ settings: newSettings, hasChanges: true });
      },

      updateAccount: async (updates: Partial<AccountSettings>) => {
        const newSettings = { 
          ...get().settings, 
          account: { ...get().settings.account, ...updates } 
        };
        set({ settings: newSettings, hasChanges: true });
      },

      updateImportExport: async (updates: Partial<ImportExportSettings>) => {
        const newSettings = { 
          ...get().settings, 
          importExport: { ...get().settings.importExport, ...updates } 
        };
        set({ settings: newSettings, hasChanges: true });
      },

      loadSettings: async () => {
        try {
          set({ loading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Load from multiple tables
          const [profileData, preferencesData] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('user_preferences').select('*').eq('user_id', user.id).single()
          ]);

          const loadedSettings = { ...defaultSettings };

          // Merge profile data
          if (profileData.data) {
            loadedSettings.profile = {
              avatar_url: profileData.data.avatar_url || '',
              display_name: profileData.data.display_name || '',
              bio: profileData.data.bio || '',
              location: profileData.data.location || '',
              website: profileData.data.website || '',
              twitter_handle: profileData.data.twitter_handle || '',
              favorite_genres: profileData.data.favorite_genres || []
            };
            loadedSettings.account.username = profileData.data.username || '';
          }

          // Merge preferences data
          if (preferencesData.data) {
            const prefs = preferencesData.data;
            loadedSettings.preferences.theme = prefs.theme || defaultSettings.preferences.theme;
            loadedSettings.preferences.language = prefs.language || defaultSettings.preferences.language;
            loadedSettings.preferences.title_language = prefs.title_language || defaultSettings.preferences.title_language;
            loadedSettings.preferences.auto_play_trailers = prefs.auto_play_trailers ?? defaultSettings.preferences.auto_play_trailers;
            
            // Notification settings
            loadedSettings.notifications.email_notifications = prefs.email_notifications ?? defaultSettings.notifications.email_notifications;
            loadedSettings.notifications.email_on_episode_release = prefs.email_on_episode_release ?? defaultSettings.notifications.email_on_episode_release;
            loadedSettings.notifications.email_on_friend_activity = prefs.email_on_friend_activity ?? defaultSettings.notifications.email_on_friend_activity;
            loadedSettings.notifications.push_notifications = prefs.push_notifications ?? defaultSettings.notifications.push_notifications;
            loadedSettings.notifications.push_on_episode_release = prefs.push_on_episode_release ?? defaultSettings.notifications.push_on_episode_release;
            
            // Privacy settings
            loadedSettings.privacy.profile_visibility = prefs.profile_visibility || defaultSettings.privacy.profile_visibility;
            loadedSettings.privacy.show_progress = prefs.show_watching_status ?? defaultSettings.privacy.show_progress;
            loadedSettings.privacy.allow_friend_requests = prefs.allow_friend_requests ?? defaultSettings.privacy.allow_friend_requests;
          }

          set({ settings: loadedSettings });
        } catch (error) {
          console.error('Failed to load settings:', error);
          set({ error: 'Failed to load settings' });
        } finally {
          set({ loading: false });
        }
      },

      saveToSupabase: async () => {
        try {
          set({ loading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const { settings } = get();

          // Save to user_preferences
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              theme: settings.preferences.theme,
              language: settings.preferences.language,
              title_language: settings.preferences.title_language,
              show_adult_content: settings.preferences.content_filter !== 'family_friendly',
              auto_play_trailers: settings.preferences.auto_play_trailers,
              email_notifications: settings.notifications.email_notifications,
              email_on_episode_release: settings.notifications.email_on_episode_release,
              email_on_friend_activity: settings.notifications.email_on_friend_activity,
              push_notifications: settings.notifications.push_notifications,
              push_on_episode_release: settings.notifications.push_on_episode_release,
              profile_visibility: settings.privacy.profile_visibility,
              show_watching_status: settings.privacy.show_progress,
              allow_friend_requests: settings.privacy.allow_friend_requests,
              updated_at: new Date().toISOString()
            });

          // Save profile data
          if (settings.profile.display_name || settings.profile.bio) {
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                display_name: settings.profile.display_name || null,
                avatar_url: settings.profile.avatar_url || null,
                bio: settings.profile.bio || null,
                location: settings.profile.location || null,
                website: settings.profile.website || null,
                twitter_handle: settings.profile.twitter_handle || null,
                favorite_genres: settings.profile.favorite_genres,
                updated_at: new Date().toISOString()
              });
          }

        } catch (error) {
          console.error('Failed to save settings:', error);
          set({ error: 'Failed to save settings' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      resetCategory: (category: keyof AllSettings) => {
        const newSettings = { 
          ...get().settings, 
          [category]: defaultSettings[category] 
        };
        set({ settings: newSettings, hasChanges: true });
      },

      resetAllSettings: () => {
        set({ settings: defaultSettings, hasChanges: true });
      },

      exportSettings: () => {
        return JSON.stringify(get().settings, null, 2);
      },

      importSettings: (jsonString: string) => {
        try {
          const importedSettings = JSON.parse(jsonString);
          // Validate structure
          if (importedSettings && typeof importedSettings === 'object') {
            set({ settings: { ...defaultSettings, ...importedSettings }, hasChanges: true });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      markSaved: () => {
        set({ hasChanges: false });
      }
    }),
    {
      name: 'settings-storage'
    }
  )
);