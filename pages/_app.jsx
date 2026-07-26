import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/global.css';
import Header from '../components/Header';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // 1. Logic for Scroll Reveal Animations using IntersectionObserver
    const observerOptions = {
      threshold: 0.1, // Trigger when 10% of the element is visible
      rootMargin: '0px 0px -60px 0px', // Trigger slightly before entering the viewport
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          // Once animated, we don't need to observe it again
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const registerObservers = () => {
      // Find all elements with scroll animation class names
      const elements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
      );
      elements.forEach((el) => {
        // If it's already animated in, skip it
        if (!el.classList.contains('animate-in')) {
          observer.observe(el);
        }
      });
    };

    // Run observer registration
    registerObservers();

    // MutationObserver to capture dynamically rendered elements (like Supabase loaded data)
    const mutationObserver = new MutationObserver(() => {
      registerObservers();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [router.asPath]); // Re-bind whenever route/path changes

  const isDecorativePage = ['/', '/Beranda', '/Tentang', '/Repositori', '/PusatBantuan'].includes(router.pathname);

  return (
    <div className={`relative min-h-screen bg-white ${isDecorativePage ? 'overflow-x-hidden' : ''}`}>
      {isDecorativePage && <Header />}
      {isDecorativePage && (
        <>
          {/* Pojok Kiri Atas: Gambar Dekoratif */}
          <img
            src="/Decorative Elements.png"
            alt=""
            className="pointer-events-none absolute left-0 top-0 w-[24rem] sm:w-[32rem] md:w-[40rem] h-auto opacity-20 -scale-x-100 origin-top-left select-none z-0"
          />

          {/* Pojok Kanan Atas: Blur + Gambar Dekoratif */}
          <div className="pointer-events-none absolute right-[-10rem] top-[-10rem] h-[35rem] w-[35rem] rounded-full bg-emerald-500/10 blur-3xl z-0" />
          <img
            src="/Decorative Elements.png"
            alt=""
            className="pointer-events-none absolute right-0 top-0 w-[24rem] sm:w-[32rem] md:w-[40rem] h-auto opacity-20 origin-top-right select-none z-0"
          />
        </>
      )}

      {/* Page entrance animation wrapper */}
      <div key={router.asPath} className="animate-pageTransition relative z-10">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

