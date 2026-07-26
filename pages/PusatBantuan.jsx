import React, { useState } from 'react';
import Head from 'next/head';

import Footer from '../components/Footer';
import { HelpCircle, Phone, Mail, Send, ChevronDown, Search } from 'lucide-react';

export default function PusatBantuan() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Umum');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const categories = ['Umum', 'Santri/Alumni', 'Mubahhitsin', 'Perumus/Mushohih'];

  const faqs = [
    {
      id: 1,
      question: 'Apakah masyarakat umum harus masuk atau memiliki akun untuk melihat hasil keputusan sidang?',
      answer: 'Tidak perlu. Masyarakat umum atau publik dapat langsung mengakses halaman "Repositori Dokumen" untuk mencari, membaca, dan mengunduh berkas fisik resmi berupa PDF hasil keputusan Bahtsul Masail secara gratis tanpa harus melakukan login atau membuat akun ke dalam sistem.',
      categories: ['Umum', 'Santri/Alumni']
    },
    {
      id: 2,
      question: 'Bagaimana cara mendapatkan akun untuk masuk ke Dasbor Mufid?',
      answer: 'Pengguna tidak dapat melakukan pendaftaran akun secara mandiri. Seluruh akun keanggotaan internal sidang (Mubahhisin, Muharrir, dan Mushohih) didaftarkan secara terpusat oleh Admin (Panitia Pusat) sebelum sidang dimulai. Silakan hubungi nomor kontak panitia di bawah jika akun Anda belum terdaftar.',
      categories: ['Umum', 'Mubahhitsin', 'Perumus/Mushohih']
    },
    {
      id: 3,
      question: 'Mengapa formulir draf jawaban kelompok kami tiba-tiba terkunci dan tidak bisa diedit?',
      answer: 'Berdasarkan alur sidang, setelah Anda mengklik tombol "Setor ke Perumus", status draf jawaban kelompok Anda berubah menjadi "Disetor" dan otomatis dikunci oleh sistem agar Tim Perumus (Muharrir) bisa melakukan verifikasi. Jika memerlukan perbaikan data, silakan hubungi Tim Perumus untuk mengubah status draf Anda kembali menjadi "Revisi".',
      categories: ['Mubahhitsin']
    },
    {
      id: 4,
      question: 'Apakah kelompok kami bisa melihat atau mengubah draf jawaban milik kelompok lain?',
      answer: 'Untuk menjaga transparansi ilmiah, Anda dapat melihat dan membaca draf jawaban milik kelompok lain melalui dasbor Anda. Namun, kebijakan keamanan database kami mengunci ketat hak akses ubah. Anda mutlak tidak bisa memodifikasi atau menghapus data milik kelompok lain.',
      categories: ['Mubahhitsin']
    },
    {
      id: 5,
      question: 'Apakah saya perlu memuat ulang (refresh) halaman untuk melihat soal baru atau catatan dari Perumus?',
      answer: 'Tidak perlu. Platform Mufid didukung oleh teknologi sinkronisasi real-time. Setiap kali Admin merilis soal baru atau Perumus memberikan catatan evaluasi, data akan langsung muncul di layar Anda dalam waktu kurang dari 1 detik secara otomatis tanpa mengganggu aktivitas pengetikan Anda.',
      categories: ['Mubahhitsin', 'Perumus/Mushohih']
    },
    {
      id: 6,
      question: 'Bagaimana aturan pengetikan naskah dalil teks Arab di dalam formulir jawaban?',
      answer: 'Pengetikan teks Arab wajib menyertakan harakat lengkap (tanwin, tasydid, dan harakat pendek). Formulir input telah dioptimalkan secara otomatis menggunakan font khusus keagamaan (Amiri), tata letak kanan-ke-kiri (RTL), serta ukuran minimal 24px dengan jarak antarbaris yang longgar agar harakat tidak bertumpuk atau terpotong saat ditinjau oleh Dewan Mushohih.',
      categories: ['Mubahhitsin', 'Perumus/Mushohih']
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetEmail = 'ponpesalfattah1433@gmail.com';
    const subject = encodeURIComponent(`Pesan Teknis MUFID - ${name}`);
    const body = encodeURIComponent(
      `Nama Lengkap: ${name}\n` +
      `Email/Kontak: ${email}\n\n` +
      `Pesan/Keluhan:\n${message}`
    );
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesTab = searchQuery ? true : faq.categories.includes(activeTab);
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans antialiased flex flex-col">
      <Head>
        <title>Pusat Bantuan - Mufid | Musyawarah Fiqhiyyah Digital</title>
        <meta name="description" content="Pusat Bantuan dan Dukungan Teknis Sistem Musyawarah Fiqhiyyah Digital Mufid" />
      </Head>



      <main className="flex-grow">
        {/* Banner Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 border-b border-slate-100 py-16">
          
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8">
            <div className="max-w-4xl">
              <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:mb-4 lg:text-4xl">
                Pusat Bantuan & Dukungan Mufid
              </h1>
              <p className="mt-6 text-sm text-gray-600 sm:mb-8 sm:text-lg">
                Musyawarah Fiqhiyyah Digital. Solusi cepat kendala aplikasi, panduan 
                <br className="hidden sm:block"/>
                sistem, dan eskalasi teknis langsung ke Panitia TI Pusat.
              </p>

              {/* Search Bar */}
              <div className="mt-8 max-w-3xl relative">
                <input
                  type="text"
                  placeholder="Cari solusi anda..."
                  className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-full shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all font-semibold text-slate-800 placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpenIndex(null); // Reset accordion state when searching
                  }}
                />
                <div className="absolute right-2 top-2 p-2.5 bg-emerald-700 text-white rounded-full transition shadow-sm">
                  <Search className="h-5 w-5" />
                </div>
              </div>
              {/* Category Tabs (4 Kolom Sejajar di Layar Mobile & Desktop) */}
              <div className="mt-6 sm:mt-8 grid grid-cols-4 gap-1.5 sm:gap-3 w-full max-w-3xl">
                {categories.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSearchQuery(''); // Clear search when switching tabs
                      setOpenIndex(null); // Reset accordion
                    }}
                    className={`w-full py-2 sm:py-2.5 px-1 sm:px-3 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold tracking-tight sm:tracking-wide transition-all duration-200 text-center flex items-center justify-center ${
                      activeTab === tab && !searchQuery
                        ? 'bg-slate-200/80 text-slate-900 font-extrabold shadow-sm ring-1 ring-slate-300/50'
                        : 'bg-slate-100/60 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold'
                    }`}
                  >
                    <span className="truncate">{tab}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8 py-16">
          <div className="max-w-4xl scroll-reveal">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-emerald-700" />
              <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
            </h2>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div 
                      key={faq.id} 
                      className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleAccordion(index)}
                        className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
                      >
                        <span className="font-bold text-emerald-800 text-sm sm:text-base leading-snug">
                          {faq.question}
                        </span>
                        <span className={`p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-emerald-700 transition-colors duration-200 flex-shrink-0 ml-4`}>
                          <ChevronDown className={`h-5 w-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-700' : 'rotate-0'}`} />
                        </span>
                      </button>
                      
                      <div 
                        className={`transition-all duration-500 ease-in-out ${
                          isOpen ? 'max-h-[700px] border-t border-slate-100' : 'max-h-0'
                        } overflow-hidden`}
                      >
                        <div className="px-6 py-5 bg-slate-50/50">
                          <div className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line">
                            {faq.id === 6 ? (
                              <>
                                {faq.answer}
                                <div className="mt-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 text-center">
                                  <p className="text-xs font-bold text-emerald-800 mb-2">Contoh Penulisan Naskah Dalil Arab:</p>
                                  <p className="text-3xl font-serif text-slate-900 leading-loose tracking-wide py-2" dir="rtl" style={{ fontFamily: 'Amiri, Georgia, serif' }}>
                                    كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ
                                  </p>
                                </div>
                              </>
                            ) : (
                              faq.answer
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 font-bold text-sm">
                Tidak ditemukan jawaban yang cocok. Coba cari kata kunci lain atau pilih tab kategori berbeda.
              </div>
            )}
          </div>
        </section>

        {/* Hubungi Kami Section */}
        <section className="bg-slate-50 border-y border-slate-100 py-16">
          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8">
            <div className="max-w-4xl scroll-reveal">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Hubungi Kami</h2>
              <p className="text-sm sm:text-base font-normal text-slate-600 mb-8 max-w-xl">
                Jika Anda mengalami masalah teknis atau ingin mendaftarkan akun baru, silakan hubungi tim administrator panitia pusat MUFID:
              </p>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* WhatsApp / Telpon */}
                <a
                  href="https://wa.me/6282138602863"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-start gap-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:border-emerald-500/30 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                    <Phone className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">WhatsApp / Telepon</h3>
                    <p className="text-slate-600 font-extrabold text-sm mt-1">0821-3860-2863</p>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Senin - Minggu (08:00 - 21:00 WIB)</p>
                  </div>
                </a>
                
                {/* Email */}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=ponpesalfattah1433@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-start gap-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:border-emerald-500/30 transition-all duration-200 cursor-pointer active:scale-[0.97]"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                    <Mail className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Surel (Email)</h3>
                    <p className="text-slate-600 font-extrabold text-sm mt-1">ponpesalfattah1433@gmail.com</p>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Respon teknis dalam 1-2 hari</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Kirim Pesan Teknis Form Section */}
        <section className="max-w-[1320px] mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8 py-16">
          <div className="max-w-4xl scroll-reveal">
            <div className="bg-white p-8 rounded-[24px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Kirim Pesan Teknis</h3>
              <p className="text-sm sm:text-base font-normal text-slate-600 mb-6">
                Ada kendala yang belum terjawab? Kirimkan detail masalah teknis Anda langsung ke panitia TI pusat kami.
              </p>
              
              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200/50 rounded-2xl text-sm text-emerald-800 font-bold text-center animate-scaleUp">
                  Pesan Anda telah berhasil dikirim ke Admin! Kami akan segera menghubungi Anda melalui kontak yang dilampirkan.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="help-name" className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                      <input
                        id="help-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder-slate-400"
                        placeholder="Masukkan nama lengkap Anda"
                      />
                    </div>
                    <div>
                      <label htmlFor="help-email" className="block text-xs font-bold text-slate-700 mb-1.5">Email / Kontak</label>
                      <input
                        id="help-email"
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder-slate-400"
                        placeholder="Email atau nomor WhatsApp Anda"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="help-msg" className="block text-xs font-bold text-slate-700 mb-1.5">Pesan / Keluhan</label>
                    <textarea
                      id="help-msg"
                      rows="5"
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all placeholder-slate-400"
                      placeholder="Jelaskan secara detail masalah atau kendala yang Anda alami..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-sm font-extrabold shadow-md flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <Send className="h-4 w-4" />
                    <span>Kirim Pesan</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
