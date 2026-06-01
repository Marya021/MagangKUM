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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string
          entity: string
          entity_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          action: string
          created_at?: string
          description: string
          entity: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          entity?: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          acceptance_letter_url: string | null
          applicant_id: string
          cover_letter: string | null
          created_at: string
          duration_months: number | null
          end_date: string | null
          id: string
          penempatan: string | null
          position_id: string
          resume_url: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          school_letter_url: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          acceptance_letter_url?: string | null
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          duration_months?: number | null
          end_date?: string | null
          id?: string
          penempatan?: string | null
          position_id: string
          resume_url?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          school_letter_url?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          acceptance_letter_url?: string | null
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          duration_months?: number | null
          end_date?: string | null
          id?: string
          penempatan?: string | null
          position_id?: string
          resume_url?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          school_letter_url?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      attendances: {
        Row: {
          created_at: string
          date: string
          id: string
          note: string | null
          status: string
          time_in: string | null
          time_out: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          status?: string
          time_in?: string | null
          time_out?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          note?: string | null
          status?: string
          time_in?: string | null
          time_out?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      intern: {
        Row: {
          asal: string
          created_at: string
          end_date: string | null
          id: string
          jurusan: string
          nama: string
          penempatan: string
          start_date: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          asal?: string
          created_at?: string
          end_date?: string | null
          id?: string
          jurusan?: string
          nama: string
          penempatan?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          asal?: string
          created_at?: string
          end_date?: string | null
          id?: string
          jurusan?: string
          nama?: string
          penempatan?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intern_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          file_url: string | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      penempatan: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string
          created_by: string | null
          deadline: string | null
          department: string
          description: string
          id: string
          location: string
          quota: number
          requirements: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department: string
          description: string
          id?: string
          location?: string
          quota?: number
          requirements: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          department?: string
          description?: string
          id?: string
          location?: string
          quota?: number
          requirements?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reports: {
        Row: {
          activities: string
          created_at: string
          id: string
          obstacles: string | null
          plan_tomorrow: string | null
          report_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activities: string
          created_at?: string
          id?: string
          obstacles?: string | null
          plan_tomorrow?: string | null
          report_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activities?: string
          created_at?: string
          id?: string
          obstacles?: string | null
          plan_tomorrow?: string | null
          report_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      supervisors: {
        Row: {
          created_at: string
          id: string
          intern_id: string
          supervisor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intern_id: string
          supervisor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intern_id?: string
          supervisor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisors_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "intern"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisors_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          asal: string
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          jurusan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asal?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          jurusan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asal?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          jurusan?: string
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
      check_email_exists: { Args: { _email: string }; Returns: boolean }
      count_applications_by_position: {
        Args: { _position_id: string }
        Returns: number
      }
      get_accepted_counts: {
        Args: never
        Returns: {
          count: number
          position_id: string
        }[]
      }
      get_admin_schedule: {
        Args: { _end_date: string; _start_date: string }
        Returns: {
          date: string
          time_in: string
          time_out: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_activity: {
        Args: {
          _action: string
          _description?: string
          _entity: string
          _entity_id?: string
          _metadata?: Json
          _user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "applier" | "supervisor"
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
      app_role: ["admin", "reviewer", "applier", "supervisor"],
    },
  },
} as const
