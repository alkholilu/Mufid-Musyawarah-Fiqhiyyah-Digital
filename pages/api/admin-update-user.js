import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify that the request is made by an Admin
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the caller is indeed an Admin
    const { data: { user: caller }, error: callerError } = await supabaseService.auth.getUser(token);
    if (callerError || !caller) {
      return res.status(401).json({ error: 'Sesi tidak valid.' });
    }

    const { data: callerProfile, error: callerProfileError } = await supabaseService
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

    const { error: profileError } = await supabaseService
      .from('profiles')
      .update(profileData)
      .eq('id', user_id);

    if (profileError) throw profileError;

    // 4. Update email and/or password in Supabase Auth if provided
    const authUpdatePayload = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password;

    if (Object.keys(authUpdatePayload).length > 0) {
      const { error: authUpdateError } = await supabaseService.auth.admin.updateUserById(
        user_id,
        authUpdatePayload
      );

      if (authUpdateError) {
        console.warn('Auth update error:', authUpdateError.message);
        return res.status(400).json({ error: `Gagal memperbarui autentikasi pengguna: ${authUpdateError.message}` });
      }
    }

    return res.status(200).json({ success: true, message: 'Data pengguna berhasil diperbarui.' });

  } catch (err) {
    console.error('API update user error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
