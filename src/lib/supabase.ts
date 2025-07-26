import { createClient } from '@supabase/supabase-js'

// Try to get from environment, fallback to development values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

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