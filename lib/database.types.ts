/**
 * Generated from the Supabase schema (project: scv / erccluueswqqbukaikut).
 * Regenerate with:  npx supabase gen types typescript --project-id erccluueswqqbukaikut
 */

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      buildings: {
        Row: {
          address: string | null
          building_name: string | null
          city: string | null
          conv_date: string | null
          conv_review: string | null
          county: string | null
          created_at: string
          fha_exp: string | null
          fha_method: string | null
          fha_status: string | null
          id: number
          precon: string | null
          precon_status: string | null
          recert_status: string | null
          recert_year: number | null
          registry_enf: string | null
          registry_status: string | null
          sb4d: string | null
          sb4d_bldgs_3plus: number | null
          sb4d_units: number | null
          signal_count: number | null
          signals: string | null
          sirs_filed: string | null
          tri_county: string | null
          va_date: string | null
          va_status: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          building_name?: string | null
          city?: string | null
          conv_date?: string | null
          conv_review?: string | null
          county?: string | null
          created_at?: string
          fha_exp?: string | null
          fha_method?: string | null
          fha_status?: string | null
          id?: never
          precon?: string | null
          precon_status?: string | null
          recert_status?: string | null
          recert_year?: number | null
          registry_enf?: string | null
          registry_status?: string | null
          sb4d?: string | null
          sb4d_bldgs_3plus?: number | null
          sb4d_units?: number | null
          signal_count?: number | null
          signals?: string | null
          sirs_filed?: string | null
          tri_county?: string | null
          va_date?: string | null
          va_status?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          building_name?: string | null
          city?: string | null
          conv_date?: string | null
          conv_review?: string | null
          county?: string | null
          created_at?: string
          fha_exp?: string | null
          fha_method?: string | null
          fha_status?: string | null
          id?: never
          precon?: string | null
          precon_status?: string | null
          recert_status?: string | null
          recert_year?: number | null
          registry_enf?: string | null
          registry_status?: string | null
          sb4d?: string | null
          sb4d_bldgs_3plus?: number | null
          sb4d_units?: number | null
          signal_count?: number | null
          signals?: string | null
          sirs_filed?: string | null
          tri_county?: string | null
          va_date?: string | null
          va_status?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          building_id: number | null
          created_at: string
          email: string | null
          id: number
          intent: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          building_id?: number | null
          created_at?: string
          email?: string | null
          id?: never
          intent: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          building_id?: number | null
          created_at?: string
          email?: string | null
          id?: never
          intent?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/* ---- app-level aliases ---- */

/** One row of the `buildings` table. */
export type Building = Database["public"]["Tables"]["buildings"]["Row"]

/** Columns supplied on insert (id / created_at are database-generated). */
export type BuildingInsert = Database["public"]["Tables"]["buildings"]["Insert"]

/** One captured lead from /connect. */
export type Lead = Database["public"]["Tables"]["leads"]["Row"]

export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"]
