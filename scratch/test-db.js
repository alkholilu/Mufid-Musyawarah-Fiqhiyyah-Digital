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

async function testInsert() {
  console.log('--- Testing insert with all required columns ---');
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({ 
      nama_operator: 'System Test', 
      peran_operator: 'Admin', 
      aksi: 'TEST', 
      keterangan_perubahan: 'TESTING' 
    })
    .select();

  if (error) {
    console.error('Insert failed:', error);
  } else {
    console.log('Insert succeeded! Created columns:', Object.keys(data[0] || {}));
    console.log('Row:', data[0]);
  }
}

testInsert();
