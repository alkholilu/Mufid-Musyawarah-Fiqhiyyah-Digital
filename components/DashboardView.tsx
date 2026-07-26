import React, { useEffect, useState } from "react";
import { supabase } from "../src/config/supabaseClient";
import { 
  ShieldAlert, 
  Database, 
  Users, 
  Activity, 
  Plus, 
  RefreshCw, 
  ExternalLink,
  BookOpen,
  TrendingUp,
  FileDown
} from "lucide-react";
import { AuditLog } from "../types";

interface DashboardViewProps {
  questionsCount: number;
  usersCount: number;
  isAdminOverride: boolean;
  setIsAdminOverride: (val: boolean) => void;
  activeGroup: string;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({
  questionsCount,
  usersCount,
  isAdminOverride,
  setIsAdminOverride,
  activeGroup,
  auditLogs,
  setAuditLogs,
  setActiveTab
}: DashboardViewProps) {

  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Gagal memuat audit log:", err);
    }
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('realtime-forensic-logs')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'audit_logs' }, 
        (payload) => {
          console.log("Realtime audit log insert detected:", payload);
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-8 font-sans antialiased">
      
      {/* Alert Override Ribbon if Admin Override is Active */}
      {isAdminOverride && (
        <div className="bg-amber-600 text-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300 animate-pulse">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Mode Intervensi Aktif</p>
              <p className="text-xs text-amber-100 font-medium mt-0.5">Bertindak Sebagai {activeGroup.toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdminOverride(false)}
            className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/20 transition-colors cursor-pointer"
          >
            Matikan Override
          </button>
        </div>
      )}

      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-zinc-900 tracking-tight">
            Mufid Control Center
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Forensik audit, statistik partisipasi, dan kendali sidang Musyawarah Fiqhiyyah Digital secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="flex items-center space-x-2 bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 text-xs font-bold px-4 py-3 rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
            <span>Refresh Log</span>
          </button>
          <button 
            onClick={() => setActiveTab("bahtsul")}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Buka Sidang Forum</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Statistics (Unified Colors) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-[0_12px_30px_-15px_rgba(24,24,27,0.02)] hover:shadow-[0_15px_35px_-15px_rgba(24,24,27,0.04)] transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Masalah Sidang</p>
            <p className="text-3xl font-display font-bold text-zinc-900">{questionsCount}</p>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Semua Terdistribusi</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Database className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-[0_12px_30px_-15px_rgba(24,24,27,0.02)] hover:shadow-[0_15px_35px_-15px_rgba(24,24,27,0.04)] transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pengguna Terdaftar</p>
            <p className="text-3xl font-display font-bold text-zinc-900">{usersCount}</p>
            <p className="text-xs text-zinc-500 font-semibold">Sertifikasi Mushohih & Muharrir</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-50 text-zinc-600 flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-[0_12px_30px_-15px_rgba(24,24,27,0.02)] hover:shadow-[0_15px_35px_-15px_rgba(24,24,27,0.04)] transition-all duration-300">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Kelompok Aktif</p>
            <p className="text-3xl font-display font-bold text-zinc-900">8 <span className="text-xs text-emerald-600 font-bold ml-1">• Aktif</span></p>
            <p className="text-xs text-zinc-500 font-semibold">Sinkronisasi Real-Time</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50/50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Forensic Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_45px_-15px_rgba(24,24,27,0.02)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-zinc-50/40">
          <h2 className="text-lg font-display font-bold text-zinc-900">Forensic Audit Log</h2>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Mencatat mutasi status dan entri referensi persidangan secara real-time.</p>
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/40 border-b border-slate-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-4 px-6">WAKTU</th>
                <th className="py-4 px-6">OPERATOR</th>
                <th className="py-4 px-6">PERAN</th>
                <th className="py-4 px-6">AKSI</th>
                <th className="py-4 px-6">KETERANGAN PERUBAHAN DATA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log, idx) => {
                let badgeClass = "bg-zinc-100 text-zinc-800 border-zinc-200/60";
                if (log.aksi === "UPDATE") badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                if (log.aksi === "STATUS") badgeClass = "bg-zinc-100 text-emerald-800 border-emerald-200";
                if (log.aksi === "INSERT") badgeClass = "bg-emerald-100/60 text-emerald-900 border-emerald-200";
                if (log.aksi === "OVERRIDE" || log.aksi === "DELETE") badgeClass = "bg-amber-50 text-amber-700 border-amber-100";

                return (
                  <tr key={log.id} className={`transition-colors hover:bg-zinc-50/40 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="py-4 px-6 font-mono text-zinc-500">
                      {log.created_at ? new Date(log.created_at).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : '-'}
                    </td>
                    <td className="py-4 px-6 font-bold text-zinc-800">{log.nama_operator}</td>
                    <td className="py-4 px-6 font-semibold text-zinc-500">{log.peran_operator}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                        {log.aksi}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-600 max-w-md truncate lg:max-w-xl font-medium" title={log.keterangan_perubahan}>
                      {log.keterangan_perubahan}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {logs.map((log) => {
            let badgeClass = "bg-zinc-100 text-zinc-800 border-zinc-200/60";
            if (log.aksi === "UPDATE") badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
            if (log.aksi === "STATUS") badgeClass = "bg-zinc-100 text-emerald-800 border-emerald-200";
            if (log.aksi === "INSERT") badgeClass = "bg-emerald-100/60 text-emerald-900 border-emerald-200";
            if (log.aksi === "OVERRIDE" || log.aksi === "DELETE") badgeClass = "bg-amber-50 text-amber-700 border-amber-100";

            return (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-400">
                    {log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}
                  </span>
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                    {log.aksi}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-800">
                    {log.nama_operator} <span className="text-[10px] font-normal text-zinc-500">({log.peran_operator})</span>
                  </h4>
                  <p className="text-xs text-zinc-500 leading-normal font-medium">{log.keterangan_perubahan}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 text-center bg-zinc-50/20">
          <p className="text-[11px] text-zinc-400 font-semibold">
            Menampilkan {logs.length} entri log audit terhangat
          </p>
        </div>
      </div>

      {/* Info Banner Section about Islamic Scholarship Workflow */}
      <div className="bg-zinc-50 border border-slate-200/50 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h3 className="font-bold text-zinc-800 flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            1. Perumusan Masalah (Asilah)
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Panitia merumuskan kronologi masalah hukum kontemporer (Waqi'iyyah) dan mendistribusikannya sebagai rancangan masalah resmi.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-zinc-800 flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            2. Musyawarah & Referensi Teks
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Delegasi pondok pesantren (Mubahhisin) menyodorkan jawaban ilmiah beserta rujukan teks Arab suci (Amiri, Min. 24px) dari kitab kuning standar.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-zinc-800 flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            3. Pentashihan & Keabsahan Fatwa
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
            Dewan Mushohih meneliti ketepatan kesimpulan hukum dan teks dalil sebelum disahkan ("Disahkan") dan diekspor dalam format dokumen PDF final.
          </p>
        </div>
      </div>
    </div>
  );
}
