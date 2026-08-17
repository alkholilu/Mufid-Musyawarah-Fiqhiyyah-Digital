import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygwckbmapejbdqbqghpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Verify caller user is Admin
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
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat membuat pengguna baru.' });
    }

    // 2. Parse body params
    const { email, password, nama_lengkap, role_id, kelompok_id } = req.body;

    if (!email || !password || !nama_lengkap || !role_id) {
      return res.status(400).json({ error: 'Email, password, nama lengkap, dan role harus diisi.' });
    }

    // Validation: Anti-duplicate kelompok for Mubahhisin (role_id = 1)
    if (Number(role_id) === 1 && kelompok_id) {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kelompok_id', kelompok_id)
        .eq('role_id', 1);

      if (countError) throw countError;

      if (count && count > 0) {
        return res.status(400).json({ error: '❌ Gagal: Nama Kelompok tersebut sudah terdaftar untuk delegasi lain. Data tidak boleh duplikat!' });
      }
    }

    // 3. Create user in Supabase Auth using service key if available
    let newUserId = null;
    let authUser = null;

    if (supabaseServiceKey) {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nama_lengkap }
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
      authUser = authData.user;
      newUserId = authUser.id;
    } else {
      return res.status(400).json({ error: 'Fitur pembuatan akun memerlukan Supabase Service Role Key.' });
    }

    // 4. Update or insert profiles table
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', newUserId);

    const profileData = {
      nama_lengkap,
      role_id,
      kelompok_id: kelompok_id || null
    };

    if (existingProfiles && existingProfiles.length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', newUserId);
      if (profileError) throw profileError;
    } else {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          ...profileData
        });
      if (profileError) throw profileError;
    }

    return res.status(200).json({ success: true, message: 'User berhasil dibuat.', user: authUser });

  } catch (err) {
    console.error('API create user error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
