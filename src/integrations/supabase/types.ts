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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_date: string | null
          created_at: string
          description: string | null
          focus_area: string | null
          id: string
          name: string
          status: string
        }
        Insert: {
          activity_date?: string | null
          created_at?: string
          description?: string | null
          focus_area?: string | null
          id?: string
          name: string
          status?: string
        }
        Update: {
          activity_date?: string | null
          created_at?: string
          description?: string | null
          focus_area?: string | null
          id?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      compliance_tasks: {
        Row: {
          created_at: string
          done: boolean
          id: string
          reference: string | null
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          reference?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          reference?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          attendance: string | null
          created_at: string
          held_on: string
          id: string
          kind: string
          summary: string | null
          title: string
          venue: string | null
        }
        Insert: {
          attendance?: string | null
          created_at?: string
          held_on?: string
          id?: string
          kind?: string
          summary?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          attendance?: string | null
          created_at?: string
          held_on?: string
          id?: string
          kind?: string
          summary?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          gender: string | null
          id: string
          id_number: string | null
          is_executive: boolean
          is_signatory: boolean
          joined_on: string | null
          notes: string | null
          phone: string | null
          position: string
          sort_order: number
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          id_number?: string | null
          is_executive?: boolean
          is_signatory?: boolean
          joined_on?: string | null
          notes?: string | null
          phone?: string | null
          position?: string
          sort_order?: number
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_number?: string | null
          is_executive?: boolean
          is_signatory?: boolean
          joined_on?: string | null
          notes?: string | null
          phone?: string | null
          position?: string
          sort_order?: number
          status?: string
        }
        Relationships: []
      }
      org_settings: {
        Row: {
          bank: string | null
          county: string | null
          email: string | null
          id: number
          location: string | null
          mission: string | null
          name: string
          phone: string | null
          physical_address: string | null
          postal_address: string | null
          reg_date: string | null
          reg_no: string | null
          serial_no: string | null
          sub_county: string | null
          sub_location: string | null
          tagline: string | null
          updated_at: string
          ward: string | null
        }
        Insert: {
          bank?: string | null
          county?: string | null
          email?: string | null
          id?: number
          location?: string | null
          mission?: string | null
          name?: string
          phone?: string | null
          physical_address?: string | null
          postal_address?: string | null
          reg_date?: string | null
          reg_no?: string | null
          serial_no?: string | null
          sub_county?: string | null
          sub_location?: string | null
          tagline?: string | null
          updated_at?: string
          ward?: string | null
        }
        Update: {
          bank?: string | null
          county?: string | null
          email?: string | null
          id?: number
          location?: string | null
          mission?: string | null
          name?: string
          phone?: string | null
          physical_address?: string | null
          postal_address?: string | null
          reg_date?: string | null
          reg_no?: string | null
          serial_no?: string | null
          sub_county?: string | null
          sub_location?: string | null
          tagline?: string | null
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          kind: string
          note: string | null
          txn_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          note?: string | null
          txn_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          note?: string | null
          txn_date?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
