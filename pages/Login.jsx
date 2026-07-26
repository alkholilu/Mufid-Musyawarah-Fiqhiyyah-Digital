import { useState } from 'react';
import Head from 'next/head';
import { UserRound, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../src/config/supabaseClient';

export default function Login() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Login dengan Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identity,
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccessMsg('Login berhasil! Mengambil data profil...');

      // 2. Fetch profile untuk mengetahui role pengguna
      const session = data.session;
      const res = await fetch('/api/getProfile', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Gagal mengambil data profil pengguna.');
      }

      const profile = await res.json();
      const roleName = profile.roles?.nama_role;

      // 3. Redirect berdasarkan role
      setSuccessMsg('Login berhasil! Mengalihkan ke dashboard...');

      let dashboardPath = '/Beranda'; // fallback
      if (roleName === 'Admin') {
        dashboardPath = '/dashboard/admin';
      } else if (roleName === 'Mubahhisin') {
        dashboardPath = '/dashboard/mubahhitsin';
      } else if (roleName === 'Muharrir') {
        dashboardPath = '/dashboard/muharrir';
      } else if (roleName === 'Mushohih') {
        dashboardPath = '/dashboard/mushohih';
      }

      if (typeof window !== 'undefined') {
        window.location.href = dashboardPath;
      }
    } catch (error) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        setErrorMsg('Gagal terhubung ke server database (Supabase). Pastikan koneksi internet Anda aktif.');
      } else if (error.message?.includes('Invalid login credentials')) {
        setErrorMsg('Email atau password yang Anda masukkan salah.');
      } else {
        setErrorMsg(error.message || 'Gagal login. Periksa kembali email dan password Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Sistem Musyawarah Fiqhiyyah Digital</title>
        <meta name="description" content="Halaman Login Sistem Musyawarah Fiqhiyyah Digital" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="relative min-h-screen lg:grid lg:grid-cols-[60%_40%] bg-white text-slate-900 font-sans">
        {/* Panel Kiri (Pola Islami & Branding) - Disembunyikan di Mobile */}
        <section
          className="islamic-pattern relative hidden min-h-screen overflow-hidden px-8 py-9 lg:flex lg:flex-col"
          aria-labelledby="brand-title"
        >
          {/* Aksen Hiasan Atas Kiri */}
          <div className="pointer-events-none absolute -left-8 top-0 h-44 w-56 opacity-30">
            <svg viewBox="0 0 220 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g fill="#6B806F" opacity=".45">
                <ellipse cx="26" cy="32" rx="8" ry="28" transform="rotate(-42 26 32)" />
                <ellipse cx="62" cy="18" rx="7" ry="24" transform="rotate(28 62 18)" />
                <ellipse cx="95" cy="38" rx="8" ry="28" transform="rotate(44 95 38)" />
                <ellipse cx="44" cy="82" rx="9" ry="28" transform="rotate(42 44 82)" />
                <ellipse cx="118" cy="86" rx="7" ry="24" transform="rotate(-42 118 86)" />
                <path d="M18 4c62 28 98 64 134 128" stroke="#6B806F" strokeWidth="4" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          {/* Watermark Menara */}
          <div className="pointer-events-none absolute left-7 top-36 h-[520px] w-[290px] opacity-[0.11] tower-watermark">
            <svg viewBox="0 0 260 520" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M130 12v66" stroke="#064E3B" strokeWidth="4" />
              <path d="M100 52h60l24 32H76l24-32Z" stroke="#064E3B" strokeWidth="5" />
              <path d="M70 84h120v44H70V84Z" stroke="#064E3B" strokeWidth="5" />
              <path d="M88 128h84v92H88v-92Z" stroke="#064E3B" strokeWidth="5" />
              <circle cx="130" cy="170" r="22" stroke="#064E3B" strokeWidth="5" />
              <path d="M70 220h120l16 42H54l16-42Z" stroke="#064E3B" strokeWidth="5" />
              <path d="M66 262h128v230H66V262Z" stroke="#064E3B" strokeWidth="5" />
              <path d="M90 308h24v60H90zM146 308h24v60h-24zM90 402h24v60H90zM146 402h24v60h-24z" stroke="#064E3B" strokeWidth="5" />
              <path d="M42 492h176" stroke="#064E3B" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center pt-4 text-center">
            <div className="arch-logo mb-5 flex h-72 w-72 items-center justify-center rounded-full border border-emerald-100 bg-white/70 p-4 shadow-[0_16px_42px_rgba(15,118,110,0.14)] backdrop-blur-sm">
              <img
                src="/Mufid-Logo.png"
                alt="Logo Mufid"
                className="h-full w-full object-contain"
              />
            </div>

            <h1 id="brand-title" className="text-2xl font-extrabold text-[#064E3B]">
              Sistem Musyawarah Fiqhiyyah Digital
            </h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-slate-600">
              Bahsul Masail | Menyelesaikan Masalah, Mencari Hukum dengan Dalil yang Kuat
            </p>

            <div className="relative mt-7 w-full max-w-4xl">
              <div className="absolute inset-x-8 bottom-0 h-28 rounded-full bg-emerald-900/10 blur-3xl"></div>
              <div className="relative mx-auto min-h-[250px] max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-b from-emerald-50/30 to-white px-6 pt-8">
                <div className="absolute inset-0 soft-vignette"></div>
                <div className="relative mx-auto flex max-w-3xl items-end justify-center gap-3">
                  <div className="hidden pb-7 md:block">
                    <div className="h-20 w-28 rotate-[-7deg] rounded-xl bg-emerald-950/80 shadow-lg"></div>
                    <div className="-mt-2 h-24 w-24 rounded-full bg-[#f0d5b7] shadow-md"></div>
                    <div className="-mt-1 h-32 w-32 rounded-t-[3rem] bg-white shadow-lg ring-1 ring-emerald-100"></div>
                  </div>
                  <div className="pb-10">
                    <div className="mx-auto h-16 w-24 rotate-[8deg] rounded-xl bg-slate-950 shadow-lg"></div>
                    <div className="-mt-2 h-20 w-20 rounded-full bg-[#d7a977] shadow-md"></div>
                    <div className="-mt-1 h-28 w-28 rounded-t-[3rem] bg-stone-200 shadow-lg ring-1 ring-emerald-100"></div>
                  </div>
                  <div className="relative z-10">
                    <div className="mx-auto h-16 w-24 rounded-xl bg-slate-950 shadow-lg"></div>
                    <div className="-mt-2 h-24 w-24 rounded-full bg-[#d8a06c] shadow-md"></div>
                    <div className="-mt-1 h-36 w-36 rounded-t-[3.5rem] bg-white shadow-xl ring-1 ring-emerald-100"></div>
                  </div>
                  <div className="pb-10">
                    <div className="mx-auto h-16 w-24 rotate-[-8deg] rounded-xl bg-slate-950 shadow-lg"></div>
                    <div className="-mt-2 h-20 w-20 rounded-full bg-[#c88f61] shadow-md"></div>
                    <div className="-mt-1 h-28 w-28 rounded-t-[3rem] bg-emerald-100 shadow-lg ring-1 ring-emerald-100"></div>
                  </div>
                  <div className="hidden pb-7 md:block">
                    <div className="h-20 w-28 rotate-[7deg] rounded-xl bg-slate-950 shadow-lg"></div>
                    <div className="-mt-2 h-24 w-24 rounded-full bg-[#c98f62] shadow-md"></div>
                    <div className="-mt-1 h-32 w-32 rounded-t-[3rem] bg-white shadow-lg ring-1 ring-emerald-100"></div>
                  </div>
                </div>

                <div className="relative z-20 mx-auto -mt-10 h-28 max-w-3xl rounded-[50%] bg-gradient-to-b from-[#9b6a3d] to-[#6f4728] shadow-2xl">
                  <div className="absolute left-1/2 top-4 h-16 w-36 -translate-x-1/2 rounded-lg bg-stone-100 shadow-inner">
                    <div className="mx-auto mt-5 h-4 w-20 rounded-full bg-emerald-100"></div>
                  </div>
                  <div className="absolute left-16 top-6 h-8 w-16 rotate-[-12deg] rounded bg-white/80 shadow-sm"></div>
                  <div className="absolute right-16 top-7 h-8 w-16 rotate-[12deg] rounded bg-white/80 shadow-sm"></div>
                  <div className="absolute bottom-5 left-1/2 h-7 w-28 -translate-x-1/2 rounded bg-emerald-950/70"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Kanan (Form Login) */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          {/* Latar Belakang & Hiasan Panel Kanan */}
          <div className="absolute inset-0 bg-[#064E3B] lg:hidden"></div>
          <div className="right-green-panel absolute inset-y-0 right-0 hidden w-[118%] bg-gradient-to-br from-[#07804C] via-[#006B3F] to-[#03412F] lg:block"></div>
          <div className="absolute -left-16 top-0 hidden h-full w-44 rounded-r-full bg-white/15 lg:block"></div>
          <div className="absolute inset-0 opacity-[0.07] islamic-pattern"></div>

          <div className="relative z-10 flex w-full max-w-[460px] flex-col items-center gap-5 lg:max-w-[520px]">
            <article className="w-full rounded-2xl bg-white px-6 py-8 shadow-[0_24px_70px_rgba(6,78,59,0.24)] ring-1 ring-black/5 sm:px-10 sm:py-11 scroll-reveal-scale">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#06965B] to-[#064E3B] text-white shadow-lg shadow-emerald-900/25">
                  <UserRound className="h-8 w-8" />
                </div>
                <h2 className="mt-7 text-2xl font-extrabold text-[#064E3B] sm:text-3xl">Login ke Sistem</h2>
                <p className="mt-3 text-sm font-medium text-slate-500">Silakan masuk untuk melanjutkan</p>
              </div>

              {errorMsg && (
                <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-200">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200">
                  {successMsg}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                <label className="block" htmlFor="identity">
                  <span className="sr-only">Email atau Username</span>
                  <span className="relative block">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#006B3F]" />
                    <input
                      id="identity"
                      name="identity"
                      type="text"
                      autoComplete="username"
                      placeholder="Email / Username"
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      required
                      className="h-14 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#006B3F] focus:ring-4 focus:ring-emerald-100"
                    />
                  </span>
                </label>

                <label className="block" htmlFor="password">
                  <span className="sr-only">Password</span>
                  <span className="relative block">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#006B3F]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-14 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#006B3F] focus:ring-4 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      id="toggle-password"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-[#064E3B]"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </span>
                </label>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label className="flex cursor-pointer items-center gap-3 font-medium text-slate-700" htmlFor="remember">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-[#006B3F] focus:ring-[#006B3F]"
                    />
                    <span>Ingat saya</span>
                  </label>
                  <a
                    href="https://wa.me/6282138602863?text=Halo%20Admin%20Mufid,%20saya%20lupa%20password%20akun%20saya.%20Mohon%20bantuan%20reset%20password."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#006B3F] transition hover:text-emerald-800 hover:underline"
                  >
                    Lupa Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center rounded-lg bg-[#006B3F] px-5 text-base font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-[#064E3B] focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm font-medium text-slate-500">
                Belum memiliki akun?{' '}
                <a
                  href="https://wa.me/6282138602863?text=Halo%20Admin%20Mufid,%20saya%20ingin%20meminta%20pembuatan%20akun%20musyawarah."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#006B3F] transition hover:text-emerald-800 hover:underline"
                >
                  Hubungi Administrator
                </a>
              </p>
            </article>

            <p className="absolute bottom-6 right-8 z-10 hidden text-xs font-medium text-white/85 lg:block">
              &copy; 2026 Mufid - Musyawarah Fiqhiyyah Digital
            </p>
            <p className="text-center text-xs font-medium text-white/85 lg:hidden">
              &copy; 2026 Mufid - Musyawarah Fiqhiyyah Digital
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
