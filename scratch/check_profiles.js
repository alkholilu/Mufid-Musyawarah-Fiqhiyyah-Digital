const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ygwckbmapejbdqbqghpz.supabase.co";
const serviceKey = "sb_secret_TECq7awxggz6UVvhwp8JiQ_TGrzRFrq";

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, nama_lengkap, role_id, roles(id, nama_role)');
    if (error) throw error;
    console.log("Profiles in Database:\n", JSON.stringify(profiles, null, 2));
  } catch (err) {
    console.error("Error listing profiles:", err.message);
  }
}

run();
