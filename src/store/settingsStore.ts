import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabaseClient';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoplay: boolean;
  notifications: boolean;
  mature_content: boolean;
  data_saver: boolean;
  offline_mode: boolean;
  sync_on_startup: boolean;
}

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  autoplay: true,
  notifications: true,
  mature_content: false,
  data_saver: false,
  offline_mode: false,
  sync_on_startup: true
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      loading: false,
      error: null,

      updateSettings: async (updates: Partial<Settings>) => {
        try {
          set({ loading: true, error: null });
          
          const newSettings = { ...get().settings, ...updates };
          set({ settings: newSettings });

          // Save to database if user is authenticated
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Store settings as JSON in notification_settings column temporarily
            const { error } = await supabase
              .from('user_preferences')
              .upsert({
                user_id: user.id,
                notification_settings: newSettings,
                show_adult_content: newSettings.mature_content,
                updated_at: new Date().toISOString()
              });

            if (error && error.code !== 'PGRST116') throw error;
          }
        } catch (error) {
          console.error('Failed to update settings:', error);
          set({ error: 'Failed to update settings' });
        } finally {
          set({ loading: false });
        }
      },

      loadSettings: async () => {
        try {
          set({ loading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          if (data && data.notification_settings) {
            // Load settings from notification_settings JSON
            const loadedSettings = {
              ...defaultSettings,
              ...(typeof data.notification_settings === 'object' ? data.notification_settings : {}),
              mature_content: data.show_adult_content ?? defaultSettings.mature_content
            };
            set({ settings: loadedSettings });
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
          set({ error: 'Failed to load settings' });
        } finally {
          set({ loading: false });
        }
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      }
    }),
    {
      name: 'settings-storage'
    }
  )
);
