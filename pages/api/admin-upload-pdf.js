import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ygwckbmapejbdqbqghpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnd2NrYm1hcGVqYmRxYnFnaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODYxNTAsImV4cCI6MjA5NzE2MjE1MH0.1lGdl9TzOH9gdyR1BIau0LHGXUm723uY_uP2-g_P84g";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user: caller }, error: callerError } = await supabase.auth.getUser(token);
    if (callerError || !caller) {
      return res.status(401).json({ error: 'Sesi tidak valid.' });
    }

    const { data: callerProfile, error: callerProfileError } = await supabase
      .from('profiles')
      .select('roles(nama_role)')
      .eq('id', caller.id)
      .single();

    if (callerProfileError || callerProfile?.roles?.nama_role !== 'Admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat mengelola dokumen.' });
    }

    const { action, fileName, fileBase64, docId, headline, tagline, tanggalMasehi, tahunSidang, kategoriMasalah } = req.body;

    // ─── ACTION: DELETE DOKUMEN REPOSITORI ───
    if (action === 'delete') {
      if (!docId) {
        return res.status(400).json({ error: 'docId harus disertakan untuk menghapus berkas.' });
      }

      const { error: dbError } = await supabase
        .from('repositori_dokumen')
        .delete()
        .eq('id', docId);

      if (dbError) {
        console.error('Database delete error on repositori_dokumen:', dbError);
        throw new Error(`Gagal menghapus dokumen repositori: ${dbError.message}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Berkas PDF repositori berhasil dihapus.'
      });
    }

    // ─── ACTION: UPLOAD PDF REPOSITORI ───
    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: 'Data berkas PDF dan nama file harus diisi.' });
    }

    // 2. Decode Base64 to Buffer
    const base64Data = fileBase64.replace(/^data:.+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 3. Upload Buffer to Supabase Storage
    const fileExt = fileName.split('.').pop() || 'pdf';
    const storagePath = `pdf-repositori/repo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('dokumen-sidang')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Gagal mengunggah ke storage: ${uploadError.message}`);
    }

    // 4. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from('dokumen-sidang')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // 5. Insert record directly into repositori_dokumen
    const insertPayload = {
      headline: headline || 'Keputusan Hasil Bahtsul Masail',
      tagline: tagline || '28 Syawal 1448 H',
      tanggal_masehi: tanggalMasehi || '25 Juli 2026',
      kategori: kategoriMasalah || 'Thaharah',
      tahun_sidang: tahunSidang ? parseInt(tahunSidang, 10) : new Date().getFullYear(),
      file_pdf_url: publicUrl,
    };

    const { data: insertedDoc, error: dbError } = await supabase
      .from('repositori_dokumen')
      .insert(insertPayload)
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error on repositori_dokumen:', dbError);
      throw new Error(`Gagal menyimpan ke database repositori: ${dbError.message}`);
    }

    return res.status(200).json({
      success: true,
      message: `Berkas PDF '${fileName}' berhasil diunggah dan dipublikasikan ke Repositori.`,
      publicUrl,
      doc: insertedDoc,
    });
  } catch (err) {
    console.error('API admin-upload-pdf Error:', err.message);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server saat mengunggah PDF.' });
  }
}
