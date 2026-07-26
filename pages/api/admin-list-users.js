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
  if (req.method !== 'GET') {
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
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat melihat daftar pengguna.' });
    }

    // 2. Fetch all profiles with role and kelompok info
    const { data: profiles, error: profilesError } = await supabaseService
      .from('profiles')
      .select('id, nama_lengkap, role_id, kelompok_id, roles(id, nama_role), kelompok(id, nama_kelompok)')
      .order('nama_lengkap', { ascending: true });

    if (profilesError) throw profilesError;

    // 3. Fetch all auth users to get real emails
    const { data: { users: authUsers }, error: authError } = await supabaseService.auth.admin.listUsers({
      perPage: 1000
    });

    if (authError) throw authError;

    // 4. Merge profiles with auth user emails
    const emailMap = {};
    for (const authUser of authUsers) {
      emailMap[authUser.id] = authUser.email;
    }

    const mergedUsers = profiles.map(p => ({
      ...p,
      email: emailMap[p.id] || null
    }));

    return res.status(200).json({ users: mergedUsers });

  } catch (err) {
    console.error('API list users error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
