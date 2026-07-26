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
    const { data: roles, error } = await supabase.from('roles').select('*');
    if (error) throw error;
    console.log("Roles in Database:\n", roles);
  } catch (err) {
    console.error("Error listing roles:", err.message);
  }
}

run();
