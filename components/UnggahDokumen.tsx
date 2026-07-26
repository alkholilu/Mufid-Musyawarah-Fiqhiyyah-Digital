import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  Copy, 
  Trash2, 
  Check, 
  AlertCircle,
  Clock,
  Folder,
  ArrowUpDown,
  ChevronDown,
  Sparkle,
  Sparkles
} from "lucide-react";
import { UploadedDocument } from "../types";

interface UnggahDokumenProps {
  documents: UploadedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
  addAuditLog: (operator: string, action: "UPDATE" | "STATUS" | "INSERT" | "DELETE" | "OVERRIDE", detail: string) => void;
  isAdminOverride: boolean;
  activeGroup: string;
}

export default function UnggahDokumen({
  documents,
  setDocuments,
  addAuditLog,
  isAdminOverride,
  activeGroup
}: UnggahDokumenProps) {
  const [dragActive, setDragActive] = useState(false);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  
  // Metadata state for Repositori filter alignment & Wireframe Card matching
  const [uploadHeadline, setUploadHeadline] = useState<string>("Keputusan Hasil Bahtsul Masail");
  const [uploadTagline, setUploadTagline] = useState<string>("28 Syawal 1448 H");
  const [uploadTanggal, setUploadTanggal] = useState<string>("25 Juli 2026");
  const [uploadKategori, setUploadKategori] = useState<string>("Thaharah");
  const [uploadTahun, setUploadTahun] = useState<number>(() => new Date().getFullYear());
  
  // Ref for file input trigger
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format Indonesian display date
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split(" ");
      if (parts.length >= 2) {
        const dateParts = parts[0].split("-"); // [2026, 06, 23]
        const timeParts = parts[1].split(":"); // [20, 15, 00]
        if (dateParts.length === 3 && timeParts.length >= 2) {
          const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ];
          const day = parseInt(dateParts[2], 10);
          const monthIdx = parseInt(dateParts[1], 10) - 1;
          const year = dateParts[0];
          const hour = timeParts[0];
          const min = timeParts[1];
          return `Diunggah: ${day} ${months[monthIdx]} ${year}, ${hour}:${min} WIB`;
        }
      }
    } catch (e) {
      // fallback
    }
    return `Diunggah: ${dateStr}`;
  };

  // Copy to clipboard mock
  const handleCopyUrl = (doc: UploadedDocument) => {
    const fullMockUrl = `${window.location.origin}${doc.path}`;
    navigator.clipboard.writeText(fullMockUrl);
    setCopiedDocId(doc.id);
    
    // Notify
    const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";
    addAuditLog(
      operatorName,
      "UPDATE",
      `Menyalin tautan repositori untuk dokumen: '${doc.name}'`
    );

    setTimeout(() => {
      setCopiedDocId(null);
    }, 2000);
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Create mock file on drop/select
  const handleFileDropOrSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Periksa apakah berkas berakhiran .pdf atau memiliki MIME type pdf (dukung semua dokumen PDF)
    const isPdf = file.name.toLowerCase().endsWith(".pdf") || 
                  file.type === "application/pdf" || 
                  file.type.toLowerCase().includes("pdf");

    if (!isPdf) {
      alert("Format berkas tidak didukung! Silakan pilih berkas dokumen dengan format .pdf.");
      return;
    }

    const pathName = "/repositori/" + file.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      path: pathName,
      size: sizeMb,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fileObject: file,
      headline: uploadHeadline,
      tagline: uploadTagline,
      tanggalMasehi: uploadTanggal,
      tahunSidang: uploadTahun,
      kategoriMasalah: uploadKategori
    };

    setDocuments(prev => [newDoc, ...prev]);

    const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";
    addAuditLog(
      operatorName,
      "INSERT",
      `Mengunggah dokumen keputusan final: '${file.name}' (${sizeMb})`
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFileDropOrSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileDropOrSelect(e.target.files);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteDoc = (id: string, docName: string) => {
    setDeleteTarget({ id, name: docName });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDocuments(prev => prev.filter(d => d.id !== id));
    
    const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";
    addAuditLog(
      operatorName,
      "DELETE",
      `Menghapus dokumen keputusan dari repositori: '${name}'`
    );
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Title with vertical line */}
      <div className="flex items-start gap-3 sticky top-0 z-20 bg-[#f8fafc]/95 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-100 -mt-4 md:-mt-8 mb-2">
        <div className="w-[4px] h-[32px] bg-[#059669] rounded-full self-start mt-0.5"></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-7">
            Repositori & Unggah Dokumen Final
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Publikasikan dokumen fatwa resmi dan laporan keputusan bahtsul masail dalam format digital PDF.
          </p>
        </div>
      </div>

      {/* Outer White Panel holding the columns */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        
        {/* 12-Column Responsive Dual Zone Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Zone: Drag & Drop Area (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-[120px] self-start w-full space-y-4">
            
            {/* Metadata Selection Panel for Repositori Filter Alignment & Wireframe Card matching */}
            <div className="bg-[#F4FBF9] border border-[#A7F3D0] rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-[#065F46] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                Metadata Dokumen Repositori
              </h3>

              <div className="space-y-3">
                {/* HEADLINE DOKUMEN */}
                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Nama Dokumen <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Keputusan Hasil Bahtsul Masail..."
                    value={uploadHeadline}
                    onChange={(e) => setUploadHeadline(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 shadow-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* TAGLINE DOKUMEN */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Tagline/Subjudul <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 28 Syawal 1448 H..."
                      value={uploadTagline}
                      onChange={(e) => setUploadTagline(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 shadow-xs"
                      required
                    />
                  </div>

                  {/* TANGGAL DOKUMEN */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Tanggal Masehi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 25 Juli 2026..."
                      value={uploadTanggal}
                      onChange={(e) => setUploadTanggal(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 shadow-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* KATEGORI MASALAH */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Kategori <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Thaharah, Muamalah, dll..."
                      value={uploadKategori}
                      onChange={(e) => setUploadKategori(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 shadow-xs"
                      required
                    />
                  </div>

                  {/* TAHUN SIDANG */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Tahun Sidang <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={2020}
                      max={2030}
                      value={uploadTahun}
                      onChange={(e) => setUploadTahun(parseInt(e.target.value, 10) || new Date().getFullYear())}
                      className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 shadow-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full min-h-[320px] border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 ${
                dragActive 
                  ? "border-[#10B981] bg-[#F4FBF9]/80 shadow-md scale-[1.01]" 
                  : "border-[#10B981]/25 hover:border-[#10B981] bg-[#F4FBF9]/35 hover:bg-[#F4FBF9]/60"
              }`}
              id="drag-and-drop-container"
            >
              {/* Hidden Input */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,application/pdf,application/x-pdf"
                onChange={handleFileInputChange}
                className="hidden" 
              />

              {/* Cloud Icon with decorative Sparkles */}
              <div className="w-20 h-20 rounded-full bg-[#E6F7F0] flex items-center justify-center text-[#059669] relative shadow-[0_4px_12px_rgba(5,150,105,0.06)]">
                <UploadCloud className="w-9 h-9" />
                <Sparkles className="absolute -top-1 -right-1 text-[#34D399] w-4 h-4 animate-pulse" />
                <Sparkle className="absolute top-1/2 -left-6 text-[#34D399] w-3 h-3.5" />
              </div>

              {/* Central Call to Action */}
              <h3 className="text-base font-extrabold text-slate-800 leading-snug mt-6 max-w-[240px] mx-auto">
                Tarik file laporan resmi PDF bertanda tangan ke sini
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                atau klik untuk browse file dari perangkat Anda
              </p>
              
              {/* Pill Outline Button */}
              <button
                type="button"
                className="inline-flex items-center gap-2 border border-[#A7F3D0] hover:border-[#059669] text-[#059669] hover:bg-[#ECFDF5] bg-white transition-all duration-200 font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-xs mt-6 cursor-pointer"
                id="btn-choose-pdf"
              >
                <FileText className="w-4 h-4" />
                <span>Pilih File PDF</span>
              </button>

              {/* Limit footnote */}
              <span className="inline-block mt-4 text-[11px] text-slate-400 font-medium">
                Format PDF, maksimal 10MB
              </span>
            </div>
          </div>

          {/* Right Zone: List of uploaded files (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header list block */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EBFDF5] flex items-center justify-center text-[#059669] border border-[#D1FAE5] shadow-xs">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Dokumen yang Telah Diunggah
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Kelola, bagikan, dan hapus dokumen dengan mudah.
                  </p>
                </div>
              </div>

              {/* Sorting button */}
              <div className="flex items-center gap-1.5 border border-slate-200 text-slate-700 bg-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Terbaru</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </div>
            </div>

            {/* Document list container */}
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-sm hover:border-slate-200/50 transition-all duration-200"
                  id={`doc-card-${doc.id}`}
                >
                  <div className="flex items-center space-x-4 pr-3 overflow-hidden">
                    
                    {/* PDF Badge Graphic */}
                    <div className="w-14 h-16 bg-[#FEF2F2] rounded-2xl flex flex-col justify-between items-center py-2.5 shrink-0 select-none border border-[#FEE2E2] shadow-xs">
                      <span className="text-[9px] font-black text-[#EF4444] tracking-widest leading-none">PDF</span>
                      <FileText className="w-5 h-5 text-[#EF4444]" />
                      <span className="text-[9px] font-extrabold text-[#EF4444] tracking-wide leading-none">{doc.size}</span>
                    </div>

                    {/* Meta details */}
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-[13px] font-extrabold text-slate-800 truncate leading-snug" title={doc.name}>
                        {doc.name}
                      </h4>
                      <p className="text-xs font-bold text-[#059669] select-all leading-none mt-0.5">
                        {doc.path}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5 font-medium leading-none">
                        <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>{formatDisplayDate(doc.uploadedAt)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleCopyUrl(doc)}
                      className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                      id={`btn-copy-${doc.id}`}
                    >
                      {copiedDocId === doc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 shrink-0" />
                          <span>Salin URL</span>
                        </>
                      )}
                    </button>
                    
                    {/* Delete Icon Button matching the photo */}
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.name)}
                      className="border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 p-2.5 rounded-xl transition-all cursor-pointer"
                      title="Hapus Dokumen"
                      id={`btn-delete-${doc.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {documents.length === 0 && (
                <div className="text-center py-16 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Belum Ada Dokumen</p>
                  <p className="text-xs text-slate-400 mt-1">Tarik dokumen PDF keputusan Anda ke panel kiri untuk dipublikasikan.</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
      
      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity" 
            onClick={() => setDeleteTarget(null)}
          />
          
          {/* Modal Box */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 max-w-md w-full shadow-[0_20px_50px_rgba(15,23,42,0.15)] relative z-10 transform scale-100 transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-slate-900">
                  Hapus Dokumen Keputusan?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus dokumen <span className="font-semibold text-slate-800">"{deleteTarget.name}"</span> dari repositori publik? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 bg-white text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(225,29,72,0.2)] hover:shadow-[0_4px_16px_rgba(225,29,72,0.3)] cursor-pointer active:scale-95"
                id="confirm-delete-btn"
              >
                Hapus Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
