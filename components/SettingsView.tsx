import React from "react";
import { 
  Settings, 
  ShieldAlert, 
  Trash2, 
  RefreshCw, 
  Database,
  CheckCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface SettingsViewProps {
  isAdminOverride: boolean;
  setIsAdminOverride: (val: boolean) => void;
  activeGroup: string;
  setActiveGroup: (val: string) => void;
  resetAllData: () => void;
  clearAuditLogs: () => void;
}

export default function SettingsView({
  isAdminOverride,
  setIsAdminOverride,
  activeGroup,
  setActiveGroup,
  resetAllData,
  clearAuditLogs
}: SettingsViewProps) {

  const groupOptions = [
    "Kelompok 1",
    "Kelompok 2",
    "Kelompok 3",
    "Kelompok 4",
    "Kelompok 5"
  ];

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
          System Settings & Control
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Atur parameter simulasi, intervensi delegasi, dan pemeliharaan database Mufid.
        </p>
      </div>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: Mode Intervensi Otoritas (Admin Override) */}
        <div className="bg-white rounded-lg border border-border-hairline shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border-hairline bg-slate-50 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-display font-bold text-slate-900 text-sm">Mode Intervensi Otoritas</h3>
          </div>
          
          <div className="p-6 space-y-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              Ketika diaktifkan, administrator utama bertindak langsung atas nama delegasi pondok pesantren pilihan di bawah untuk memasukkan pendapat, argumentasi, atau rujukan draf secara kilat.
            </p>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase">Status Intervensi</span>
              <button 
                type="button"
                onClick={() => setIsAdminOverride(!isAdminOverride)}
                className="focus:outline-none"
              >
                {isAdminOverride ? (
                  <ToggleRight className="w-12 h-8 text-amber-600" />
                ) : (
                  <ToggleLeft className="w-12 h-8 text-slate-400" />
                )}
              </button>
            </div>

            {/* Group selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Bertindak Sebagai Delegasi:</label>
              <select
                disabled={!isAdminOverride}
                value={activeGroup}
                onChange={(e) => setActiveGroup(e.target.value)}
                className={`w-full text-xs border border-border-hairline rounded bg-white px-3 py-2.5 text-slate-950 font-semibold ${
                  !isAdminOverride ? 'opacity-50 cursor-not-allowed' : 'border-amber-400 bg-amber-50/20'
                }`}
              >
                {groupOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Panel 2: Database Maintenance */}
        <div className="bg-white rounded-lg border border-border-hairline shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border-hairline bg-slate-50 flex items-center space-x-2">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-slate-900 text-sm">Pemeliharaan Basis Data</h3>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Utilitas administrasi untuk mereset seluruh data state lokal kembali ke pengaturan pabrik (default draf rujukan), atau menghapus log audit forensik.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin mereset seluruh database pengguna, dokumen, dan asilah kembali ke data awal? Semua perubahan baru akan hilang.")) {
                    resetAllData();
                    alert("Seluruh database berhasil di-reset ke nilai default!");
                  }
                }}
                className="w-full flex items-center justify-center space-x-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 rounded transition-all"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>Reset Database ke Nilai Awal</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin mengosongkan seluruh riwayat log audit forensik? Tindakan ini tidak dapat dibatalkan.")) {
                    clearAuditLogs();
                    alert("Seluruh log audit forensik berhasil dibersihkan!");
                  }
                }}
                className="w-full flex items-center justify-center space-x-2 border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold py-2.5 rounded transition-all"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Kosongkan Forensic Audit Log</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
