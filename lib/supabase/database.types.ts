// Hand-written placeholder. Regenerate after linking the Supabase project:
//   pnpm db:types
// (runs: supabase gen types typescript --linked --schema public > lib/supabase/database.types.ts)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PlatformT = "google" | "meta" | "linkedin";
export type CountryT = "KSA" | "UAE" | "Kuwait" | "Bahrain";
export type CampaignStatusT = "active" | "paused" | "ended";
export type ProjectStatusT = "not_started" | "in_progress" | "blocked" | "done";
export type SuggestionStatusT = "pending" | "applied" | "dismissed";

interface FunnelMetrics {
  spend_usd: number;
  leads: number;
  sql1: number;
  sql2: number;
  sal1: number;
  sal2: number;
  client: number;
}

export interface Database {
  public: {
    Tables: {
      weekly_funnel: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          platform: PlatformT;
          country: CountryT;
          spend_usd: number;
          leads: number;
          sql1: number;
          sql2: number;
          sal1: number;
          sal2: number;
          client: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<FunnelMetrics> & {
          id?: string;
          user_id: string;
          week_start: string;
          platform: PlatformT;
          country: CountryT;
          notes?: string | null;
        };
        Update: Partial<FunnelMetrics> & {
          notes?: string | null;
          week_start?: string;
          platform?: PlatformT;
          country?: CountryT;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          platform: PlatformT;
          country: CountryT;
          status: CampaignStatusT;
          start_date: string | null;
          end_date: string | null;
          total_budget_usd: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          platform: PlatformT;
          country: CountryT;
          status?: CampaignStatusT;
          start_date?: string | null;
          end_date?: string | null;
          total_budget_usd?: number | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          platform?: PlatformT;
          country?: CountryT;
          status?: CampaignStatusT;
          start_date?: string | null;
          end_date?: string | null;
          total_budget_usd?: number | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      campaign_funnel_entries: {
        Row: {
          id: string;
          user_id: string;
          campaign_id: string;
          period_start: string;
          period_end: string;
          spend_usd: number;
          leads: number;
          sql1: number;
          sql2: number;
          sal1: number;
          sal2: number;
          client: number;
          ai_rating_score: number | null;
          ai_rating_band: string | null;
          ai_rating_rationale: string | null;
          ai_recommendations: Json | null;
          ai_rated_at: string | null;
          created_at: string;
        };
        Insert: Partial<FunnelMetrics> & {
          id?: string;
          user_id: string;
          campaign_id: string;
          period_start: string;
          period_end: string;
        };
        Update: Partial<FunnelMetrics> & {
          period_start?: string;
          period_end?: string;
          ai_rating_score?: number | null;
          ai_rating_band?: string | null;
          ai_rating_rationale?: string | null;
          ai_recommendations?: Json | null;
          ai_rated_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          owner: string | null;
          status: ProjectStatusT;
          progress_pct: number;
          due_date: string | null;
          notes_markdown: string | null;
          linked_campaign_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          owner?: string | null;
          status?: ProjectStatusT;
          progress_pct?: number;
          due_date?: string | null;
          notes_markdown?: string | null;
          linked_campaign_ids?: string[];
        };
        Update: {
          title?: string;
          owner?: string | null;
          status?: ProjectStatusT;
          progress_pct?: number;
          due_date?: string | null;
          notes_markdown?: string | null;
          linked_campaign_ids?: string[];
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          platform: PlatformT;
          country: CountryT;
          planned_usd: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          platform: PlatformT;
          country: CountryT;
          planned_usd?: number;
        };
        Update: {
          month?: string;
          platform?: PlatformT;
          country?: CountryT;
          planned_usd?: number;
        };
        Relationships: [];
      };
      reallocation_runs: {
        Row: {
          id: string;
          user_id: string;
          generated_at: string;
          lookback_weeks: number;
          payload: Json;
          status: SuggestionStatusT;
          applied_move_index: number | null;
          applied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lookback_weeks?: number;
          payload: Json;
          status?: SuggestionStatusT;
        };
        Update: {
          status?: SuggestionStatusT;
          applied_move_index?: number | null;
          applied_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      monthly_actuals: {
        Row: {
          user_id: string;
          month: string;
          platform: PlatformT;
          country: CountryT;
          actual_usd: number;
          leads: number;
          sal1: number;
          cost_per_sal1: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      apply_reallocation: {
        Args: { p_run_id: string; p_move_index: number };
        Returns: void;
      };
    };
    Enums: {
      platform_t: PlatformT;
      country_t: CountryT;
      campaign_status_t: CampaignStatusT;
      project_status_t: ProjectStatusT;
      suggestion_status_t: SuggestionStatusT;
    };
    CompositeTypes: Record<string, never>;
  };
}
