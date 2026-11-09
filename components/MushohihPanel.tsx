import React, { useState, useEffect, useRef } from "react";
import { Scale, Star, CheckCircle2, Loader2, FileText, BookOpen, ChevronDown, ChevronUp, Plus, Eye, EyeOff } from "lucide-react";
import { Question } from "../types";
import { supabase } from "../src/config/supabaseClient";

interface MushohihPanelProps {
  currentQ: Question;
  isLocked: boolean;
  mushohihSubTab: "mubahhisin" | "citations" | "natijah" | "ketuk";
  setMushohihSubTab: (tab: "mubahhisin" | "citations" | "natijah" | "ketuk") => void;
  editingGroupId: string | null;
  setEditingGroupId: (id: string | null) => void;
  groupEditText: string;
  setGroupEditText: (text: string) => void;
  handleMushohihSaveGroupText: (groupId: string, newText: string) => void;
  handleMushohihSetStatus: (groupId: string, newStatus: "Draft" | "Revisi" | "Disetor" | "Disahkan", note?: string) => void;
  handleMushohihSetPrimary: (groupId: string) => void;
  editingCitationId: string | null;
  setEditingCitationId: (id: string | null) => void;
  editKitab: string;
  setEditKitab: (text: string) => void;
  editArabic: string;
  setEditArabic: (text: string) => void;
  editTranslation: string;
  setEditTranslation: (text: string) => void;
  handleSaveInlineCitation: (groupId: string) => void;
  handleMushohihDeleteCitation: (groupId: string, citId: string) => void;
  newCitGroupId: string;
  setNewCitGroupId: (id: string) => void;
  newCitKitab: string;
  setNewCitKitab: (text: string) => void;
  newCitArabic: string;
  setNewCitArabic: (text: string) => void;
  newCitTranslation: string;
  setNewCitTranslation: (text: string) => void;
  handleMushohihAddCitation: (groupId: string, kitab: string, arabic: string, translation: string) => void;
  natijahText: string;
  setNatijahText: (text: string) => void;
  mushohihNote: string;
  setMushohihNote: (text: string) => void;
  handleKetukPalu: () => void;
  gavelStruck: boolean;
  hideSubTabs?: boolean;
}

