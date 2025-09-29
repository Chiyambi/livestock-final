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
      animals: {
        Row: {
          age: number | null
          breed: string | null
          created_at: string
          health_status: string | null
          id: string
          name: string
          notes: string | null
          photo_url: string | null
          species: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          breed?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          name: string
          notes?: string | null
          photo_url?: string | null
          species: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          breed?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          name?: string
          notes?: string | null
          photo_url?: string | null
          species?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      feeding_records: {
        Row: {
          animal_id: string
          created_at: string
          fed_at: string
          feed_type: string
          id: string
          notes: string | null
          quantity: number
          schedule_id: string | null
          user_id: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          fed_at?: string
          feed_type: string
          id?: string
          notes?: string | null
          quantity: number
          schedule_id?: string | null
          user_id: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          fed_at?: string
          feed_type?: string
          id?: string
          notes?: string | null
          quantity?: number
          schedule_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_records_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "feeding_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_schedules: {
        Row: {
          animal_id: string
          created_at: string
          days_of_week: string[] | null
          feed_type: string
          feeding_time: string
          frequency: string
          id: string
          is_active: boolean | null
          next_feeding_date: string | null
          notes: string | null
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          days_of_week?: string[] | null
          feed_type: string
          feeding_time: string
          frequency: string
          id?: string
          is_active?: boolean | null
          next_feeding_date?: string | null
          notes?: string | null
          quantity: number
          updated_at?: string
          user_id: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          days_of_week?: string[] | null
          feed_type?: string
          feeding_time?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_feeding_date?: string | null
          notes?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_schedules_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          notification_feeding: boolean | null
          notification_health_reports: boolean | null
          notification_vaccination: boolean | null
          phone_number: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_feeding?: boolean | null
          notification_health_reports?: boolean | null
          notification_vaccination?: boolean | null
          phone_number: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_feeding?: boolean | null
          notification_health_reports?: boolean | null
          notification_vaccination?: boolean | null
          phone_number?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          animal_id: string
          completed_date: string | null
          created_at: string
          id: string
          notes: string | null
          scheduled_date: string
          status: string
          updated_at: string
          user_id: string
          vaccine_name: string
        }
        Insert: {
          animal_id: string
          completed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date: string
          status?: string
          updated_at?: string
          user_id: string
          vaccine_name: string
        }
        Update: {
          animal_id?: string
          completed_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          status?: string
          updated_at?: string
          user_id?: string
          vaccine_name?: string
        }
        Relationships: []
      }
      weight_records: {
        Row: {
          animal_id: string
          created_at: string
          id: string
          notes: string | null
          recorded_at: string
          user_id: string
          weight: number
        }
        Insert: {
          animal_id: string
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          user_id: string
          weight: number
        }
        Update: {
          animal_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          recorded_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_feeding_date: {
        Args: {
          p_days_of_week?: string[]
          p_feeding_time: string
          p_frequency: string
        }
        Returns: string
      }
      update_overdue_vaccinations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
