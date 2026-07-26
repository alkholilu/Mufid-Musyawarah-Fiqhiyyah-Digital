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
        <p className="mt-4 text-sm font-bold text-emerald-800">Memuat Dashboard Mubahhisin...</p>
      </div>
    </div>
  );
}

export default function MubahhitsinDashboard() {
  /* ── Auth & Profile ── */
  const [profile, setProfile] = useState(null);
  const [kelompok, setKelompok] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  /* ── Data ── */
  const [masalahList, setMasalahList] = useState([]);
  const [jawabanMap, setJawabanMap] = useState({}); // masalah_id -> jawaban record
  const [allJawaban, setAllJawaban] = useState([]);

  /* ── Navigation ── */
  const [activeTab, setActiveTab] = useState('bahtsul'); // 'bahtsul' | 'arsip'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /* ── Toast helper ── */
  const [notification, setNotification] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  /* ─────────────────────────────────────────────
     1. LOGIKA FETCH DRAF AMAN DENGAN MAYBESINGLE()
     Mencegah Error PGRST116 'Cannot coerce the result to a single JSON object'
  ───────────────────────────────────────────── */
  const fetchCurrentDraft = useCallback(async (idMasalahAktif, kelompokId) => {
    if (!idMasalahAktif || !kelompokId) return null;
    try {
      const { data: drafLama, error } = await supabase
        .from('jawaban')
        .select('*')
        .eq('masalah_id', idMasalahAktif)
        .eq('kelompok_id', kelompokId)
        .maybeSingle(); // MENGGUNAKAN INI AGAR AMAN JIKA DATA MASIH 0 BARIS

      if (error) {
        console.error("Gagal memuat draf:", error.message);
        return null;
      }
      return drafLama;
    } catch (err) {
      console.error("Error fetching current draft:", err.message);
      return null;
    }
  }, []);

  /* ─────────────────────────────────────────────
     AUTH CHECK & INITIAL DATA FETCH
  ───────────────────────────────────────────── */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          window.location.href = '/Login';
          return;
        }
        setSession(currentSession);

        // Fetch profile via API
        const res = await fetch('/api/getProfile', {
          headers: { Authorization: `Bearer ${currentSession.access_token}` },
        });
        if (!res.ok) throw new Error('Profile fetch failed');
        const data = await res.json();

        if (data.roles?.nama_role !== 'Mubahhisin') {
          window.location.href = '/Login';
          return;
        }

        let currentKelompok = data.kelompok;
        let kelompokId = data.kelompok_id;

        // Fetch kelompok details separately using maybeSingle()
        try {
          const { data: fullProfile, error: fpError } = await supabase
            .from('profiles')
            .select('kelompok_id, kelompok:kelompok_id(id, nama_kelompok)')
            .eq('id', data.id)
            .maybeSingle();

          if (!fpError && fullProfile) {
            currentKelompok = fullProfile.kelompok;
            kelompokId = fullProfile.kelompok_id;
          }
        } catch (kelompokErr) {
          console.warn('Kelompok fetch failed (non-fatal):', kelompokErr);
        }

        const userProfileObj = {
          ...data,
          kelompok_id: kelompokId,
          kelompok: currentKelompok
        };
        setProfile(userProfileObj);
        setKelompok(currentKelompok);

        // Fetch initial masalah list
        const { data: masalahData, error: mError } = await supabase
          .from('masalah_sidang')
          .select('*')
          .order('created_at', { ascending: false });
        if (mError) throw mError;
        setMasalahList(masalahData || []);

        const { data: allJData } = await supabase
          .from('jawaban')
          .select('*, kelompok(nama_kelompok)');
        setAllJawaban(allJData || []);

        if (kelompokId && allJData) {
          const map = {};
          allJData.filter(j => j.kelompok_id === kelompokId).forEach((j) => {
            map[j.masalah_id] = j;
          });
          setJawabanMap(map);
        }
      } catch (err) {
        console.error('Error during auth check:', err);
        window.location.href = '/Login';
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  /* ─────────────────────────────────────────────
     FETCH MASALAH + JAWABAN
  ───────────────────────────────────────────── */
  const fetchMasalah = useCallback(async () => {
    const { data, error } = await supabase
      .from('masalah_sidang')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching masalah:', error);
      return;
    }
    setMasalahList(data || []);
  }, []);

  const fetchAllJawaban = useCallback(async () => {
    const { data, error } = await supabase
      .from('jawaban')
      .select('*, kelompok(nama_kelompok)');

    if (error) {
      console.error('Error fetching jawaban:', error);
      return;
    }
    setAllJawaban(data || []);
    if (profile?.kelompok_id) {
      const map = {};
      (data || []).filter(j => j.kelompok_id === profile.kelompok_id).forEach((j) => {
        map[j.masalah_id] = j;
      });
      setJawabanMap(map);
    }
  }, [profile?.kelompok_id]);

  useEffect(() => {
    fetchMasalah();
    fetchAllJawaban();
  }, [profile?.kelompok_id, fetchMasalah, fetchAllJawaban]);

  /* ─────────────────────────────────────────────
     REALTIME SUBSCRIPTIONS
  ───────────────────────────────────────────── */
  useEffect(() => {
    if (!profile) return;

    const masalahChannel = supabase
      .channel('mubahhitsin-masalah-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'masalah_sidang' },
        () => {
          fetchMasalah();
          fetchAllJawaban();
        }
      )
      .subscribe();

    const jawabanChannel = supabase
      .channel('mubahhitsin-jawaban-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jawaban',
        },
        () => {
          fetchAllJawaban();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(masalahChannel);
      supabase.removeChannel(jawabanChannel);
    };
  }, [profile, fetchMasalah, fetchAllJawaban]);

  /* ── Audit Logging Helper ── */
  const logAudit = async (action, desc) => {
    if (!profile) return;
    try {
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        nama_operator: profile.nama_lengkap,
        peran_operator: 'Mubahhisin',
        aksi: action,
        keterangan_perubahan: desc
      });
    } catch (err) {
      console.error('Audit log error:', err);
    }
  };

  /* ── Logout ── */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/Login';
  };

  /* ── Map Supabase state to UI Question format ── */
  const getMappedQuestions = () => {
    const userGroupName = kelompok ? `${kelompok.nama_kelompok}` : `Kelompok ${profile?.kelompok_id || '?'}`;
    return masalahList.map((m) => {
      const responses = allJawaban
        .filter(j => j.masalah_id === m.id)
        .map(j => {
          const groupName = j.kelompok_id === profile?.kelompok_id 
            ? userGroupName 
            : (j.kelompok_id === null || j.kelompok_id === 'g-perumus' || j.kelompok_id === 'Tim Perumus' 
                ? 'Tim Perumus' 
                : (j.kelompok?.nama_kelompok || `Kelompok ${j.kelompok_id}`));

          const formattedKitab = j.nama_kitab ? `${j.nama_kitab}, Juz ${j.juz_ke || '-'}, Hal. ${j.halaman_berapa || '-'} (Karya: ${j.karangan_siapa || '-'}) [Hukum: ${j.status_hukum || '-'}]` : '';
          
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
            groupName: groupName,
            text: j.argumen_indo || '',
            citations: finalCitations,
            status: m.status_sidang === 'Selesai' || m.status_sidang === 'Disahkan' ? 'Disahkan' : (j.status || 'Draft'),
            isReferensiUtama: j.referensi_terpilih || false,
            evaluationNote: j.catatan_analisis_perumus || ''
          };
        });

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

  /* ─────────────────────────────────────────────
     2 & 3. LOGIKA KONDISIONAL BERDASARKAN HASIL MAYBESINGLE
     PENGIRIMAN DATA MENGGUNAKAN NAMA KOLOM RESMI:
     masalah_id, kelompok_id, nama_kitab, juz_ke, halaman_berapa, karangan_siapa, dalil_arab, argumen_indo, status_hukum
  ───────────────────────────────────────────── */
  const handleSetQuestions = async (updater) => {
    const currentMapped = getMappedQuestions();
    const nextQuestions = typeof updater === 'function' ? updater(currentMapped) : updater;
    const groupName = kelompok ? `${kelompok.nama_kelompok}` : `Kelompok ${profile?.kelompok_id || '?'}`;

    const userKelompokId = profile?.kelompok_id;
    if (!userKelompokId) {
      showToast('⚠️ Kelompok Anda belum terdaftar di sistem. Hubungi Admin untuk mengatur kelompok.', 'error');
      return;
    }

    for (const nextQ of nextQuestions) {
      const prevQ = currentMapped.find((q) => q.id === nextQ.id);
      if (!prevQ) continue;

      const nextResp = nextQ.responses?.find((r) => r.groupName === groupName);
      const prevResp = prevQ.responses?.find((r) => r.groupName === groupName);

      const nextText = nextResp?.text || '';
      const prevText = prevResp?.text || '';
      const nextStatus = nextResp?.status || 'Draft';
      const prevStatus = prevResp?.status || 'Draft';

      const nextCit = nextResp?.citations?.[0] || { kitab: '', arabicText: '', translation: '' };
      const isCitationsChanged = JSON.stringify(nextResp?.citations || []) !== JSON.stringify(prevResp?.citations || []);

      if (
        nextText !== prevText ||
        nextStatus !== prevStatus ||
        isCitationsChanged
      ) {
        // Skip placeholders
        const isPlaceholder = nextText?.startsWith("Draf jawaban hukum sedang dirumuskan") || 
                              nextText?.startsWith("Keputusan hukum awal yang disusun oleh Tim Perumus");
        if (isPlaceholder) {
          continue;
        }

        if (!nextQ.id) {
          showToast('⚠️ ID masalah tidak ditemukan. Silakan muat ulang halaman.', 'error');
          return;
        }

        // NAMA KOLOM RESMI TABEL 'jawaban'
        const payload = {
          nama_kitab: nextCit.namaKitab || nextCit.kitab || '',
          juz_ke: nextCit.juzKe || '',
          halaman_berapa: nextCit.halamanBerapa || '',
          karangan_siapa: nextCit.karanganSiapa || '',
          status_hukum: nextCit.statusHukum || 'Boleh',
          dalil_arab: nextCit.arabicText || '',
          terjemahan_indo: nextCit.translation || '',
          argumen_indo: nextText,
          status: nextStatus,
          citations_json: nextResp?.citations || [],
          updated_at: new Date().toISOString()
        };

        try {
          // 1. Tarik draf lama dengan maybeSingle() agar aman saat data masih 0 baris
          const drafLama = await fetchCurrentDraft(nextQ.id, userKelompokId);

          if (drafLama) {
            // 2A. JIKA drafLama POSITIF (Data ditemukan): Jalankan .update()
            const { data, error } = await supabase
              .from('jawaban')
              .update(payload)
              .eq('id', drafLama.id)
              .select()
              .maybeSingle();

            if (error) throw error;
            if (data) {
              setJawabanMap((prev) => ({ ...prev, [nextQ.id]: data }));
            }
            await logAudit('UPDATE_JAWABAN', `Mengubah draf jawaban kelompok untuk masalah ${nextQ.title}`);
          } else {
            // 2B. JIKA drafLama NULL (Data kosong/baru pertama kali): Jalankan .insert()
            const insertPayload = {
              masalah_id: nextQ.id,
              kelompok_id: userKelompokId,
              ...payload,
            };

            const { data, error } = await supabase
              .from('jawaban')
              .insert(insertPayload)
              .select()
              .maybeSingle();

            if (error) throw error;
            if (data) {
              setJawabanMap((prev) => ({ ...prev, [nextQ.id]: data }));
            }
            await logAudit('INSERT_JAWABAN', `Membuat draf jawaban kelompok baru untuk masalah ${nextQ.title}`);
          }
          
          await fetchJawabanKelompok();

          showToast(
            nextStatus === 'Disetor'
              ? 'Sukses! Jawaban berhasil disetor ke Tim Perumus.'
              : 'Sukses! Draf jawaban kelompok disimpan.',
            'success'
          );
        } catch (err) {
          console.error('[Mubahhisin] Save error:', err);
          showToast(err.message || 'Gagal menyimpan jawaban.', 'error');
        }
      }
    }
  };

  if (loading) return <LoadingScreen />;
  if (!profile) return null;

  const mappedQuestions = getMappedQuestions();
  const mubahhisGroupName = kelompok ? `${kelompok.nama_kelompok}` : `Kelompok ${profile?.kelompok_id || '?'}`;

  return (
    <>
      <Head>
        <title>Dashboard Mubahhitsin - Mufid</title>
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
            role: 'Mubahhisin',
            group: mubahhisGroupName,
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

            {activeTab === 'bahtsul' && (
              <BahtsulMasail
                questions={mappedQuestions}
                setQuestions={handleSetQuestions}
                addAuditLog={logAudit}
                isAdminOverride={false}
                activeGroup={mubahhisGroupName}
                userRole="Mubahhisin"
                userGroup={mubahhisGroupName}
              />
            )}

            {activeTab === 'arsip' && (
              <ArsipDigital
                questions={mappedQuestions}
                userRole="Mubahhisin"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

