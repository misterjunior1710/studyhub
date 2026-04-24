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
      activity_feed: {
        Row: {
          actor_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
        }
        Insert: {
          actor_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          actor_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
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
      announcements: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          id: string
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          content: string
          created_at?: string
          id?: string
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          name: string
          rarity: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value?: number
          description: string
          icon: string
          id?: string
          name: string
          rarity: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string
          slug?: string
          sort_order?: number
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
      cached_updates: {
        Row: {
          fetched_at: string
          id: string
          payload: Json
        }
        Insert: {
          fetched_at?: string
          id: string
          payload: Json
        }
        Update: {
          fetched_at?: string
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          idempotency_key: string
          metadata: Json | null
          reason: string
          source_id: string | null
          source_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          idempotency_key: string
          metadata?: Json | null
          reason: string
          source_id?: string | null
          source_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          metadata?: Json | null
          reason?: string
          source_id?: string | null
          source_type?: string | null
          user_id?: string
        }
        Relationships: []
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
      daily_goals: {
        Row: {
          completed: boolean
          created_at: string
          goal_type: string
          id: string
          local_date: string
          progress: number
          reward_claimed: boolean
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          goal_type: string
          id?: string
          local_date: string
          progress?: number
          reward_claimed?: boolean
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          goal_type?: string
          id?: string
          local_date?: string
          progress?: number
          reward_claimed?: boolean
          target?: number
          updated_at?: string
          user_id?: string
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
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
      follows: {
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
      leagues: {
        Row: {
          color: string
          icon: string
          min_weekly_xp: number
          name: string
          slug: string
          tier: number
        }
        Insert: {
          color: string
          icon: string
          min_weekly_xp: number
          name: string
          slug: string
          tier: number
        }
        Update: {
          color?: string
          icon?: string
          min_weekly_xp?: number
          name?: string
          slug?: string
          tier?: number
        }
        Relationships: []
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
      missions: {
        Row: {
          coin_reward: number
          created_at: string
          description: string
          difficulty: string
          event_type: string
          icon: string | null
          id: string
          is_active: boolean
          period: string
          slug: string
          sort_order: number
          target: number
          title: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          created_at?: string
          description: string
          difficulty?: string
          event_type: string
          icon?: string | null
          id?: string
          is_active?: boolean
          period: string
          slug: string
          sort_order?: number
          target?: number
          title: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          created_at?: string
          description?: string
          difficulty?: string
          event_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          period?: string
          slug?: string
          sort_order?: number
          target?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          subject?: string | null
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
          dedupe_key: string | null
          id: string
          is_read: boolean
          post_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          dedupe_key?: string | null
          id?: string
          is_read?: boolean
          post_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          dedupe_key?: string | null
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
          hashtags: string[] | null
          id: string
          is_anonymous: boolean | null
          is_flagged: boolean | null
          is_hidden: boolean | null
          mentions: string[] | null
          post_type: string
          quiet_mode: boolean | null
          share_count: number
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
          hashtags?: string[] | null
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          mentions?: string[] | null
          post_type?: string
          quiet_mode?: boolean | null
          share_count?: number
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
          hashtags?: string[] | null
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          mentions?: string[] | null
          post_type?: string
          quiet_mode?: boolean | null
          share_count?: number
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
      powerups: {
        Row: {
          category: string
          cost_coins: number
          created_at: string
          description: string
          duration_minutes: number
          icon: string | null
          id: string
          is_active: boolean
          multiplier: number
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          category: string
          cost_coins?: number
          created_at?: string
          description: string
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          multiplier?: number
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          category?: string
          cost_coins?: number
          created_at?: string
          description?: string
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          multiplier?: number
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
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
          current_league: string
          daily_hours_target: number | null
          daily_reminder_time: string | null
          daily_xp_date: string | null
          date_format: string | null
          grade: string | null
          id: string
          is_banned: boolean | null
          is_public: boolean | null
          last_active_date: string | null
          last_streak_date: string | null
          notify_announcements: boolean | null
          notify_doubt_replies: boolean | null
          notify_feature_updates: boolean | null
          notify_group_updates: boolean | null
          notify_mentions: boolean | null
          notify_mock_tests: boolean | null
          notify_weekly_report: boolean | null
          onboarding_completed: boolean | null
          onboarding_tasks: Json | null
          points: number | null
          safe_mode: boolean | null
          show_online_status: boolean | null
          show_verified_only: boolean | null
          sound_enabled: boolean
          streak_days: number | null
          stream: string | null
          strike_count: number | null
          subjects: string[] | null
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
          current_league?: string
          daily_hours_target?: number | null
          daily_reminder_time?: string | null
          daily_xp_date?: string | null
          date_format?: string | null
          grade?: string | null
          id: string
          is_banned?: boolean | null
          is_public?: boolean | null
          last_active_date?: string | null
          last_streak_date?: string | null
          notify_announcements?: boolean | null
          notify_doubt_replies?: boolean | null
          notify_feature_updates?: boolean | null
          notify_group_updates?: boolean | null
          notify_mentions?: boolean | null
          notify_mock_tests?: boolean | null
          notify_weekly_report?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_tasks?: Json | null
          points?: number | null
          safe_mode?: boolean | null
          show_online_status?: boolean | null
          show_verified_only?: boolean | null
          sound_enabled?: boolean
          streak_days?: number | null
          stream?: string | null
          strike_count?: number | null
          subjects?: string[] | null
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
          current_league?: string
          daily_hours_target?: number | null
          daily_reminder_time?: string | null
          daily_xp_date?: string | null
          date_format?: string | null
          grade?: string | null
          id?: string
          is_banned?: boolean | null
          is_public?: boolean | null
          last_active_date?: string | null
          last_streak_date?: string | null
          notify_announcements?: boolean | null
          notify_doubt_replies?: boolean | null
          notify_feature_updates?: boolean | null
          notify_group_updates?: boolean | null
          notify_mentions?: boolean | null
          notify_mock_tests?: boolean | null
          notify_weekly_report?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_tasks?: Json | null
          points?: number | null
          safe_mode?: boolean | null
          show_online_status?: boolean | null
          show_verified_only?: boolean | null
          sound_enabled?: boolean
          streak_days?: number | null
          stream?: string | null
          strike_count?: number | null
          subjects?: string[] | null
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_slug: string
          id: string
          seen: boolean
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_slug: string
          id?: string
          seen?: boolean
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_slug?: string
          id?: string
          seen?: boolean
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_slug_fkey"
            columns: ["badge_slug"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["slug"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          mission_id: string
          period_start: string
          progress: number
          reward_claimed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          mission_id: string
          period_start: string
          progress?: number
          reward_claimed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          mission_id?: string
          period_start?: string
          progress?: number
          reward_claimed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_powerups: {
        Row: {
          activated_at: string
          category: string
          expires_at: string
          id: string
          multiplier: number
          powerup_id: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          category: string
          expires_at: string
          id?: string
          multiplier: number
          powerup_id: string
          user_id: string
        }
        Update: {
          activated_at?: string
          category?: string
          expires_at?: string
          id?: string
          multiplier?: number
          powerup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_powerups_powerup_id_fkey"
            columns: ["powerup_id"]
            isOneToOne: false
            referencedRelation: "powerups"
            referencedColumns: ["id"]
          },
        ]
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
      user_wallet: {
        Row: {
          coins: number
          streak_freezes: number
          total_coins_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coins?: number
          streak_freezes?: number
          total_coins_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coins?: number
          streak_freezes?: number
          total_coins_earned?: number
          updated_at?: string
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
      activate_powerup: { Args: { _slug: string }; Returns: Json }
      assign_daily_missions: { Args: never; Returns: Json }
      assign_weekly_missions: { Args: never; Returns: Json }
      auto_assign_user_to_groups: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      award_coins: {
        Args: {
          p_amount: number
          p_metadata?: Json
          p_reason: string
          p_source_id?: string
          p_source_type?: string
          p_user_id: string
        }
        Returns: Json
      }
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
      can_access_dm_file: { Args: { _object_name: string }; Returns: boolean }
      can_edit_whiteboard: {
        Args: { _user_id: string; _whiteboard_id: string }
        Returns: boolean
      }
      can_view_whiteboard: {
        Args: { _user_id: string; _whiteboard_id: string }
        Returns: boolean
      }
      check_and_award_badges: { Args: { p_user_id: string }; Returns: number }
      claim_mission_reward: {
        Args: { _user_mission_id: string }
        Returns: Json
      }
      create_whiteboard: {
        Args: { p_group_id?: string; p_name?: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      ensure_auto_group: {
        Args: { p_description: string; p_name: string }
        Returns: string
      }
      follow_user: { Args: { _target: string }; Returns: Json }
      get_active_xp_multiplier: { Args: { _user_id: string }; Returns: number }
      get_activity_feed: {
        Args: { _limit?: number }
        Returns: {
          actor_avatar_url: string
          actor_id: string
          actor_username: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
        }[]
      }
      get_daily_answer_xp_remaining: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_leaderboard: {
        Args: { p_limit?: number; p_period?: string; p_scope?: string }
        Returns: {
          avatar_url: string
          country: string
          current_league: string
          rank: number
          user_id: string
          username: string
          xp: number
        }[]
      }
      get_user_level: { Args: { p_total_xp: number }; Returns: Json }
      get_user_rank: {
        Args: { p_period?: string; p_scope?: string }
        Returns: Json
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
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_following: {
        Args: { _follower: string; _following: string }
        Returns: boolean
      }
      is_group_admin: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_mutual_friend: {
        Args: { _user_a: string; _user_b: string }
        Returns: boolean
      }
      is_verifier: { Args: { _user_id: string }; Returns: boolean }
      is_whiteboard_owner: {
        Args: { _user_id: string; _whiteboard_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      purchase_streak_freeze: { Args: never; Returns: Json }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      recalculate_leagues: { Args: never; Returns: undefined }
      reset_weekly_xp: { Args: never; Returns: undefined }
      unfollow_user: { Args: { _target: string }; Returns: Json }
      update_daily_goal: {
        Args: { p_goal_type: string; p_increment?: number; p_user_id: string }
        Returns: Json
      }
      update_mission_progress: {
        Args: { _event_type: string; _user_id: string; _value?: number }
        Returns: undefined
      }
      update_user_streak: { Args: { p_user_id: string }; Returns: undefined }
      update_user_streak_v2: { Args: { p_user_id: string }; Returns: Json }
      user_local_date: { Args: { p_user_id: string }; Returns: string }
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
