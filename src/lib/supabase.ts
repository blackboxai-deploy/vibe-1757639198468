import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For client-side operations (browser)
export function createClientComponentClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
          credits: number;
          total_credits_used: number;
          daily_generations: number;
          last_reset_date: string | null;
          customer_id: string | null;
          subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          plan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
          credits?: number;
          total_credits_used?: number;
          daily_generations?: number;
          last_reset_date?: string | null;
          customer_id?: string | null;
          subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          plan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
          credits?: number;
          total_credits_used?: number;
          daily_generations?: number;
          last_reset_date?: string | null;
          customer_id?: string | null;
          subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          image_url: string;
          width: number;
          height: number;
          model: string;
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          image_url: string;
          width: number;
          height: number;
          model: string;
          credits_used: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          image_url?: string;
          width?: number;
          height?: number;
          model?: string;
          credits_used?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          type: 'subscription' | 'credits' | 'one_time';
          credits: number | null;
          plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_id: string;
          amount: number;
          currency?: string;
          status: 'pending' | 'completed' | 'failed' | 'cancelled';
          type: 'subscription' | 'credits' | 'one_time';
          credits?: number | null;
          plan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed' | 'cancelled';
          type?: 'subscription' | 'credits' | 'one_time';
          credits?: number | null;
          plan?: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}