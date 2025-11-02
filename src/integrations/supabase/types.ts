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
      advance_payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string
          id: string
          notes: string | null
          payment_date: string
          record_id: string
          record_type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          created_by: string
          id?: string
          notes?: string | null
          payment_date: string
          record_id: string
          record_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string
          id?: string
          notes?: string | null
          payment_date?: string
          record_id?: string
          record_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      booking_register: {
        Row: {
          advance: number
          balance: number | null
          bill_number: string | null
          booking_id: string
          created_at: string | null
          created_by: string
          date: string
          freight: number
          from_location: string
          gr_number: string
          id: string
          lorry_number: string
          lorry_type: string
          other_expenses: number
          party_name: string
          payment_status: string
          pod_received_date: string | null
          pod_received_status: string
          to_location: string
          total_balance: number | null
          updated_at: string | null
          weight: number
        }
        Insert: {
          advance?: number
          balance?: number | null
          bill_number?: string | null
          booking_id: string
          created_at?: string | null
          created_by: string
          date: string
          freight?: number
          from_location: string
          gr_number: string
          id?: string
          lorry_number: string
          lorry_type: string
          other_expenses?: number
          party_name: string
          payment_status?: string
          pod_received_date?: string | null
          pod_received_status?: string
          to_location: string
          total_balance?: number | null
          updated_at?: string | null
          weight: number
        }
        Update: {
          advance?: number
          balance?: number | null
          bill_number?: string | null
          booking_id?: string
          created_at?: string | null
          created_by?: string
          date?: string
          freight?: number
          from_location?: string
          gr_number?: string
          id?: string
          lorry_number?: string
          lorry_type?: string
          other_expenses?: number
          party_name?: string
          payment_status?: string
          pod_received_date?: string | null
          pod_received_status?: string
          to_location?: string
          total_balance?: number | null
          updated_at?: string | null
          weight?: number
        }
        Relationships: []
      }
      customer_details: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          created_by: string
          customer_id: string
          customer_name: string
          email: string | null
          gst_number: string | null
          id: string
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by: string
          customer_id: string
          customer_name: string
          email?: string | null
          gst_number?: string | null
          id?: string
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string
          customer_id?: string
          customer_name?: string
          email?: string | null
          gst_number?: string | null
          id?: string
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      driver_information: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string
          current_vehicle: string | null
          driver_id: string
          driver_name: string
          experience_years: number | null
          id: string
          license_expiry: string
          license_number: string
          phone_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by: string
          current_vehicle?: string | null
          driver_id: string
          driver_name: string
          experience_years?: number | null
          id?: string
          license_expiry: string
          license_number: string
          phone_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string
          current_vehicle?: string | null
          driver_id?: string
          driver_name?: string
          experience_years?: number | null
          id?: string
          license_expiry?: string
          license_number?: string
          phone_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lr_details: {
        Row: {
          address_of_delivery: string | null
          agent: string | null
          billing_party: string | null
          billing_party_address: string | null
          billing_party_city: string | null
          billing_party_contact: string | null
          billing_party_gst: string | null
          billing_party_name: string | null
          billing_party_pan: string | null
          charged_weight: number | null
          company_logo_url: string | null
          consignee_address: string | null
          consignee_city: string | null
          consignee_contact: string | null
          consignee_gst: string | null
          consignee_name: string
          consignee_pan: string | null
          consignor_address: string | null
          consignor_city: string | null
          consignor_contact: string | null
          consignor_gst: string | null
          consignor_name: string
          consignor_pan: string | null
          created_at: string | null
          created_by: string
          date: string
          design_template: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          employee: string | null
          eway_bill_date: string | null
          eway_bill_no: string | null
          eway_ex_date: string | null
          freight: number
          from_place: string
          gst_paid_by: string | null
          id: string
          invoice_amount: number | null
          invoice_date: string | null
          invoice_no: string | null
          items: Json | null
          lorry_type: string | null
          lr_no: string
          lr_type: string
          method_of_packing: string | null
          po_date: string | null
          po_no: string | null
          rate: number | null
          rate_on: string | null
          remark: string | null
          to_place: string
          truck_driver_no: string | null
          truck_no: string
          updated_at: string | null
          weight: number
          whatsapp_sent: boolean | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          address_of_delivery?: string | null
          agent?: string | null
          billing_party?: string | null
          billing_party_address?: string | null
          billing_party_city?: string | null
          billing_party_contact?: string | null
          billing_party_gst?: string | null
          billing_party_name?: string | null
          billing_party_pan?: string | null
          charged_weight?: number | null
          company_logo_url?: string | null
          consignee_address?: string | null
          consignee_city?: string | null
          consignee_contact?: string | null
          consignee_gst?: string | null
          consignee_name: string
          consignee_pan?: string | null
          consignor_address?: string | null
          consignor_city?: string | null
          consignor_contact?: string | null
          consignor_gst?: string | null
          consignor_name: string
          consignor_pan?: string | null
          created_at?: string | null
          created_by: string
          date: string
          design_template?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee?: string | null
          eway_bill_date?: string | null
          eway_bill_no?: string | null
          eway_ex_date?: string | null
          freight?: number
          from_place: string
          gst_paid_by?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_no?: string | null
          items?: Json | null
          lorry_type?: string | null
          lr_no: string
          lr_type?: string
          method_of_packing?: string | null
          po_date?: string | null
          po_no?: string | null
          rate?: number | null
          rate_on?: string | null
          remark?: string | null
          to_place: string
          truck_driver_no?: string | null
          truck_no: string
          updated_at?: string | null
          weight?: number
          whatsapp_sent?: boolean | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          address_of_delivery?: string | null
          agent?: string | null
          billing_party?: string | null
          billing_party_address?: string | null
          billing_party_city?: string | null
          billing_party_contact?: string | null
          billing_party_gst?: string | null
          billing_party_name?: string | null
          billing_party_pan?: string | null
          charged_weight?: number | null
          company_logo_url?: string | null
          consignee_address?: string | null
          consignee_city?: string | null
          consignee_contact?: string | null
          consignee_gst?: string | null
          consignee_name?: string
          consignee_pan?: string | null
          consignor_address?: string | null
          consignor_city?: string | null
          consignor_contact?: string | null
          consignor_gst?: string | null
          consignor_name?: string
          consignor_pan?: string | null
          created_at?: string | null
          created_by?: string
          date?: string
          design_template?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee?: string | null
          eway_bill_date?: string | null
          eway_bill_no?: string | null
          eway_ex_date?: string | null
          freight?: number
          from_place?: string
          gst_paid_by?: string | null
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_no?: string | null
          items?: Json | null
          lorry_type?: string | null
          lr_no?: string
          lr_type?: string
          method_of_packing?: string | null
          po_date?: string | null
          po_no?: string | null
          rate?: number | null
          rate_on?: string | null
          remark?: string | null
          to_place?: string
          truck_driver_no?: string | null
          truck_no?: string
          updated_at?: string | null
          weight?: number
          whatsapp_sent?: boolean | null
          whatsapp_sent_at?: string | null
        }
        Relationships: []
      }
      lr_permits: {
        Row: {
          ack_rec_date: string | null
          attachment_url: string | null
          created_at: string | null
          created_by: string
          id: string
          lr_id: string
          lr_no: string
          remark: string | null
          road_permit_receipt_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ack_rec_date?: string | null
          attachment_url?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          lr_id: string
          lr_no: string
          remark?: string | null
          road_permit_receipt_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ack_rec_date?: string | null
          attachment_url?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          lr_id?: string
          lr_no?: string
          remark?: string | null
          road_permit_receipt_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lr_permits_lr_id_fkey"
            columns: ["lr_id"]
            isOneToOne: false
            referencedRelation: "lr_details"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      vehicle_fleet: {
        Row: {
          capacity_tons: number | null
          created_at: string | null
          created_by: string
          fitness_expiry: string | null
          id: string
          insurance_expiry: string | null
          lorry_number: string
          lorry_type: string
          owner_name: string
          owner_phone: string | null
          registration_date: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          capacity_tons?: number | null
          created_at?: string | null
          created_by: string
          fitness_expiry?: string | null
          id?: string
          insurance_expiry?: string | null
          lorry_number: string
          lorry_type: string
          owner_name: string
          owner_phone?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          capacity_tons?: number | null
          created_at?: string | null
          created_by?: string
          fitness_expiry?: string | null
          id?: string
          insurance_expiry?: string | null
          lorry_number?: string
          lorry_type?: string
          owner_name?: string
          owner_phone?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: []
      }
      vehicle_hiring_details: {
        Row: {
          advance: number
          balance: number | null
          bill_number: string | null
          booking_id: string
          created_at: string | null
          created_by: string
          date: string
          driver_number: string | null
          freight: number
          from_location: string
          gr_number: string
          id: string
          lorry_number: string
          other_expenses: number
          owner_name: string
          payment_status: string
          pod_received_date: string | null
          pod_received_status: string
          pod_status: string
          to_location: string
          total_balance: number | null
          updated_at: string | null
        }
        Insert: {
          advance?: number
          balance?: number | null
          bill_number?: string | null
          booking_id: string
          created_at?: string | null
          created_by: string
          date: string
          driver_number?: string | null
          freight?: number
          from_location: string
          gr_number: string
          id?: string
          lorry_number: string
          other_expenses?: number
          owner_name: string
          payment_status?: string
          pod_received_date?: string | null
          pod_received_status?: string
          pod_status?: string
          to_location: string
          total_balance?: number | null
          updated_at?: string | null
        }
        Update: {
          advance?: number
          balance?: number | null
          bill_number?: string | null
          booking_id?: string
          created_at?: string | null
          created_by?: string
          date?: string
          driver_number?: string | null
          freight?: number
          from_location?: string
          gr_number?: string
          id?: string
          lorry_number?: string
          other_expenses?: number
          owner_name?: string
          payment_status?: string
          pod_received_date?: string | null
          pod_received_status?: string
          pod_status?: string
          to_location?: string
          total_balance?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_id: { Args: never; Returns: string }
      generate_lr_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
      app_role: ["admin", "staff"],
    },
  },
} as const
