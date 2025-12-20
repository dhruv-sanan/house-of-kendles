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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          state?: string
          street?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      bill_of_materials: {
        Row: {
          created_at: string
          id: number
          product_variant_id: number
          quantity_required: number
          raw_material_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          product_variant_id: number
          quantity_required: number
          raw_material_id: number
        }
        Update: {
          created_at?: string
          id?: never
          product_variant_id?: number
          quantity_required?: number
          raw_material_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_of_materials_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_of_materials_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          id: number
          is_active: boolean | null
          min_order_value: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type: string
          discount_value: number
          id?: never
          is_active?: boolean | null
          min_order_value?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          id?: never
          is_active?: boolean | null
          min_order_value?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: number
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: number
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: number
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          price_at_purchase: number
          product_id: number
          quantity: number
          variant_id: number | null
        }
        Insert: {
          id?: number
          order_id: number
          price_at_purchase: number
          product_id: number
          quantity: number
          variant_id?: number | null
        }
        Update: {
          id?: number
          order_id?: number
          price_at_purchase?: number
          product_id?: number
          quantity?: number
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          customer_id: number | null
          delivery_address_id: string | null
          estimated_delivery: string | null
          gift_wrap: boolean | null
          id: number
          order_date: string
          order_uid: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
        }
        Insert: {
          customer_id?: number | null
          delivery_address_id?: string | null
          estimated_delivery?: string | null
          gift_wrap?: boolean | null
          id?: number
          order_date?: string
          order_uid?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
        }
        Update: {
          customer_id?: number | null
          delivery_address_id?: string | null
          estimated_delivery?: string | null
          gift_wrap?: boolean | null
          id?: number
          order_date?: string
          order_uid?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recommendations: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: number
          recommendation_type: string
          recommended_product_id: number
          source_product_id: number
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          recommendation_type: string
          recommended_product_id: number
          source_product_id: number
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          recommendation_type?: string
          recommended_product_id?: number
          source_product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_recommended_product_id_fkey"
            columns: ["recommended_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recommendations_source_product_id_fkey"
            columns: ["source_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          flavor: string | null
          id: number
          image_url: string | null
          image_urls: string[] | null
          is_bestseller: boolean | null
          price: number
          product_id: number
          size: string | null
          stock_quantity: number
        }
        Insert: {
          flavor?: string | null
          id?: number
          image_url?: string | null
          image_urls?: string[] | null
          is_bestseller?: boolean | null
          price: number
          product_id: number
          size?: string | null
          stock_quantity?: number
        }
        Update: {
          flavor?: string | null
          id?: number
          image_url?: string | null
          image_urls?: string[] | null
          is_bestseller?: boolean | null
          price?: number
          product_id?: number
          size?: string | null
          stock_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          name: string
          slug: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          name: string
          slug?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      purchase_log: {
        Row: {
          created_at: string
          date_received: string
          id: number
          notes: string | null
          quantity_purchased: number
          raw_material_id: number
          total_cost: number | null
          vendor_id: number | null
        }
        Insert: {
          created_at?: string
          date_received?: string
          id?: never
          notes?: string | null
          quantity_purchased: number
          raw_material_id: number
          total_cost?: number | null
          vendor_id?: number | null
        }
        Update: {
          created_at?: string
          date_received?: string
          id?: never
          notes?: string | null
          quantity_purchased?: number
          raw_material_id?: number
          total_cost?: number | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_log_raw_material_id_fkey"
            columns: ["raw_material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_log_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number
          id: number
          name: string
          notes: string | null
          unit_of_measure: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: never
          name: string
          notes?: string | null
          unit_of_measure: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: never
          name?: string
          notes?: string | null
          unit_of_measure?: string
        }
        Relationships: []
      }
      recommendation_clicks: {
        Row: {
          added_at: string | null
          added_to_cart: boolean | null
          click_location: string
          clicked_at: string | null
          id: number
          recommended_product_id: number
          recommended_variant_id: number | null
          session_id: string
          source_page_url: string | null
          source_product_id: number | null
        }
        Insert: {
          added_at?: string | null
          added_to_cart?: boolean | null
          click_location: string
          clicked_at?: string | null
          id?: number
          recommended_product_id: number
          recommended_variant_id?: number | null
          session_id: string
          source_page_url?: string | null
          source_product_id?: number | null
        }
        Update: {
          added_at?: string | null
          added_to_cart?: boolean | null
          click_location?: string
          clicked_at?: string | null
          id?: number
          recommended_product_id?: number
          recommended_variant_id?: number | null
          session_id?: string
          source_page_url?: string | null
          source_product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_clicks_recommended_product_id_fkey"
            columns: ["recommended_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_clicks_recommended_variant_id_fkey"
            columns: ["recommended_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_clicks_source_product_id_fkey"
            columns: ["source_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: string | null
          created_at: string
          id: number
          location: string | null
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: never
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: never
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_raw_material_stock: {
        Args: { material_id_to_update: number; quantity_change: number }
        Returns: undefined
      }
      decrement_stock: {
        Args: { quantity_to_decrement: number; variant_id_to_update: number }
        Returns: undefined
      }
      get_or_create_customer: {
        Args: never
        Returns: {
          address: string | null
          created_at: string
          email: string
          id: number
          name: string
          phone: string | null
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      increment_stock: {
        Args: { quantity_to_increment: number; variant_id_to_update: number }
        Returns: undefined
      }
      set_default_address: {
        Args: { address_id: string }
        Returns: {
          city: string
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          state: string
          street: string
          user_id: string
          zip_code: string
        }
        SetofOptions: {
          from: "*"
          to: "addresses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      order_status:
        | "pending_payment"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      order_status: [
        "pending_payment",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
