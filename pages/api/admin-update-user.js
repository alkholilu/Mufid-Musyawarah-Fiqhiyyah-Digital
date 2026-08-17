import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygwckbmapejbdqbqghpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Verify that the request is made by an Admin
    const { data: { user: caller }, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !caller) {
      return res.status(401).json({ error: 'Sesi tidak valid.' });
    }

    const { data: callerProfile, error: callerProfileError } = await supabase
      .from('profiles')
      .select('roles(nama_role)')
      .eq('id', caller.id)
      .single();

    if (callerProfileError || callerProfile?.roles?.nama_role !== 'Admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat mengubah data pengguna.' });
    }

    // 2. Parse body params
    const { user_id, nama_lengkap, email, role_id, kelompok_id, password } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'ID Pengguna (user_id) harus diisi.' });
    }

    if (!nama_lengkap || !role_id) {
      return res.status(400).json({ error: 'Nama lengkap dan role harus diisi.' });
    }

    // 3. Update profile in profiles table
    const profileData = {
      nama_lengkap,
      role_id,
      kelompok_id: kelompok_id || null
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user_id);

    if (profileError) throw profileError;

    // 4. Update email and/or password in Supabase Auth if provided and service key exists
    const authUpdatePayload = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password;

    if (Object.keys(authUpdatePayload).length > 0 && supabaseServiceKey) {
      try {
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        await supabaseService.auth.admin.updateUserById(user_id, authUpdatePayload);
      } catch (authErr) {
        console.warn('[admin-update-user] Auth update warning:', authErr.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Data pengguna berhasil diperbarui.' });

  } catch (err) {
    console.error('API update user error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
