import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the service role key (server-side only)
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

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify the JWT token and get the user object
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Sesi kedaluwarsa atau tidak valid. Silakan login kembali.' });
    }

    // 2. Fetch the user profile using the service role client (bypassing RLS)
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('id, nama_lengkap, role_id, roles(id, nama_role), kelompok_id, kelompok:kelompok_id(id, nama_kelompok)')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return res.status(404).json({ error: 'Profil pengguna tidak ditemukan di database.' });
    }

    // 3. Return the profile data
    return res.status(200).json(profile);

  } catch (err) {
    console.error("API handler error:", err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server.' });
  }
}
