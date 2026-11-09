import React, { useState } from "react";
import { Question } from "../types";
import PdfPreviewModal from "./PdfPreviewModal";
import { 
  Archive, 
  Search, 
  BookOpen, 
  Download, 
  Share2, 
  BookmarkCheck,
  Award,
  Printer,
  Filter,
  CheckCircle2
} from "lucide-react";

interface ArsipDigitalProps {
  questions: Question[];
  userRole?: string;
}

export default function ArsipDigital({ questions, userRole }: ArsipDigitalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"disahkan" | "semua">("disahkan");
  const [selectedQForPdf, setSelectedQForPdf] = useState<Question | null>(null);
  
  const disahkanQuestions = (questions || []).filter((q) => {
    const status = (q.status || "").trim().toLowerCase();
    const isApproved = 
      status === "disahkan" || 
      status === "selesai" || 
      status === "disetujui" ||
      status.includes("sah") || 
      status.includes("selesai");

    if (filterType === "disahkan" && !isApproved) return false;

    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const titleMatch = (q.title || "").toLowerCase().includes(term);
    const fatwaMatch = (q.finalFatwa || "").toLowerCase().includes(term);
    const catMatch = (q.categories || []).some(c => (c || "").toLowerCase().includes(term));
    return titleMatch || fatwaMatch || catMatch;
  });

  const totalDisahkanCount = (questions || []).filter(q => {
    const s = (q.status || "").trim().toLowerCase();
    return s === "disahkan" || s === "selesai" || s.includes("sah") || s.includes("selesai");
  }).length;

  const handleShare = (title: string) => {
    alert(`Tautan fatwa hukum disalin ke clipboard:\n\nhttps://mufid.id/fatwa-resmi/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {userRole && (
            <p className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1.5 font-mono">
              Sidang {userRole === "Admin" ? "Administrator" : userRole}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-zinc-900 tracking-tight">
            Sistem Arsip Digital
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Koleksi digital hasil keputusan hukum syara' Bahtsul Masail yang telah berkekuatan hukum tetap (disahkan).
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterType("disahkan")}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === "disahkan"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Keputusan Disahkan ({totalDisahkanCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType("semua")}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === "semua"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Semua Masalah ({(questions || []).length})</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-md relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kata kunci fatwa, judul masalah, atau kitab rujukan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm border border-border-hairline rounded-xl pl-10 pr-4 py-2.5 bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* Grid of Disahkan Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {disahkanQuestions.map((q) => (
          <div 
            key={q.id} 
            className="bg-white border border-border-hairline rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
          >
            {/* Top metadata header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-border-hairline flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ID: {String(q.id).toUpperCase()}</span>
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                (q.status || "").toLowerCase().includes("sah") || (q.status || "").toLowerCase() === "selesai"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {q.status || "Disahkan"}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {/* Question Title */}
              <h3 className="text-base sm:text-lg font-display font-bold text-slate-950 leading-snug">
                {q.title}
              </h3>

              {/* Final Fatwa Rulings */}
              <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-border-hairline">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Keputusan Fatwa Final:</h4>
                <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                  {q.finalFatwa || "Belum ada isi deskripsi fatwa."}
                </p>
              </div>

              {/* Display primary Arabic citations if any */}
              {(() => {
                const citations = q.arabicCitations && q.arabicCitations.length > 0
                  ? q.arabicCitations
                  : (q.responses?.filter(r => r.isReferensiUtama).flatMap(r => r.citations || []) || []).length > 0
                    ? q.responses?.filter(r => r.isReferensiUtama).flatMap(r => r.citations || [])
                    : q.responses?.flatMap(r => r.citations || []) || [];

                if (citations && citations.length > 0) {
                  return (
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Rujukan Kitab Kuning Utama:</span>
                      <div className="font-arabic text-right text-slate-900 border-r-2 border-slate-300 pr-3 leading-relaxed" style={{ fontSize: "1.25rem", direction: "rtl" }}>
                        {citations[0].arabicText}
                      </div>
                      <p className="text-[11px] font-bold text-primary font-mono">{citations[0].kitab}</p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Bottom Download & Share Panel */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-border-hairline flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Tahun Sidang: {q.year || "2026"}</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleShare(q.title)}
                  className="p-2.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Bagikan Tautan Fatwa"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQForPdf(q)}
                  className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-900/10 cursor-pointer"
                  title="Download Lembar Putusan Resmi (PDF)"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQForPdf(q)}
                  className="p-2.5 text-slate-600 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Pratinjau & Cetak Dokumen"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {disahkanQuestions.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
            <Archive className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {filterType === "disahkan" 
                  ? "Tidak ada arsip keputusan sah yang ditemukan." 
                  : "Tidak ada masalah sidang yang sesuai dengan pencarian."}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {filterType === "disahkan"
                  ? "Sahkan draf masalah terlebih dahulu di menu Sidang Mushohih / Bahtsul Masail agar masuk arsip digital."
                  : "Ubah kata kunci pencarian Anda untuk melihat arsip dokumen lainnya."}
              </p>
            </div>
            {filterType === "disahkan" && (questions || []).length > 0 && (
              <button
                type="button"
                onClick={() => setFilterType("semua")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                <span>Lihat Seluruh Masalah Sidang ({(questions || []).length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {selectedQForPdf && (
        <PdfPreviewModal
          question={selectedQForPdf}
          isOpen={!!selectedQForPdf}
          onClose={() => setSelectedQForPdf(null)}
        />
      )}

    </div>
  );
}
