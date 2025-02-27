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
      order_details: {
        Row: {
          cost: number
          created_at: string
          id: string
          order_id: string | null
          product: string
          qty: number
          sale: number
          sku: string | null
          total_cost: number | null
          total_sale: number | null
          upc: string | null
        }
        Insert: {
          cost: number
          created_at?: string
          id?: string
          order_id?: string | null
          product: string
          qty: number
          sale: number
          sku?: string | null
          total_cost?: number | null
          total_sale?: number | null
          upc?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          order_id?: string | null
          product?: string
          qty?: number
          sale?: number
          sku?: string | null
          total_cost?: number | null
          total_sale?: number | null
          upc?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_name: string
          email: string
          id: string
          order_number: string
          phone: string
          quantity: number
          status: string
          total: number | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          email: string
          id?: string
          order_number: string
          phone: string
          quantity: number
          status?: string
          total?: number | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          email?: string
          id?: string
          order_number?: string
          phone?: string
          quantity?: number
          status?: string
          total?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          cost_price: number
          created_at: string
          id: string
          name: string
          sale_price: number
          sku: string | null
          upc: string | null
        }
        Insert: {
          cost_price: number
          created_at?: string
          id?: string
          name: string
          sale_price: number
          sku?: string | null
          upc?: string | null
        }
        Update: {
          cost_price?: number
          created_at?: string
          id?: string
          name?: string
          sale_price?: number
          sku?: string | null
          upc?: string | null
        }
        Relationships: []
      }
      stock: {
        Row: {
          current_quantity: number
          id: number
          max_quantity: number
          updated_at: string | null
        }
        Insert: {
          current_quantity?: number
          id?: number
          max_quantity?: number
          updated_at?: string | null
        }
        Update: {
          current_quantity?: number
          id?: number
          max_quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_stock_with_validation: {
        Args: {
          new_quantity: number
        }
        Returns: {
          current_quantity: number
          id: number
          max_quantity: number
          updated_at: string | null
        }
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
