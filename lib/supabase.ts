// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pwnazfczxdvonhcziije.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bmF6ZmN6eGR2b25oY3ppaWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NzU3NzAsImV4cCI6MjA2OTM1MTc3MH0.gar3WXcfqMDxJ7-ZFsbxhceyn6d0ND8icZTEyNvXLss'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
