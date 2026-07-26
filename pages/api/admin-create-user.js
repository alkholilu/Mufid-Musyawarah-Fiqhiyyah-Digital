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
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify that the request is made by an Admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1];

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
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat membuat pengguna baru.' });
    }

    // 2. Parse body params
    const { email, password, nama_lengkap, role_id, kelompok_id } = req.body;

    if (!email || !password || !nama_lengkap || !role_id) {
      return res.status(400).json({ error: 'Email, password, nama lengkap, dan role harus diisi.' });
    }

    // 2.5 Validation: Anti-duplicate kelompok for Mubahhisin (role_id = 1)
    if (Number(role_id) === 1 && kelompok_id) {
      const { count, error: countError } = await supabaseService
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kelompok_id', kelompok_id)
        .eq('role_id', 1);

      if (countError) throw countError;

      if (count && count > 0) {
        return res.status(400).json({ error: '❌ Gagal: Nama Kelompok tersebut sudah terdaftar untuk delegasi lain. Data tidak boleh duplikat!' });
      }
    }

    // 3. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama_lengkap }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const newUserId = authData.user.id;

    // 4. Update or insert profiles table
    // Sometimes there is a trigger, so we check if the profile exists first.
    const { data: existingProfiles, error: checkError } = await supabaseService
      .from('profiles')
      .select('id')
      .eq('id', newUserId);

    if (checkError) throw checkError;

    const profileData = {
      nama_lengkap,
      role_id,
      // If kelompok_id is empty/none, keep it null
      kelompok_id: kelompok_id || null
    };

    if (existingProfiles && existingProfiles.length > 0) {
      const { error: profileError } = await supabaseService
        .from('profiles')
        .update(profileData)
        .eq('id', newUserId);
      if (profileError) throw profileError;
    } else {
      const { error: profileError } = await supabaseService
        .from('profiles')
        .insert({
          id: newUserId,
          ...profileData
        });
      if (profileError) throw profileError;
    }

    return res.status(200).json({ success: true, message: 'User berhasil dibuat.', user: authData.user });

  } catch (err) {
    console.error('API create user error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
