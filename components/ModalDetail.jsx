import React, { useEffect, useState } from 'react';
import { supabase } from '../src/config/supabaseClient';
import { X, BookOpen, Calendar, Tag, FileText, CheckCircle2, Bookmark, AlertCircle, HelpCircle } from 'lucide-react';

export default function ModalDetail({ isOpen, onClose, documentId }) {
  const [docDetail, setDocDetail] = useState(null);
  const [jawabanList, setJawabanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !documentId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Fetch masalah_sidang details
        const { data: masalahData, error: masalahErr } = await supabase
          .from('masalah_sidang')
          .select('id, judul_pembahasan, deskripsi_masalah, soal_pertanyaan, kategori_masalah, tahun_sidang, file_pdf_hasil, status_sidang')
          .eq('id', documentId)
          .single();

        if (masalahErr) throw masalahErr;
        setDocDetail(masalahData);

        // 2. Fetch jawaban that are linked, including kelompok name
        // We filter by status_jawaban = 'Disahkan' or is_referensi_utama = true
        const { data: jawabanData, error: jawabanErr } = await supabase
          .from('jawaban')
          .select(`
            id,
            argumen_indo,
            dalil_arab,
            nama_kitab,
            juz_ke,
            halaman_berapa,
            karangan_siapa,
            status_hukum,
            is_referensi_utama,
            kelompok_id,
            kelompok:kelompok_id ( nama_kelompok )
          `)
          .eq('masalah_id', documentId)
          .order('is_referensi_utama', { ascending: false });

        if (jawabanErr) throw jawabanErr;
        setJawabanList(jawabanData || []);

      } catch (err) {
        console.error('Gagal mengambil detail dokumen:', err.message);
        setError('Gagal memuat detail dokumen hasil sidang.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn z-10">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-snug">Detail Keputusan Sidang</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Dokumen Hasil Tashih Bahtsul Masail</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="h-10 w-10 border-4 border-emerald-600/30 border-t-emerald-700 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-emerald-800">Memuat detail pembahasan...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center text-rose-800">
              <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
              <p className="font-bold">{error}</p>
            </div>
          ) : !docDetail ? (
            <p className="text-center py-12 text-slate-500 font-bold">Dokumen tidak ditemukan.</p>
          ) : (
            <article className="space-y-8">
              
              {/* Header Info */}
              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl p-6 border border-emerald-100/50 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100/70 text-emerald-800 px-3 py-1 rounded-lg font-extrabold border border-emerald-200/50">
                    <Tag className="h-3 w-3" /> {docDetail.kategori_masalah}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-extrabold border border-slate-200">
                    <Calendar className="h-3 w-3" /> Tahun Sidang {docDetail.tahun_sidang}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-lg font-extrabold border border-green-200">
                    <CheckCircle2 className="h-3 w-3" /> {docDetail.status_sidang}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {docDetail.judul_pembahasan}
                </h2>
              </div>

              {/* Deskripsi Masalah */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-700" />
                  <span>Deskripsi Masalah</span>
                </h4>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-700 text-sm md:text-base font-medium leading-relaxed whitespace-pre-line">
                  {docDetail.deskripsi_masalah}
                </div>
              </div>

              {/* Pertanyaan */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-700" />
                  <span>Pertanyaan</span>
                </h4>
                <div className="p-5 bg-emerald-50/20 rounded-2xl border border-emerald-100/60 text-emerald-900 text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">
                  {docDetail.soal_pertanyaan}
                </div>
              </div>

              {/* Jawaban & Dalil Rujukan */}
              <div className="space-y-6 pt-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-emerald-700" />
                  <span>Natijah Keputusan & Dalil Kitab</span>
                </h4>

                {jawabanList.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-4">Belum ada rumusan jawaban yang disahkan untuk masalah ini.</p>
                ) : (
                  <div className="space-y-8">
                    {jawabanList.map((jawaban, idx) => {
                      const isMain = jawaban.is_referensi_utama;
                      return (
                        <div 
                          key={jawaban.id} 
                          className={`p-6 rounded-2xl border transition ${
                            isMain 
                              ? 'bg-emerald-50/10 border-emerald-200 shadow-sm ring-1 ring-emerald-500/10' 
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-slate-500">
                              Oleh: {jawaban.kelompok?.nama_kelompok || `Kelompok ${idx + 1}`}
                            </span>
                            {isMain && (
                              <span className="text-[10px] bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                ★ Referensi Utama
                              </span>
                            )}
                          </div>

                          {/* Isi Jawaban */}
                          <div className="mb-5">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Jawaban Rumusan</h5>
                            <p className="text-slate-800 text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">
                              {jawaban.argumen_indo}
                            </p>
                          </div>

                          {/* Teks Arab (RTL) */}
                          {jawaban.dalil_arab && (
                            <div className="mb-5 bg-amber-50/10 p-5 rounded-xl border border-amber-100/50">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Kutipan Dalil (Nash)</h5>
                              <p className="arabic-text text-slate-900 leading-[2.2] text-right font-serif" dir="rtl" style={{ fontSize: '24px' }}>
                                {jawaban.dalil_arab}
                              </p>
                            </div>
                          )}

                          {/* Referensi Kitab */}
                          {jawaban.nama_kitab && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#006432] mt-3 pt-3 border-t border-slate-100">
                              <span className="text-slate-400 font-medium">Kitab Rujukan:</span>
                              <span>{`${jawaban.nama_kitab}, Juz ${jawaban.juz_ke || '-'}, Hal. ${jawaban.halaman_berapa || '-'} (Karya: ${jawaban.karangan_siapa || '-'}) [Hukum: ${jawaban.status_hukum || '-'}]`}</span>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PDF Download Button (Footer area of modal) */}
              {docDetail.file_pdf_hasil && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <a
                    href={docDetail.file_pdf_hasil}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006432] hover:bg-[#004A23] text-white text-sm font-bold rounded-xl shadow-md transition"
                  >
                    ðŸ“¥ Unduh PDF Resmi Hasil Sidang
                  </a>
                </div>
              )}

            </article>
          )}

        </div>
      </div>
    </div>
  );
}

