export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          favicon_url: string | null
          id: string
          language: string | null
          login_logo_url: string | null
          logo_login_url: string | null
          logo_url: string | null
          mobile_logo_url: string | null
          pwa_logo_url: string | null
          theme: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          language?: string | null
          login_logo_url?: string | null
          logo_login_url?: string | null
          logo_url?: string | null
          mobile_logo_url?: string | null
          pwa_logo_url?: string | null
          theme?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          language?: string | null
          login_logo_url?: string | null
          logo_login_url?: string | null
          logo_url?: string | null
          mobile_logo_url?: string | null
          pwa_logo_url?: string | null
          theme?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string | null
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string | null
          specialist_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          specialist_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          specialist_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_specialist_id_fkey"
            columns: ["specialist_id"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          accent_color: string | null
          address: string | null
          created_at: string | null
          description: string | null
          email: string | null
          favicon_url: string | null
          id: string
          logo_mobile_url: string | null
          logo_url: string | null
          logo_web_url: string | null
          mobile_logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          pwa_logo_url: string | null
          secondary_color: string | null
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          favicon_url?: string | null
          id?: string
          logo_mobile_url?: string | null
          logo_url?: string | null
          logo_web_url?: string | null
          mobile_logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          pwa_logo_url?: string | null
          secondary_color?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          favicon_url?: string | null
          id?: string
          logo_mobile_url?: string | null
          logo_url?: string | null
          logo_web_url?: string | null
          mobile_logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          pwa_logo_url?: string | null
          secondary_color?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      config: {
        Row: {
          created_at: string | null
          id: string
          login_logo_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          login_logo_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          login_logo_url?: string | null
        }
        Relationships: []
      }
      flow_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          flow_id: string | null
          frequency: string | null
          id: string
          patient_id: string | null
          progress: Json | null
          repetitions: number | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          flow_id?: string | null
          frequency?: string | null
          id?: string
          patient_id?: string | null
          progress?: Json | null
          repetitions?: number | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          flow_id?: string | null
          frequency?: string | null
          id?: string
          patient_id?: string | null
          progress?: Json | null
          repetitions?: number | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_assignments_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_node_id: string
          execution_data: Json | null
          flow_id: string
          id: string
          patient_id: string
          started_at: string
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_node_id: string
          execution_data?: Json | null
          flow_id: string
          id?: string
          patient_id: string
          started_at: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_node_id?: string
          execution_data?: Json | null
          flow_id?: string
          id?: string
          patient_id?: string
          started_at?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_executions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_schedules: {
        Row: {
          created_at: string | null
          delay_amount: number
          delay_unit: string
          flow_id: string
          id: string
          patient_id: string
          scheduled_for: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delay_amount: number
          delay_unit: string
          flow_id: string
          id?: string
          patient_id: string
          scheduled_for: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delay_amount?: number
          delay_unit?: string
          flow_id?: string
          id?: string
          patient_id?: string
          scheduled_for?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flow_schedules_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flows: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          flow_data: Json
          id: string
          is_active: boolean | null
          is_template: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flow_data?: Json
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          flow_data?: Json
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flows_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flows_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      image_gallery: {
        Row: {
          bucket_id: string
          created_at: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          updated_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          updated_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          allergies: string | null
          assigned_specialist: string | null
          clinic_id: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          insurance_info: Json | null
          medical_history: string | null
          medications: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          allergies?: string | null
          assigned_specialist?: string | null
          clinic_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          medical_history?: string | null
          medications?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          allergies?: string | null
          assigned_specialist?: string | null
          clinic_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          insurance_info?: Json | null
          medical_history?: string | null
          medications?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_assigned_specialist_fkey"
            columns: ["assigned_specialist"]
            isOneToOne: false
            referencedRelation: "specialists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specialists: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          availability: Json | null
          certifications: string[] | null
          clinic_id: string | null
          consultation_fee: number | null
          created_at: string | null
          education: string | null
          id: string
          is_approved: boolean | null
          languages: string[] | null
          license_number: string | null
          specialization: string
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          availability?: Json | null
          certifications?: string[] | null
          clinic_id?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          education?: string | null
          id?: string
          is_approved?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          specialization: string
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          availability?: Json | null
          certifications?: string[] | null
          clinic_id?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          education?: string | null
          id?: string
          is_approved?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          specialization?: string
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "specialists_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialists_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tip_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          patient_id: string | null
          read_at: string | null
          status: string | null
          tip_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          patient_id?: string | null
          read_at?: string | null
          status?: string | null
          tip_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          patient_id?: string | null
          read_at?: string | null
          status?: string | null
          tip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tip_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tip_assignments_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "tips"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          category: string
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          steps: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          steps?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          steps?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          clinic_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_sign_in_at: string | null
          license_number: string | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings: Json | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          license_number?: string | null
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          clinic_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          license_number?: string | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
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
      user_role:
        | "super_admin"
        | "clinic_admin"
        | "chief_specialist"
        | "specialist"
        | "patient"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "super_admin",
        "clinic_admin",
        "chief_specialist",
        "specialist",
        "patient",
      ],
    },
  },
} as const
