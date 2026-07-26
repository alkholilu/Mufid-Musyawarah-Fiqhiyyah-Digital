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
    const { data, error } = await supabase.auth.admin.updateUserById(
      'bed7da1e-3b4b-4894-9a55-63554dde7cc2',
      { password: 'password123' }
    );

    if (error) throw error;
    console.log("Successfully updated password for user:", data.user.email);
  } catch (err) {
    console.error("Error updating password:", err.message);
  }
}

run();
