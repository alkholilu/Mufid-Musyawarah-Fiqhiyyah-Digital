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
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat menghapus pengguna.' });
    }

    // 2. Parse body params
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'ID Pengguna (user_id) harus diisi.' });
    }

    if (user_id === caller.id) {
      return res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri.' });
    }

    // 3. Delete profile from profiles table first (just to be safe, if cascade is not set)
    await supabaseService
      .from('profiles')
      .delete()
      .eq('id', user_id);

    // 4. Delete user from Supabase Auth
    const { error: deleteError } = await supabaseService.auth.admin.deleteUser(user_id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    return res.status(200).json({ success: true, message: 'User berhasil dihapus.' });

  } catch (err) {
    console.error('API delete user error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
