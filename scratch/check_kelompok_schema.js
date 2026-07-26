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
    const { data: kelompok, error } = await supabase
      .from('kelompok')
      .select('*')
      .limit(1);
    if (error) throw error;
    console.log("Kelompok columns:\n", kelompok);
  } catch (err) {
    console.error("Error listing kelompok:", err.message);
  }
}

run();
