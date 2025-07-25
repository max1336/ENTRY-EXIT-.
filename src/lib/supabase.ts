import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string
          type: 'entry' | 'exit'
          timestamp: string
          person_id: string | null
          person_name: string | null
          person_enrollment_no: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'entry' | 'exit'
          timestamp?: string
          person_id?: string | null
          person_name?: string | null
          person_enrollment_no?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'entry' | 'exit'
          timestamp?: string
          person_id?: string | null
          person_name?: string | null
          person_enrollment_no?: string | null
          user_id?: string
          created_at?: string
        }
      }
      people: {
        Row: {
          id: string
          name: string
          enrollment_no: string | null
          email: string | null
          phone: string | null
          qr_code_data: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          enrollment_no?: string | null
          email?: string | null
          phone?: string | null
          qr_code_data?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          enrollment_no?: string | null
          email?: string | null
          phone?: string | null
          qr_code_data?: string | null
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}