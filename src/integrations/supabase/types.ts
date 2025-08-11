export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_type: string
          anime_id: string | null
          created_at: string
          id: string
          manga_id: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          anime_id?: string | null
          created_at?: string
          id?: string
          manga_id?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          anime_id?: string | null
          created_at?: string
          id?: string
          manga_id?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "manga"
            referencedColumns: ["id"]
          },
        ]
      }
      anime: {
        Row: {
          aired_from: string | null
          aired_to: string | null
          airing_schedule: Json | null
          anilist_id: number | null
          banner_image: string | null
          characters_data: Json | null
          color_theme: string | null
          cover_image_extra_large: string | null
          cover_image_large: string | null
          created_at: string
          demographics: string[] | null
          detailed_tags: Json | null
          episodes: number | null
          external_links: Json | null
          favorites: number | null
          genres: string[] | null
          id: string
          image_url: string | null
          last_sync_check: string | null
          mal_id: number | null
          members: number | null
          next_episode_date: string | null
          next_episode_number: number | null
          popularity: number | null
          rank: number | null
          recommendations_data: Json | null
          relations_data: Json | null
          score: number | null
          scored_by: number | null
          season: string | null
          staff_data: Json | null
          status: string | null
          streaming_episodes: Json | null
          studios: string[] | null
          studios_data: Json | null
          synopsis: string | null
          themes: string[] | null
          title: string
          title_english: string | null
          title_japanese: string | null
          trailer_id: string | null
          trailer_site: string | null
          trailer_url: string | null
          type: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          aired_from?: string | null
          aired_to?: string | null
          airing_schedule?: Json | null
          anilist_id?: number | null
          banner_image?: string | null
          characters_data?: Json | null
          color_theme?: string | null
          cover_image_extra_large?: string | null
          cover_image_large?: string | null
          created_at?: string
          demographics?: string[] | null
          detailed_tags?: Json | null
          episodes?: number | null
          external_links?: Json | null
          favorites?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          last_sync_check?: string | null
          mal_id?: number | null
          members?: number | null
          next_episode_date?: string | null
          next_episode_number?: number | null
          popularity?: number | null
          rank?: number | null
          recommendations_data?: Json | null
          relations_data?: Json | null
          score?: number | null
          scored_by?: number | null
          season?: string | null
          staff_data?: Json | null
          status?: string | null
          streaming_episodes?: Json | null
          studios?: string[] | null
          studios_data?: Json | null
          synopsis?: string | null
          themes?: string[] | null
          title: string
          title_english?: string | null
          title_japanese?: string | null
          trailer_id?: string | null
          trailer_site?: string | null
          trailer_url?: string | null
          type?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          aired_from?: string | null
          aired_to?: string | null
          airing_schedule?: Json | null
          anilist_id?: number | null
          banner_image?: string | null
          characters_data?: Json | null
          color_theme?: string | null
          cover_image_extra_large?: string | null
          cover_image_large?: string | null
          created_at?: string
          demographics?: string[] | null
          detailed_tags?: Json | null
          episodes?: number | null
          external_links?: Json | null
          favorites?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          last_sync_check?: string | null
          mal_id?: number | null
          members?: number | null
          next_episode_date?: string | null
          next_episode_number?: number | null
          popularity?: number | null
          rank?: number | null
          recommendations_data?: Json | null
          relations_data?: Json | null
          score?: number | null
          scored_by?: number | null
          season?: string | null
          staff_data?: Json | null
          status?: string | null
          streaming_episodes?: Json | null
          studios?: string[] | null
          studios_data?: Json | null
          synopsis?: string | null
          themes?: string[] | null
          title?: string
          title_english?: string | null
          title_japanese?: string | null
          trailer_id?: string | null
          trailer_site?: string | null
          trailer_url?: string | null
          type?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      anime_details: {
        Row: {
          aired_from: string | null
          aired_to: string | null
          created_at: string | null
          episodes: number | null
          id: string
          last_sync_check: string | null
          next_episode_date: string | null
          next_episode_number: number | null
          season: string | null
          status: string | null
          title_id: string | null
          trailer_id: string | null
          trailer_site: string | null
          trailer_url: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          aired_from?: string | null
          aired_to?: string | null
          created_at?: string | null
          episodes?: number | null
          id?: string
          last_sync_check?: string | null
          next_episode_date?: string | null
          next_episode_number?: number | null
          season?: string | null
          status?: string | null
          title_id?: string | null
          trailer_id?: string | null
          trailer_site?: string | null
          trailer_url?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          aired_from?: string | null
          aired_to?: string | null
          created_at?: string | null
          episodes?: number | null
          id?: string
          last_sync_check?: string | null
          next_episode_date?: string | null
          next_episode_number?: number | null
          season?: string | null
          status?: string | null
          title_id?: string | null
          trailer_id?: string | null
          trailer_site?: string | null
          trailer_url?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anime_details_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      content_sync_status: {
        Row: {
          completed_at: string | null
          content_type: string
          current_page: number | null
          error_message: string | null
          id: string
          next_run_at: string | null
          operation_type: string
          processed_items: number | null
          started_at: string | null
          status: string
          total_items: number | null
        }
        Insert: {
          completed_at?: string | null
          content_type: string
          current_page?: number | null
          error_message?: string | null
          id?: string
          next_run_at?: string | null
          operation_type: string
          processed_items?: number | null
          started_at?: string | null
          status?: string
          total_items?: number | null
        }
        Update: {
          completed_at?: string | null
          content_type?: string
          current_page?: number | null
          error_message?: string | null
          id?: string
          next_run_at?: string | null
          operation_type?: string
          processed_items?: number | null
          started_at?: string | null
          status?: string
          total_items?: number | null
        }
        Relationships: []
      }
      genres: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      import_export_logs: {
        Row: {
          created_at: string
          error_message: string | null
          file_url: string | null
          id: string
          items_processed: number | null
          items_total: number | null
          operation_type: string
          source_platform: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_url?: string | null
          id?: string
          items_processed?: number | null
          items_total?: number | null
          operation_type: string
          source_platform?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_url?: string | null
          id?: string
          items_processed?: number | null
          items_total?: number | null
          operation_type?: string
          source_platform?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      manga: {
        Row: {
          anilist_id: number | null
          authors: string[] | null
          chapters: number | null
          created_at: string
          demographics: string[] | null
          favorites: number | null
          genres: string[] | null
          id: string
          image_url: string | null
          last_sync_check: string | null
          mal_id: number | null
          members: number | null
          next_chapter_date: string | null
          next_chapter_number: number | null
          popularity: number | null
          published_from: string | null
          published_to: string | null
          rank: number | null
          release_schedule: Json | null
          score: number | null
          scored_by: number | null
          serializations: string[] | null
          status: string | null
          synopsis: string | null
          themes: string[] | null
          title: string
          title_english: string | null
          title_japanese: string | null
          type: string | null
          updated_at: string
          volumes: number | null
        }
        Insert: {
          anilist_id?: number | null
          authors?: string[] | null
          chapters?: number | null
          created_at?: string
          demographics?: string[] | null
          favorites?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          last_sync_check?: string | null
          mal_id?: number | null
          members?: number | null
          next_chapter_date?: string | null
          next_chapter_number?: number | null
          popularity?: number | null
          published_from?: string | null
          published_to?: string | null
          rank?: number | null
          release_schedule?: Json | null
          score?: number | null
          scored_by?: number | null
          serializations?: string[] | null
          status?: string | null
          synopsis?: string | null
          themes?: string[] | null
          title: string
          title_english?: string | null
          title_japanese?: string | null
          type?: string | null
          updated_at?: string
          volumes?: number | null
        }
        Update: {
          anilist_id?: number | null
          authors?: string[] | null
          chapters?: number | null
          created_at?: string
          demographics?: string[] | null
          favorites?: number | null
          genres?: string[] | null
          id?: string
          image_url?: string | null
          last_sync_check?: string | null
          mal_id?: number | null
          members?: number | null
          next_chapter_date?: string | null
          next_chapter_number?: number | null
          popularity?: number | null
          published_from?: string | null
          published_to?: string | null
          rank?: number | null
          release_schedule?: Json | null
          score?: number | null
          scored_by?: number | null
          serializations?: string[] | null
          status?: string | null
          synopsis?: string | null
          themes?: string[] | null
          title?: string
          title_english?: string | null
          title_japanese?: string | null
          type?: string | null
          updated_at?: string
          volumes?: number | null
        }
        Relationships: []
      }
      manga_details: {
        Row: {
          chapters: number | null
          created_at: string | null
          id: string
          last_sync_check: string | null
          next_chapter_date: string | null
          next_chapter_number: number | null
          published_from: string | null
          published_to: string | null
          status: string | null
          title_id: string | null
          type: string | null
          updated_at: string | null
          volumes: number | null
        }
        Insert: {
          chapters?: number | null
          created_at?: string | null
          id?: string
          last_sync_check?: string | null
          next_chapter_date?: string | null
          next_chapter_number?: number | null
          published_from?: string | null
          published_to?: string | null
          status?: string | null
          title_id?: string | null
          type?: string | null
          updated_at?: string | null
          volumes?: number | null
        }
        Update: {
          chapters?: number | null
          created_at?: string | null
          id?: string
          last_sync_check?: string | null
          next_chapter_date?: string | null
          next_chapter_number?: number | null
          published_from?: string | null
          published_to?: string | null
          status?: string | null
          title_id?: string | null
          type?: string | null
          updated_at?: string | null
          volumes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manga_details_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          name: string
          session_id: string
          tags: Json | null
          timestamp: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          session_id: string
          tags?: Json | null
          timestamp?: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          session_id?: string
          tags?: Json | null
          timestamp?: string
          value?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          anime_id: string | null
          confidence_score: number | null
          created_at: string
          dismissed: boolean | null
          id: string
          manga_id: string | null
          reason: string | null
          recommendation_type: string
          user_id: string
        }
        Insert: {
          anime_id?: string | null
          confidence_score?: number | null
          created_at?: string
          dismissed?: boolean | null
          id?: string
          manga_id?: string | null
          reason?: string | null
          recommendation_type: string
          user_id: string
        }
        Update: {
          anime_id?: string | null
          confidence_score?: number | null
          created_at?: string
          dismissed?: boolean | null
          id?: string
          manga_id?: string | null
          reason?: string | null
          recommendation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "manga"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          anime_id: string | null
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          manga_id: string | null
          rating: number | null
          spoiler_warning: boolean | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anime_id?: string | null
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          manga_id?: string | null
          rating?: number | null
          spoiler_warning?: boolean | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anime_id?: string | null
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          manga_id?: string | null
          rating?: number | null
          spoiler_warning?: boolean | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "manga"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      title_authors: {
        Row: {
          author_id: string
          title_id: string
        }
        Insert: {
          author_id: string
          title_id: string
        }
        Update: {
          author_id?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_authors_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      title_genres: {
        Row: {
          genre_id: string
          title_id: string
        }
        Insert: {
          genre_id: string
          title_id: string
        }
        Update: {
          genre_id?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_genres_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      title_studios: {
        Row: {
          studio_id: string
          title_id: string
        }
        Insert: {
          studio_id: string
          title_id: string
        }
        Update: {
          studio_id?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_studios_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_studios_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          anilist_id: number
          color_theme: string | null
          content_type: string
          created_at: string | null
          favorites: number | null
          id: string
          image_url: string | null
          members: number | null
          popularity: number | null
          rank: number | null
          score: number | null
          synopsis: string | null
          title: string
          title_english: string | null
          title_japanese: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          anilist_id: number
          color_theme?: string | null
          content_type: string
          created_at?: string | null
          favorites?: number | null
          id?: string
          image_url?: string | null
          members?: number | null
          popularity?: number | null
          rank?: number | null
          score?: number | null
          synopsis?: string | null
          title: string
          title_english?: string | null
          title_japanese?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          anilist_id?: number
          color_theme?: string | null
          content_type?: string
          created_at?: string | null
          favorites?: number | null
          id?: string
          image_url?: string | null
          members?: number | null
          popularity?: number | null
          rank?: number | null
          score?: number | null
          synopsis?: string | null
          title?: string
          title_english?: string | null
          title_japanese?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      user_anime_lists: {
        Row: {
          anime_id: string
          created_at: string
          episodes_watched: number | null
          finish_date: string | null
          id: string
          notes: string | null
          score: number | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anime_id: string
          created_at?: string
          episodes_watched?: number | null
          finish_date?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anime_id?: string
          created_at?: string
          episodes_watched?: number | null
          finish_date?: string | null
          id?: string
          notes?: string | null
          score?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_anime_lists_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_manga_lists: {
        Row: {
          chapters_read: number | null
          created_at: string
          finish_date: string | null
          id: string
          manga_id: string
          notes: string | null
          score: number | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          volumes_read: number | null
        }
        Insert: {
          chapters_read?: number | null
          created_at?: string
          finish_date?: string | null
          id?: string
          manga_id: string
          notes?: string | null
          score?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          volumes_read?: number | null
        }
        Update: {
          chapters_read?: number | null
          created_at?: string
          finish_date?: string | null
          id?: string
          manga_id?: string
          notes?: string | null
          score?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          volumes_read?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_manga_lists_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "manga"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_add_sequels: boolean | null
          created_at: string
          excluded_genres: string[] | null
          id: string
          list_visibility: string | null
          notification_settings: Json | null
          preferred_genres: string[] | null
          privacy_level: string | null
          show_adult_content: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_add_sequels?: boolean | null
          created_at?: string
          excluded_genres?: string[] | null
          id?: string
          list_visibility?: string | null
          notification_settings?: Json | null
          preferred_genres?: string[] | null
          privacy_level?: string | null
          show_adult_content?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_add_sequels?: boolean | null
          created_at?: string
          excluded_genres?: string[] | null
          id?: string
          list_visibility?: string | null
          notification_settings?: Json | null
          preferred_genres?: string[] | null
          privacy_level?: string | null
          show_adult_content?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recent_anime: {
        Args: { limit_param?: number }
        Returns: {
          id: string
          anilist_id: number
          title: string
          title_english: string
          title_japanese: string
          synopsis: string
          image_url: string
          score: number
          rank: number
          popularity: number
          members: number
          favorites: number
          year: number
          color_theme: string
          content_type: string
          created_at: string
          updated_at: string
          episodes: number
          aired_from: string
          aired_to: string
          season: string
          status: string
          type: string
          trailer_url: string
          trailer_site: string
          trailer_id: string
          next_episode_date: string
          next_episode_number: number
        }[]
      }
      get_recent_manga: {
        Args: { limit_param?: number }
        Returns: {
          id: string
          anilist_id: number
          title: string
          title_english: string
          title_japanese: string
          synopsis: string
          image_url: string
          score: number
          rank: number
          popularity: number
          members: number
          favorites: number
          year: number
          color_theme: string
          content_type: string
          created_at: string
          updated_at: string
          chapters: number
          volumes: number
          published_from: string
          published_to: string
          status: string
          type: string
          next_chapter_date: string
          next_chapter_number: number
        }[]
      }
      get_trending_anime: {
        Args: { limit_param?: number }
        Returns: {
          id: string
          anilist_id: number
          title: string
          title_english: string
          title_japanese: string
          synopsis: string
          image_url: string
          score: number
          rank: number
          popularity: number
          members: number
          favorites: number
          year: number
          color_theme: string
          content_type: string
          created_at: string
          updated_at: string
          episodes: number
          aired_from: string
          aired_to: string
          season: string
          status: string
          type: string
          trailer_url: string
          trailer_site: string
          trailer_id: string
          next_episode_date: string
          next_episode_number: number
        }[]
      }
      get_trending_manga: {
        Args: { limit_param?: number }
        Returns: {
          id: string
          anilist_id: number
          title: string
          title_english: string
          title_japanese: string
          synopsis: string
          image_url: string
          score: number
          rank: number
          popularity: number
          members: number
          favorites: number
          year: number
          color_theme: string
          content_type: string
          created_at: string
          updated_at: string
          chapters: number
          volumes: number
          published_from: string
          published_to: string
          status: string
          type: string
          next_chapter_date: string
          next_chapter_number: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
