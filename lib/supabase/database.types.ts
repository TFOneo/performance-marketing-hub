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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          country: Database["public"]["Enums"]["country_t"]
          created_at: string
          id: string
          month: string
          planned_usd: number
          platform: Database["public"]["Enums"]["platform_t"]
          updated_at: string
          user_id: string
        }
        Insert: {
          country: Database["public"]["Enums"]["country_t"]
          created_at?: string
          id?: string
          month: string
          planned_usd?: number
          platform: Database["public"]["Enums"]["platform_t"]
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: Database["public"]["Enums"]["country_t"]
          created_at?: string
          id?: string
          month?: string
          planned_usd?: number
          platform?: Database["public"]["Enums"]["platform_t"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_funnel_entries: {
        Row: {
          ai_rated_at: string | null
          ai_rating_band: string | null
          ai_rating_rationale: string | null
          ai_rating_score: number | null
          ai_recommendations: Json | null
          campaign_id: string
          client: number
          created_at: string
          id: string
          leads: number
          period_end: string
          period_start: string
          sal1: number
          sal2: number
          spend_usd: number
          sql1: number
          sql2: number
          user_id: string
        }
        Insert: {
          ai_rated_at?: string | null
          ai_rating_band?: string | null
          ai_rating_rationale?: string | null
          ai_rating_score?: number | null
          ai_recommendations?: Json | null
          campaign_id: string
          client?: number
          created_at?: string
          id?: string
          leads?: number
          period_end: string
          period_start: string
          sal1?: number
          sal2?: number
          spend_usd?: number
          sql1?: number
          sql2?: number
          user_id: string
        }
        Update: {
          ai_rated_at?: string | null
          ai_rating_band?: string | null
          ai_rating_rationale?: string | null
          ai_rating_score?: number | null
          ai_recommendations?: Json | null
          campaign_id?: string
          client?: number
          created_at?: string
          id?: string
          leads?: number
          period_end?: string
          period_start?: string
          sal1?: number
          sal2?: number
          spend_usd?: number
          sql1?: number
          sql2?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_funnel_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          country: Database["public"]["Enums"]["country_t"]
          created_at: string
          end_date: string | null
          id: string
          name: string
          notes: string | null
          platform: Database["public"]["Enums"]["platform_t"]
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status_t"]
          total_budget_usd: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          country: Database["public"]["Enums"]["country_t"]
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          platform: Database["public"]["Enums"]["platform_t"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status_t"]
          total_budget_usd?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: Database["public"]["Enums"]["country_t"]
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform_t"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status_t"]
          total_budget_usd?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          linked_campaign_ids: string[]
          notes_markdown: string | null
          owner: string | null
          progress_pct: number
          status: Database["public"]["Enums"]["project_status_t"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          linked_campaign_ids?: string[]
          notes_markdown?: string | null
          owner?: string | null
          progress_pct?: number
          status?: Database["public"]["Enums"]["project_status_t"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          linked_campaign_ids?: string[]
          notes_markdown?: string | null
          owner?: string | null
          progress_pct?: number
          status?: Database["public"]["Enums"]["project_status_t"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reallocation_runs: {
        Row: {
          applied_at: string | null
          applied_move_index: number | null
          created_at: string
          generated_at: string
          id: string
          lookback_weeks: number
          payload: Json
          status: Database["public"]["Enums"]["suggestion_status_t"]
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          applied_move_index?: number | null
          created_at?: string
          generated_at?: string
          id?: string
          lookback_weeks?: number
          payload: Json
          status?: Database["public"]["Enums"]["suggestion_status_t"]
          user_id: string
        }
        Update: {
          applied_at?: string | null
          applied_move_index?: number | null
          created_at?: string
          generated_at?: string
          id?: string
          lookback_weeks?: number
          payload?: Json
          status?: Database["public"]["Enums"]["suggestion_status_t"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_funnel: {
        Row: {
          client: number
          country: Database["public"]["Enums"]["country_t"]
          created_at: string
          id: string
          leads: number
          notes: string | null
          platform: Database["public"]["Enums"]["platform_t"]
          sal1: number
          sal2: number
          spend_usd: number
          sql1: number
          sql2: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          client?: number
          country: Database["public"]["Enums"]["country_t"]
          created_at?: string
          id?: string
          leads?: number
          notes?: string | null
          platform: Database["public"]["Enums"]["platform_t"]
          sal1?: number
          sal2?: number
          spend_usd?: number
          sql1?: number
          sql2?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          client?: number
          country?: Database["public"]["Enums"]["country_t"]
          created_at?: string
          id?: string
          leads?: number
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform_t"]
          sal1?: number
          sal2?: number
          spend_usd?: number
          sql1?: number
          sql2?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      monthly_actuals: {
        Row: {
          actual_usd: number | null
          cost_per_sal1: number | null
          country: Database["public"]["Enums"]["country_t"] | null
          leads: number | null
          month: string | null
          platform: Database["public"]["Enums"]["platform_t"] | null
          sal1: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_reallocation: {
        Args: { p_move_index: number; p_run_id: string }
        Returns: undefined
      }
    }
    Enums: {
      campaign_status_t: "active" | "paused" | "ended"
      country_t: "KSA" | "UAE" | "Kuwait" | "Bahrain"
      platform_t: "google" | "meta" | "linkedin"
      project_status_t: "not_started" | "in_progress" | "blocked" | "done"
      suggestion_status_t: "pending" | "applied" | "dismissed"
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
      campaign_status_t: ["active", "paused", "ended"],
      country_t: ["KSA", "UAE", "Kuwait", "Bahrain"],
      platform_t: ["google", "meta", "linkedin"],
      project_status_t: ["not_started", "in_progress", "blocked", "done"],
      suggestion_status_t: ["pending", "applied", "dismissed"],
    },
  },
} as const
