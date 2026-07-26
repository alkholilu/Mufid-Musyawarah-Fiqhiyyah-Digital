import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify that the request is made by an Admin
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user: caller }, error: callerError } = await supabaseService.auth.getUser(token);
    if (callerError || !caller) {
      return res.status(401).json({ error: 'Sesi tidak valid.' });
    }

    const { data: callerProfile, error: callerProfileError } = await supabaseService
      .from('profiles')
      .select('roles(nama_role)')
      .eq('id', caller.id)
      .single();

    if (callerProfileError || callerProfile?.roles?.nama_role !== 'Admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya Admin yang dapat mengelola masalah sidang.' });
    }

    // 2. Determine action from body
    const { action } = req.body;

    // ─── INSERT ───
    if (action === 'insert') {
      const { judul_pembahasan, kategori_masalah, tahun_sidang, deskripsi_masalah, soal_pertanyaan } = req.body;

      if (!judul_pembahasan || !deskripsi_masalah || !soal_pertanyaan) {
        return res.status(400).json({ error: 'Judul, deskripsi, dan soal pertanyaan harus diisi.' });
      }

      const { data, error } = await supabaseService
        .from('masalah_sidang')
        .insert({
          judul_pembahasan,
          kategori_masalah: kategori_masalah || 'Medis',
          tahun_sidang: tahun_sidang || new Date().getFullYear(),
          deskripsi_masalah,
          soal_pertanyaan,
          status_sidang: 'Draft'
        })
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Masalah berhasil didaftarkan.', data });
    }

    // ─── UPDATE ───
    if (action === 'update') {
      const { id, judul_pembahasan, status_sidang, tahun_sidang, deskripsi_masalah, soal_pertanyaan } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID masalah harus disertakan.' });
      }

      const updatePayload = {};
      if (judul_pembahasan !== undefined) updatePayload.judul_pembahasan = judul_pembahasan;
      if (status_sidang !== undefined) updatePayload.status_sidang = status_sidang;
      if (tahun_sidang !== undefined) updatePayload.tahun_sidang = tahun_sidang;
      if (deskripsi_masalah !== undefined) updatePayload.deskripsi_masalah = deskripsi_masalah;
      if (soal_pertanyaan !== undefined) updatePayload.soal_pertanyaan = soal_pertanyaan;

      const { data, error } = await supabaseService
        .from('masalah_sidang')
        .update(updatePayload)
        .eq('id', id)
        .select();

      if (error) throw error;


      return res.status(200).json({ success: true, message: 'Masalah berhasil diperbarui.', data });
    }

    // ─── DELETE ───
    if (action === 'delete') {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID masalah harus disertakan.' });
      }

      // Delete related jawaban first
      await supabaseService
        .from('jawaban')
        .delete()
        .eq('masalah_id', id);

      const { data, error } = await supabaseService
        .from('masalah_sidang')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Masalah berhasil dihapus.', data });
    }

    // ─── SYNC JAWABAN ───
    if (action === 'sync-jawaban') {
      const { masalah_id, jawaban } = req.body;

      if (!masalah_id || !jawaban) {
        return res.status(400).json({ error: 'masalah_id dan jawaban harus disertakan.' });
      }

      const { data, error } = await supabaseService
        .from('jawaban')
        .upsert(jawaban, { onConflict: 'id' })
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    return res.status(400).json({ error: 'Action tidak dikenali. Gunakan: insert, update, delete, atau sync-jawaban.' });

  } catch (err) {
    console.error('API masalah error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan internal server.' });
  }
}
