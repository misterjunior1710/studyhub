export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      ban_appeals: {
        Row: {
          admin_response: string | null
          created_at: string
          id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          id?: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborative_docs: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string
          group_id: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by: string
          group_id: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string
          group_id?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborative_docs_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_helpful_votes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_helpful_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          helpful_count: number | null
          id: string
          is_accepted: boolean | null
          is_helpful: boolean | null
          is_verified: boolean | null
          post_id: string
          quality_score: number | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
          xp_awarded: boolean | null
        }
        Insert: {
          content: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_accepted?: boolean | null
          is_helpful?: boolean | null
          is_verified?: boolean | null
          post_id: string
          quality_score?: number | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          xp_awarded?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_accepted?: boolean | null
          is_helpful?: boolean | null
          is_verified?: boolean | null
          post_id?: string
          quality_score?: number | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          xp_awarded?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          created_at: string
          date: string
          id: string
          total_errors: number
          total_flagged: number
          total_payments: number
          total_posts: number
          total_users: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          total_errors?: number
          total_flagged?: number
          total_payments?: number
          total_posts?: number
          total_users?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_errors?: number
          total_flagged?: number
          total_payments?: number
          total_posts?: number
          total_users?: number
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          reminder_enabled: boolean | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          reminder_enabled?: boolean | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          reminder_enabled?: boolean | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "study_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_shares: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          shared_by_user_id?: string
          shared_with_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_shares_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "study_events"
            referencedColumns: ["id"]
          },
        ]
      }
      feynman_notes: {
        Row: {
          concept: string
          created_at: string
          gaps_identified: string | null
          id: string
          is_public: boolean | null
          refined_explanation: string | null
          simple_explanation: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          concept: string
          created_at?: string
          gaps_identified?: string | null
          id?: string
          is_public?: boolean | null
          refined_explanation?: string | null
          simple_explanation?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          concept?: string
          created_at?: string
          gaps_identified?: string | null
          id?: string
          is_public?: boolean | null
          refined_explanation?: string | null
          simple_explanation?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_decks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          flashcard_id: string
          id: string
          reviewed_at: string
          user_id: string
          was_correct: boolean
        }
        Insert: {
          flashcard_id: string
          id?: string
          reviewed_at?: string
          user_id: string
          was_correct: boolean
        }
        Update: {
          flashcard_id?: string
          id?: string
          reviewed_at?: string
          user_id?: string
          was_correct?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          box_number: number
          created_at: string
          deck_id: string
          front: string
          id: string
          next_review_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          box_number?: number
          created_at?: string
          deck_id: string
          front: string
          id?: string
          next_review_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          box_number?: number
          created_at?: string
          deck_id?: string
          front?: string
          id?: string
          next_review_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_study_content: {
        Row: {
          created_at: string
          examples: Json | null
          explanation: string | null
          generation_status: string
          grade: string
          id: string
          key_concepts: Json | null
          practice_questions: Json | null
          revision_notes: string | null
          sources: Json | null
          stream: string
          subject: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          examples?: Json | null
          explanation?: string | null
          generation_status?: string
          grade: string
          id?: string
          key_concepts?: Json | null
          practice_questions?: Json | null
          revision_notes?: string | null
          sources?: Json | null
          stream: string
          subject: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          examples?: Json | null
          explanation?: string | null
          generation_status?: string
          grade?: string
          id?: string
          key_concepts?: Json | null
          practice_questions?: Json | null
          revision_notes?: string | null
          sources?: Json | null
          stream?: string
          subject?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_chats: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          show_in_browse: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          show_in_browse?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          show_in_browse?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      group_join_requests: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          message: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          content: string
          created_at: string | null
          file_type: string | null
          file_url: string | null
          group_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          content: string
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          group_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          content?: string
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          group_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_map_nodes: {
        Row: {
          color: string | null
          content: string
          created_at: string
          id: string
          mind_map_id: string
          parent_id: string | null
          position_x: number
          position_y: number
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string
          id?: string
          mind_map_id: string
          parent_id?: string | null
          position_x?: number
          position_y?: number
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          mind_map_id?: string
          parent_id?: string | null
          position_x?: number
          position_y?: number
        }
        Relationships: [
          {
            foreignKeyName: "mind_map_nodes_mind_map_id_fkey"
            columns: ["mind_map_id"]
            isOneToOne: false
            referencedRelation: "mind_maps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_map_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mind_map_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_maps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          country: string
          created_at: string
          downvotes: number
          file_url: string | null
          flag_reason: string | null
          flagged_at: string | null
          flagged_by: string | null
          grade: string
          id: string
          is_anonymous: boolean | null
          is_flagged: boolean | null
          is_hidden: boolean | null
          post_type: string
          quiet_mode: boolean | null
          stream: string
          subject: string
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          country: string
          created_at?: string
          downvotes?: number
          file_url?: string | null
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          grade: string
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          post_type?: string
          quiet_mode?: boolean | null
          stream: string
          subject: string
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          country?: string
          created_at?: string
          downvotes?: number
          file_url?: string | null
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          grade?: string
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          post_type?: string
          quiet_mode?: boolean | null
          stream?: string
          subject?: string
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_dms: boolean | null
          app_language: string | null
          auto_start_focus_timer: boolean | null
          avatar_url: string | null
          banned_until: string | null
          bio: string | null
          blocked_subjects: string[] | null
          country: string | null
          created_at: string
          daily_hours_target: number | null
          daily_reminder_time: string | null
          daily_xp_date: string | null
          date_format: string | null
          grade: string | null
          id: string
          is_banned: boolean | null
          is_public: boolean | null
          last_active_date: string | null
          notify_announcements: boolean | null
          notify_doubt_replies: boolean | null
          notify_feature_updates: boolean | null
          notify_group_updates: boolean | null
          notify_mentions: boolean | null
          notify_mock_tests: boolean | null
          notify_weekly_report: boolean | null
          points: number | null
          safe_mode: boolean | null
          show_online_status: boolean | null
          show_verified_only: boolean | null
          streak_days: number | null
          stream: string | null
          strike_count: number | null
          theme_color: string | null
          timezone: string | null
          username: string | null
          weekly_study_goal: number | null
          weekly_xp_last_reset: string | null
        }
        Insert: {
          allow_dms?: boolean | null
          app_language?: string | null
          auto_start_focus_timer?: boolean | null
          avatar_url?: string | null
          banned_until?: string | null
          bio?: string | null
          blocked_subjects?: string[] | null
          country?: string | null
          created_at?: string
          daily_hours_target?: number | null
          daily_reminder_time?: string | null
          daily_xp_date?: string | null
          date_format?: string | null
          grade?: string | null
          id: string
          is_banned?: boolean | null
          is_public?: boolean | null
          last_active_date?: string | null
          notify_announcements?: boolean | null
          notify_doubt_replies?: boolean | null
          notify_feature_updates?: boolean | null
          notify_group_updates?: boolean | null
          notify_mentions?: boolean | null
          notify_mock_tests?: boolean | null
          notify_weekly_report?: boolean | null
          points?: number | null
          safe_mode?: boolean | null
          show_online_status?: boolean | null
          show_verified_only?: boolean | null
          streak_days?: number | null
          stream?: string | null
          strike_count?: number | null
          theme_color?: string | null
          timezone?: string | null
          username?: string | null
          weekly_study_goal?: number | null
          weekly_xp_last_reset?: string | null
        }
        Update: {
          allow_dms?: boolean | null
          app_language?: string | null
          auto_start_focus_timer?: boolean | null
          avatar_url?: string | null
          banned_until?: string | null
          bio?: string | null
          blocked_subjects?: string[] | null
          country?: string | null
          created_at?: string
          daily_hours_target?: number | null
          daily_reminder_time?: string | null
          daily_xp_date?: string | null
          date_format?: string | null
          grade?: string | null
          id?: string
          is_banned?: boolean | null
          is_public?: boolean | null
          last_active_date?: string | null
          notify_announcements?: boolean | null
          notify_doubt_replies?: boolean | null
          notify_feature_updates?: boolean | null
          notify_group_updates?: boolean | null
          notify_mentions?: boolean | null
          notify_mock_tests?: boolean | null
          notify_weekly_report?: boolean | null
          points?: number | null
          safe_mode?: boolean | null
          show_online_status?: boolean | null
          show_verified_only?: boolean | null
          streak_days?: number | null
          stream?: string | null
          strike_count?: number | null
          theme_color?: string | null
          timezone?: string | null
          username?: string | null
          weekly_study_goal?: number | null
          weekly_xp_last_reset?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          quiz_id: string
          score?: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json | null
          order_index: number
          question: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          question: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          order_index?: number
          question?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          created_at: string
          current_step: string
          id: string
          questions: string | null
          read_notes: string | null
          recite_notes: string | null
          review_notes: string | null
          source_material: string | null
          survey_notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: string
          id?: string
          questions?: string | null
          read_notes?: string | null
          recite_notes?: string | null
          review_notes?: string | null
          source_material?: string | null
          survey_notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: string
          id?: string
          questions?: string | null
          read_notes?: string | null
          recite_notes?: string | null
          review_notes?: string | null
          source_material?: string | null
          survey_notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      study_events: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          group_id: string | null
          id: string
          is_public: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          reminder_sent: boolean | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          group_id?: string | null
          id?: string
          is_public?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          reminder_sent?: boolean | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          group_id?: string | null
          id?: string
          is_public?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          reminder_sent?: boolean | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          ended_at: string | null
          id: string
          session_type: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          issued_by: string | null
          post_id: string | null
          reason: string
          user_id: string
          warning_type: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_by?: string | null
          post_id?: string | null
          reason: string
          user_id: string
          warning_type: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_by?: string | null
          post_id?: string | null
          reason?: string
          user_id?: string
          warning_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_warnings_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp_totals: {
        Row: {
          last_updated_at: string
          total_xp: number
          user_id: string
          week_start: string
          weekly_xp: number
        }
        Insert: {
          last_updated_at?: string
          total_xp?: number
          user_id: string
          week_start?: string
          weekly_xp?: number
        }
        Update: {
          last_updated_at?: string
          total_xp?: number
          user_id?: string
          week_start?: string
          weekly_xp?: number
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      whiteboard_shares: {
        Row: {
          can_edit: boolean | null
          created_at: string | null
          id: string
          shared_with_user_id: string
          whiteboard_id: string
        }
        Insert: {
          can_edit?: boolean | null
          created_at?: string | null
          id?: string
          shared_with_user_id: string
          whiteboard_id: string
        }
        Update: {
          can_edit?: boolean | null
          created_at?: string | null
          id?: string
          shared_with_user_id?: string
          whiteboard_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whiteboard_shares_whiteboard_id_fkey"
            columns: ["whiteboard_id"]
            isOneToOne: false
            referencedRelation: "whiteboards"
            referencedColumns: ["id"]
          },
        ]
      }
      whiteboards: {
        Row: {
          canvas_data: Json | null
          created_at: string | null
          created_by: string
          group_id: string | null
          id: string
          is_public: boolean | null
          name: string
          share_token: string | null
          updated_at: string | null
        }
        Insert: {
          canvas_data?: Json | null
          created_at?: string | null
          created_by: string
          group_id?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          share_token?: string | null
          updated_at?: string | null
        }
        Update: {
          canvas_data?: Json | null
          created_at?: string | null
          created_by?: string
          group_id?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          share_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          idempotency_key: string
          metadata: Json | null
          source_id: string | null
          source_type: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          idempotency_key: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          idempotency_key?: string
          metadata?: Json | null
          source_id?: string | null
          source_type?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          grade: string | null
          id: string | null
          is_public: boolean | null
          points: number | null
          streak_days: number | null
          stream: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string | null
          is_public?: boolean | null
          points?: number | null
          streak_days?: number | null
          stream?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string | null
          is_public?: boolean | null
          points?: number | null
          streak_days?: number | null
          stream?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_xp: {
        Args: {
          p_event_type: string
          p_metadata?: Json
          p_source_id?: string
          p_source_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      can_edit_whiteboard: {
        Args: { _user_id: string; _whiteboard_id: string }
        Returns: boolean
      }
      can_view_whiteboard: {
        Args: { _user_id: string; _whiteboard_id: string }
        Returns: boolean
      }
      get_daily_answer_xp_remaining: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_xp_tier: { Args: { p_event_type: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_verifier: { Args: { _user_id: string }; Returns: boolean }
      is_whiteboard_owner: {
        Args: { _user_id: string; _whiteboard_id: string }
        Returns: boolean
      }
      reset_weekly_xp: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "verifier"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "verifier"],
    },
  },
} as const
