import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      id="kontak"
      className="relative py-14 text-white sm:py-16 overflow-hidden"
      style={{
        backgroundImage: 'url("/mufid-footer-reference.png")',
        backgroundBlendMode: 'multiply',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Background Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none islamic-pattern"></div>
      
      <div className="mx-auto max-w-[1320px] px-6 sm:px-10 md:px-12 lg:px-16 xl:px-8 relative z-10">
        {/* Main Grid: Responsive 4-column layout */}
        <div className="grid gap-x-8 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_.6fr_.6fr_1fr]">

          {/* Brand / About */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/Logo Putih.png"
                alt="Mufid Musyawarah Fiqhiyyah Digital"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-white/70">
              <strong className="font-extrabold text-white">Mufid</strong> adalah platform digitalisasi tata kelola musyawarah
              hukum Islam (Bahtsul Masail) yang dirancang khusus
              untuk memenuhi kebutuhan standardisasi perumusan
              hukum secara digital di lingkungan
              Pondok Pesantren Putra Al Fattah Kudus.
            </p>
          </div>

          {/* Navigasi */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-bold">Navigasi</h3>
            <ul className="mt-4 space-y-2 text-sm font-medium text-white/70">
              <li>
                <Link href="/" className="transition hover:text-white">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/Repositori" className="transition hover:text-white">
                  Repositori
                </Link>
              </li>
              <li>
                <Link href="/Tentang" className="transition hover:text-white">
                  Tentang
                </Link>
              </li>
              <li>
                <Link href="/PusatBantuan" className="transition hover:text-white">
                  Pusat Bantuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Integrasi */}
          <div className="col-span-1">
            <h3 className="text-base sm:text-lg font-bold">Integrasi</h3>
            <ul className="mt-4 space-y-2 text-sm font-medium text-white/70">
              <li>Mufid Al Fattah</li>
              <li>Mubahhitsin</li>
              <li>Muharrir</li>
              <li>Mushohih</li>
              <li>Tim Digital</li>
            </ul>
          </div>

          {/* Hubungi Kami */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-bold">Hubungi Kami</h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-white/70">
              Jl. KH. Turaichan Adjhuri No.36, Pejaten, Kajeksan, Kec.
              <br />
              Kota Kudus, Kabupaten Kudus, Jawa Tengah 59315
              <br />
              Telepon: (0821-3860-2863)
            </p>

            <h4 className="mt-4 text-sm font-extrabold">Email</h4>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=ponpesalfattah1433@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-block text-sm font-medium text-white/70 transition hover:text-white break-all"
            >
              ponpesalfattah1433@gmail.com
            </a>

            <h4 className="mt-4 text-sm font-extrabold">Instagram</h4>
            <a
              href="https://www.instagram.com/yayasananwarulmusthofaalfattah?igsh=MW52emI2ZDVoNGNoZg=="
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block text-sm font-medium text-white/70 transition hover:text-white break-all"
            >
              @yayasananwarulmusthofaalfattah
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-7 text-xs font-semibold text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; HAK.Development {new Date().getFullYear()}. All rights reserved</p>
          <a
            href="https://maps.app.goo.gl/aro79FeZpvs2Be1M7"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            <i>Pondok Pesantren Al Fattah Kudus</i>
          </a>
        </div>
      </div>
    </footer>
  );
}
