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
      fixed_rates: {
        Row: {
          id: number
          rate_type: string
          billing_method: string
          expense_type: string
          amount: number
          effective_date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          rate_type: string
          billing_method: string
          expense_type: string
          amount: number
          effective_date: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          rate_type?: string
          billing_method?: string
          expense_type?: string
          amount?: number
          effective_date?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_number: string
          account_type: string
          agency: string
          balance: number
          bank: string
          color: string
          created_at: string | null
          id: number
          initial_balance: number
          name: string
          updated_at: string | null
          pix_key: string | null
          pix_key_type: string | null
        }
        Insert: {
          account_number: string
          account_type: string
          agency: string
          balance?: number
          bank: string
          color?: string
          created_at?: string | null
          id?: number
          initial_balance?: number
          name: string
          updated_at?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
        }
        Update: {
          account_number?: string
          account_type?: string
          agency?: string
          balance?: number
          bank?: string
          color?: string
          created_at?: string | null
          id?: number
          initial_balance?: number
          name?: string
          updated_at?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: number
          invoice_number: string
          reference_month: number
          reference_year: number
          unit: string
          unit_id: number
          resident: string
          total_amount: number
          due_date: string
          status: string
          payment_date: string | null
          payment_method: string | null
          payment_account_id: number | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          invoice_number: string
          reference_month: number
          reference_year: number
          unit: string
          unit_id: number
          resident: string
          total_amount: number
          due_date: string
          status?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_account_id?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          invoice_number?: string
          reference_month?: number
          reference_year?: number
          unit?: string
          unit_id?: number
          resident?: string
          total_amount?: number
          due_date?: string
          status?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_account_id?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: number
          invoice_id: number
          billing_id: string
          description: string
          amount: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          invoice_id: number
          billing_id: string
          description: string
          amount: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          invoice_id?: number
          billing_id?: string
          description?: string
          amount?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_billing_id_fkey"
            columns: ["billing_id"]
            isOneToOne: false
            referencedRelation: "billings"
            referencedColumns: ["id"]
          }
        ]
      }
      billings: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          due_date: string
          id: string
          is_printed: boolean
          is_sent: boolean
          resident: string
          status: string
          unit: string
          unit_id: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          is_printed?: boolean
          is_sent?: boolean
          resident: string
          status?: string
          unit: string
          unit_id?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          is_printed?: boolean
          is_sent?: boolean
          resident?: string
          status?: string
          unit?: string
          unit_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      consumption_bills: {
        Row: {
          billing_date: string
          billing_period_end: string
          billing_period_start: string
          consumption_amount: number
          created_at: string | null
          current_reading_id: number | null
          id: number
          previous_reading_id: number | null
          rate_used: number
          status: string
          total_amount: number
          unit_id: number
          updated_at: string | null
          utility_type: string
        }
        Insert: {
          billing_date: string
          billing_period_end: string
          billing_period_start: string
          consumption_amount: number
          created_at?: string | null
          current_reading_id?: number | null
          id?: number
          previous_reading_id?: number | null
          rate_used: number
          status?: string
          total_amount: number
          unit_id: number
          updated_at?: string | null
          utility_type: string
        }
        Update: {
          billing_date?: string
          billing_period_end?: string
          billing_period_start?: string
          consumption_amount?: number
          created_at?: string | null
          current_reading_id?: number | null
          id?: number
          previous_reading_id?: number | null
          rate_used?: number
          status?: string
          total_amount?: number
          unit_id?: number
          updated_at?: string | null
          utility_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumption_bills_current_reading_id_fkey"
            columns: ["current_reading_id"]
            isOneToOne: false
            referencedRelation: "meter_readings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_bills_previous_reading_id_fkey"
            columns: ["previous_reading_id"]
            isOneToOne: false
            referencedRelation: "meter_readings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_bills_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      meter_readings: {
        Row: {
          created_at: string | null
          id: number
          reading_date: string
          reading_value: number
          unit_id: number
          updated_at: string | null
          utility_type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          reading_date: string
          reading_value: number
          unit_id: number
          updated_at?: string | null
          utility_type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          reading_date?: string
          reading_value?: number
          unit_id?: number
          updated_at?: string | null
          utility_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "meter_readings_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          created_at: string
          email: string
          id: number
          name: string
          phone: string
          role: string
          status: string | null
          unit_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          name: string
          phone: string
          role: string
          status?: string | null
          unit_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          name?: string
          phone?: string
          role?: string
          status?: string | null
          unit_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account: string
          amount: number
          category: string
          date: string
          description: string
          id: number
          payee: string | null
          status: string
          to_account: string | null
          type: string
          unit: string | null
        }
        Insert: {
          account: string
          amount: number
          category: string
          date: string
          description: string
          id?: number
          payee?: string | null
          status: string
          to_account?: string | null
          type: string
          unit?: string | null
        }
        Update: {
          account?: string
          amount?: number
          category?: string
          date?: string
          description?: string
          id?: number
          payee?: string | null
          status?: string
          to_account?: string | null
          type?: string
          unit?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          block: string
          created_at: string
          id: number
          number: string
          owner: string
          residents: number
          status: string
          updated_at: string
        }
        Insert: {
          block: string
          created_at?: string
          id?: number
          number: string
          owner: string
          residents: number
          status: string
          updated_at?: string
        }
        Update: {
          block?: string
          created_at?: string
          id?: number
          number?: string
          owner?: string
          residents?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      utility_rates: {
        Row: {
          created_at: string | null
          effective_date: string
          id: number
          rate_per_cubic_meter: number
          updated_at: string | null
          utility_type: string
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          id?: number
          rate_per_cubic_meter: number
          updated_at?: string | null
          utility_type: string
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          id?: number
          rate_per_cubic_meter?: number
          updated_at?: string | null
          utility_type?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
