import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Repositori', href: '/Repositori' },
    { name: 'Tentang', href: '/Tentang' },
    { name: 'Pusat Bantuan', href: '/PusatBantuan' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return router.pathname === '/' || router.pathname === '/Beranda';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-white/85 border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
              {/* Mufid Logo */}
              <img 
                src="/Logo Hitam.png" 
                alt="Logo Hitam" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
              {/* Al Fattah Logo */}
              <img 
                src="/Logo Pondok.png" 
                alt="Logo Pondok" 
                className="h-10 sm:h-12 w-auto object-contain border-l border-slate-300 pl-3"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                  isActive(link.href)
                    ? 'text-emerald-700 font-bold border-b-2 border-emerald-600 pb-1'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex items-center">
            <Link
              href="/Login"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-[#006432] hover:bg-[#004A23] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Masuk
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-slate-50 focus:outline-none transition"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg animate-fadeIn duration-200">
          <div className="px-4 pt-2 pb-6 space-y-3 shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 px-3 border-t border-slate-100">
              <Link
                href="/Login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#006432] hover:bg-[#004A23] text-white text-base font-bold rounded-lg shadow-md transition"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
    {/* Spacer agar konten di bawahnya tidak tertutup oleh header yang fixed */}
    <div className="h-20 w-full" aria-hidden="true"></div>
    </>
  );
}
