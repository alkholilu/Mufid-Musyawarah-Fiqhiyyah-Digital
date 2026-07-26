import React, { useEffect, useState } from 'react';
import { supabase } from '../src/config/supabaseClient';

import Footer from '../components/Footer';
import Head from 'next/head';
import Link from 'next/link';
import ModalDetail from '../components/ModalDetail';
import { Search, SlidersHorizontal, Calendar, FileText, Download, ChevronDown } from 'lucide-react';

export default function Repositori() {
  // Tempat menyimpan data dari database
  const [dokumenList, setDokumenList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tempat menyimpan teks pencarian dan filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');

  // State untuk modal detail dokumen
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper untuk memetakan metadata tiruan yang sesuai dengan mockup gambar
  const getMockMetadata = (doc) => {
    const title = doc.judul_pembahasan || '';
    const idStr = String(doc.id);
    
    // Pemetaan khusus dokumen Paylater agar pas dengan mockup gambar
    if (title.toLowerCase().includes('paylater')) {
      return {
        kategori: 'Muamalah Modern',
        tanggal: "15 Sya'ban 1445 H (25 Feb 2024)",
        statusBadges: [
          { text: 'JAWAZ / BOLEH', colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
          { text: 'MAKRUH TAHZIB', colorClass: 'bg-slate-100 text-slate-700 border border-slate-200' }
        ],
        noKeputusan: 'Keputusan No. 45/KF/2024'
      };
    }
    
    // Pemetaan khusus dokumen Follower/Engagement agar pas dengan mockup gambar
    if (title.toLowerCase().includes('follower') || title.toLowerCase().includes('engagement')) {
      return {
        kategori: 'Sosial Kemasyarakatan',
        tanggal: "10 Muharram 1445 H (28 Jul 2023)",
        statusBadges: [
          { text: 'HARAM', colorClass: 'bg-red-50 text-red-700 border border-red-100' }
        ],
        noKeputusan: 'Hasil Pleno II'
      };
    }

    // Default generator metadata untuk dokumen lainnya secara dinamis
    const mockDay = (parseInt(idStr.slice(-1)) || 5) * 3 + 1;
    let statusBadges = [];
    if (doc.kategori_masalah === 'Medis') {
      statusBadges = [{ text: 'MAKRUH', colorClass: 'bg-amber-50 text-amber-700 border border-amber-100' }];
    } else if (doc.kategori_masalah === 'Teknologi') {
      statusBadges = [{ text: 'JAWAZ / BOLEH', colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100' }];
    } else {
      statusBadges = [{ text: 'JAWAZ / BOLEH', colorClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100' }];
    }
    
    return {
      kategori: doc.kategori_masalah || 'Fikih Kontemporer',
      tanggal: `${mockDay} Syawal 1445 H (${mockDay} May ${doc.tahun_sidang || 2024})`,
      statusBadges,
      noKeputusan: `Keputusan No. ${parseInt(idStr.slice(-2)) || 12}/KF/${doc.tahun_sidang || 2024}`
    };
  };

  // Fungsi untuk mengambil data dari Supabase
  const fetchDokumen = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('repositori_dokumen')
        .select('*')
        .order('created_at', { ascending: false });

      // Jalankan query ke database
      const { data, error } = await query;

      if (error) throw error;
      setDokumenList(data || []);
    } catch (error) {
      console.error('Gagal mengambil data repositori:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fungsi fetchDokumen saat halaman pertama kali dibuka & aktifkan Realtime listener
  useEffect(() => {
    fetchDokumen();

    const channel = supabase
      .channel('public-repositori-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'repositori_dokumen' },
        () => {
          fetchDokumen();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Logika filter data di sisi frontend (Client-side filtering)
  const filteredDokumen = dokumenList.filter((doc) => {
    if (!doc.file_pdf_url) return false;

    const headlineText = doc.headline || '';
    const taglineText = doc.tagline || '';
    const dateText = doc.tanggal_masehi || '';
    
    const cocokKataKunci = headlineText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          taglineText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dateText.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const cocokKategori = selectedKategori === '' || (doc.kategori && doc.kategori.toLowerCase().includes(selectedKategori.toLowerCase()));
    const cocokTahun = selectedTahun === '' || String(doc.tahun_sidang) === selectedTahun;
    
    return cocokKataKunci && cocokKategori && cocokTahun;
  });

  // Ekstrak tahun sidang dan kategori masalah unik dari database secara dinamis
  const uniqueYears = Array.from(new Set(dokumenList.map(doc => doc.tahun_sidang).filter(Boolean))).sort((a, b) => b - a);
  const defaultCategories = ["Jinayat", "Muamalah", "Medis", "Teknologi", "Zakat", "Sosial Kemasyarakatan"];
  const dbCategories = dokumenList.map(doc => doc.kategori).filter(Boolean);
  const uniqueCategories = Array.from(new Set([...defaultCategories, ...dbCategories])).sort();

  const openModal = (id) => {
    setSelectedDocId(id);
    setIsModalOpen(true);
  };

  // Generate schema.org structured data (JSON-LD) dynamically based on results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Repositori Dokumen Hasil Sidang - Mufid",
    "description": "Koleksi keputusan resmi hasil sidang Bahtsul Masail LBM Mufid",
    "numberOfItems": filteredDokumen.length,
    "itemListElement": filteredDokumen.map((doc, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "name": doc.judul_pembahasan,
        "headline": doc.judul_pembahasan,
        "description": doc.deskripsi_masalah,
        "datePublished": `${doc.tahun_sidang}-01-01`, // Fallback format
        "author": {
          "@type": "Organization",
          "name": "LBM Mufid"
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans flex flex-col justify-between">
      <Head>
        <title>Repositori Dokumen Hasil Sidang - Mufid</title>
        <meta name="description" content="Koleksi keputusan resmi hasil sidang Bahtsul Masail LBM Mufid" />
        
        {/* Dynamic JSON-LD Structured Data for SEO */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>



      <main className="flex-grow">
        {/* ───────────── BREADCRUMB & HEADER UTAMA ───────────── */}
        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8 pt-10 pb-6 animate-fadeInUp">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-400 mb-4 select-none">
            <Link href="/" className="hover:text-emerald-700 transition">Beranda</Link>
            <span>/</span>
            <span className="text-emerald-800 font-semibold">Repositori</span>
          </nav>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
            Repositori Dokumen
          </h1>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-500 max-w-3xl leading-relaxed">
            Pusat pencarian arsip, hasil bahtsul masail, dan fatwa resmi dari berbagai masalah. 
            Gunakan filter untuk mempersempit hasil pencarian.
          </p>
        </div>

        <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8 pb-20">
          
          {/* 🔍 KOTAK PENCARIAN & FILTER SEJAJAR (MOCKUP STYLE) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] mb-8 flex flex-col xl:flex-row gap-4 items-center justify-between scroll-reveal">
            
            {/* Input Pencarian */}
            <div className="w-full xl:flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari kata kunci, topik, atau nomor keputusan..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Dropdowns & Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:flex-shrink-0 items-stretch sm:items-center justify-between">
              
              {/* Dropdown: Tahun Sidang */}
              <select
                className="w-full sm:w-auto sm:flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-white text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 transition-all cursor-pointer min-w-0"
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
              >
                <option value="">Tahun Sidang</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Dropdown: Kategori Masalah */}
              <select
                className="w-full sm:w-auto sm:flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-white text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 transition-all cursor-pointer min-w-0"
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
              >
                <option value="">Semua Kategori Masalah</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Tombol Reset Filter */}
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedKategori('');
                  setSelectedTahun('');
                }}
                className="flex-shrink-0 flex items-center justify-center p-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition duration-200 cursor-pointer shadow-xs"
                title="Reset Filter"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 📄 DAFTAR HASIL & SORTING */}
          {loading ? (
            <div className="text-center py-20 text-slate-500 font-semibold animate-pulse">Memuat berkas dokumen...</div>
          ) : (
            <div className="space-y-6">
              
              {/* Info Hasil Filter & Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 select-none animate-fadeInUp">
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  Menampilkan {filteredDokumen.length > 0 ? `1 - ${filteredDokumen.length}` : '0'} dari {filteredDokumen.length} dokumen
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
                  <span>Urutkan:</span>
                  <span className="text-slate-900 font-extrabold cursor-pointer hover:text-emerald-700 transition flex items-center gap-1">
                    Terbaru <ChevronDown className="h-4 w-4" />
                  </span>
                </div>
              </div>

              {filteredDokumen.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl text-slate-400 font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                  Dokumen yang Anda cari tidak ditemukan.
                </div>
              ) : (
                <>
                  {/* 🖥️ TAMPILAN TABEL DESKTOP ONLY (Sesuai Gambar Screenshot) */}
                  <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                            <th className="py-4 px-5 text-center w-14">NO</th>
                            <th className="py-4 px-6">NAMA DOKUMEN / DESKRIPSI</th>
                            <th className="py-4 px-6 text-center">KATEGORI</th>
                            <th className="py-4 px-6 text-center">DOKUMEN</th>
                            <th className="py-4 px-6 text-center">UPDATE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDokumen.map((doc, idx) => (
                            <tr 
                              key={doc.id}
                              className="hover:bg-slate-50/70 transition-colors duration-150 group"
                            >
                              {/* 1. NO */}
                              <td className="py-5 px-5 text-center text-xs font-bold text-slate-400">
                                {idx + 1}
                              </td>

                              {/* 2. NAMA DOKUMEN / DESKRIPSI */}
                              <td className="py-5 px-6">
                                <div className="flex items-start gap-4">
                                  {/* Badge Ikon PDF Merah */}
                                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-500 shadow-2xs mt-0.5">
                                    <div className="flex flex-col items-center justify-center">
                                      <FileText className="w-4 h-4 text-rose-500" />
                                      <span className="text-[7px] font-extrabold uppercase -mt-0.5 tracking-tighter text-rose-600">PDF</span>
                                    </div>
                                  </div>

                                  {/* Teks Nama Dokumen (Headline) & Sub-deskripsi */}
                                  <div className="space-y-1 pr-4">
                                    <h2 className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                                      {doc.headline || "Keputusan Hasil Bahtsul Masail"}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                      {doc.tagline || "28 Syawal 1448 H"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* 3. KATEGORI */}
                              <td className="py-5 px-6 text-center">
                                <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60 shadow-2xs">
                                  {doc.kategori || "Thaharah"}
                                </span>
                              </td>

                              {/* 4. DOKUMEN (Tombol Unduh Hijau) */}
                              <td className="py-5 px-6 text-center">
                                {doc.file_pdf_url ? (
                                  <a
                                    href={doc.file_pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                                    title="Unduh Berkas PDF"
                                  >
                                    <Download className="w-3.5 h-3.5 text-white" />
                                    <span>Unduh</span>
                                  </a>
                                ) : (
                                  <button
                                    disabled
                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
                                  >
                                    <Download className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Unduh</span>
                                  </button>
                                )}
                              </td>

                              {/* 5. UPDATE */}
                              <td className="py-5 px-6 text-center text-xs font-bold text-slate-600 whitespace-nowrap">
                                {doc.tanggal_masehi || "25 Juli 2026"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 📱 TAMPILAN MOBILE & TABLET (RESPONSIF KARTU KOTAK-KOTAK SESUAI GAMBAR) */}
                  <div className="block lg:hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                      {filteredDokumen.map((doc) => (
                        <div 
                          key={doc.id}
                          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
                        >
                          {/* Top: Red PDF Icon & Title / Tagline */}
                          <div className="flex items-start gap-3.5">
                            {/* Ikon PDF Merah */}
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-500 shadow-2xs mt-0.5">
                              <div className="flex flex-col items-center justify-center">
                                <FileText className="w-4 h-4 text-rose-500" />
                                <span className="text-[7px] font-extrabold uppercase -mt-0.5 tracking-tighter text-rose-600">PDF</span>
                              </div>
                            </div>

                            {/* Headline & Sub-deskripsi */}
                            <div className="space-y-1">
                              <h2 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                                {doc.headline || "Keputusan Hasil Bahtsul Masail"}
                              </h2>
                              <p className="text-xs text-slate-500 font-medium line-clamp-2">
                                {doc.tagline || "28 Syawal 1448 H"}
                              </p>
                            </div>
                          </div>

                          {/* Middle: Kategori Label & Value */}
                          <div className="pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                              KATEGORI
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5">
                              {doc.kategori || "Thaharah"}
                            </span>
                          </div>

                          {/* Bottom: Terakhir Update (Kiri) & Tombol Unduh Hijau (Kanan) */}
                          <div className="flex items-end justify-between pt-3 border-t border-slate-100/80">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block font-mono">
                                Terakhir Update
                              </span>
                              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                                {doc.tanggal_masehi || "25 Juli 2026"}
                              </span>
                            </div>

                            {doc.file_pdf_url ? (
                              <a
                                href={doc.file_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
                                title="Unduh PDF Resmi"
                              >
                                <Download className="w-3.5 h-3.5 text-white" />
                                <span>Unduh</span>
                              </a>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
                              >
                                <Download className="w-3.5 h-3.5 text-slate-400" />
                                <span>Unduh</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ───────────── PAGINATION NAVIGATION (MOCKUP STYLE) ───────────── */}
              {filteredDokumen.length > 0 && (
                <div className="mt-12 flex justify-center items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm select-none animate-fadeInUp">
                  <button className="flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 border border-slate-200 rounded-lg text-slate-400 bg-white hover:bg-slate-50 transition">
                    &lt;
                  </button>
                  <button className="flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 bg-emerald-800 text-white rounded-lg transition">
                    1
                  </button>
                  <button className="flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition">
                    2
                  </button>
                  <button className="flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition">
                    3
                  </button>
                  <span className="text-slate-400 px-1">...</span>
                  <button className="flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition">
                    125
                  </button>
                  <button className="flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition">
                    &gt;
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />

      {/* Detail Document Modal */}
      <ModalDetail 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        documentId={selectedDocId} 
      />
    </div>
  );
}
