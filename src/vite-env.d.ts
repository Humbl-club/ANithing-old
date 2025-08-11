
/// <reference types="vite/client" />
// Augment Vite env typings for this project
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_GAMIFICATION?: string;
  readonly VITE_ENABLE_OFFLINE?: string;
  readonly VITE_ENABLE_PUSH?: string;
  // allow other prefixed vars without strict typing
  readonly [key: string]: string | undefined;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
