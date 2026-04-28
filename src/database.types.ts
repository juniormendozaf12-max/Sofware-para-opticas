export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          name: string;
          dni: string;
          phone: string | null;
          address: string | null;
          birth_date: string | null;
          is_vip: boolean;
          photo_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          date: string;
          reason: string;
          medical_history: string | null;
          visual_acuity: Json | null;
          diagnosis: Json;
          diagnosis_tags: string[];
          lens_recommendation: Json | null;
          pio_od: number | null;
          pio_oi: number | null;
          notes: string | null;
          optometrist: string | null;
          ai_analysis: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['consultations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['consultations']['Insert']>;
      };
      prescriptions: {
        Row: {
          id: string;
          patient_id: string;
          date: string;
          od_sph: number;
          od_cyl: number;
          od_axis: number;
          od_add: number;
          oi_sph: number;
          oi_cyl: number;
          oi_axis: number;
          oi_add: number;
          dip: number;
          lens_type: string | null;
          material: string | null;
          treatments: string[] | null;
          optometrist: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prescriptions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['prescriptions']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          code: string;
          name: string;
          brand: string | null;
          model: string | null;
          color: string | null;
          category: string;
          material: string | null;
          cost_price: number;
          sale_price: number;
          stock: number;
          stock_min: number;
          supplier: string | null;
          location: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          date: string;
          patient_id: string | null;
          patient_name: string | null;
          items: Json;
          subtotal: number;
          discount: number;
          igv: number;
          total: number;
          payment_method: string;
          document_type: string;
          document_number: string | null;
          seller_id: string;
          seller_name: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      lens_inventory: {
        Row: {
          id: string;
          material: string;
          sph: number;
          cyl: number;
          stock: number;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lens_inventory']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lens_inventory']['Insert']>;
      };
    };
  };
}
