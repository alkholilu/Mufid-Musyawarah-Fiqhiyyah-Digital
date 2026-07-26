const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ygwckbmapejbdqbqghpz.supabase.co";
const serviceKey = "sb_secret_TECq7awxggz6UVvhwp8JiQ_TGrzRFrq";

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email, password, fullName, roleId, customId = null) {
  try {
    let targetUserId = customId;
    let userExists = false;

    if (customId) {
      // Check if user with this ID already exists in Auth
      const { data: { user: existingUser }, error: getError } = await supabase.auth.admin.getUserById(customId);
      if (existingUser) {
        userExists = true;
        // Update user email and password if needed
        const { error: updateError } = await supabase.auth.admin.updateUserById(customId, {
          email: email,
          password: password,
          email_confirm: true
        });
        if (updateError) throw updateError;
        console.log(`Updated existing auth user by ID: ${email} (${customId})`);
      }
    }

    if (!userExists) {
      // Check if user with this email already exists in Auth
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        userExists = true;
        targetUserId = existingUser.id;
        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(targetUserId, { password });
        if (updateError) throw updateError;
        console.log(`Updated existing auth user by email: ${email} (${targetUserId})`);
      }
    }

    if (!userExists) {
      // Create parameters
      const createParams = {
        email: email,
        password: password,
        email_confirm: true
      };
      if (customId) {
        await supabase.from('profiles').delete().eq('id', customId);
        createParams.id = customId;
      }
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser(createParams);
      if (authError) throw authError;
      targetUserId = authData.user.id;
      console.log(`Created new auth user: ${email} (${targetUserId})`);
    }

    // Insert or update profile
    await insertProfile(targetUserId, fullName, roleId);

  } catch (err) {
    console.error(`Failed to handle user ${email}:`, err.message || err);
  }
}

async function insertProfile(userId, fullName, roleId) {
  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    // Update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ nama_lengkap: fullName, role_id: roleId })
      .eq('id', userId);
    if (updateError) throw updateError;
    console.log(`Updated profile for ${fullName}`);
  } else {
    // Insert
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ id: userId, nama_lengkap: fullName, role_id: roleId }]);
    if (insertError) throw insertError;
    console.log(`Created profile for ${fullName}`);
  }
}

async function run() {
  await createUser('admin01@gmail.com', 'password123', 'Ahmad Admin', 4);
  await createUser('mushohih01@gmail.com', 'password123', 'K.H. Ahmad Mushohih', 3);
  await createUser('mubahhits01@gmail.com', 'password123', 'Ustadz Ahmad Mubahhits', 1);
  await createUser('muharir01@gmail.com', 'password123', 'Ustadz Ahmad Muharrir', 2, 'bed7da1e-3b4b-4894-9a55-63554dde7cc2');
  console.log("Test users creation finished.");
}

run();