export default function MushohihPanel({
  currentQ,
  isLocked,
  mushohihSubTab,
  setMushohihSubTab,
  editingGroupId,
  setEditingGroupId,
  groupEditText,
  setGroupEditText,
  handleMushohihSaveGroupText,
  handleMushohihSetStatus,
  handleMushohihSetPrimary,
  editingCitationId,
  setEditingCitationId,
  editKitab,
  setEditKitab,
  editArabic,
  setEditArabic,
  editTranslation,
  setEditTranslation,
  handleSaveInlineCitation,
  handleMushohihDeleteCitation,
  newCitGroupId,
  setNewCitGroupId,
  newCitKitab,
  setNewCitKitab,
  newCitArabic,
  setNewCitArabic,
  newCitTranslation,
  setNewCitTranslation,
  handleMushohihAddCitation,
  natijahText,
  setNatijahText,
  mushohihNote,
  setMushohihNote,
  handleKetukPalu,
  gavelStruck,
  hideSubTabs = false
}: MushohihPanelProps) {
  // Local state for Koreksi Natijah editor
  const [draftNatijah, setDraftNatijah] = useState(natijahText || currentQ.finalFatwa || "");
  const [isSavingNatijah, setIsSavingNatijah] = useState(false);
  const [isSavedNatijah, setIsSavedNatijah] = useState(false);
  const isDirtyNatijah = useRef(false);

  // Live state for Ketuk Palu Sidang sub-menu preview
  const [naskahFinalPalu, setNaskahFinalPalu] = useState(natijahText || currentQ.finalFatwa || "");
  const [showKetukCitEditor, setShowKetukCitEditor] = useState(true);

  // Synchronize draftNatijah if natijahText or currentQ changes externally
  useEffect(() => {
    if (!isDirtyNatijah.current) {
      const initial = natijahText || currentQ.finalFatwa || "";
      setDraftNatijah(initial);
      setNaskahFinalPalu(initial);
    }
  }, [natijahText, currentQ.id, currentQ.finalFatwa]);

  // Realtime channel for Ketuk Palu Sidang sub-menu: Sync live update from masalah_sidang and jawaban table
  useEffect(() => {
    const idMasalahAktif = currentQ?.id;
    if (!idMasalahAktif) return;

    // Fetch initial Natijah from database for Palu menu
    const fetchNatijahForPalu = async () => {
      try {
        const { data: jData } = await supabase
          .from('jawaban')
          .select('kesimpulan_global_rumusan')
          .eq('masalah_id', idMasalahAktif)
          .not('kesimpulan_global_rumusan', 'is', null)
          .limit(1)
          .maybeSingle();

        if (jData && jData.kesimpulan_global_rumusan) {
          const text = jData.kesimpulan_global_rumusan;
          setNaskahFinalPalu(text);
          if (!isDirtyNatijah.current) {
            setDraftNatijah(text);
            setNatijahText(text);
          }
        } else if (currentQ.finalFatwa) {
          setNaskahFinalPalu(currentQ.finalFatwa);
          if (!isDirtyNatijah.current) {
            setDraftNatijah(currentQ.finalFatwa);
            setNatijahText(currentQ.finalFatwa);
          }
        }
      } catch (err) {
        console.error("Error fetching Natijah for Palu:", err);
      }
    };

    fetchNatijahForPalu();

    // Attach Supabase Realtime Listener
    const channelPalu = supabase
      .channel(`sync-palu-sidang-${idMasalahAktif}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'masalah_sidang',
          filter: `id=eq.${idMasalahAktif}`
        },
        () => {
          fetchNatijahForPalu();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jawaban',
          filter: `masalah_id=eq.${idMasalahAktif}`
        },
        (payload) => {
          const newData = payload.new as Record<string, any> | null;
          if (newData && newData.kesimpulan_global_rumusan) {
            setNaskahFinalPalu(newData.kesimpulan_global_rumusan);
            if (!isDirtyNatijah.current) {
              setDraftNatijah(newData.kesimpulan_global_rumusan);
              setNatijahText(newData.kesimpulan_global_rumusan);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelPalu);
    };
  }, [currentQ?.id]);

  // Debounce 1000ms Auto-Save for Koreksi Natijah
  useEffect(() => {
    if (!isDirtyNatijah.current || !currentQ?.id) return;

    const timer = setTimeout(async () => {
      await saveNatijahToSupabase(draftNatijah);
    }, 1000);

    return () => clearTimeout(timer);
  }, [draftNatijah, currentQ?.id]);

  const saveNatijahToSupabase = async (newText: string) => {
    if (!currentQ?.id) return;
    setIsSavingNatijah(true);
    try {
      // 1. Update masalah_sidang
      const { error: err1 } = await supabase
        .from('masalah_sidang')
        .update({
          kesimpulan_global_rumusan: newText,
          final_fatwa: newText
        })
        .eq('id', currentQ.id);

      if (err1) {
        // Fallback update if final_fatwa column doesn't exist
        await supabase
          .from('masalah_sidang')
          .update({
            kesimpulan_global_rumusan: newText
          })
          .eq('id', currentQ.id);
      }

      // 2. ALSO update jawaban table
      await supabase
        .from('jawaban')
        .update({
          kesimpulan_global_rumusan: newText
        })
        .eq('masalah_id', currentQ.id);

      // Instantly update local & parent state
      setNatijahText(newText);
      setNaskahFinalPalu(newText);
      setIsSavedNatijah(true);
      isDirtyNatijah.current = false;
      setTimeout(() => setIsSavedNatijah(false), 2500);
    } catch (err) {
      console.error("Gagal menyimpan Natijah:", err);
    } finally {
      setIsSavingNatijah(false);
    }
  };

  const handleManualSaveNatijah = async () => {
    await saveNatijahToSupabase(draftNatijah);
  };

  return (
    <div className="bg-white rounded-2xl border border-border-hairline shadow-sm overflow-hidden p-5 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600 animate-pulse" />
            Otoritas Pentashihan & Koreksi Mushohih
          </h3>
          <p className="text-[11px] text-slate-400">Mushohih memegang kekuasaan penuh untuk merevisi dan mensahkan sidang.</p>
        </div>
        <span className="text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-xl uppercase tracking-wider self-start sm:self-center">
          Dewan Mushohih
        </span>
      </div>

      {/* Status Banner */}
      <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-amber-800 space-y-1">
        <p className="font-bold">🔑 OTORITAS TERTINGGI AKTIF (BYPASS KUNCI):</p>
        <p className="text-slate-600 font-normal leading-relaxed">
          Anda memiliki wewenang untuk merevisi teks arab rujukan, naskah mubahhisin, draf natijah perumus, serta mengubah status kelayakan draf.
        </p>
      </div>

      {/* Mushohih Workspace Tabs */}
      {!hideSubTabs && (
        <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setMushohihSubTab("mubahhisin")}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              mushohihSubTab === "mubahhisin"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            📂 Jawaban Kelompok ({currentQ.responses?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setMushohihSubTab("citations")}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              mushohihSubTab === "citations"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            📚 Kitab Kuning
          </button>
          <button
            type="button"
            onClick={() => setMushohihSubTab("natijah")}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              mushohihSubTab === "natijah"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            ✍️ Koreksi Natijah
          </button>
          <button
            type="button"
            onClick={() => setMushohihSubTab("ketuk")}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              mushohihSubTab === "ketuk"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            ⚖️ Ketuk Palu Sidang
          </button>
        </div>
      )}

      {/* TAB CONTENT 1: JAWABAN KELOMPOK */}
      {mushohihSubTab === "mubahhisin" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Daftar Hasil Jawaban Delegasi:</span>
            <span className="text-xs text-slate-400 italic">Klik tombol aksi untuk mengedit atau mengesahkan langsung</span>
          </div>

          <div className="space-y-4">
            {currentQ.responses && currentQ.responses.map((resp) => {
              const isEditing = editingGroupId === resp.groupId;
              return (
                <div key={resp.groupId} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-slate-800">{resp.groupName}</span>
                      {resp.isReferensiUtama && (
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-emerald-250 shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          Referensi Utama
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border shadow-sm ${
                        resp.status === "Disahkan" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                        resp.status === "Disetor" ? "bg-blue-50 border-blue-200 text-blue-700" :
                        resp.status === "Revisi" ? "bg-rose-50 border-rose-200 text-rose-700" :
                        "bg-slate-100 border-slate-250 text-slate-700"
                      }`}>
                        {resp.status}
                      </span>
                    </div>
                  </div>

                  {/* Item Answer Text */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        rows={6}
                        disabled={isLocked}
                        value={groupEditText}
                        onChange={(e) => setGroupEditText(e.target.value)}
                        className="w-full text-sm sm:text-base border border-slate-350 rounded-xl p-4 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-normal leading-relaxed shadow-inner"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingGroupId(null)}
                          className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleMushohihSaveGroupText(resp.groupId, groupEditText);
                            setEditingGroupId(null);
                          }}
                          className="text-xs font-bold bg-[#038543] hover:bg-[#026c36] text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                        >
                          ✓ Simpan Koreksi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal text-justify">
                        {resp.text}
                      </p>
                      {resp.evaluationNote && (
                        <p className="text-xs sm:text-sm text-rose-600 bg-rose-50 border border-rose-200 p-3.5 rounded-xl font-mono leading-relaxed">
                          <strong>Catatan Koreksi:</strong> {resp.evaluationNote}
                        </p>
                      )}
                      
                      {!isLocked && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGroupId(resp.groupId);
                              setGroupEditText(resp.text);
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                          >
                            ✏️ Koreksi Teks Jawaban
                          </button>
                          {resp.status !== "Disahkan" && (
                            <button
                              type="button"
                              onClick={() => handleMushohihSetStatus(resp.groupId, "Disahkan")}
                              className="text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                            >
                              ✓ Sahkan
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleMushohihSetPrimary(resp.groupId)}
                            className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all shadow-sm ${
                              resp.isReferensiUtama
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                                : "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {resp.isReferensiUtama ? "★ Referensi Utama (Aktif)" : "★ Jadikan Referensi Utama"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: KITAB KUNING CITATIONS */}
      {mushohihSubTab === "citations" && (
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono block border-b border-slate-100 pb-3">Koreksi Referensi Kitab Yang Tersemat:</span>
            
            <div className="space-y-6">
              {currentQ.responses && currentQ.responses.map((resp) => {
                const hasCits = resp.citations && resp.citations.length > 0;
                if (!hasCits) return null;

                return (
                  <div key={`cit-group-${resp.groupId}`} className="space-y-3 border-l-4 border-slate-200 pl-4">
                    <span className="text-xs font-black text-slate-500 block tracking-wider uppercase font-mono">
                      RUJUKAN MILIK {resp.groupName.toUpperCase()}
                    </span>

                    {resp.citations.map((cit) => {
                      const isEditingCit = editingCitationId === cit.id;
                      return (
                        <div key={cit.id} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                          {isEditingCit ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Nama Kitab & Juz/Halaman"
                                value={editKitab}
                                onChange={(e) => setEditKitab(e.target.value)}
                                className="w-full text-sm bg-white border border-slate-300 p-3 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                              <textarea
                                placeholder="Teks Arab Kitab (RTL)"
                                value={editArabic}
                                onChange={(e) => setEditArabic(e.target.value)}
                                className="w-full text-base sm:text-lg bg-white border border-slate-300 p-3 rounded-lg text-slate-800 font-arabic text-right leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                style={{ direction: "rtl" }}
                                rows={3}
                              />
                              <textarea
                                placeholder="Terjemahan Bahasa Indonesia"
                                value={editTranslation}
                                onChange={(e) => setEditTranslation(e.target.value)}
                                className="w-full text-sm sm:text-base bg-white border border-slate-300 p-3 rounded-lg text-slate-800 font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCitationId(null)}
                                  className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
                                >
                                  Batal
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineCitation(resp.groupId)}
                                  className="text-xs font-bold bg-[#038543] hover:bg-[#026c36] text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                                >
                                  ✓ Simpan Koreksi
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="font-serif text-right text-slate-900 leading-loose text-xl sm:text-2xl font-bold pr-3 border-r-4 border-emerald-500" style={{ direction: "rtl" }}>
                                {cit.arabicText}
                              </p>
                              <p className="text-sm sm:text-base text-slate-850 leading-relaxed font-normal text-justify">
                                <strong className="text-emerald-700 font-extrabold font-mono text-xs sm:text-sm mr-1">({cit.kitab}):</strong> {cit.translation}
                              </p>
                              {!isLocked && (
                                <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCitationId(cit.id);
                                      setEditKitab(cit.kitab);
                                      setEditArabic(cit.arabicText);
                                      setEditTranslation(cit.translation);
                                    }}
                                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm("Apakah anda yakin ingin menghapus referensi ini?")) {
                                        handleMushohihDeleteCitation(resp.groupId, cit.id);
                                      }
                                    }}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
                                  >
                                    🗑️ Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Emergency Citation Section */}
          {!isLocked && (
            <div className="p-6 sm:p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono block">⚠️ TAMBAH RUJUKAN DARURAT OLEH MUSHOhiH:</span>
              
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">PILIH DELEGASI TARGET PENERIMA RUJUKAN:</label>
                <select
                  value={newCitGroupId}
                  onChange={(e) => setNewCitGroupId(e.target.value)}
                  className="w-full text-sm border border-slate-350 p-3 rounded-xl bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">-- Pilih Kelompok Target --</option>
                  {currentQ.responses?.map((r) => (
                    <option key={r.groupId} value={r.groupId}>{r.groupName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">Nama Kitab Kuning / Juz:</label>
                <input
                  type="text"
                  placeholder="Contoh: Fathul Qorib, Juz 1, Hal 23"
                  value={newCitKitab}
                  onChange={(e) => setNewCitKitab(e.target.value)}
                  className="text-sm border border-slate-350 p-3 rounded-xl bg-white text-slate-800 w-full font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">Teks Arab Dalil (RTL):</label>
                <textarea
                  placeholder="Teks Arab Dalil..."
                  value={newCitArabic}
                  onChange={(e) => setNewCitArabic(e.target.value)}
                  className="w-full text-base sm:text-lg border border-slate-350 p-3 rounded-xl bg-white text-right font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-loose"
                  style={{ direction: "rtl" }}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Terjemahan Bahasa Indonesia <span className="text-slate-400 font-normal lowercase ml-1">(opsional)</span>:
                </label>
                <textarea
                  placeholder="Terjemahan (opsional)..."
                  value={newCitTranslation}
                  onChange={(e) => setNewCitTranslation(e.target.value)}
                  className="w-full text-sm sm:text-base border border-slate-355 p-3 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed font-normal"
                  rows={3}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newCitGroupId || !newCitKitab || !newCitArabic) {
                    alert("Harap lengkapi target kelompok, nama Kitab, dan teks Arab!");
                    return;
                  }
                  handleMushohihAddCitation(newCitGroupId, newCitKitab, newCitArabic, newCitTranslation);
                  // Reset fields
                  setNewCitKitab("");
                  setNewCitArabic("");
                  setNewCitTranslation("");
                  setNewCitGroupId("");
                }}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                ✓ Sisipkan Referensi Otoritatif
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: KOREKSI NATIJAH */}
      {mushohihSubTab === "natijah" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="space-y-1">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider block flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                KOREKSI NASKAH DRAFT NATIJAH (KESIMPULAN GLOBAL)
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Hasil ini dirumuskan oleh Muharrir. Sebagai Mushohih, Anda dapat merevisi teks ini secara bebas dan langsung menyimpannya ke database.
              </p>
            </div>

            {isSavingNatijah && (
              <span className="text-xs text-amber-600 font-bold flex items-center gap-1.5 animate-pulse bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-250 shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
              </span>
            )}
            {isSavedNatijah && !isSavingNatijah && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-250 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan ke Database
              </span>
            )}
          </div>

          <textarea
            rows={10}
            disabled={isLocked}
            value={draftNatijah}
            onChange={(e) => {
              setDraftNatijah(e.target.value);
              setNatijahText(e.target.value);
              isDirtyNatijah.current = true;
            }}
            className="w-full text-sm sm:text-base border border-slate-300 rounded-2xl p-5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all font-medium leading-relaxed shadow-inner"
            placeholder="Tuliskan draf Natijah resmi..."
          />

          {!isLocked && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleManualSaveNatijah}
                disabled={isSavingNatijah}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {isSavingNatijah ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>💾 Simpan Perubahan Redaksi</span>
                  </>
                )}
              </button>
            </div>
          )}

          <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium text-center leading-relaxed">
            ℹ️ Perubahan pada kolom ini akan disinkronkan secara <strong>REAL-TIME</strong> langsung ke sub-menu <strong>Ketuk Palu Sidang</strong> dan Lembar Cetak
          </p>
        </div>
      )}

      {/* TAB CONTENT 4: KETUK PALU & CATATAN (MOCK PDF SCROLL PREVIEW) */}
      {mushohihSubTab === "ketuk" && (
        <div className="space-y-6">
          <style dangerouslySetInnerHTML={{ __html: `
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #e2e8f0;
              border-radius: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #64748b;
              border-radius: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #475569;
            }
          ` }} />

          {/* MODUL PENYELARAS & FORM EDITOR REFERENSI FINAL PDF */}
          {(() => {
            const fromResponses = (currentQ.responses || []).flatMap(r => (r.citations || []).map(c => ({ ...c, groupId: r.groupId })));
            const fromFallback = (currentQ.arabicCitations || []).map(c => ({ ...c, groupId: currentQ.responses?.[0]?.groupId || "g1" }));
            const combined = [...fromResponses, ...fromFallback];
            const activeCitations = combined.filter((c, idx, self) =>
              idx === self.findIndex(t => (t.kitab || "") === (c.kitab || "") && (t.arabicText || "") === (c.arabicText || ""))
            );

            return (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-display">
                      <BookOpen className="w-5 h-5 text-emerald-600 shrink-0" />
                      Penyelaras & Form Editor Referensi Final PDF
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Sunting, tambah, atau hapus rujukan dalil secara langsung. Perubahan akan ber-efek <strong>REAL-TIME</strong> pada lembar A4 di bawah ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKetukCitEditor(!showKetukCitEditor)}
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-all shrink-0 flex items-center gap-2 shadow-xs active:scale-95"
                  >
                    {showKetukCitEditor ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Sembunyikan Form Editor</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Buka Form Editor ({activeCitations.length} Rujukan)</span>
                      </>
                    )}
                  </button>
                </div>

                {showKetukCitEditor && (
                  <div className="space-y-6 animate-fade-in">
                    {/* 1. DAFTAR DALIL TERSEMAT & ACTIONS */}
                    <div className="space-y-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono block">
                        Daftar Dalil Tersemat ({activeCitations.length}):
                      </span>

                      {activeCitations.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">
                          Belum ada rujukan dalil yang tersemat pada masalah ini. Gunakan form di bawah untuk menambahkan dalil final.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {activeCitations.map((cit, idx) => {
                            const isEditing = editingCitationId === cit.id;
                            const targetGroupId = (cit as any).groupId || currentQ.responses?.[0]?.groupId || "g1";

                            return (
                              <div key={cit.id || idx} className="p-5 bg-slate-50/80 border border-slate-250 rounded-2xl space-y-3 shadow-xs hover:border-slate-300 transition-all">
                                {isEditing ? (
                                  <div className="space-y-3 bg-white p-5 rounded-2xl border border-emerald-300 shadow-sm">
                                    <div className="space-y-1">
                                      <label className="text-xs font-bold text-slate-500 font-mono">NAMA KITAB & RUJUKAN:</label>
                                      <input
                                        type="text"
                                        placeholder="Nama Kitab & Juz/Halaman"
                                        value={editKitab}
                                        onChange={(e) => setEditKitab(e.target.value)}
                                        className="w-full text-sm bg-white border border-slate-300 p-3 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs font-bold text-slate-500 font-mono">TEKS ARAB DALIL (RTL):</label>
                                      <textarea
                                        placeholder="Teks Arab Kitab (RTL)"
                                        value={editArabic}
                                        onChange={(e) => setEditArabic(e.target.value)}
                                        className="w-full text-base sm:text-lg bg-white border border-slate-300 p-3 rounded-xl text-slate-900 font-arabic text-right leading-loose focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        style={{ direction: "rtl" }}
                                        rows={3}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs font-bold text-slate-500 font-mono">TERJEMAHAN BAHASA INDONESIA:</label>
                                      <textarea
                                        placeholder="Terjemahan Bahasa Indonesia"
                                        value={editTranslation}
                                        onChange={(e) => setEditTranslation(e.target.value)}
                                        className="w-full text-sm bg-white border border-slate-300 p-3 rounded-xl text-slate-800 font-normal leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCitationId(null)}
                                        className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveInlineCitation(targetGroupId)}
                                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                                      >
                                        Simpan Perubahan
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm font-extrabold text-emerald-800 font-serif italic">
                                          ({cit.kitab || `Kitab ${idx + 1}`})
                                        </span>
                                        {cit.excludedFromPdf ? (
                                          <span className="text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                                            <EyeOff className="w-3 h-3 text-rose-600" /> Disembunyikan dari Cetakan A4
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tampil di Lembar Cetak A4
                                          </span>
                                        )}
                                      </div>
                                      {!isLocked && (
                                        <div className="flex items-center gap-3">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingCitationId(cit.id);
                                              setEditKitab(cit.kitab);
                                              setEditArabic(cit.arabicText);
                                              setEditTranslation(cit.translation);
                                            }}
                                            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                                          >
                                            ✏️ Edit Teks
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleMushohihDeleteCitation(targetGroupId, cit.id)}
                                            className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                              cit.excludedFromPdf 
                                                ? "text-emerald-700 hover:text-emerald-900" 
                                                : "text-amber-700 hover:text-amber-900"
                                            }`}
                                          >
                                            {cit.excludedFromPdf ? (
                                              <>
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Tampilkan di PDF</span>
                                              </>
                                            ) : (
                                              <>
                                                <EyeOff className="w-3.5 h-3.5" />
                                                <span>Sembunyikan dari Cetakan A4</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <p className={`font-serif text-right leading-loose text-lg sm:text-xl font-bold pr-3 border-r-4 ${cit.excludedFromPdf ? "text-slate-400 border-slate-300 opacity-60" : "text-slate-950 border-emerald-600"}`} style={{ direction: "rtl" }}>
                                      {cit.arabicText}
                                    </p>
                                    {cit.translation && (
                                      <p className={`text-xs sm:text-sm leading-relaxed font-normal italic ${cit.excludedFromPdf ? "text-slate-400 opacity-60" : "text-slate-800"}`}>
                                        Artinya: "{cit.translation}"
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>


                  </div>
                )}
              </div>
            );
          })()}

          {/* 1. KUNCI CONTAINER PRATINJAU AGAR BISA DI-SCROLL (FIXED SCROLL BOX WITH CONTRAST BACKGROUND) */}
          <div className="max-h-[700px] overflow-y-auto border border-gray-300 rounded-xl p-4 sm:p-8 bg-slate-100 custom-scrollbar shadow-inner flex flex-col items-center">
            
            {/* 2. LEMBAR KERTAS HVS A4 PUTIH YANG SEBENARNYA (SINGLE UNIFIED CLEAN WHITE PAPER SHEET) */}
            <div 
              style={{ backgroundColor: '#ffffff', color: '#09090b', opacity: 1, minHeight: '1100px', flexShrink: 0 }}
              className="bg-white text-gray-950 shadow-2xl border border-gray-200 p-12 mx-auto my-6 w-full max-w-[850px] rounded-sm font-serif flex flex-col justify-start space-y-8 relative opacity-100 shrink-0"
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
                  {currentQ.title}
                </h1>
                <p style={{ color: '#64748b' }} className="text-xs !text-slate-500 font-sans mt-1">
                  Kategori: {currentQ.categories?.join(", ") || "Fiqhiyyah"} | Tahun Sidang: {currentQ.year || "2026"}
                </p>
              </div>

              {/* Deskripsi Masalah (Waqi'iyyah) */}
              {currentQ.waqiIyyah && (
                <div className="space-y-2">
                  <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
                    DESKRIPSI MASALAH:
                  </h3>
                  <div style={{ color: '#0f172a' }} className="text-sm !text-slate-900 leading-relaxed font-serif text-justify indent-8 space-y-2">
                    {currentQ.waqiIyyah.split("\n").map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Soal Pertanyaan (Asilah) */}
              {currentQ.asilah && (
                <div className="space-y-2">
                  <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
                    SOAL:
                  </h3>
                  <div style={{ color: '#0f172a' }} className="text-sm !text-slate-900 leading-relaxed font-serif space-y-2 pl-4">
                    {currentQ.asilah.split("\n").map((aLine, aIdx) => (
                      <p key={aIdx}>{aLine}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* JAWABAN / NATIJAH FINAL (Rendered directly and cleanly without box) */}
              <div className="space-y-2">
                <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
                  JAWABAN:
                </h3>
                <div style={{ color: '#0f172a' }} className="text-sm !text-slate-900 leading-relaxed font-serif text-justify whitespace-pre-line">
                  {naskahFinalPalu || draftNatijah || natijahText || currentQ.finalFatwa || (
                    <span className="italic text-slate-500 font-normal">Belum ada natijah yang dirumuskan oleh Muharrir...</span>
                  )}
                </div>
              </div>

              {/* Horizontal Divider Line */}
              <hr className="border-t border-gray-300 my-4" />

              {/* REFERENSI KITAB RUJUKAN */}
              <div className="space-y-4">
                <h3 style={{ color: '#09090b' }} className="text-sm font-bold uppercase tracking-wider font-serif">
                  REFERENSI KITAB RUJUKAN:
                </h3>

                {(() => {
                  const fromResponses = (currentQ.responses || []).flatMap(r => r.citations || []);
                  const fromFallback = currentQ.arabicCitations || [];
                  const combined = [...fromResponses, ...fromFallback];
                  const citationsList = combined
                    .filter(c => !c.excludedFromPdf)
                    .filter((c, idx, self) =>
                      idx === self.findIndex(t => (t.kitab || "") === (c.kitab || "") && (t.arabicText || "") === (c.arabicText || ""))
                    );

                  if (citationsList.length === 0) {
                    return <p className="text-xs text-slate-500 italic">Belum ada referensi kitab kuning yang tersemat.</p>;
                  }

                  return (
                    <div className="space-y-8">
                      {citationsList.map((cit, idx) => (
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
                  );
                })()}
              </div>

              {/* Footer Lembar Cetak Kertas HVS */}
              <div style={{ borderColor: '#cbd5e1', color: '#64748b' }} className="pt-8 border-t border-slate-300 text-center text-[10px] !text-slate-500 font-sans flex justify-between uppercase font-semibold mt-auto">
                <span>Halaman 1 dari 1</span>
                <span>Platform Digital MUFID</span>
              </div>
            </div>
          </div>

          {/* 4. TOMBOL VALIDASI KETUK PALU (DI LUAR KOTAK SCROLL PDF) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Supervisory Notes */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Catatan Resmi Pentashih Dewan Mushohih:
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={mushohihNote}
                onChange={(e) => setMushohihNote(e.target.value)}
                placeholder="Masukkan maklumat tambahan, dekret khusus, atau penjelasan legalitas fatwa..."
                className="w-full text-xs border border-slate-300 rounded-xl p-3 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Row Tombol Aksi Kontras */}
            {!isLocked ? (
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleKetukPalu}
                  className={`w-full text-white text-xs font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                    gavelStruck ? "bg-amber-600 animate-bounce" : "bg-emerald-600 hover:bg-emerald-700 animate-pulse"
                  }`}
                >
                  <Scale className="w-5 h-5 shrink-0" />
                  <span>{gavelStruck ? "⚡ MENGETUK PALU SIDANG..." : "⚖️ SAHKAN & KETUK PALU SIDANG"}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold">
                  SIDANG TELAH DISAHKAN - SELURUH AKSES DIKUNCI SECARA PERMANEN
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
