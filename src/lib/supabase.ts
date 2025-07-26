import { createClient } from '@supabase/supabase-js'

// Debug: Log what environment variables are available
console.log('Environment check:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  allEnvVars: import.meta.env
});

// For now, we'll create a mock setup until real credentials are provided
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a mock client that simulates authentication
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      console.log('Mock login attempt:', { email, password });
      
      // Simulate the specific login you want
      if (email === 'mihir.r.bhavsar1336@gmail.com' && password === 'mihir1336') {
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: 'mihir.r.bhavsar1336@gmail.com'
            },
            session: {
              access_token: 'mock-token',
              user: {
                id: 'mock-user-id',
                email: 'mihir.r.bhavsar1336@gmail.com'
              }
            }
          },
          error: null
        };
      }
      
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      };
    },

    signUp: async ({ email, password }: { email: string, password: string }) => {
      console.log('Mock signup attempt:', { email, password });
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: email
          },
          session: {
            access_token: 'mock-token',
            user: {
              id: 'mock-user-id',
              email: email
            }
          }
        },
        error: null
      };
    },
    
    getSession: async () => {
      return {
        data: { session: null },
        error: null
      };
    },
    
    signOut: async () => {
      return { error: null };
    },
    
    onAuthStateChange: (callback: Function) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    }
  },
  
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        order: (column: string, options?: any) => Promise.resolve({
          data: [],
          error: null
        })
      }),
      single: () => Promise.resolve({
        data: null,
        error: null
      })
    }),
    insert: (data: any) => {
      const result = Promise.resolve({
        data: { id: 'mock-id', ...data, created_at: new Date().toISOString() },
        error: null
      });
      
      return {
        select: () => ({
          single: () => result
        }),
        ...result
      };
    },
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({
        data: null,
        error: null
      })
    }),
    delete: () => {
      const deleteResult = Promise.resolve({
        data: null,
        error: null
      });
      
      return {
        eq: (column: string, value: any) => ({
          eq: (column2: string, value2: any) => deleteResult,
          ...deleteResult
        })
      };
    }
  })
};

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