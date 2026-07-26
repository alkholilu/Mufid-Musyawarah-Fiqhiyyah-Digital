const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY);

async function check() {
  const { data: roles, error: rolesError } = await supabase.from('roles').select('*');
  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
  } else {
    console.log('Roles:', roles);
  }

  const { data: kelompok, error: kelompokError } = await supabase.from('kelompok').select('*');
  if (kelompokError) {
    console.error('Error fetching kelompok:', kelompokError);
  } else {
    console.log('Kelompok:', kelompok);
  }

  const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, nama_lengkap, role_id, roles(id, nama_role)').limit(5);
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    console.log('Profiles (first 5):', JSON.stringify(profiles, null, 2));
  }
}

check();
