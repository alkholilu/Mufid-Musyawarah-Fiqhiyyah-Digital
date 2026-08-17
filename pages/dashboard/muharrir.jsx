import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { supabase } from '../../src/config/supabaseClient';
import Sidebar from '../../components/Sidebar';
import BahtsulMasail from '../../components/BahtsulMasail';
import ArsipDigital from '../../components/ArsipDigital';
import { Loader2, CheckCircle2 } from 'lucide-react';

/* ───────────── LOADING SCREEN ───────────── */
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
        </div>
        <p className="mt-4 text-sm font-bold text-emerald-800">Memuat Dashboard Muharrir...</p>
      </div>
    </div>
  );
}

export default function MuharrirDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Data
  const [masalahList, setMasalahList] = useState([]);
  const [allJawaban, setAllJawaban] = useState([]);

  // UI State
  const [activeTab, setActiveTab] = useState('muharrir-monitoring'); // 'muharrir-monitoring' | 'muharrir-natijah' | 'muharrir-kirim' | 'arsip'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Fetch Masalah List
  const fetchMasalah = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('masalah_sidang')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMasalahList(data || []);
    } catch (err) {
      console.error('Error fetching masalah:', err);
      if (err.message?.includes('fetch') || err.message?.includes('TypeError')) {
        setError('Koneksi database terputus. Gagal memuat daftar masalah sidang.');
      }
    }
  }, []);

  // Fetch All Jawaban from all groups
  const fetchAllJawaban = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jawaban')
        .select(`
          id,
          masalah_id,
          argumen_indo,
          dalil_arab,
          nama_kitab,
          juz_ke,
          halaman_berapa,
          karangan_siapa,
          status_hukum,
          referensi_terpilih,
          catatan_analisis_perumus,
          kesimpulan_global_rumusan,
          kelompok_id,
          status,
          terjemahan_indo,
          excluded_from_pdf,
          citations_json,
          kelompok:kelompok_id ( id, nama_kelompok )
        `)
        .order('kelompok_id', { ascending: true });

      if (error) throw error;
      setAllJawaban(data || []);
    } catch (err) {
      console.error('Error fetching all jawaban:', err);
      if (err.message?.includes('fetch') || err.message?.includes('TypeError')) {
        setError('Koneksi database terputus. Gagal memuat data jawaban sidang.');
      }
    }
  }, []);

  // Auth Guard
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          if (isMounted) setLoading(false);
          window.location.href = '/Login';
          return;
        }

        if (isMounted) setSession(currentSession);

        const res = await fetch('/api/getProfile', {
          headers: { Authorization: `Bearer ${currentSession.access_token}` }
        });
        if (!res.ok) throw new Error('Profile fetch failed');
        const data = await res.json();

        if (data.roles?.nama_role !== 'Muharrir') {
          window.location.href = '/Login';
          return;
        }
        if (isMounted) setProfile(data);

        await Promise.all([
          fetchMasalah(),
          fetchAllJawaban()
        ]);
      } catch (err) {
        console.error('Auth error:', err);
        window.location.href = '/Login';
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT' || (!currentSession && event !== 'INITIAL_SESSION')) {
        if (isMounted) {
          setSession(null);
          setProfile(null);
          setLoading(false);
          window.location.href = '/Login';
        }
      }
    });

    return () => {
      isMounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchMasalah, fetchAllJawaban]);

  /* Heartbeat interval untuk menjaga sesi & mencegah login ganda */
  useEffect(() => {
    if (!session?.access_token) return;

    const sendHeartbeat = async () => {
      try {
        const res = await fetch('/api/auth-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'heartbeat',
            session_id: session.access_token,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn('Heartbeat check failed:', err.error);
          if (res.status === 401 || res.status === 409) {
            alert('Sesi Anda telah diakhiri atau akun di-login dari perangkat lain.');
            await supabase.auth.signOut();
            window.location.href = '/Login';
          }
        }
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const handleLogout = async () => {
    if (session?.access_token) {
      await fetch('/api/auth-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'release',
          session_id: session.access_token,
        }),
      }).catch(() => {});
    }
    await supabase.auth.signOut();
    window.location.href = '/Login';
  };

  // Realtime subscriptions
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('muharrir-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'masalah_sidang' }, () => {
        fetchMasalah();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jawaban' }, () => {
        fetchAllJawaban();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Log Audit Helper
  const logAudit = async (action, desc, jawabanId = null) => {
    if (!profile) return;
    try {
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        nama_operator: profile.nama_lengkap,
        peran_operator: 'Muharrir',
        aksi: action,
        keterangan_perubahan: desc,
        jawaban_id: jawabanId
      });
    } catch (err) {
      console.error('Audit log error:', err);
    }
  };

  // Map database data to Question structures
  const getMappedQuestions = () => {
    return masalahList.map(m => {
      const responses = allJawaban
        .filter(j => j.masalah_id === m.id)
        .map(j => {
          const formattedKitab = j.nama_kitab ? `${j.nama_kitab}, Juz ${j.juz_ke || '-'}, Hal. ${j.halaman_berapa || '-'} (Karya: ${j.karangan_siapa || '-'}) [Hukum: ${j.status_hukum || '-'}]` : '';
          
          // Load citations from citations_json if present, otherwise fallback to legacy columns
          const finalCitations = (() => {
            if (j.citations_json && Array.isArray(j.citations_json) && j.citations_json.length > 0) {
              return j.citations_json.map(c => ({
                id: c.id,
                kitab: c.kitab,
                arabicText: c.arabicText,
                translation: c.translation,
                namaKitab: c.namaKitab || '',
                juzKe: c.juzKe || '',
                halamanBerapa: c.halamanBerapa || '',
                karanganSiapa: c.karanganSiapa || '',
                statusHukum: c.statusHukum || 'Boleh',
                excludedFromPdf: c.excludedFromPdf || false
              }));
            }
            return (j.dalil_arab || j.nama_kitab) ? [
              {
                id: `cit-${j.id}`,
                kitab: formattedKitab,
                arabicText: j.dalil_arab || '',
                translation: j.terjemahan_indo || '',
                namaKitab: j.nama_kitab || '',
                juzKe: j.juz_ke || '',
                halamanBerapa: j.halaman_berapa || '',
                karanganSiapa: j.karangan_siapa || '',
                statusHukum: j.status_hukum || 'Boleh',
                excludedFromPdf: j.excluded_from_pdf || false
              }
            ] : [];
          })();

          return {
            groupId: j.id,
            groupName: (() => {
              if (j.kelompok_id === null || j.kelompok_id === 'g-perumus' || j.kelompok_id === 'Tim Perumus') return 'Tim Perumus';
              return j.kelompok?.nama_kelompok || `Kelompok ${j.kelompok_id}`;
            })(),
            text: j.argumen_indo || '',
            citations: finalCitations,
            status: m.status_sidang === 'Selesai' ? 'Disahkan' : (j.status || 'Draft'),
            isReferensiUtama: j.referensi_terpilih || false,
            evaluationNote: j.catatan_analisis_perumus || ''
          };
        });

      // Find the Natijah from the responses in the database
      const responseWithNatijah = allJawaban.find(j => j.masalah_id === m.id && j.kesimpulan_global_rumusan);
      const finalFatwa = responseWithNatijah?.kesimpulan_global_rumusan || m.final_fatwa || m.kesimpulan_global_rumusan || '';

      return {
        id: m.id,
        title: m.judul_pembahasan,
        status: m.status_sidang,
        categories: [m.kategori_masalah],
        year: m.tahun_sidang,
        waqiIyyah: m.deskripsi_masalah,
        asilah: m.soal_pertanyaan,
        finalFatwa: finalFatwa,
        responses: responses
      };
    });
  };

  // Intercept state changes to sync with Supabase
  const handleSetQuestions = async (updater) => {
    const currentMapped = getMappedQuestions();
    const nextQuestions = typeof updater === 'function' ? updater(currentMapped) : updater;

    for (const nextQ of nextQuestions) {
      const prevQ = currentMapped.find(q => q.id === nextQ.id);
      if (!prevQ) continue;

      // 1. Check if final fatwa/natijah was updated
      if (nextQ.finalFatwa !== prevQ.finalFatwa || nextQ.status !== prevQ.status) {
        try {
          // Update status in masalah_sidang (and final_fatwa if present)
          const { error: statusError } = await supabase
            .from('masalah_sidang')
            .update({
              status_sidang: nextQ.status,
              final_fatwa: nextQ.finalFatwa
            })
            .eq('id', nextQ.id);

          if (statusError) {
            // Retry update without final_fatwa column in case schema doesn't have it on masalah_sidang
            await supabase
              .from('masalah_sidang')
              .update({
                status_sidang: nextQ.status
              })
              .eq('id', nextQ.id);
          }

          // Check if any jawaban row exists for this masalah_id
          const { data: existingJawaban } = await supabase
            .from('jawaban')
            .select('id')
            .eq('masalah_id', nextQ.id);

          if (existingJawaban && existingJawaban.length > 0) {
            const { error: natijahError } = await supabase
              .from('jawaban')
              .update({
                kesimpulan_global_rumusan: nextQ.finalFatwa
              })
              .eq('masalah_id', nextQ.id);

            if (natijahError) throw natijahError;
          } else {
            // Insert new Tim Perumus jawaban row containing Natijah
            const { error: insertError } = await supabase
              .from('jawaban')
              .insert({
                masalah_id: nextQ.id,
                kelompok_id: null,
                kesimpulan_global_rumusan: nextQ.finalFatwa,
                argumen_indo: nextQ.finalFatwa,
                status: 'Disetor'
              });

            if (insertError) throw insertError;
          }

          await logAudit('SETOR_NATIJAH', `Menyetor draf Natijah untuk masalah: ${nextQ.title}`);
          showToast('Sukses! Natijah akhir dikirim ke Dewan Mushohih.', 'success');
          await Promise.all([fetchMasalah(), fetchAllJawaban()]);
        } catch (err) {
          showToast(err.message, 'error');
        }
      }

      // 2. Check changes in group responses
      if (nextQ.responses && prevQ.responses) {
        for (const nextResp of nextQ.responses) {
          const prevResp = prevQ.responses.find(r => r.groupId === nextResp.groupId) || 
                           prevQ.responses.find(r => r.groupName === nextResp.groupName);

          // If this is a new response created locally by Muharrir Panel (e.g. Tim Perumus)
          if (!prevResp) {
            // Skip placeholders to avoid infinite loops and duplicate rows
            const isPlaceholder = nextResp.text?.startsWith("Keputusan hukum awal yang disusun oleh Tim Perumus");
            if (!nextResp.text || isPlaceholder) {
               continue;
            }
            // INSERT Tim Perumus response
            if (nextResp.groupName === 'Tim Perumus') {
              const cit = nextResp.citations?.[0] || {};
              try {
                const { data, error } = await supabase
                  .from('jawaban')
                  .insert({
                    masalah_id: nextQ.id,
                    kelompok_id: null,
                    nama_kitab: cit.namaKitab || '',
                    juz_ke: cit.juzKe || '',
                    halaman_berapa: cit.halamanBerapa || '',
                    karangan_siapa: cit.karanganSiapa || '',
                    status_hukum: cit.statusHukum || 'Boleh',
                    dalil_arab: cit.arabicText || '',
                    terjemahan_indo: cit.translation || '',
                    argumen_indo: nextResp.text || '',
                    referensi_terpilih: false,
                    status: nextResp.status || 'Disetor',
                    citations_json: nextResp.citations || []
                  })
                  .select()
                  .single();

                if (error) throw error;
                await logAudit('INSERT_JAWABAN_PERUMUS', `Membuat draf jawaban Tim Perumus untuk masalah ${nextQ.title}`);
                showToast('Draf jawaban Tim Perumus berhasil disimpan.', 'success');
                fetchAllJawaban();
              } catch (err) {
                showToast(err.message, 'error');
              }
            }
            continue;
          }

          // Check if toggled Primary Reference
          if (nextResp.isReferensiUtama !== prevResp.isReferensiUtama) {
            try {
              if (nextResp.isReferensiUtama) {
                // Reset all other responses for this masalah
                await supabase
                  .from('jawaban')
                  .update({ referensi_terpilih: false })
                  .eq('masalah_id', nextQ.id);

                // Set this response as primary
                const { error } = await supabase
                  .from('jawaban')
                  .update({ referensi_terpilih: true })
                  .eq('id', nextResp.groupId);

                if (error) throw error;
                showToast(`Referensi utama diatur ke kelompok ${nextResp.groupName}`, 'success');
              } else {
                const { error } = await supabase
                  .from('jawaban')
                  .update({ referensi_terpilih: false })
                  .eq('id', nextResp.groupId);

                if (error) throw error;
                showToast('Referensi utama dinonaktifkan.', 'success');
              }
              await logAudit('TOGGLE_REFERENSI_UTAMA', `Mengubah status referensi utama untuk ${nextResp.groupName} pada ${nextQ.title}`);
              fetchAllJawaban();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }

          // Helper to check if ID is a valid database record ID (not client mock string like 'gp-1' or 'g-resp-')
          const isRealDbId = (id) => {
            if (!id) return false;
            const str = String(id);
            return !str.startsWith('gp-') && !str.startsWith('g-resp-') && !str.startsWith('cit-');
          };

          // Check if evaluationNote was updated
          if (nextResp.evaluationNote !== prevResp.evaluationNote) {
            try {
              if (isRealDbId(nextResp.groupId)) {
                const { error } = await supabase
                  .from('jawaban')
                  .update({ catatan_analisis_perumus: nextResp.evaluationNote })
                  .eq('id', nextResp.groupId);

                if (error) throw error;
                await logAudit('ADD_CATATAN_EVALUASI', `Menyimpan catatan evaluasi untuk ${nextResp.groupName}: "${nextResp.evaluationNote}"`);
                showToast(`Catatan evaluasi ${nextResp.groupName} berhasil disimpan.`, 'success');
                fetchAllJawaban();
              }
            } catch (err) {
              console.error('Error saving evaluation note:', err);
              showToast(err.message || 'Gagal menyimpan catatan evaluasi.', 'error');
            }
          }

          // Check if status was updated (e.g. Return to Revision)
          if (nextResp.status !== prevResp.status) {
            try {
              if (nextResp.status === 'Revisi') {
                // Update status_sidang in masalah_sidang to 'Dimulai'
                const { error: statusErr } = await supabase
                  .from('masalah_sidang')
                  .update({ status_sidang: 'Dimulai' })
                  .eq('id', nextQ.id);

                if (statusErr) throw statusErr;

                // Optionally update status in jawaban table if real record exists
                if (isRealDbId(nextResp.groupId)) {
                  await supabase
                    .from('jawaban')
                    .update({ status: 'Revisi' })
                    .eq('id', nextResp.groupId);
                }

                await logAudit('CHANGE_STATUS_JAWABAN', `Mengubah status sidang masalah ${nextQ.title} kembali menjadi Dimulai (Revisi)`);
                showToast(`Status sidang berhasil diubah ke 'Dimulai' (Revisi) untuk kelompok ${nextResp.groupName}.`, 'success');
                await fetchMasalah();
                await fetchAllJawaban();
              } else {
                if (isRealDbId(nextResp.groupId)) {
                  const { error: statusErr } = await supabase
                    .from('jawaban')
                    .update({ status: nextResp.status })
                    .eq('id', nextResp.groupId);

                  if (statusErr) throw statusErr;
                  await logAudit('CHANGE_STATUS_JAWABAN', `Mengubah status jawaban ${nextResp.groupName} menjadi ${nextResp.status}`);
                  fetchAllJawaban();
                }
              }
            } catch (err) {
              console.error('Error changing status to revision:', err);
              showToast(err.message || 'Gagal membuka gembok edit.', 'error');
            }
          }
          // Check if perumus edits their own response content
          if (nextResp.groupName === 'Tim Perumus') {
            if (
              nextResp.text !== prevResp.text ||
              JSON.stringify(nextResp.citations) !== JSON.stringify(prevResp.citations)
            ) {
              try {
                const nextCit = nextResp.citations?.[0] || { kitab: '', arabicText: '', translation: '', excludedFromPdf: false };
                const { error } = await supabase
                  .from('jawaban')
                  .update({
                    nama_kitab: nextCit.namaKitab || nextCit.kitab || '',
                    juz_ke: nextCit.juzKe || '',
                    halaman_berapa: nextCit.halamanBerapa || '',
                    karangan_siapa: nextCit.karanganSiapa || '',
                    status_hukum: nextCit.statusHukum || 'Boleh',
                    dalil_arab: nextCit.arabicText || '',
                    terjemahan_indo: nextCit.translation || '',
                    argumen_indo: nextResp.text || '',
                    citations_json: nextResp.citations || [],
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', nextResp.groupId);

                if (error) throw error;
                await logAudit('UPDATE_JAWABAN_PERUMUS', `Mengubah draf jawaban Tim Perumus untuk masalah ${nextQ.title}`);
                fetchAllJawaban();
              } catch (err) {
                showToast(err.message, 'error');
              }
            }
          }
        }
      }
    }
  };

  if (loading) return <LoadingScreen />;
  if (!profile) return null;

  const mappedQuestions = getMappedQuestions();

  // Determine forced sub-tab for BahtsulMasail component based on Sidebar's activeTab
  let forcedSubTab = 'monitoring';
  if (activeTab === 'muharrir-monitoring') forcedSubTab = 'monitoring';
  if (activeTab === 'muharrir-natijah') forcedSubTab = 'muharrir-natijah';
  if (activeTab === 'muharrir-kirim') forcedSubTab = 'kirim-jawaban';

  return (
    <>
      <Head>
        <title>Dashboard Perumus (Muharrir) - Mufid</title>
      </Head>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdminOverride={false}
          activeGroup=""
          user={{
            fullName: profile.nama_lengkap,
            email: profile.email,
            role: 'Muharrir',
            group: 'Tim Perumus',
          }}
          onLogout={handleLogout}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Header Mobile Toggle */}
          <div className="sticky top-0 z-30 min-[1440px]:hidden flex items-center justify-between bg-white border-b border-slate-100 px-6 py-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="text-slate-650 font-bold text-xs bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl"
            >
              Menu
            </button>
            <span className="text-xs font-black text-slate-800">Mufid Portal</span>
          </div>

          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-semibold text-sm">{error}</p>
                  <p className="text-xs text-rose-600 mt-0.5">Sistem mendeteksi pemutusan koneksi atau server database tidak merespon. Pengambilan data otomatis dihentikan untuk mencegah overload.</p>
                </div>
              </div>
            )}
            {notification && (
              <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md text-white rounded-2xl shadow-2xl border p-4 flex items-center gap-3 transition-all duration-300 animate-toast-in animate-bounce-subtle ${
                notification.type === 'error' 
                  ? 'bg-rose-900 border-rose-700/50 shadow-rose-950/40' 
                  : 'bg-emerald-900 border-emerald-700/50 shadow-emerald-950/40'
              }`}>
                <div className={`p-2.5 rounded-xl shrink-0 border ${
                  notification.type === 'error' ? 'bg-rose-800 text-rose-300 border-rose-700' : 'bg-emerald-800 text-emerald-300 border-emerald-700'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <h4 className={`text-xs font-bold tracking-wider uppercase font-mono ${
                    notification.type === 'error' ? 'text-rose-200' : 'text-emerald-200'
                  }`}>
                    Pemberitahuan
                  </h4>
                  <p className="text-xs text-white font-medium leading-relaxed">{notification.message}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setNotification(null)}
                  className="text-emerald-300 hover:text-white text-sm font-bold p-1 hover:bg-emerald-800 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
            )}

            {activeTab !== 'arsip' ? (
              <BahtsulMasail
                questions={mappedQuestions}
                setQuestions={handleSetQuestions}
                addAuditLog={logAudit}
                isAdminOverride={false}
                activeGroup="Tim Perumus"
                userRole="Muharrir"
                userGroup="Tim Perumus"
                forcedSubTab={forcedSubTab}
              />
            ) : (
              <ArsipDigital
                questions={mappedQuestions}
                userRole="Muharrir"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
