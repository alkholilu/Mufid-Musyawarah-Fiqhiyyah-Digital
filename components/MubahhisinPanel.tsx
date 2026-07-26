import React from "react";
import { Users, AlertTriangle, Plus, Send, Lock, Edit } from "lucide-react";
import { Question, GroupResponse } from "../types";

interface MubahhisinPanelProps {
  currentQ: Question;
  mubahhisGroup: string;
  setMubahhisGroup: (val: string) => void;
  userRole?: "Admin" | "Mubahhisin" | "Muharrir" | "Mushohih";
  activeGroupResp?: GroupResponse;
  mubahhisStatus: "Draft" | "Revisi" | "Disetor" | "Disahkan";
  isMubahhisLocked: boolean;
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
  mubahhisEditingCitId?: string | null;
  handleStartEditMubahhisCitation?: (citId: string, kitab: string, arabic: string, trans: string) => void;
  handleCancelEditMubahhisCitation?: () => void;
}

export default function MubahhisinPanel({
  currentQ,
  mubahhisGroup,
  setMubahhisGroup,
  userRole,
  activeGroupResp,
  mubahhisStatus,
  isMubahhisLocked,
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
  mubahhisEditingCitId,
  handleStartEditMubahhisCitation,
  handleCancelEditMubahhisCitation
}: MubahhisinPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Lembar Kerja Jawaban Delegasi
          </h3>
          <p className="text-xs text-slate-400">Tulis teks argumentasi hukum dan sematkan dalil harakat Arab.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Kelompok Anda:</span>
          {userRole === "Mubahhisin" ? (
            <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-250 select-none">
              {mubahhisGroup}
            </span>
          ) : (
            <select
              value={mubahhisGroup}
              onChange={(e) => setMubahhisGroup(e.target.value)}
              className="text-sm font-bold text-slate-700 bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {defaultGroups.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Status banner based on currentQ.status */}
      {currentQ.status === "Persiapan" && (
        <div className="bg-yellow-50 border border-yellow-250 text-yellow-800 p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm">
          <span>⏳ Status: Persiapan Panitia. Form input dalil kelompok belum dibuka oleh Admin.</span>
        </div>
      )}
      {currentQ.status === "Dimulai" && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm">
          <span>🟢 Sidang Telah Dimulai! Silakan ketik dan setor dalil dari kelompok Anda.</span>
        </div>
      )}
      {currentQ.status === "Perumusan" && (
        <div className="bg-orange-50 border border-orange-250 text-orange-850 p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm">
          <span>🕒 Status: Tahap Perumusan. Form input dalil kelompok telah ditutup oleh Admin.</span>
        </div>
      )}
      {(currentQ.status === "Selesai" || currentQ.status === "Disahkan") && (
        <div className="bg-slate-100 border border-slate-250 text-slate-700 p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm">
          <span>✅ Status: Sidang Selesai. Hasil keputusan resmi telah disahkan oleh Dewan Mushohih.</span>
        </div>
      )}

      {/* Display Muharrir Evaluation if any */}
      {activeGroupResp?.evaluationNote && (
        <div className="bg-amber-50 border border-amber-250 text-amber-950 p-5 rounded-2xl text-xs sm:text-sm space-y-1.5 shadow-sm">
          <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs text-amber-800 flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-4 h-4" />
            Catatan Pelurusan Diskusi dari Muharrir (Perumus):
          </span>
          <p className="font-semibold italic text-slate-800">"{activeGroupResp.evaluationNote}"</p>
        </div>
      )}

      {/* Status Ribbon */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium">
        <span className="font-bold text-slate-500">Status Jawaban Kelompok Anda:</span>
        <span className={`text-[10px] sm:text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm border ${
          mubahhisStatus === "Disetor"
            ? "bg-blue-50 text-blue-800 border-blue-200"
            : mubahhisStatus === "Revisi"
            ? "bg-rose-50 text-rose-700 border-rose-255 animate-pulse"
            : "bg-amber-50 text-amber-800 border-amber-200"
        }`}>
          {mubahhisStatus}
        </span>
      </div>

      {/* Main Response Input */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
          Naskah Argumentasi Hukum Kelompok <span className="text-rose-500 font-bold ml-0.5">*</span>
        </label>
        <textarea
          rows={6}
          disabled={isMubahhisLocked}
          placeholder="Ketik pokok pikiran, kesimpulan hukum syara, serta penjelasan argumen kelompok Anda..."
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          className={`w-full text-sm sm:text-base border border-slate-300 rounded-2xl p-5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all leading-relaxed shadow-inner ${
            isMubahhisLocked ? "bg-slate-50/80 cursor-not-allowed opacity-75" : ""
          }`}
          required
        />
      </div>

      {/* Citations List for Group */}
      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
          Kutipan Rujukan Kitab Kuning Anda
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
                  {!isMubahhisLocked && (
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
                  )}
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

      {/* Add Citation Form if NOT Locked */}
      {!isMubahhisLocked ? (
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
                <span>Tambah Kutipan Kitab Kuning</span>
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
                className="w-full text-sm border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-950 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
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
                className="w-full text-sm border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-950 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
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
                className="w-full text-sm border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-950 font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 shadow-sm"
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
                className="w-full text-sm sm:text-base border border-slate-350 rounded-xl px-4 py-2.5 bg-white text-slate-950 font-normal leading-relaxed focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 resize-y shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between font-mono">
              <span>Kutipan Teks Arab (Font Amiri ≥ 24px) <span className="text-rose-500 font-bold ml-0.5">*</span></span>
              <span className="text-emerald-600 italic font-bold">Wajib Berharakat</span>
            </label>
            <textarea
              rows={3}
              placeholder="Masukkan tulisan Arab kitab suci..."
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
              {mubahhisEditingCitId ? "Simpan Perubahan Rujukan" : "Tambahkan Rujukan Kitab"}
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
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl text-center text-sm text-emerald-800 flex items-center justify-center gap-2 shadow-sm font-medium">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            Formulir draf jawaban dikunci permanen karena berstatus <strong className="uppercase font-extrabold">{mubahhisStatus}</strong>.
          </span>
        </div>
      )}

      {/* Action Save/Submit */}
      {!isMubahhisLocked && (
        <div className="flex gap-3 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleSaveMubahhisDraft(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold py-3.5 rounded-xl transition-all border border-slate-200 active:scale-95 shadow-sm"
          >
            Simpan Draf Kelompok
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
      )}
    </div>
  );
}
