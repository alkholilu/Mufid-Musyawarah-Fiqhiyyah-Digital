import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Question } from "../types";
import { X, Printer, CheckCircle, FileText, Download } from "lucide-react";

interface PdfPreviewModalProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
  customNatijah?: string;
  customNote?: string;
}

export default function PdfPreviewModal({
  question,
  isOpen,
  onClose,
  customNatijah,
  customNote
}: PdfPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Auto-scroll modal container to top when opened
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard shortcut: Press Escape to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const title = question.title || "";
  const waqiIyyah = question.waqiIyyah || "";
  const asilah = question.asilah || "";
  
  let jawabanText = customNatijah !== undefined ? customNatijah : (question.finalFatwa || "");
  const noteText = customNote !== undefined ? customNote : "";

  if (!jawabanText) {
    const primaryResp = question.responses?.find(r => r.isReferensiUtama);
    if (primaryResp) {
      jawabanText = primaryResp.text;
    } else if (question.responses && question.responses.length > 0) {
      jawabanText = question.responses[0].text;
    } else {
      jawabanText = "Naskah keputusan sedang dalam tahap penyusunan oleh Dewan Mushohih.";
    }
  }

  // 1. Gather ALL citations from all group responses + arabicCitations (filter out excluded ones)
  const allCitationsFromResponses = (question.responses || []).flatMap(r => r.citations || []).filter(c => !c.excludedFromPdf);
  const allFallbackCitations = (question.arabicCitations || []).filter(c => !c.excludedFromPdf);
  const rawCitationsList = [...allCitationsFromResponses, ...allFallbackCitations];
  
  // Deduplicate by Kitab & Arabic Text
  const citations = rawCitationsList.filter((c, index, self) => 
    index === self.findIndex((t) => (t.kitab || "") === (c.kitab || "") && (t.arabicText || "") === (c.arabicText || ""))
  );

  // 2. Gather all responses from groups
  const groupResponses = question.responses || [];

  const formattedAsilahLines = asilah
    ? asilah.split("\n").filter(line => line.trim().length > 0)
    : [];

  const handleTriggerPrint = () => {
    try {
      const citationsHtml = citations.map(c => `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <div style="text-align: left; font-size: 11pt; font-style: italic; margin-bottom: 4px; font-family: 'Times New Roman', serif; font-weight: bold; color: #0f172a;">
            (${c.kitab})
          </div>
          <div dir="rtl" style="text-align: right; font-family: 'Amiri', 'Traditional Arabic', serif; font-size: 17pt; line-height: 1.9; margin-bottom: 6px; direction: rtl; color: #020617; font-weight: bold; border-right: 3px solid #059669; padding-right: 12px;">
            ${c.arabicText}
          </div>
          ${c.translation ? `
            <p style="font-size: 10.5pt; font-style: italic; color: #1e293b; margin: 4px 0 0 0; text-align: justify; line-height: 1.6; font-family: 'Times New Roman', serif;">
              Artinya: "${c.translation}"
            </p>
          ` : ''}
        </div>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>${title.replace(/"/g, '&quot;')}</title>
          <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Times New Roman', Times, 'Amiri', 'Georgia', serif;
              color: #09090b !important;
              background-color: #ffffff !important;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .kop-header {
              text-align: center;
              font-family: 'Times New Roman', serif;
              border-bottom: 4px double #09090b;
              padding-bottom: 14px;
              margin-bottom: 20px;
            }
            .kop-header h2 {
              font-size: 18pt;
              font-weight: 900;
              text-transform: uppercase;
              margin: 0;
              letter-spacing: 1px;
              color: #09090b;
            }
            .kop-header p {
              font-size: 9pt;
              font-family: sans-serif;
              text-transform: uppercase;
              font-weight: bold;
              margin-top: 4px;
              color: #334155;
            }
            
            .title-container {
              text-align: center;
              margin-bottom: 20px;
            }
            
            .title {
              font-size: 14pt;
              font-weight: 800;
              text-transform: uppercase;
              margin: 0;
              line-height: 1.4;
              color: #09090b;
            }
            .meta {
              font-size: 9pt;
              font-family: sans-serif;
              color: #64748b;
              margin-top: 4px;
            }
            
            .section-title {
              font-size: 10.5pt;
              font-weight: bold;
              text-transform: uppercase;
              margin: 18px 0 6px 0;
              color: #09090b;
              font-family: 'Times New Roman', serif;
              letter-spacing: 0.5px;
            }
            
            .content-text {
              font-size: 11pt;
              text-align: justify;
              margin: 0;
              line-height: 1.6;
              color: #0f172a;
            }
            
            .waqi-text {
              text-indent: 35px;
            }
            
            .page-break-inside-avoid {
              page-break-inside: avoid;
              break-inside: avoid;
            }

            .footer-bar {
              margin-top: 40px;
              padding-top: 14px;
              border-top: 1px solid #cbd5e1;
              text-align: center;
              font-size: 9pt;
              color: #64748b;
              font-family: sans-serif;
              display: flex;
              justify-content: space-between;
              text-transform: uppercase;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="kop-header">
            <h2>MUFID - Musywarah Fiqhiyyah Digital</h2>
            <p>Pondok Pesantren Putra Al-Fattah Kudus</p>
          </div>

          <div class="title-container">
            <h1 class="title">${title}</h1>
            <p class="meta">Kategori: ${question.categories?.join(", ") || "Fiqhiyyah"} | Tahun Sidang: ${question.year || "2026"}</p>
          </div>

          ${waqiIyyah ? `
            <div class="page-break-inside-avoid">
              <h2 class="section-title">DESKRIPSI MASALAH:</h2>
              <div class="content-text waqi-text">
                ${waqiIyyah.split('\n').map(p => `<p style="margin-bottom:6px;">${p}</p>`).join('')}
              </div>
            </div>
          ` : ''}

          ${asilah ? `
            <div class="page-break-inside-avoid" style="margin-top: 14px;">
              <h2 class="section-title">SOAL:</h2>
              <div class="content-text" style="padding-left: 16px;">
                ${formattedAsilahLines.map(line => `<p style="margin-bottom:4px;">${line}</p>`).join('')}
              </div>
            </div>
          ` : ''}

          <div class="page-break-inside-avoid" style="margin-top: 14px;">
            <h2 class="section-title">JAWABAN:</h2>
            <div class="content-text" style="white-space: pre-line;">
              ${jawabanText}
            </div>
            ${noteText ? `
              <div style="margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 8px;">
                <p style="font-size: 10pt; font-style: italic; color: #78350f; background-color: #fffbeb; padding: 10px; border: 1px solid #fde68a; border-radius: 6px;">
                  <strong>Catatan Pentashih Dewan Mushohih:</strong> ${noteText}
                </p>
              </div>
            ` : ''}
          </div>

          ${citationsHtml ? `
            <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0 14px 0;" />
            <div>
              <h2 class="section-title">REFERENSI KITAB RUJUKAN:</h2>
              <div style="margin-top: 10px;">
                ${citationsHtml}
              </div>
            </div>
          ` : ''}

          <div class="footer-bar">
            <span>Halaman 1 dari 1</span>
            <span>Platform Digital MUFID</span>
          </div>
        </body>
        </html>
      `;

      let iframe = document.getElementById("pdf-print-iframe") as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "pdf-print-iframe";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);
      }

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 500);
      }
    } catch (err) {
      console.error("Error triggering print iframe:", err);
      window.print();
    }
  };

  const modalContent = (
    <div className="printable-pdf-modal-parent fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-md flex flex-col h-screen w-screen overflow-hidden text-slate-100">
      {/* Dynamic Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          #root, header, nav, footer, aside, .no-print {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .printable-pdf-modal-parent {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          .printable-pdf-modal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}} />

      {/* 1. PERMANENTLY FIXED TOP HEADER BAR (NEVER SCROLLS AWAY) */}
      <header className="no-print shrink-0 w-full bg-slate-900 border-b border-slate-800 px-3 py-2.5 sm:px-6 sm:py-3 shadow-2xl z-50 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-emerald-500/20 text-emerald-400 p-1.5 sm:p-2 rounded-xl border border-emerald-500/30 shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono truncate">
                Lembar Fatwa Resmi MUFID
              </h3>
              <span className="hidden xs:inline-flex text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded uppercase font-sans shrink-0">
                Dokumen Resmi
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate hidden md:block">
              Lampiran Keputusan Sidang Bahtsul Masail
            </p>
          </div>
        </div>

        {/* Right: Actions (Download PDF, Cetak, Tutup) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleTriggerPrint}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all border border-emerald-500/30 cursor-pointer"
            title="Download atau Simpan Lembar Keputusan sebagai PDF"
            id="modal-btn-download-top"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs font-bold px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            title="Cetak langsung dokumen"
            id="modal-btn-cetak-top"
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 active:scale-95 text-xs font-bold px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="Tutup Pratinjau (Esc)"
            id="modal-btn-tutup-top"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Tutup</span>
          </button>
        </div>
      </header>

      {/* 2. MIDDLE SCROLLABLE PREVIEW AREA */}
      <main 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-6 md:p-10 flex flex-col items-center justify-start overscroll-contain"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Printable PDF Page (A4 Paper Mockup - 100% IDENTICAL TO KETOK PALU SIDANG SHEET) */}
        <div 
          id="printable-pdf-content" 
          style={{ backgroundColor: '#ffffff', color: '#09090b', opacity: 1, minHeight: '1100px' }}
          className="printable-pdf-modal bg-white text-gray-950 shadow-2xl border border-gray-200 p-5 sm:p-10 md:p-14 mx-auto my-2 sm:my-6 w-full max-w-[850px] rounded-sm font-serif flex flex-col justify-start space-y-8 relative opacity-100 shrink-0"
        >
        {/* Bagian Kop Kepala Surat LBM */}
        <div style={{ borderColor: '#09090b' }} className="text-center font-bold font-serif space-y-1 border-b-4 border-double border-slate-950 pb-4 mb-6">
          <h2 style={{ color: '#09090b' }} className="text-xl md:text-2xl font-black !text-slate-950 tracking-wider uppercase">
            MUFID - Musywarah Fiqhiyyah Digital
          </h2>
          <p style={{ color: '#334155' }} className="text-xs !text-slate-700 font-sans tracking-wide uppercase font-bold mt-1">
            Pondok Pesantren Putra Al-Fattah Kudus
          </p>
        </div>

        {/* Title Problem Heading */}
        <div className="text-center pb-2">
          <h1 style={{ color: '#09090b' }} className="text-base md:text-lg font-extrabold !text-slate-950 uppercase tracking-wide leading-relaxed font-serif">
            {title}
          </h1>
          <p style={{ color: '#64748b' }} className="text-xs !text-slate-500 font-sans mt-1">
            Kategori: {question.categories?.join(", ") || "Fiqhiyyah"} | Tahun Sidang: {question.year || "2026"}
          </p>
        </div>

        {/* Deskripsi Masalah (Waqi'iyyah) */}
        {waqiIyyah && (
          <div className="space-y-2">
            <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
              DESKRIPSI MASALAH:
            </h3>
            <div style={{ color: '#0f172a' }} className="text-sm !text-slate-900 leading-relaxed font-serif text-justify indent-8 space-y-2">
              {waqiIyyah.split('\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {/* Soal Pertanyaan (Asilah) */}
        {asilah && (
          <div className="space-y-2">
            <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
              SOAL:
            </h3>
            <div style={{ color: '#0f172a' }} className="text-sm !text-slate-900 leading-relaxed font-serif space-y-2 pl-4">
              {formattedAsilahLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* JAWABAN / NATIJAH FINAL */}
        <div className="space-y-2">
          <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
            JAWABAN:
          </h3>
          <div style={{ color: '#0f172a' }} className="text-sm !text-slate-900 leading-relaxed font-serif text-justify whitespace-pre-line">
            {jawabanText || <span className="italic text-slate-500 font-normal">Belum ada natijah yang dirumuskan oleh Muharrir...</span>}
          </div>

          {noteText && (
            <div className="mt-4 border-t border-dashed border-slate-300 pt-3">
              <div 
                style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#78350f' }}
                className="text-xs italic !text-amber-950 font-serif leading-relaxed !bg-amber-50 p-3.5 rounded-lg border border-amber-300 font-medium"
              >
                <strong>Catatan Pentashih Dewan Mushohih:</strong> {noteText}
              </div>
            </div>
          )}
        </div>

        {/* Horizontal Divider Line */}
        <hr className="border-t border-gray-300 my-4" />

        {/* REFERENSI KITAB RUJUKAN */}
        <div className="space-y-4">
          <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
            REFERENSI KITAB RUJUKAN:
          </h3>

          {citations.length > 0 ? (
            <div className="space-y-8">
              {citations.map((cit, idx) => (
                <div 
                  key={cit.id || idx} 
                  className="space-y-3 pb-6 border-b border-gray-250 last:border-none page-break-inside-avoid"
                >
                  {/* Header Baris Kitab */}
                  <div style={{ color: '#1e293b' }} className="text-xs md:text-sm font-bold font-serif italic text-left">
                    ({cit.kitab || `Kitab ${idx + 1}`})
                  </div>

                  {/* Area Teks Arab (RTL At-Ta'bir) */}
                  <div 
                    dir="rtl" 
                    style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", direction: "rtl", color: "#020617" }}
                    className="text-right font-serif text-xl sm:text-2xl leading-loose my-2 tracking-wide !text-slate-950 font-bold pr-4 border-r-2 border-emerald-600/50"
                  >
                    {cit.arabicText}
                  </div>

                  {/* Teks Arti Bahasa Indonesia */}
                  {cit.translation && (
                    <p style={{ color: '#334155' }} className="text-xs sm:text-sm !text-slate-800 italic mt-1 block font-normal leading-relaxed text-justify font-serif">
                      Artinya: "{cit.translation}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Belum ada referensi kitab kuning yang tersemat.</p>
          )}
        </div>

        {/* Footer Lembar Cetak Kertas HVS */}
        <div style={{ borderColor: '#cbd5e1', color: '#64748b' }} className="pt-8 border-t border-slate-300 text-center text-[10px] !text-slate-500 font-sans flex justify-between uppercase font-semibold mt-auto">
          <span>Halaman 1 dari 1</span>
          <span>Platform Digital MUFID</span>
        </div>
      </div>
    </main>

    {/* 3. MOBILE BOTTOM FLOATING ACTION BAR (PADA LAYAR HP) */}
    <footer className="no-print sm:hidden shrink-0 w-full bg-slate-900/98 backdrop-blur border-t border-slate-800 px-3 py-2.5 flex items-center justify-between gap-2 z-50 shadow-2xl">
      <button
        type="button"
        onClick={handleTriggerPrint}
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 cursor-pointer"
        id="modal-btn-download-bottom"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Download PDF</span>
      </button>

      <button
        type="button"
        onClick={handleTriggerPrint}
        className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
        title="Cetak Dokumen"
        id="modal-btn-cetak-bottom"
      >
        <Printer className="w-4 h-4 shrink-0" />
        <span>Cetak</span>
      </button>

      <button
        type="button"
        onClick={onClose}
        className="bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white active:scale-95 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1 border border-rose-500/30 cursor-pointer"
        title="Tutup Pratinjau"
        id="modal-btn-tutup-bottom"
      >
        <X className="w-4 h-4 shrink-0" />
        <span>Tutup</span>
      </button>
    </footer>
  </div>
  );

  return createPortal(modalContent, document.body);
}
