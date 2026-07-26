import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import Footer from '../components/Footer';
import { Compass, BookOpen, Database, Workflow, Globe } from 'lucide-react';

export default function Tentang() {
  return (
    <div className="min-h-screen bg-transparent text-dark antialiased overflow-x-hidden flex flex-col relative">
      <Head>
        <title>Tentang Mufid - Platform Digitalisasi Tata Kelola Hukum Islam</title>
        <meta name="description" content="Platform digitalisasi tata kelola dan layanan hukum Islam (Fiqh) yang berlandaskan Manhaj Ahlussunnah wal Jamaah (Aswaja) an-Nahdliyah." />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Decorative Top Background Radial Gradient */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-50/30 blur-[100px] rounded-full -z-10 pointer-events-none"></div>



      {/* MAIN CONTAINER */}
      <main className="space-y-20 lg:space-y-32 pb-24 flex-grow">

        {/* HERO SECTION: Tentang Mufid */}
        <section id="tentang" className="relative pt-12 sm:pt-16 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div 
            className="border border-brand-500/10 rounded-3xl p-6 sm:p-10 lg:p-16 text-center shadow-sm relative overflow-hidden"
            style={{
              background: 'radial-gradient(70.71% 70.71% at 50% 50%, rgba(0, 100, 50, 0.05) 0%, rgba(249, 249, 255, 0.05) 100%)'
            }}
          >
            {/* Inner background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-brand-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            {/* Breadcrumb */}
            <nav className="flex items-center justify-center space-x-2 text-xs sm:text-sm font-medium mb-6 relative z-10">
              <Link href="/" className="text-gray-500 hover:text-brand-500 transition-colors">Beranda</Link>
              <span className="text-gray-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <span className="text-brand-600 font-semibold bg-brand-50 px-2.5 py-0.5 rounded-full">Tentang</span>
            </nav>

            {/* Heading 1 */}
            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-dark tracking-tight mb-6 relative z-10 leading-tight">
              Tentang Mufid
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed relative z-10">
              Platform digitalisasi tata kelola dan layanan hukum islam (Fiqh) yang berlandaskan Manhaj <strong className="font-bold text-slate-900">Ahlussunnah wal Jamaah (Aswaja) an-Nahdliyah</strong> yang berperan sebagai pusat integrasi pengelolaan dan literasi digital yang dikembangkan oleh Tim Musyawarah Fiqhiyyah Pondok Pesantren Putra Al Fattah Kudus
            </p>
          </div>
        </section>

        {/* VISI & MISI SECTION */}
        <section id="visi-misi" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Side: Illustration / Interactive Image Showcase */}
            <div className="lg:col-span-5 relative group scroll-reveal-left">
              {/* Decorative radial background behind image */}
              <div className="absolute inset-0 bg-brand-500/10 rounded-[32px] blur-2xl -z-10 group-hover:scale-105 transition-transform duration-500"></div>
              
              <div className="border border-brand-500/10 rounded-[32px] overflow-hidden bg-white shadow-xl relative aspect-square lg:aspect-auto flex items-center justify-center p-6 lg:p-8">
                {/* Main Mufid Logo Asset (Mufid-Logo.png) */}
                <img 
                  src="/Mufid-Logo.png" 
                  alt="Mufid Emblem" 
                  className="w-full h-auto max-h-[480px] object-contain relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right Side: Visi & Misi Content */}
            <div className="lg:col-span-7 space-y-10 lg:space-y-12 scroll-reveal-right">
              {/* Visi Block */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-500 border border-brand-500/10">
                    <Compass className="w-5 h-5 text-brand-500" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-dark">Visi</h2>
                </div>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Menjadi rujukan utama dan pelopor transformasi digital dalam tata kelola hukum Islam dan tradisi intelektual pesantren, memastikan warisan keilmuan Nahdlatul Ulama tetap relevan, mudah diakses, dan menjadi panduan yang otoritatif di era modern.
                </p>
              </div>

              {/* Horizontal Divider */}
              <hr className="border-gray-100" />

              {/* Misi Block */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3.5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-500 border border-brand-500/10">
                    <BookOpen className="w-5 h-5 text-brand-500" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl sm:text-3xl text-dark">Misi</h2>
                </div>

                {/* Card Misi List */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Misi 1 */}
                  <div className="flex items-start space-x-4 p-5 bg-gray-50/70 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md hover:border-brand-500/20 transition-all">
                    <div className="flex-shrink-0 mt-1">
                      <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-500 border border-brand-500/10 shadow-inner">
                        <Database className="w-6 h-6 text-brand-500" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm sm:text-base text-dark tracking-wide">Standardisasi Data</h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Membangun repositori tunggal yang tersistematisasi untuk seluruh putusan hukum dan literatur keislaman.</p>
                    </div>
                  </div>

                  {/* Misi 2 */}
                  <div className="flex items-start space-x-4 p-5 bg-gray-50/70 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md hover:border-brand-500/20 transition-all">
                    <div className="flex-shrink-0 mt-1">
                      <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-500 border border-brand-500/10 shadow-inner">
                        <Workflow className="w-6 h-6 text-brand-500" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm sm:text-base text-dark tracking-wide">Transparansi Proses</h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Mendigitalisasi alur perumusan hukum (Bahtsul Masail) agar lebih terukur dan terdokumentasi dengan baik.</p>
                    </div>
                  </div>

                  {/* Misi 3 */}
                  <div className="flex items-start space-x-4 p-5 bg-gray-50/70 border border-gray-100 rounded-xl hover:bg-white hover:shadow-md hover:border-brand-500/20 transition-all">
                    <div className="flex-shrink-0 mt-1">
                      <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-500 border border-brand-500/10 shadow-inner">
                        <Globe className="w-6 h-6 text-brand-500" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm sm:text-base text-dark tracking-wide">Aksesibilitas Universal</h3>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Menyediakan platform yang ramah pengguna bagi masyarakat umum, peneliti, dan pengurus untuk mencari rujukan shahih.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEJARAH & LATAR BELAKANG (TIMELINE) */}
        <section className="bg-light-bg py-20 lg:py-28 border-y border-light-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24 space-y-4 scroll-reveal">
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-dark tracking-tight">Sejarah & Latar Belakang</h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Perjalanan Mufid lahir dari kesadaran untuk merawat dan menyebarluaskan tradisi intelektual dalam format yang relevan dengan zaman sekarang (Digitalisasi).
              </p>
            </div>

            {/* Timeline Component */}
            <div className="relative max-w-5xl mx-auto">
              {/* Vertical Timeline Divider Line (Desktop: Center, Mobile: Left aligned) */}
              <div className="absolute left-4 sm:left-1/2 transform sm:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-brand-500/20"></div>

              {/* Step 1: Tradisi Klasik */}
              <div className="relative flex flex-col sm:flex-row items-stretch mb-12 sm:mb-16">
                {/* Dot Indicator */}
                <div className="absolute left-4 sm:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-brand-500 border-4 border-white shadow-md z-10 top-6"></div>
                
                {/* Content Card (Left hand side on Desktop, Right side on mobile) */}
                <div className="w-full sm:w-1/2 pl-10 pr-0 sm:pl-0 sm:pr-12 text-left sm:text-right flex flex-col items-start sm:items-end scroll-reveal-left">
                  <div className="inline-flex items-center px-3 py-1 bg-brand-50 text-brand-500 text-xs font-semibold rounded-full mb-3 tracking-wide uppercase">
                    Tradisi Klasik
                  </div>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-dark mb-3">Bahtsul Masail</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg">
                    Forum permusyawaratan hukum Islam telah menjadi tulang punggung NU selama puluhan tahun. Namun, dokumentasi putusan masih tersebar dalam berbagai bentuk fisik dan catatan lokal, menyulitkan akses bagi generasi penerus.
                  </p>
                </div>
                <div className="hidden sm:block w-1/2"></div>
              </div>

              {/* Step 2: Inisiatif Digital (Right aligned on desktop) */}
              <div className="relative flex flex-col sm:flex-row items-stretch mb-12 sm:mb-16">
                {/* Dot Indicator */}
                <div className="absolute left-4 sm:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-brand-500 border-4 border-white shadow-md z-10 top-6"></div>
                
                <div className="hidden sm:block w-1/2"></div>

                {/* Content Card (Right hand side on Desktop & Mobile) */}
                <div className="w-full sm:w-1/2 pl-10 sm:pl-12 text-left flex flex-col items-start scroll-reveal-right">
                  <div className="inline-flex items-center px-3 py-1 bg-brand-50 text-brand-500 text-xs font-semibold rounded-full mb-3 tracking-wide uppercase">
                    Inisiatif Digital
                  </div>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-dark mb-3">Gagasan Sentralisasi</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg">
                    Menyadari pentingnya menjaga turats (warisan), Tim Musyawarah Fiqhiyyah menginisiasi proyek digitalisasi. Fokus utama adalah mengumpulkan, mengklasifikasi, dan mendigitalisasi dokumen-dokumen putusan historis ke dalam satu database.
                  </p>
                </div>
              </div>

              {/* Step 3: Hari Ini (Left aligned on desktop) */}
              <div className="relative flex flex-col sm:flex-row items-stretch">
                {/* Dot Indicator */}
                <div className="absolute left-4 sm:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-brand-500 border-4 border-white shadow-[0_0_0_4px_rgba(0,100,50,0.15)] z-10 top-6"></div>
                
                {/* Content Card (Left hand side on Desktop, Right side on mobile) */}
                <div className="w-full sm:w-1/2 pl-10 pr-0 sm:pl-0 sm:pr-12 text-left sm:text-right flex flex-col items-start sm:items-end scroll-reveal-left">
                  <div className="inline-flex items-center px-3 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full mb-3 tracking-wide uppercase">
                    Hari Ini
                  </div>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-dark mb-3">Lahirnya Mufid</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg">
                    Mufid diresmikan sebagai platform ekosistem digital terpadu. Bukan sekadar arsip, melainkan sistem pintar yang mendukung pencarian fatwa, manajemen sidang Bahtsul Masail, dan interaksi *scholarly* secara online.
                  </p>
                </div>
                <div className="hidden sm:block w-1/2"></div>
              </div>

            </div>
          </div>
        </section>

        {/* STRUKTUR ORGANISASI & TIM */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 scroll-reveal">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-dark tracking-tight">Struktur Organisasi & Tim</h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Mufid dikembangkan dan diawasi oleh Tim Musyawarah Fiqhiyyah Pondok Pesantren Putra Al Fattah Kudus yang bersinergi dengan tim profesional teknologi digital.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Card 1: Mubahhitsin */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all flex flex-col justify-between group scroll-reveal-scale">
              <div className="space-y-4">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-500 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-users text-2xl"></i>
                </div>
                <h3 className="font-heading font-bold text-xl text-dark">Mubahhitsin</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Menyampaikan argumen, referensi kitab dan mendiskusikan berbagai perspektif hukum.
                </p>
              </div>
            </div>

            {/* Card 2: Muharrir */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all flex flex-col justify-between group scroll-reveal-scale" style={{ transitionDelay: '150ms' }}>
              <div className="space-y-4">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-500 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-pen-fancy text-2xl"></i>
                </div>
                <h3 className="font-heading font-bold text-xl text-dark">Muharrir</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Mengemukakan rumusan serta referensi kitab setelah terkumpulnya argumen Mubahhitsin.
                </p>
              </div>
            </div>

            {/* Card 3: Dewan Mushohih */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all flex flex-col justify-between group scroll-reveal-scale" style={{ transitionDelay: '300ms' }}>
              <div className="space-y-4">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-500 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-gavel text-2xl"></i>
                </div>
                <h3 className="font-heading font-bold text-xl text-dark">Dewan Mushohih</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Memvalidasi, mengesahkan (tashih), dan memberikan catatan akhir atas rumusan hukum.
                </p>
              </div>
            </div>

            {/* Card 4: Tim Digital */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:border-brand-500/20 transition-all flex flex-col justify-between group scroll-reveal-scale" style={{ transitionDelay: '450ms' }}>
              <div className="space-y-4">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-500 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-code text-2xl"></i>
                </div>
                <h3 className="font-heading font-bold text-xl text-dark">Tim Digital</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Developer, desainer, dan analis data yang membangun arsitektur teknologi, UI/UX, dan menjaga keamanan sistem platform Mufid.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
