import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase para el servidor (con service role key)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Tipos de la base de datos
export interface Session {
  id: string;
  code: string;
  restaurant_name: string;
  currency: string;
  tip_rate: number;
  tax_rate: number;
  status: 'open' | 'closed';
  created_by?: string;
  created_at: string;
}

export interface Item {
  id: string;
  session_id: string;
  name: string;
  qty: number;
  unit_price: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  session_id: string;
  item_id: string;
  guest_id: string;
  fraction: number;
}

export interface Payment {
  id: string;
  session_id: string;
  guest_id: string;
  provider: string;
  provider_payment_id?: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface WebhookLog {
  event_id: string;
  payload: any;
  received_at: string;
}
