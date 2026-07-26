const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ygwckbmapejbdqbqghpz.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";

// Let's first log in as mubahhits01@gmail.com and perform the queries
async function run() {
  const supabase = createClient(supabaseUrl, anonKey);
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'mubahhits01@gmail.com',
      password: 'password123'
    });
    
    if (authError) throw authError;
    console.log("Logged in successfully. User ID:", authData.user.id);
    
    // Now let's try the api call logic. First getProfile. But API call runs with service role in backend, so it will succeed.
    // Let's query from client side:
    console.log("Querying profiles directly from client...");
    const { data: fullProfile, error: fpError } = await supabase
      .from('profiles')
      .select('kelompok_id, kelompok:kelompok_id(id, nama_kelompok, nomor_kelompok)')
      .eq('id', authData.user.id)
      .single();
      
    if (fpError) {
      console.error("fpError:", fpError);
    } else {
      console.log("fullProfile:", fullProfile);
    }
  } catch (err) {
    console.error("Error:", err.message || err);
  }
}

run();
