import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      residents: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string;
          role: string;
          status: string;
          unit_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone: string;
          role: string;
          status?: string;
          unit_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string;
          role?: string;
          status?: string;
          unit_id?: number;
          updated_at?: string;
        };
      };
      units: {
        Row: {
          id: number;
          number: string;
          block: string;
          owner: string;
          status: string;
          residents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          number: string;
          block: string;
          owner: string;
          status: string;
          residents: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          number?: string;
          block?: string;
          owner?: string;
          status?: string;
          residents?: number;
          updated_at?: string;
        };
      };
      billings: {
        Row: {
          id: number;
          billing_id: string;
          unit: string;
          resident: string;
          description: string;
          amount: number;
          due_date: string;
          status: 'pending' | 'paid' | 'overdue' | 'cancelled';
          is_printed: boolean;
          is_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          billing_id: string;
          unit: string;
          resident: string;
          description: string;
          amount: number;
          due_date: string;
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
          is_printed?: boolean;
          is_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          billing_id?: string;
          unit?: string;
          resident?: string;
          description?: string;
          amount?: number;
          due_date?: string;
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
          is_printed?: boolean;
          is_sent?: boolean;
          updated_at?: string;
        };
      };
      bank_accounts: {
        Row: {
          id: number;
          name: string;
          bank: string;
          account_number: string;
          agency: string;
          balance: number;
          initial_balance: number;
          account_type: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          bank: string;
          account_number: string;
          agency: string;
          balance: number;
          initial_balance: number;
          account_type: string;
          color: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          bank?: string;
          account_number?: string;
          agency?: string;
          balance?: number;
          initial_balance?: number;
          account_type?: string;
          color?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: number;
          description: string;
          amount: number;
          type: 'income' | 'expense' | 'transfer';
          category: string;
          account: string;
          account_id: number;
          to_account?: string;
          to_account_id?: number;
          date: string;
          unit?: string;
          payee?: string;
          status: 'completed' | 'pending' | 'cancelled';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          description: string;
          amount: number;
          type: 'income' | 'expense' | 'transfer';
          category: string;
          account: string;
          account_id: number;
          to_account?: string;
          to_account_id?: number;
          date: string;
          unit?: string;
          payee?: string;
          status?: 'completed' | 'pending' | 'cancelled';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          description?: string;
          amount?: number;
          type?: 'income' | 'expense' | 'transfer';
          category?: string;
          account?: string;
          account_id?: number;
          to_account?: string;
          to_account_id?: number;
          date?: string;
          unit?: string;
          payee?: string;
          status?: 'completed' | 'pending' | 'cancelled';
          notes?: string;
          updated_at?: string;
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);