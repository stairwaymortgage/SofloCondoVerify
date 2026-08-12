/**
 * GENERATED FILE — do not edit.
 * Regenerate with:  npm run types:gen
 * (npx supabase gen types typescript --project-id erccluueswqqbukaikut)
 * Needs a Supabase access token: run `supabase login` or set SUPABASE_ACCESS_TOKEN.
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
      agencies: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          email: string | null
          id: number
          notes: string | null
          organization_office: string | null
          phone: string | null
          source: string | null
          status: string | null
          sub_office_role: string | null
          toll_free_alt: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          id?: never
          notes?: string | null
          organization_office?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          sub_office_role?: string | null
          toll_free_alt?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          id?: never
          notes?: string | null
          organization_office?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          sub_office_role?: string | null
          toll_free_alt?: string | null
          website?: string | null
        }
        Relationships: []
      }
      assn_registry: {
        Row: {
          address: string | null
          association_name: string | null
          created_at: string
          enforcement_status: string | null
          id: number
          reg_date: string | null
          registration: string | null
          registration_status: string | null
          type: string | null
        }
        Insert: {
          address?: string | null
          association_name?: string | null
          created_at?: string
          enforcement_status?: string | null
          id?: never
          reg_date?: string | null
          registration?: string | null
          registration_status?: string | null
          type?: string | null
        }
        Update: {
          address?: string | null
          association_name?: string | null
          created_at?: string
          enforcement_status?: string | null
          id?: never
          reg_date?: string | null
          registration?: string | null
          registration_status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      authority_links: {
        Row: {
          created_at: string
          domain: string | null
          id: number
          type: string | null
          url: string | null
          use_for_outbound_link: string | null
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: never
          type?: string | null
          url?: string | null
          use_for_outbound_link?: string | null
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: never
          type?: string | null
          url?: string | null
          use_for_outbound_link?: string | null
        }
        Relationships: []
      }
      board_contacts: {
        Row: {
          association: string | null
          city: string | null
          contact_name: string | null
          county: string | null
          created_at: string
          id: number
          mailing_address: string | null
          phone: string | null
          position: string | null
          publish: string | null
          source: string | null
        }
        Insert: {
          association?: string | null
          city?: string | null
          contact_name?: string | null
          county?: string | null
          created_at?: string
          id?: never
          mailing_address?: string | null
          phone?: string | null
          position?: string | null
          publish?: string | null
          source?: string | null
        }
        Update: {
          association?: string | null
          city?: string | null
          contact_name?: string | null
          county?: string | null
          created_at?: string
          id?: never
          mailing_address?: string | null
          phone?: string | null
          position?: string | null
          publish?: string | null
          source?: string | null
        }
        Relationships: []
      }
      building_officials: {
        Row: {
          address: string | null
          building_official: string | null
          created_at: string
          email: string | null
          fax: string | null
          id: number
          jurisdiction: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          building_official?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          id?: never
          jurisdiction?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          building_official?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          id?: never
          jurisdiction?: string | null
          phone?: string | null
        }
        Relationships: []
      }
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
      cam_licensees: {
        Row: {
          ce_credits: number | null
          city: string | null
          created_at: string
          expiration: string | null
          id: number
          license: string | null
          name: string | null
          street: string | null
          zip: string | null
        }
        Insert: {
          ce_credits?: number | null
          city?: string | null
          created_at?: string
          expiration?: string | null
          id?: never
          license?: string | null
          name?: string | null
          street?: string | null
          zip?: string | null
        }
        Update: {
          ce_credits?: number | null
          city?: string | null
          created_at?: string
          expiration?: string | null
          id?: never
          license?: string | null
          name?: string | null
          street?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      city_hubs: {
        Row: {
          buildings_tracked: number | null
          city: string | null
          coastal_water: string | null
          condo_relevance: string | null
          county: string | null
          created_at: string
          fha_approved: number | null
          fha_expired: number | null
          flags_2: number | null
          id: number
          identity_nickname: string | null
          known_for_hooks: string | null
          page_template: string | null
          population: number | null
          precon_pipeline: number | null
          primary_keyword: string | null
          url_slug_hub: string | null
          va_accepted: number | null
          va_rejected: number | null
          wikipedia_ref: string | null
        }
        Insert: {
          buildings_tracked?: number | null
          city?: string | null
          coastal_water?: string | null
          condo_relevance?: string | null
          county?: string | null
          created_at?: string
          fha_approved?: number | null
          fha_expired?: number | null
          flags_2?: number | null
          id?: never
          identity_nickname?: string | null
          known_for_hooks?: string | null
          page_template?: string | null
          population?: number | null
          precon_pipeline?: number | null
          primary_keyword?: string | null
          url_slug_hub?: string | null
          va_accepted?: number | null
          va_rejected?: number | null
          wikipedia_ref?: string | null
        }
        Update: {
          buildings_tracked?: number | null
          city?: string | null
          coastal_water?: string | null
          condo_relevance?: string | null
          county?: string | null
          created_at?: string
          fha_approved?: number | null
          fha_expired?: number | null
          flags_2?: number | null
          id?: never
          identity_nickname?: string | null
          known_for_hooks?: string | null
          page_template?: string | null
          population?: number | null
          precon_pipeline?: number | null
          primary_keyword?: string | null
          url_slug_hub?: string | null
          va_accepted?: number | null
          va_rejected?: number | null
          wikipedia_ref?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          company: string | null
          created_at: string
          developments: number | null
          headquarters: string | null
          id: number
          type: string | null
          url_slug: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          developments?: number | null
          headquarters?: string | null
          id?: never
          type?: string | null
          url_slug?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          developments?: number | null
          headquarters?: string | null
          id?: never
          type?: string | null
          url_slug?: string | null
        }
        Relationships: []
      }
      existing_towers: {
        Row: {
          architect: string | null
          building: string | null
          company_id: number | null
          created_at: string
          developer_page_slug: string | null
          floors: number | null
          id: number
          lead_developer: string | null
          neighborhood: string | null
          str_allowed: string | null
          str_detail: string | null
          units: number | null
          url_slug: string | null
          year_built: number | null
        }
        Insert: {
          architect?: string | null
          building?: string | null
          company_id?: number | null
          created_at?: string
          developer_page_slug?: string | null
          floors?: number | null
          id?: never
          lead_developer?: string | null
          neighborhood?: string | null
          str_allowed?: string | null
          str_detail?: string | null
          units?: number | null
          url_slug?: string | null
          year_built?: number | null
        }
        Update: {
          architect?: string | null
          building?: string | null
          company_id?: number | null
          created_at?: string
          developer_page_slug?: string | null
          floors?: number | null
          id?: never
          lead_developer?: string | null
          neighborhood?: string | null
          str_allowed?: string | null
          str_detail?: string | null
          units?: number | null
          url_slug?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "existing_towers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      faq: {
        Row: {
          answer: string | null
          city: string | null
          city_hub_id: number | null
          city_hub_slug: string | null
          cluster: string | null
          col: number | null
          county: string | null
          created_at: string
          id: number
          page_template: string | null
          primary_keyword: string | null
          question: string | null
          url_slug: string | null
        }
        Insert: {
          answer?: string | null
          city?: string | null
          city_hub_id?: number | null
          city_hub_slug?: string | null
          cluster?: string | null
          col?: number | null
          county?: string | null
          created_at?: string
          id?: never
          page_template?: string | null
          primary_keyword?: string | null
          question?: string | null
          url_slug?: string | null
        }
        Update: {
          answer?: string | null
          city?: string | null
          city_hub_id?: number | null
          city_hub_slug?: string | null
          cluster?: string | null
          col?: number | null
          county?: string | null
          created_at?: string
          id?: never
          page_template?: string | null
          primary_keyword?: string | null
          question?: string | null
          url_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_city_hub_id_fkey"
            columns: ["city_hub_id"]
            isOneToOne: false
            referencedRelation: "city_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          form_template: string | null
          host_or_link: string | null
          id: number
          purpose: string | null
          source_authority: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          form_template?: string | null
          host_or_link?: string | null
          id?: never
          purpose?: string | null
          source_authority?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          form_template?: string | null
          host_or_link?: string | null
          id?: never
          purpose?: string | null
          source_authority?: string | null
          status?: string | null
        }
        Relationships: []
      }
      keyword_map: {
        Row: {
          city: string | null
          city_hub_id: number | null
          cluster: string | null
          county: string | null
          created_at: string
          faq_pages: number | null
          hub_slug: string | null
          id: number
          primary_keyword: string | null
        }
        Insert: {
          city?: string | null
          city_hub_id?: number | null
          cluster?: string | null
          county?: string | null
          created_at?: string
          faq_pages?: number | null
          hub_slug?: string | null
          id?: never
          primary_keyword?: string | null
        }
        Update: {
          city?: string | null
          city_hub_id?: number | null
          cluster?: string | null
          county?: string | null
          created_at?: string
          faq_pages?: number | null
          hub_slug?: string | null
          id?: never
          primary_keyword?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_map_city_hub_id_fkey"
            columns: ["city_hub_id"]
            isOneToOne: false
            referencedRelation: "city_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          building_id: number | null
          created_at: string
          email: string | null
          ghl_contact_id: string | null
          ghl_synced: boolean
          id: number
          intent: string
          message: string | null
          name: string
          phone: string | null
          routed_to: string | null
          routing_tier: string
          status: string
        }
        Insert: {
          building_id?: number | null
          created_at?: string
          email?: string | null
          ghl_contact_id?: string | null
          ghl_synced?: boolean
          id?: never
          intent: string
          message?: string | null
          name: string
          phone?: string | null
          routed_to?: string | null
          routing_tier?: string
          status?: string
        }
        Update: {
          building_id?: number | null
          created_at?: string
          email?: string | null
          ghl_contact_id?: string | null
          ghl_synced?: boolean
          id?: never
          intent?: string
          message?: string | null
          name?: string
          phone?: string | null
          routed_to?: string | null
          routing_tier?: string
          status?: string
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
      legal_aid: {
        Row: {
          address_location: string | null
          category: string | null
          contact_role: string | null
          created_at: string
          email: string | null
          id: number
          notes: string | null
          organization_firm: string | null
          phone: string | null
          source: string | null
          status: string | null
          toll_free_alt: string | null
          website: string | null
        }
        Insert: {
          address_location?: string | null
          category?: string | null
          contact_role?: string | null
          created_at?: string
          email?: string | null
          id?: never
          notes?: string | null
          organization_firm?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          toll_free_alt?: string | null
          website?: string | null
        }
        Update: {
          address_location?: string | null
          category?: string | null
          contact_role?: string | null
          created_at?: string
          email?: string | null
          id?: never
          notes?: string | null
          organization_firm?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          toll_free_alt?: string | null
          website?: string | null
        }
        Relationships: []
      }
      management_firms: {
        Row: {
          city: string | null
          county: string | null
          created_at: string
          firm_name: string | null
          id: number
          license: string | null
          status: string | null
          street: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          county?: string | null
          created_at?: string
          firm_name?: string | null
          id?: never
          license?: string | null
          status?: string | null
          street?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          county?: string | null
          created_at?: string
          firm_name?: string | null
          id?: never
          license?: string | null
          status?: string | null
          street?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      market_stats: {
        Row: {
          change: string | null
          comparison_period: string | null
          comparison_value: string | null
          county_scope: string | null
          created_at: string
          id: number
          metric: string | null
          metric_id: string | null
          period: string | null
          source: string | null
          value: string | null
        }
        Insert: {
          change?: string | null
          comparison_period?: string | null
          comparison_value?: string | null
          county_scope?: string | null
          created_at?: string
          id?: never
          metric?: string | null
          metric_id?: string | null
          period?: string | null
          source?: string | null
          value?: string | null
        }
        Update: {
          change?: string | null
          comparison_period?: string | null
          comparison_value?: string | null
          county_scope?: string | null
          created_at?: string
          id?: never
          metric?: string | null
          metric_id?: string | null
          period?: string | null
          source?: string | null
          value?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          company: string | null
          created_at: string
          current_projects: string | null
          id: number
          name: string | null
          past_projects: string | null
          profile_depth: string | null
          role: string | null
          title: string | null
          url_slug: string | null
          website_linkedin: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          current_projects?: string | null
          id?: never
          name?: string | null
          past_projects?: string | null
          profile_depth?: string | null
          role?: string | null
          title?: string | null
          url_slug?: string | null
          website_linkedin?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          current_projects?: string | null
          id?: never
          name?: string | null
          past_projects?: string | null
          profile_depth?: string | null
          role?: string | null
          title?: string | null
          url_slug?: string | null
          website_linkedin?: string | null
        }
        Relationships: []
      }
      precon_broward: {
        Row: {
          address: string | null
          area: string | null
          bedrooms: string | null
          city: string | null
          company_id: number | null
          created_at: string
          delivery: string | null
          developer: string | null
          developer_page_slug: string | null
          floors: string | null
          id: number
          price_from: number | null
          project: string | null
          sf_range: string | null
          sold_out: string | null
          status: string | null
          str_allowed: string | null
          str_detail: string | null
          units: string | null
          url_slug: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          bedrooms?: string | null
          city?: string | null
          company_id?: number | null
          created_at?: string
          delivery?: string | null
          developer?: string | null
          developer_page_slug?: string | null
          floors?: string | null
          id?: never
          price_from?: number | null
          project?: string | null
          sf_range?: string | null
          sold_out?: string | null
          status?: string | null
          str_allowed?: string | null
          str_detail?: string | null
          units?: string | null
          url_slug?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          bedrooms?: string | null
          city?: string | null
          company_id?: number | null
          created_at?: string
          delivery?: string | null
          developer?: string | null
          developer_page_slug?: string | null
          floors?: string | null
          id?: never
          price_from?: number | null
          project?: string | null
          sf_range?: string | null
          sold_out?: string | null
          status?: string | null
          str_allowed?: string | null
          str_detail?: string | null
          units?: string | null
          url_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precon_broward_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      precon_miami: {
        Row: {
          architect: string | null
          bedrooms: string | null
          commission: string | null
          company_id: number | null
          created_at: string
          delivery: string | null
          delivery_year: number | null
          developer_page_slug: string | null
          id: number
          lead_developer: string | null
          neighborhood: string | null
          price_from: number | null
          project: string | null
          sold_out: string | null
          status: string | null
          str_allowed: string | null
          str_detail: string | null
          url_slug: string | null
        }
        Insert: {
          architect?: string | null
          bedrooms?: string | null
          commission?: string | null
          company_id?: number | null
          created_at?: string
          delivery?: string | null
          delivery_year?: number | null
          developer_page_slug?: string | null
          id?: never
          lead_developer?: string | null
          neighborhood?: string | null
          price_from?: number | null
          project?: string | null
          sold_out?: string | null
          status?: string | null
          str_allowed?: string | null
          str_detail?: string | null
          url_slug?: string | null
        }
        Update: {
          architect?: string | null
          bedrooms?: string | null
          commission?: string | null
          company_id?: number | null
          created_at?: string
          delivery?: string | null
          delivery_year?: number | null
          developer_page_slug?: string | null
          id?: never
          lead_developer?: string | null
          neighborhood?: string | null
          price_from?: number | null
          project?: string | null
          sold_out?: string | null
          status?: string | null
          str_allowed?: string | null
          str_detail?: string | null
          url_slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precon_miami_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      records_access: {
        Row: {
          col: string | null
          created_at: string
          id: number
          notes: string | null
          owner_accessible: string | null
          record_category: string | null
          retention_period: string | null
        }
        Insert: {
          col?: string | null
          created_at?: string
          id?: never
          notes?: string | null
          owner_accessible?: string | null
          record_category?: string | null
          retention_period?: string | null
        }
        Update: {
          col?: string | null
          created_at?: string
          id?: never
          notes?: string | null
          owner_accessible?: string | null
          record_category?: string | null
          retention_period?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          active: boolean
          created_at: string
          credential_line: string | null
          id: number
          link_url: string | null
          logo_initials: string | null
          name: string
          priority: number
          tagline: string | null
          target_pages: string[]
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          credential_line?: string | null
          id?: never
          link_url?: string | null
          logo_initials?: string | null
          name: string
          priority?: number
          tagline?: string | null
          target_pages?: string[]
          type: string
        }
        Update: {
          active?: boolean
          created_at?: string
          credential_line?: string | null
          id?: never
          link_url?: string | null
          logo_initials?: string | null
          name?: string
          priority?: number
          tagline?: string | null
          target_pages?: string[]
          type?: string
        }
        Relationships: []
      }
      statutes: {
        Row: {
          citation: string | null
          created_at: string
          id: number
          ref: string | null
          requirement_threshold: string | null
          retention_deadline: string | null
          source_doc: string | null
          topic: string | null
        }
        Insert: {
          citation?: string | null
          created_at?: string
          id?: never
          ref?: string | null
          requirement_threshold?: string | null
          retention_deadline?: string | null
          source_doc?: string | null
          topic?: string | null
        }
        Update: {
          citation?: string | null
          created_at?: string
          id?: never
          ref?: string | null
          requirement_threshold?: string | null
          retention_deadline?: string | null
          source_doc?: string | null
          topic?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      board_contacts_publishable: {
        Row: {
          association: string | null
          city: string | null
          contact_name: string | null
          county: string | null
          created_at: string | null
          id: number | null
          mailing_address: string | null
          phone: string | null
          position: string | null
          source: string | null
        }
        Insert: {
          association?: string | null
          city?: string | null
          contact_name?: string | null
          county?: string | null
          created_at?: string | null
          id?: number | null
          mailing_address?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
        }
        Update: {
          association?: string | null
          city?: string | null
          contact_name?: string | null
          county?: string | null
          created_at?: string | null
          id?: number | null
          mailing_address?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
        }
        Relationships: []
      }
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
