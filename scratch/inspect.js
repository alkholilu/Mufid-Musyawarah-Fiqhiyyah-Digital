const url = "https://ygwckbmapejbdqbqghpz.supabase.co/rest/v1/";
const serviceKey = "sb_secret_TECq7awxggz6UVvhwp8JiQ_TGrzRFrq";

async function run() {
  try {
    const res = await fetch(url + "roles?select=*", {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    const roles = await res.json();
    console.log("Roles table content:", roles);
  } catch (err) {
    console.error("Roles query failed:", err);
  }

  try {
    const res = await fetch(url + "profiles?select=*", {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    const profiles = await res.json();
    console.log("Profiles table content:", profiles);
  } catch (err) {
    console.error("Profiles query failed:", err);
  }
}

run();
