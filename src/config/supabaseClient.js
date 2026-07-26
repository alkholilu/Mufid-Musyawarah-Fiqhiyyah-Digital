import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Anon Key dari environment variables atau fallback .env yang valid
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygwckbmapejbdqbqghpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";

// Membuat dan mengekspor koneksi client untuk digunakan di halaman frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

