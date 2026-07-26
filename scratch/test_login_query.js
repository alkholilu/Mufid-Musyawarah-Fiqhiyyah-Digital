const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ygwckbmapejbdqbqghpz.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";

const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  try {
    // 1. Log in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'muharir01@gmail.com',
      password: 'password123'
    });

    if (authError) throw authError;
    const user = authData.user;
    console.log("Logged in successfully as:", user.email, "ID:", user.id);

    // 2. Query profiles only
    const { data: profilesOnly, error: errProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id);
    console.log("Profiles Only Query:", profilesOnly, "Error:", errProfiles);

    // 3. Query roles only
    const { data: rolesOnly, error: errRoles } = await supabase
      .from('roles')
      .select('*');
    console.log("Roles Only Query:", rolesOnly, "Error:", errRoles);

    // 4. Query profiles joined with roles
    const { data: joined, error: errJoined } = await supabase
      .from('profiles')
      .select('*, roles(*)')
      .eq('id', user.id);
    console.log("Joined Query:", joined, "Error:", errJoined);

  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

run();
