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
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: 'bed7da1e-3b4b-4894-9a55-63554dde7cc2',
          nama_lengkap: 'Ustadz Ahmad Muharrir',
          role_id: 2, // Muharrir
        }
      ])
      .select();

    if (error) throw error;
    console.log("Successfully inserted profile:", data);
  } catch (err) {
    console.error("Error inserting profile:", err.message);
  }
}

run();
