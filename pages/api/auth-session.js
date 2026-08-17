import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygwckbmapejbdqbqghpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

// Database admin client is no longer used for local dev / cloud bypass due to invalid keys in some environments.
// We instead query and update using the user-authenticated client (supabaseAuthClient) since we only query/update the user's own row.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];
  const { action, session_id: clientSessionId } = req.body || {};

  try {
    // 1. Verify caller user with Supabase Auth
    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Sesi kedaluwarsa atau tidak valid.' });
    }

    // 2. Fetch user profile using user-authenticated client
    const { data: profile, error: profileError } = await supabaseAuthClient
      .from('profiles')
      .select('id, session_id, last_seen_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profil pengguna tidak ditemukan.' });
    }

    const now = new Date();
    const INACTIVITY_TIMEOUT_MS = 2.5 * 60 * 1000; // 2.5 min threshold

    if (action === 'check_and_claim') {
      // Fresh login from Login page always claims the active session.
      // If another device/tab was open, its heartbeat will detect the new session_id and logout automatically.
      await supabaseAuthClient
        .from('profiles')
        .update({
          session_id: clientSessionId,
          last_seen_at: now.toISOString()
        })
        .eq('id', user.id);

      return res.status(200).json({ success: true, claimed: true });
    }

    if (action === 'heartbeat') {
      // Verify current client session matches DB session_id
      if (profile.session_id && profile.session_id !== clientSessionId) {
        return res.status(401).json({
          valid: false,
          error: 'Sesi Anda telah digantikan oleh sesi login baru di perangkat lain.'
        });
      }

      // Update heartbeat timestamp
      await supabaseAuthClient
        .from('profiles')
        .update({
          session_id: clientSessionId,
          last_seen_at: now.toISOString()
        })
        .eq('id', user.id);

      return res.status(200).json({ valid: true });
    }

    if (action === 'release') {
      // Clear session when user explicitly logs out
      await supabaseAuthClient
        .from('profiles')
        .update({
          session_id: null,
          last_seen_at: null
        })
        .eq('id', user.id);

      return res.status(200).json({ success: true, released: true });
    }

    return res.status(400).json({ error: 'Action tidak valid' });

  } catch (err) {
    console.error("[auth-session] Error:", err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server.' });
  }
}
