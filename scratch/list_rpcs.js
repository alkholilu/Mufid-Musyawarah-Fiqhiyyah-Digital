const url = "https://ygwckbmapejbdqbqghpz.supabase.co/rest/v1/";
const serviceKey = "sb_secret_TECq7awxggz6UVvhwp8JiQ_TGrzRFrq";

async function run() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    const schema = await res.json();
    const paths = schema.paths ? Object.keys(schema.paths) : [];
    const rpcs = paths.filter(p => p.startsWith("/rpc/"));
    console.log("RPC Endpoints:", rpcs);
  } catch (err) {
    console.error(err);
  }
}

run();
