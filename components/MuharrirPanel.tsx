import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Lock, 
  Send, 
  Users, 
  Star, 
  Undo, 
  Plus, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle2,
  Edit,
  Loader2
} from "lucide-react";
import { Question, GroupResponse } from "../types";

interface MuharrirPanelProps {
  currentQ: Question;
  isLocked: boolean;
  natijahText: string;
  setNatijahText: (val: string) => void;
  handleSetorNatijah: () => void;
  
  // Monitoring props
  handleSaveEvaluationNote: (groupName: string, note: string) => Promise<void> | void;
  handleTogglePrimaryReference: (groupName: string) => void;
  handleReturnToRevision: (groupName: string) => Promise<void> | void;

  // Form Kirim Jawaban props
  mubahhisGroup: string;
  setMubahhisGroup: (val: string) => void;
  activeGroupResp?: GroupResponse;
  responseText: string;
  setResponseText: (val: string) => void;
  kitabName: string;
  setKitabName: (val: string) => void;
  juzKe: string;
  setJuzKe: (val: string) => void;
  halamanBerapa: string;
  setHalamanBerapa: (val: string) => void;
  karanganSiapa: string;
  setKaranganSiapa: (val: string) => void;
  statusHukum: string;
  setStatusHukum: (val: string) => void;
  arabicText: string;
  setArabicText: (val: string) => void;
  translation: string;
  setTranslation: (val: string) => void;
  handleAddMubahhisCitation: (e: React.FormEvent) => void;
  handleRemoveMubahhisCitation: (citId: string) => void;
  handleSaveMubahhisDraft: (submitToPerumus: boolean) => void;
  defaultGroups: { id: string; name: string }[];
  activeSubTab: "monitoring" | "natijah" | "kirim-jawaban";
  mubahhisEditingCitId?: string | null;
  handleStartEditMubahhisCitation?: (citId: string, kitab: string, arabic: string, trans: string) => void;
  handleCancelEditMubahhisCitation?: () => void;
}

/* ───────────── SUB-COMPONENT FOR CATATAN EVALUASI (DEBOUNCE 1000ms & SAVE BUTTON) ───────────── */
interface EvaluationNoteBoxProps {
  groupName: string;
  initialNote: string;
  onSave: (groupName: string, note: string) => Promise<void> | void;
}

