import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import Footer from '../components/Footer';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Waypoints,
  Landmark,
  Repeat,
  Shield,
  Download,
  Headset,
  UsersRound,
  FilePenLine,
  ShieldCheck,
  FileBadge,
  GitBranch,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function Beranda() {
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans antialiased flex flex-col">
      <Head>
        <title>Beranda - Mufid | Musyawarah Fiqhiyyah Digital</title>
        <meta
          name="description"
          content="Ekosistem Musyawarah Fiqhiyyah Digital — Sinkronisasi langsung antara Mubahhitsin, Muharrir, dan Mushohih dalam satu platform terpadu."
        />
      </Head>



      <main className="flex-grow">
        {/* ───────────── HERO SECTION ───────────── */}
        <section id="beranda" className="relative overflow-hidden bg-transparent">

          <div className="relative mx-auto grid min-h-[500px] md:min-h-[580px] lg:min-h-[680px] max-w-[1320px] items-center gap-8 md:gap-10 lg:gap-14 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8 py-12 lg:py-16 md:grid-cols-2 lg:grid-cols-[1fr_518px]">
            <div className="max-w-2xl opacity-0 animate-fadeInLeft" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <p className="font-semibold text-sm tracking-[0.15em] text-slate-400 uppercase lg:text-lg">
                Transformasi Digital
              </p>
              <h1 className="mt-8 text-[40px] leading-[1.1] font-bold tracking-tight text-title sm:text-[48px] lg:text-[60px]"> 
                Ekosistem
                <br />
                Mufid
                <br />
                <span className="text-emerald-700">Musyawarah 
                  <br />Fiqhiyyah 
                  <br />Digital</span>
              </h1>
              <p className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed sm:leading-8 text-slate-400 text-pretty text-left sm:text-left">
                Sinkronisasi langsung antara Mubahhitsin, Muharrir, dan Mushohih dalam satu platform terpadu. Tingkatkan efisiensi dan keakuratan Musyawarah Fiqhiyyah Kubro Pondok Pesantren Putra Al Fattah Kudus.
              </p>
              <div className="mt-8 flex flex-row items-center gap-3 sm:gap-4 max-w-lg">
                <Link
                  href="/Login"
                  className="flex-1 inline-flex min-h-14 items-center justify-center gap-2 sm:gap-3 rounded-lg bg-emerald-800 px-3 sm:px-6 text-xs sm:text-sm lg:text-base font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-emerald-700 whitespace-nowrap text-center"
                >
                  Mulai Musyawarah <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                </Link>
                <Link
                  href="/Tentang"
                  className="flex-1 inline-flex min-h-14 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 sm:px-6 text-xs sm:text-sm lg:text-base font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-50 whitespace-nowrap text-center"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>

            {/* Hero Image Asset */}
            <div className="hidden md:block relative mx-auto md:mr-0 h-[220px] sm:h-[280px] md:h-[320px] lg:h-[380px] w-full max-w-[480px] opacity-0 animate-fadeInRight" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              {/* Layer putih solid di belakang gambar agar warna hijau tidak menembus */}
              <div className="absolute inset-2 sm:inset-4 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-lg -z-10" />
              
              <img
                src="/load.png"
                alt="Mufid load"
                className="h-full w-full object-contain relative z-10"
              />
            </div>
          </div>
        </section>

        {/* ───────────── TENTANG SECTION ───────────── */}
        <section id="tentang" className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-[1320px] px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8">
            <div className="mx-auto max-w-4xl text-center scroll-reveal">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
                Tentang Platform
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[0] text-slate-900 sm:text-4xl">
                Apa Itu Mufid?
              </h2>
              <p className="mt-6 sm:mt-7 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl font-medium leading-relaxed sm:leading-8 text-slate-600 text-pretty text-center">
                <strong className="font-extrabold text-slate-900">Mufid</strong> adalah platform digitalisasi tata kelola musyawarah hukum Islam (Bahtsul Masail) yang dirancang khusus untuk memenuhi kebutuhan standardisasi perumusan hukum secara digital di lingkungan Pondok Pesantren Putra Al Fattah Kudus.
              </p>
            </div>

            {/* Three pillar cards */}
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: FileBadge,
                  title: 'Sanad Keilmuan',
                  desc: 'Menjaga otentisitas pengambilan hukum dengan pencatatan dalil secara terstruktur dan dapat dilacak.',
                  delay: '300ms'
                },
                {
                  icon: GitBranch,
                  title: 'Kolaborasi Digital',
                  desc: 'Mensinergikan aktor musyawarah dalam platform real-time dengan hak akses yang jelas dan hierarkis.',
                  delay: '450ms'
                },
                {
                  icon: Users,
                  title: 'Kemaslahatan Publik',
                  desc: 'Membangun repositori keputusan yang dapat diakses publik sebagai panduan keagamaan yang valid.',
                  delay: '600ms'
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="border border-slate-200/60 bg-white p-7 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-brand-500/10 active:scale-[0.97] active:translate-y-0 transition-all duration-300 cursor-pointer flex flex-col justify-between scroll-reveal"
                  style={{ transitionDelay: card.delay }}
                >
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-800">
                        <card.icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{card.title}</h3>
                    </div>
                    <div className="my-5 h-px bg-slate-100" />
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-500">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── FITUR UNGGULAN SECTION ───────────── */}
        <section id="fitur" className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-[1320px] px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8">
            <div className="max-w-2xl scroll-reveal">
              <h2 className="text-3xl font-bold tracking-[0] text-slate-900 sm:text-4xl">
                Fitur Unggulan
              </h2>
              <p className="mt-4 text-base font-medium leading-8 text-slate-600">
                Sistem yang dirancang khusus untuk memenuhi kebutuhan 
                <br />
                standarisasi perumusan hukum Islam secara digital.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: Repeat,
                  title: 'Kolaborasi Real-Time',
                  desc: 'Diskusi and pencatatan argumen (ibarat) secara simultan, memastikan setiap gagasan terdokumentasi tanpa delay.',
                  delay: '300ms'
                },
                {
                  icon: Shield,
                  title: 'Hak Akses Berlapis',
                  desc: 'Kontrol otoritas yang jelas. Hanya Mushohih yang dapat menetapkan keputusan akhir (tashih), menjaga validitas hukum.',
                  delay: '450ms'
                },
                {
                  icon: Download,
                  title: 'Ekosistem Ekspor Instan',
                  desc: 'Generate hasil musyawarah menjadi dokumen resmi (PDF) dengan format standar kelembagaan dalam hitungan detik.',
                  delay: '600ms'
                },
              ].map((feat, index) => {
                const isActive = activeFeature === index;
                return (
                  <div
                    key={feat.title}
                    className="scroll-reveal"
                    style={{ transitionDelay: feat.delay }}
                  >
                    <article
                      onClick={() => setActiveFeature(index)}
                      className={`border p-7 rounded-[28px] transition-all duration-300 flex flex-col justify-between cursor-pointer select-none h-full ${
                        isActive 
                          ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-[0_12px_40px_rgba(0,100,50,0.08)] scale-[1.02] bg-white' 
                          : 'border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5'
                      }`}
                    >
                      <div>
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                          <feat.icon className="h-6 w-6" strokeWidth={2} />
                        </span>
                        <h3 className="mt-6 text-lg font-bold text-slate-900 leading-snug">{feat.title}</h3>
                        <p className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-slate-500">{feat.desc}</p>
                      </div>
                    </article>
                  </div>
                );
              })}

              {/* CTA Card */}
              <Link
                href="/Login"
                className="group flex min-h-[250px] flex-col justify-between bg-gradient-to-br from-emerald-600 to-brand-600 p-7 text-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:brightness-105 transition duration-300 scroll-reveal"
                style={{ transitionDelay: '750ms' }}
              >
                <div>
                  <p className="text-lg font-bold">Mulai Musyawarah</p>
                  <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-white/80">
                    Sistem Mufid Digital
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 border border-white/25 text-white self-end transition duration-300 group-hover:scale-105 group-hover:bg-white/30">
                  <ArrowUpRight className="h-6 w-6" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────── REPOSITORI SECTION ───────────── */}
        <section id="repositori" className="bg-white py-20 lg:py-24">
          <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8 lg:grid-cols-[620px_1fr]">
            <div className="relative mx-auto w-full max-w-[620px] scroll-reveal-left">
              <img
                src="/mufid-repository-reference.png"
                alt="Ilustrasi repositori dokumen digital"
                className="aspect-square w-full object-contain"
              />
            </div>
            <div className="max-w-xl scroll-reveal-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Dokumen Terorganisasi
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[0] text-slate-900 sm:text-4xl">
                Repositori Dokumen.
              </h2>
              <p className="mt-6 text-base font-medium leading-8 text-slate-600">
                Simpan dan telusuri setiap keputusan, rumusan, serta referensi kitab
                dalam satu repositori digital yang rapi, aman, dan mudah diakses.
              </p>
              <Link
                href="/PusatBantuan"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                Pelajari sistem kami <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────── BANTUAN CTA SECTION ───────────── */}
        <section id="bantuan" className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-[1320px] px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8">
            <div 
              className="px-6 py-12 sm:py-16 text-center sm:px-12 rounded-[24px] bg-cover bg-center bg-no-repeat overflow-hidden scroll-reveal-scale"
              style={{ backgroundImage: "url('/Decorative Elements.png'), linear-gradient(to right, #025032, #007c45)" }}
            >
              <h2 className="text-3xl font-bold tracking-[0] text-white sm:text-4xl">
                Butuh Bantuan?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm md:text-base font-medium leading-relaxed text-emerald-50/90">
                Tim Mufid Digital Al Fattah Kudus siap membantu kendala sistem Anda.
                Temukan solusi di katalog bantuan atau hubungi kami.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row items-center">
                <Link
                  href="/PusatBantuan"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-7 text-xs sm:text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 shadow-sm"
                >
                  Pusat Bantuan
                </Link>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=ponpesalfattah1433@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 px-7 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────── ALUR KERJA SECTION ───────────── */}
        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-5 text-center sm:px-8 lg:px-10 scroll-reveal">
            <h2 className="text-3xl font-bold tracking-[0] text-slate-900 sm:text-4xl">
              Alur Kerja Terstruktur
            </h2>
            <p className="mt-4 text-base font-medium text-slate-600">
              Mendigitalkan tradisi Musyawarah Fiqhiyyah dengan hierarki yang jelas
              dan sistematis.
            </p>

            <div className="relative mt-14 grid gap-10 md:grid-cols-3">
              {/* Connecting line */}
              <div className="absolute left-[17%] right-[17%] top-10 hidden h-px bg-emerald-200 md:block" />

              {/* Step 1 */}
              <article className="relative scroll-reveal" style={{ transitionDelay: '300ms' }}>
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-700 bg-white text-emerald-700">
                  <UsersRound className="h-8 w-8" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-emerald-700">1. Mubahhitsin</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm font-medium leading-7 text-slate-600">
                  Menyampaikan argumen, referensi kitab dan mendiskusikan berbagai
                  perspektif hukum.
                </p>
              </article>

              {/* Step 2 */}
              <article className="relative scroll-reveal" style={{ transitionDelay: '450ms' }}>
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-700 bg-white text-emerald-700">
                  <FilePenLine className="h-8 w-8" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-emerald-700">2. Muharrir</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm font-medium leading-7 text-slate-600">
                  Mengemukakan rumusan serta referensi kitab setelah terkumpulnya
                  argumen Mubahhitsin.
                </p>
              </article>

              {/* Step 3 */}
              <article className="relative scroll-reveal" style={{ transitionDelay: '600ms' }}>
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-rose-700 bg-white text-rose-700">
                  <ShieldCheck className="h-8 w-8" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-rose-700">3. Mushohih</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm font-medium leading-7 text-slate-600">
                  Memvalidasi, mengesahkan, dan memberikan catatan akhir atas rumusan
                  hukum.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
