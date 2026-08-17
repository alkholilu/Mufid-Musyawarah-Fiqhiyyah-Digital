import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygwckbmapejbdqbqghpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

function getSupabaseAuthEmail(profile) {
  if (profile.email && profile.email.includes('@')) {
    return profile.email;
  }

  const roleName = profile.roles?.nama_role || profile.role || '';
  const groupName = profile.kelompok?.nama_kelompok || profile.group || '';
  const fullName = profile.nama_lengkap || profile.fullName || '';

  // Match specific accounts based on Supabase Auth database
  if (fullName.includes('Aniq') || fullName.includes('Makki')) return 'mushohihsatu@gmail.com';
  if (fullName.includes('Alawy') || fullName.includes('machfudz')) return 'mushohihdua@gmail.com';
  if (fullName.includes('Faiz Amali')) return 'mushohihtiga@gmail.com';
  if (fullName.includes('Ahmad Rohmatillah')) return 'muharrirsatu@gmail.com';
  if (fullName.includes('Faizunnas')) return 'muharrirtiga@gmail.com';
  if (fullName.includes('Firdan')) return 'admin01@gmail.com';

  // Match Mubahhitsin delegasi groups
  if (groupName.includes('1') || fullName.includes('Iqbal')) return 'kelompoksatu@gmail.com';
  if (groupName.includes('2')) return 'kelompokdua@gmail.com';
  if (groupName.includes('3') || fullName.includes('Abid')) return 'kelompoktiga@gmail.com';
  if (groupName.includes('4') || fullName.includes('Naim')) return 'kelompokempat@gmail.com';
  if (groupName.includes('5') || fullName.includes('Shofil')) return 'kelompoklima@gmail.com';

  // Fallbacks by role
  if (roleName === 'Admin') return 'admin01@gmail.com';
  if (roleName === 'Muharrir') return 'muharrirsatu@gmail.com';
  if (roleName === 'Mushohih') return 'mushohihsatu@gmail.com';

  const cleanName = fullName
    .toLowerCase()
    .replace(/^(abah|kh\.|ustadz|kyai|gus|habib|drs\.|h\.|drs|h)\s+/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');
  return `${cleanName || 'user'}@gmail.com`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat melihat daftar pengguna.' });
    }

    // 2. Fetch all profiles with role and kelompok info
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nama_lengkap, role_id, kelompok_id, roles(id, nama_role), kelompok(id, nama_kelompok)')
      .order('nama_lengkap', { ascending: true });

    if (profilesError) throw profilesError;

    // 3. Fetch all auth users to get real emails if service role client is available
    const emailMap = {};
    if (supabaseServiceKey) {
      try {
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        const { data: authData } = await supabaseService.auth.admin.listUsers({ perPage: 1000 });
        if (authData?.users) {
          for (const authUser of authData.users) {
            if (authUser.id && authUser.email) {
              emailMap[authUser.id] = authUser.email;
            }
          }
        }
      } catch (e) {
        console.warn('[admin-list-users] Optional auth users list warning:', e.message);
      }
    }

    // 4. Merge profiles with auth user emails or match Supabase Auth email
    const mergedUsers = (profiles || []).map(p => ({
      ...p,
      email: emailMap[p.id] || getSupabaseAuthEmail(p)
    }));

    return res.status(200).json({ users: mergedUsers });

  } catch (err) {
    console.error('API list users error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