function EvaluationNoteBox({ groupName, initialNote, onSave }: EvaluationNoteBoxProps) {
  const [note, setNote] = useState(initialNote || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const isDirty = useRef(false);

  // Synchronize when initialNote changes from DB updates
  useEffect(() => {
    if (!isDirty.current) {
      setNote(initialNote || "");
    }
  }, [initialNote]);

  // Debounce 1000ms: Only trigger Supabase save after user stops typing for 1000ms
  useEffect(() => {
    if (!isDirty.current) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(groupName, note);
        setIsSaved(true);
        isDirty.current = false;
        setTimeout(() => setIsSaved(false), 2000);
      } catch (err) {
        console.error("Gagal menyimpan catatan evaluasi:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [note, groupName, onSave]);

  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await onSave(groupName, note);
      setIsSaved(true);
      isDirty.current = false;
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error("Gagal menyimpan catatan evaluasi:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider block font-mono">
          Catatan Pelurusan Diskusi:
        </label>
        {isSaving && (
          <span className="text-xs text-amber-600 font-bold flex items-center gap-1.5 animate-pulse bg-amber-50 px-2.5 py-1 rounded-full border border-amber-250">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan ke Supabase...
          </span>
        )}
        {isSaved && !isSaving && (
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-250">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan
          </span>
        )}
      </div>
      <div className="flex gap-3 items-stretch">
        <textarea
          rows={2}
          placeholder="Ketik instruksi koreksi/pelurusan bagi kelompok..."
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            isDirty.current = true;
          }}
          className="flex-1 text-sm sm:text-base bg-white border border-slate-300 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-normal leading-relaxed resize-y shadow-inner"
        />
        <button
          type="button"
          onClick={handleManualSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>💾 Simpan Catatan</span>
          )}
        </button>
      </div>
    </div>
  );
}

export function MuharrirPanel({
  currentQ,
  isLocked,
  natijahText,
  setNatijahText,
  handleSetorNatijah,
  handleSaveEvaluationNote,
  handleTogglePrimaryReference,
  handleReturnToRevision,
  mubahhisGroup,
  setMubahhisGroup,
  activeGroupResp,
  responseText,
  setResponseText,
  kitabName,
  setKitabName,
  juzKe,
  setJuzKe,
  halamanBerapa,
  setHalamanBerapa,
  karanganSiapa,
  setKaranganSiapa,
  statusHukum,
  setStatusHukum,
  arabicText,
  setArabicText,
  translation,
  setTranslation,
  handleAddMubahhisCitation,
  handleRemoveMubahhisCitation,
  handleSaveMubahhisDraft,
  defaultGroups,
  activeSubTab,
  mubahhisEditingCitId,
  handleStartEditMubahhisCitation,
  handleCancelEditMubahhisCitation
}: MuharrirPanelProps) {
  const [revisingGroups, setRevisingGroups] = useState<Record<string, boolean>>({});

  const handleReturnWithLoading = async (groupName: string) => {
    setRevisingGroups(prev => ({ ...prev, [groupName]: true }));
    try {
      await handleReturnToRevision(groupName);
    } catch (err) {
      console.error("Error returning to revision:", err);
    } finally {
      setRevisingGroups(prev => ({ ...prev, [groupName]: false }));
    }
  };

  return (
    <div className="bg-slate-50/50 rounded-3xl border border-slate-200 shadow-sm p-4 md:p-8 flex flex-col space-y-6">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0">
        
        {/* TAB 1: MONITORING DELEGASI */}
        {activeSubTab === "monitoring" && (
          <div className="space-y-8 animate-fade-in">
            <div className="border-b border-slate-200 pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-display font-black text-slate-900 text-base md:text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600 shrink-0" />
                  Monitoring Delegasi (Real-time)
                </h3>
                <p className="text-xs text-slate-500 mt-1">Gunakan kontrol di bawah untuk memberi catatan atau menetapkan referensi utama.</p>
              </div>
              <span className="text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest animate-pulse shrink-0 font-mono shadow-sm">
                Live Feed
              </span>
            </div>

            <div className="space-y-8">
              {currentQ.responses && currentQ.responses.filter(r => r.groupName !== "Tim Perumus").map((resp) => {
                const isSubmitted = resp.status === "Disetor" || resp.status === "Disahkan";
                const isRevising = revisingGroups[resp.groupName] || false;

                return (
                  <div 
                    key={resp.groupId}
                    className={`bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6 transition-all ${
                      resp.isReferensiUtama 
                        ? "ring-2 ring-emerald-500/60 bg-emerald-50/10 shadow-md" 
                        : "hover:border-slate-350"
                    }`}
                  >
                    {/* Header Kelompok */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-3.5 h-3.5 rounded-full ${isSubmitted ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}></span>
                        <span className="text-base sm:text-lg font-black text-slate-900">{resp.groupName}</span>
                        {resp.isReferensiUtama && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-250 flex items-center gap-1.5 shadow-sm">
                            <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Referensi Utama
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm border ${
                        resp.status === "Disetor"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : resp.status === "Revisi"
                          ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"
                          : resp.status === "Disahkan"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {resp.status}
                      </span>
                    </div>

                    {/* Draf Argumentasi */}
                    <div className="space-y-3">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest block font-mono">
                        Draf Argumentasi Kelompok:
                      </span>
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-200 text-justify">
                        {resp.text || <span className="italic text-slate-400">Belum ada draf argumentasi yang dimasukkan kelompok...</span>}
                      </p>
                    </div>

                    {/* Citations List */}
                    {resp.citations && resp.citations.length > 0 && (
                      <div className="space-y-4 pt-2" id={`citations-container-${resp.groupId}`}>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block font-mono">
                          Kutipan Dalil Disematkan:
                        </span>
                        <div className="space-y-4">
                          {resp.citations.map((c) => (
                            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm" id={`citation-item-${c.id}`}>
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5 font-mono">
                                  📖 {c.kitab}
                                </span>
                              </div>
                              
                              {c.arabicText && (
                                <div className="my-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                  <div 
                                    className="font-serif text-xl sm:text-2xl leading-loose text-right text-slate-900 font-bold pr-3 border-r-2 border-emerald-600/40" 
                                    dir="rtl"
                                  >
                                    {c.arabicText}
                                  </div>
                                </div>
                              )}
                              
                              {c.translation && (
                                <p className="text-sm sm:text-base text-slate-750 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-200 italic text-justify">
                                  Artinya: "{c.translation}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Component Catatan Pelurusan Diskusi */}
                    <div className="border-t border-slate-150 pt-5">
                      <EvaluationNoteBox
                        groupName={resp.groupName}
                        initialNote={resp.evaluationNote || ""}
                        onSave={handleSaveEvaluationNote}
                      />
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-6 flex justify-end items-center gap-3 pt-4 border-t border-slate-150">
                      <button
                        type="button"
                        onClick={() => handleTogglePrimaryReference(resp.groupName)}
                        className={`text-xs sm:text-sm font-bold flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-sm active:scale-95 ${
                          resp.isReferensiUtama 
                            ? "text-emerald-800 bg-emerald-50 border-emerald-300 shadow-sm" 
                            : "text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${resp.isReferensiUtama ? "fill-emerald-600 text-emerald-600" : "text-slate-400"}`} />
                        <span>{resp.isReferensiUtama ? "Referensi Utama (Aktif)" : "Tandai Referensi Utama"}</span>
                      </button>

                      {resp.status === "Disetor" && (
                        <button
                          type="button"
                          disabled={isRevising}
                          onClick={() => handleReturnWithLoading(resp.groupName)}
                          className="text-xs sm:text-sm text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl border border-rose-200 font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 active:scale-95"
                        >
                          {isRevising ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-rose-700" />
                              <span>Membuka Edit...</span>
                            </>
                          ) : (
                            <>
                              <Undo className="w-4 h-4" />
                              <span>Buka Edit (Revisi)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PENYUSUNAN NATIJAH */}
        {activeSubTab === "natijah" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Penyusunan Natijah 
              </h3>
              <p className="text-xs text-slate-400 mt-1">Tim Perumus merumuskan keputusan akhir resmi yang mewakili kesepakatan mufakat.</p>
            </div>

            {/* Status Info */}
            <div className="p-5 bg-emerald-50 border border-emerald-250 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-1.5 shadow-sm">
              <span className="font-black text-emerald-950 block">Panduan Penyusunan Natijah:</span>
              <p className="text-slate-650 font-normal leading-relaxed text-justify">
                Tuliskan formulasi kesimpulan hukum syara' yang ringkas, berbobot, dan lugas. Teks ini akan disetor ke Dewan Mushohih untuk dikoreksi dan disahkan melalui ketuk palu sidang.
              </p>
            </div>

            {/* Natijah Text Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                Naskah Draft Natijah Akhir (Kesimpulan Global)
              </label>
              <textarea
                rows={10}
                disabled={isLocked}
                placeholder="Ketikkan kesimpulan hukum resmi dari mufakat musyawarah di sini..."
                value={natijahText}
                onChange={(e) => setNatijahText(e.target.value)}
                className="w-full text-sm sm:text-base border border-slate-300 rounded-2xl p-5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all leading-relaxed font-medium shadow-inner"
              />
            </div>

            {!isLocked ? (
              <button
                type="button"
                onClick={handleSetorNatijah}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-800/10 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Natijah Akhir ke Dewan Mushohih</span>
              </button>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-250 text-rose-900 rounded-2xl text-xs sm:text-sm text-center font-bold flex items-center justify-center gap-2 shadow-sm">
                <Lock className="w-5 h-5" />
                <span>DEKRET TELAH DISAHKAN - FORM NATIJAH DIKUNCI PERMANEN</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FORM KIRIM JAWABAN (Dedicated to Tim Perumus/Muharrir only) */}
        {activeSubTab === "kirim-jawaban" && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                Lembar Kerja Jawaban Tim Perumus (Muharrir)
              </h3>
              <p className="text-xs text-slate-400">Tulis teks argumentasi hukum komprehensif dan sematkan kutipan dalil resmi yang mewakili hasil perumusan sidang.</p>
            </div>

            {/* Main Argumentation Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                Naskah Argumentasi Hukum Perumus (Muharrir) <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <textarea
                rows={8}
                placeholder="Ketik pokok pikiran, kesimpulan hukum syara, serta penjelasan argumen perumusan resmi di sini..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full text-sm sm:text-base border border-slate-300 rounded-2xl p-5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all leading-relaxed font-medium shadow-inner"
                required
              />
            </div>

            {/* Citations List for Tim Perumus */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                Kutipan Rujukan Kitab Kuning Tim Perumus
              </h4>

              {activeGroupResp?.citations && activeGroupResp.citations.length > 0 ? (
                <div className="space-y-4">
                  {activeGroupResp.citations.map((c) => (
                    <div key={c.id} className="border border-slate-200 p-6 rounded-2xl bg-white space-y-4 relative group shadow-sm hover:shadow-md transition-shadow">
                      <div 
                        className="font-serif text-right text-slate-900 pr-3 border-r-4 border-emerald-550 leading-loose font-bold" 
                        style={{ fontSize: "1.5rem", direction: "rtl" }}
                      >
                        {c.arabicText}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="pr-4 leading-relaxed">
                          <strong className="text-emerald-700 font-extrabold">({c.kitab}):</strong> "{c.translation}"
                        </span>
                        <div className="flex items-center gap-3.5 shrink-0 border-l border-slate-200 pl-4">
                          <button
                            type="button"
                            onClick={() => handleStartEditMubahhisCitation?.(c.id, c.kitab, c.arabicText, c.translation)}
                            className={`text-xs font-bold transition-all ${
                              mubahhisEditingCitId === c.id
                                ? "text-amber-600 font-extrabold"
                                : "text-slate-500 hover:text-emerald-600"
                            }`}
                          >
                            {mubahhisEditingCitId === c.id ? "Sedang Diedit" : "Edit"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMubahhisCitation(c.id)}
                            className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-400 italic text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Belum ada referensi kitab kuning disematkan. Gunakan form di bawah untuk menambah rujukan.
                </p>
              )}
            </div>

            {/* Add Citation Subform */}
            <form 
              onSubmit={handleAddMubahhisCitation} 
              className="border-t border-slate-100 pt-6 space-y-5"
            >
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                {mubahhisEditingCitId ? (
                  <>
                    <Edit className="w-5 h-5 text-amber-600" />
                    <span className="text-amber-800">Edit Kutipan Kitab Kuning</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-emerald-600" />
                    <span>Sematkan Kutipan Kitab Kuning Baru</span>
                  </>
                )}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Nama Kitab <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Fathul Qarib"
                    value={kitabName}
                    onChange={(e) => setKitabName(e.target.value)}
                    className="w-full text-sm border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-950 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Juz <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2"
                    value={juzKe}
                    onChange={(e) => setJuzKe(e.target.value)}
                    className="w-full text-sm border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-955 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Halaman <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 142"
                    value={halamanBerapa}
                    onChange={(e) => setHalamanBerapa(e.target.value)}
                    className="w-full text-sm border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-955 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Pengarang <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibnu Qasim"
                    value={karanganSiapa}
                    onChange={(e) => setKaranganSiapa(e.target.value)}
                    className="w-full text-sm border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-955 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Pilihan Hukum <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Boleh, Haram, Makruh"
                    value={statusHukum}
                    onChange={(e) => setStatusHukum(e.target.value)}
                    className="w-full text-sm border border-slate-355 rounded-xl px-4 py-2.5 bg-white text-slate-950 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                    required
                  />
                </div>
          
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Terjemahan Indonesia <span className="text-slate-400 font-normal lowercase ml-1">(opsional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ketik substansi terjemah kalimat..."
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    className="w-full text-sm sm:text-base border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-955 font-normal leading-relaxed focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 resize-y shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between font-mono">
                  <span>Kutipan Teks Arab <span className="text-rose-500 font-bold ml-0.5">*</span></span>
                  <span className="text-emerald-600 italic font-bold">Wajib Berharakat</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Masukkan tulisan teks arab..."
                  value={arabicText}
                  onChange={(e) => setArabicText(e.target.value)}
                  className="w-full text-base sm:text-lg border border-slate-350 rounded-xl p-4 bg-white font-arabic text-right leading-loose focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                  style={{ fontSize: "1.5rem", direction: "rtl" }}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className={`flex-1 text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 ${
                    mubahhisEditingCitId 
                      ? "bg-amber-600 hover:bg-amber-700" 
                      : "bg-slate-900 hover:bg-slate-955"
                  }`}
                >
                  {mubahhisEditingCitId ? "Simpan Perubahan Rujukan" : "Simpan & Tambahkan Rujukan Kitab"}
                </button>
                {mubahhisEditingCitId && (
                  <button
                    type="button"
                    onClick={handleCancelEditMubahhisCitation}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold py-3.5 px-6 rounded-xl transition-all border border-slate-200 active:scale-95 shadow-sm"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleSaveMubahhisDraft(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all border border-slate-200 active:scale-95 shadow-sm"
              >
                Simpan Sebagai Draf
              </button>
              <button
                type="button"
                onClick={() => handleSaveMubahhisDraft(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Simpan & Setor Jawaban</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
