const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ygwckbmapejbdqbqghpz.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";
const serviceKey = "sb_secret_TECq7awxggz6UVvhwp8JiQ_TGrzRFrq";

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

async function run() {
  const userId = 'bed7da1e-3b4b-4894-9a55-63554dde7cc2'; // Ustadz Ahmad Muharrir

  console.log("--- Querying using Service Key ---");
  const { data: dataService, error: errorService } = await supabaseService
    .from('profiles')
    .select('*, roles(nama_role)')
    .eq('id', userId);
  console.log("Service Key Results:", dataService, "Error:", errorService);

  console.log("\n--- Querying using Anon Key (No Session) ---");
  const { data: dataAnon, error: errorAnon } = await supabaseAnon
    .from('profiles')
    .select('*, roles(nama_role)')
    .eq('id', userId);
  console.log("Anon Key Results:", dataAnon, "Error:", errorAnon);

  // Let's also check roles table with Anon key
  console.log("\n--- Querying roles using Anon Key ---");
  const { data: dataRoles, error: errorRoles } = await supabaseAnon
    .from('roles')
    .select('*');
  console.log("Roles Anon Results:", dataRoles, "Error:", errorRoles);
}

run();
