import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Restaurant {
  id: string
  name: string
  slug: string
  address?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface StaffCode {
  id: string
  restaurant_id: string
  code: string
  created_by: string
  expires_at: string
  used_at?: string
  is_active: boolean
  created_at: string
}

export interface Table {
  id: string
  restaurant_id: string
  table_number: string
  join_code: string
  created_by: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  table_id: string
  guest_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  session_id: string
  item_name: string
  price: number
  quantity: number
  status: 'pending' | 'preparing' | 'ready' | 'served'
  created_at: string
  updated_at: string
}