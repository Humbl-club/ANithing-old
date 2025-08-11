import { Database } from '@/integrations/supabase/types';

declare module '@/integrations/supabase/client' {
  interface SupabaseClient {
    from(table: 'profiles'): any;
    from(table: 'user_lists'): any;
    from(table: 'user_ratings'): any;
    from(table: 'user_list_items'): any;
    from(table: 'user_title_lists'): any;
    from(table: 'list_statuses'): any;
    from(table: 'error_logs'): any;
    from(table: 'service_metrics'): any;
    from(table: 'legal_pages'): any;
    from(table: 'api_attributions'): any;
    from(table: 'pending_matches'): any;
    from(table: 'content_reports'): any;
  }
}
