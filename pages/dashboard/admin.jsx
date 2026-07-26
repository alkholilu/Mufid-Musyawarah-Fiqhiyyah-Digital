import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { supabase } from '../../src/config/supabaseClient';
import Sidebar from '../../components/Sidebar';
import DashboardView from '../../components/DashboardView';
import ManajemenSoal from '../../components/ManajemenSoal';
import ManajemenUser from '../../components/ManajemenUser';
import BahtsulMasail from '../../components/BahtsulMasail';
import UnggahDokumen from '../../components/UnggahDokumen';
import ArsipDigital from '../../components/ArsipDigital';
import SettingsView from '../../components/SettingsView';
import { Loader2 } from 'lucide-react';

/* ───────────── LOADING SCREEN ───────────── */
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-emerald-600/30 border-t-emerald-700 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-bold text-emerald-800 font-sans">Memuat Admin Panel...</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMasalah: 0,
    totalKelompok: 0,
    uptime: '99.9%'
  });

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // matches Sidebar IDs
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data Lists
  const [masalahList, setMasalahList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [kelompokList, setKelompokList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allJawaban, setAllJawaban] = useState([]);
  const [repoDocsList, setRepoDocsList] = useState([]);
  const [error, setError] = useState(null);

  // Admin Override States
  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [activeGroup, setActiveGroup] = useState('Kelompok 3');

  // Notification Toast Helper
  const [notification, setNotification] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Auth Guard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          window.location.href = '/Login';
          return;
        }
        setSession(currentSession);

        // Get Profile
        const res = await fetch('/api/getProfile', {
          headers: { Authorization: `Bearer ${currentSession.access_token}` }
        });
        if (!res.ok) throw new Error('Profile fetch failed');
        const profileData = await res.json();

        if (profileData.roles?.nama_role !== 'Admin') {
          window.location.href = '/Login';
          return;
        }
        setProfile(profileData);

        // Fetch initial data
        await Promise.all([
          fetchStats(),
          fetchMasalah(),
          fetchRepoDocs(),
          fetchUsers(),
          fetchKelompok(),
          fetchRoles(),
          fetchAuditLogs(),
          fetchAllJawaban()
        ]);
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/Login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Realtime Subscriptions
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'masalah_sidang' }, () => {
        fetchMasalah();
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repositori_dokumen' }, () => {
        fetchRepoDocs();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => {
        fetchAuditLogs();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jawaban' }, () => {
        fetchAllJawaban();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // --- DB Fetching Operations ---

  const logAudit = async (action, desc) => {
    if (!profile) return;
    try {
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        nama_operator: profile.nama_lengkap,
        peran_operator: 'Admin',
        aksi: action,
        keterangan_perubahan: desc
      });
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: userCount, error: ue } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (ue) throw ue;
      const { count: masalahCount, error: me } = await supabase.from('masalah_sidang').select('*', { count: 'exact', head: true });
      if (me) throw me;
      const { count: kelompokCount, error: ke } = await supabase.from('kelompok').select('*', { count: 'exact', head: true });
      if (ke) throw ke;

      setStats({
        totalUsers: userCount || 0,
        totalMasalah: masalahCount || 0,
        totalKelompok: kelompokCount || 0,
        uptime: '99.9%'
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      if (err.message?.includes('fetch') || err.message?.includes('TypeError')) {
        setError('Koneksi terputus. Gagal mengambil data statistik.');
      }
    }
  };

  const fetchMasalah = async () => {
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
  };

  const fetchRepoDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('repositori_dokumen')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRepoDocsList(data || []);
    } catch (err) {
      console.error('Error fetching repositori_dokumen:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const currentSession = session || (await supabase.auth.getSession()).data?.session;
      if (!currentSession) return;

      const res = await fetch('/api/admin-list-users', {
        headers: { Authorization: `Bearer ${currentSession.access_token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUserList(data.users || []);
      } else {
        // Fallback to direct query if API fails
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nama_lengkap, role_id, kelompok_id, roles(nama_role), kelompok(nama_kelompok)')
          .order('nama_lengkap', { ascending: true });
        if (error) throw error;
        setUserList(data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.message?.includes('fetch') || err.message?.includes('TypeError')) {
        setError('Koneksi terputus. Gagal memuat data pengguna.');
      }
    }
  };

  const fetchKelompok = async () => {
    try {
      const { data, error } = await supabase
        .from('kelompok')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      setKelompokList(data || []);
    } catch (err) {
      console.error('Error fetching kelompok:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      if (error) throw error;
      setRolesList(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  const fetchAllJawaban = async () => {
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
          kelompok_id,
          status,
          terjemahan_indo,
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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/Login';
  };

  // --- Mappings ---

  const getMappedQuestions = () => {
    return masalahList.map(m => {
      const responses = allJawaban
        .filter(j => j.masalah_id === m.id)
        .map(j => {
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

      return {
        id: m.id,
        title: m.judul_pembahasan,
        status: m.status_sidang,
        categories: [m.kategori_masalah],
        year: m.tahun_sidang,
        waqiIyyah: m.deskripsi_masalah,
        asilah: m.soal_pertanyaan,
        finalFatwa: m.final_fatwa || '',
        createdAt: m.created_at,
        responses: responses
      };
    });
  };

  const getMappedUsers = () => {
    return userList.map(u => {
      let displayGroup = u.kelompok?.nama_kelompok || '-';
      // Display group name is taken directly from the database
      // No hardcoded mapping needed — kelompok.nama_kelompok already contains the label

      return {
        id: u.id,
        fullName: u.nama_lengkap,
        email: u.email || '',
        role: u.roles?.nama_role || 'Mubahhisin',
        group: displayGroup
      };
    });
  };

  const getMappedAuditLogs = () => {
    return auditLogs.map(l => ({
      id: l.id,
      timestamp: l.created_at,
      operator: l.nama_operator,
      action: l.aksi,
      detail: l.keterangan_perubahan
    }));
  };

  const getMappedDocuments = () => {
    return repoDocsList.map(d => ({
      id: d.id,
      name: d.headline,
      path: d.file_pdf_url,
      size: '1.2 MB',
      headline: d.headline,
      tagline: d.tagline,
      tanggalMasehi: d.tanggal_masehi,
      kategoriMasalah: d.kategori,
      tahunSidang: d.tahun_sidang,
      uploadedAt: d.created_at
    }));
  };

  // --- State Setters / Interceptors for components ---

  const handleSetQuestions = async (updater) => {
    const currentMapped = getMappedQuestions();
    const nextQuestions = typeof updater === 'function' ? updater(currentMapped) : updater;

    // 1. Check for Add
    if (nextQuestions.length > currentMapped.length) {
      const addedQ = nextQuestions[0]; // local additions are unshifted
      try {
        const res = await fetch('/api/admin-manage-masalah', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'insert',
            judul_pembahasan: addedQ.title,
            kategori_masalah: addedQ.categories?.[0] || 'Medis',
            tahun_sidang: addedQ.year,
            deskripsi_masalah: addedQ.waqiIyyah,
            soal_pertanyaan: addedQ.asilah
          })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Gagal mendaftarkan masalah.');

        showToast('Sukses! Soal baru berhasil didaftarkan.', 'success');
        fetchMasalah();
      } catch (err) {
        showToast(err.message, 'error');
      }
      return;
    }

    // 2. Check for Delete
    if (nextQuestions.length < currentMapped.length) {
      const deletedQ = currentMapped.find(q => !nextQuestions.some(nq => nq.id === q.id));
      if (deletedQ) {
        try {
          const res = await fetch('/api/admin-manage-masalah', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              action: 'delete',
              id: deletedQ.id
            })
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Gagal menghapus masalah.');

          showToast('Sukses! Soal berhasil dihapus.', 'success');
          fetchMasalah();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
      return;
    }

    // 3. Check for Updates
    for (const nextQ of nextQuestions) {
      const prevQ = currentMapped.find(q => q.id === nextQ.id);
      if (!prevQ) continue;

      // Update question properties
      if (
        nextQ.title !== prevQ.title ||
        nextQ.status !== prevQ.status ||
        nextQ.year !== prevQ.year ||
        nextQ.waqiIyyah !== prevQ.waqiIyyah ||
        nextQ.asilah !== prevQ.asilah
      ) {
        try {
          const res = await fetch('/api/admin-manage-masalah', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              action: 'update',
              id: nextQ.id,
              judul_pembahasan: nextQ.title,
              status_sidang: nextQ.status,
              tahun_sidang: nextQ.year,
              deskripsi_masalah: nextQ.waqiIyyah,
              soal_pertanyaan: nextQ.asilah
            })
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Gagal memperbarui masalah.');

          showToast('Sukses! Masalah sidang berhasil diperbarui.', 'success');
          fetchMasalah();
          fetchAllJawaban();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }

      // Sync responses (Same as Mushohih/Muharrir actions)
      if (nextQ.responses && prevQ.responses) {
        for (const nextResp of nextQ.responses) {
          const prevResp = prevQ.responses.find(r => r.groupId === nextResp.groupId) ||
                           prevQ.responses.find(r => r.groupName === nextResp.groupName);

          // If newly created response (e.g. Mubahhitsin override or Tim Perumus)
          if (!prevResp) {
            // Skip placeholders to avoid infinite loops and duplicate rows
            const isPlaceholder = nextResp.text?.startsWith("Draf jawaban hukum sedang dirumuskan") || 
                                  nextResp.text?.startsWith("Keputusan hukum awal yang disusun oleh Tim Perumus");
            if (!nextResp.text || isPlaceholder) {
              continue;
            }
            try {
              let targetKelompokId = null;
              if (nextResp.groupName !== 'Tim Perumus') {
                const kelObj = kelompokList.find(k => k.nama_kelompok === nextResp.groupName);
                targetKelompokId = kelObj?.id || null;
              }
              const cit = nextResp.citations?.[0] || {};
              const { data, error } = await supabase
                .from('jawaban')
                .insert({
                  masalah_id: nextQ.id,
                  kelompok_id: targetKelompokId,
                  nama_kitab: cit.namaKitab || '',
                  juz_ke: cit.juzKe || '',
                  halaman_berapa: cit.halamanBerapa || '',
                  karangan_siapa: cit.karanganSiapa || '',
                  status_hukum: cit.statusHukum || 'Boleh',
                  dalil_arab: cit.arabicText || '',
                  argumen_indo: nextResp.text,
                  status: nextResp.status || 'Disetor'
                });

              if (error) throw error;
              showToast('Jawaban kelompok berhasil disinkronkan.', 'success');
              fetchAllJawaban();
            } catch (err) {
              showToast(err.message, 'error');
            }
            continue;
          }

          // Check if toggled Primary Reference
          if (nextResp.isReferensiUtama !== prevResp.isReferensiUtama) {
            try {
              if (nextResp.isReferensiUtama) {
                await supabase
                  .from('jawaban')
                  .update({ referensi_terpilih: false })
                  .eq('masalah_id', nextQ.id);

                await supabase
                  .from('jawaban')
                  .update({ referensi_terpilih: true })
                  .eq('id', nextResp.groupId);
              } else {
                await supabase
                  .from('jawaban')
                  .update({ referensi_terpilih: false })
                  .eq('id', nextResp.groupId);
              }
              fetchAllJawaban();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
          // Check if status changed
          if (nextResp.status !== prevResp.status) {
            try {
              const { error } = await supabase
                .from('jawaban')
                .update({ status: nextResp.status })
                .eq('id', nextResp.groupId);

              if (error) throw error;
              fetchAllJawaban();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
          // Check if text changed
          if (nextResp.text !== prevResp.text) {
            try {
              const { error } = await supabase
                .from('jawaban')
                .update({
                  argumen_indo: nextResp.text
                })
                .eq('id', nextResp.groupId);

              if (error) throw error;
              fetchAllJawaban();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }

          // Check if citations changed
          const nextCit = nextResp.citations?.[0] || { kitab: '', arabicText: '', translation: '' };
          const prevCit = prevResp.citations?.[0] || { kitab: '', arabicText: '', translation: '' };
          if (
            nextCit.kitab !== prevCit.kitab ||
            nextCit.arabicText !== prevCit.arabicText ||
            nextCit.translation !== prevCit.translation
          ) {
            try {
              const { error } = await supabase
                .from('jawaban')
                .update({
                  nama_kitab: nextCit.namaKitab || null,
                  juz_ke: nextCit.juzKe || null,
                  halaman_berapa: nextCit.halamanBerapa || null,
                  karangan_siapa: nextCit.karanganSiapa || null,
                  status_hukum: nextCit.statusHukum || null,
                  dalil_arab: nextCit.arabicText || null,
                  terjemahan_indo: nextCit.translation || null
                })
                .eq('id', nextResp.groupId);

              if (error) throw error;
              fetchAllJawaban();
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
        }
      }
    }
  };

  const handleSetUsers = async (updater) => {
    const currentMapped = getMappedUsers();
    const nextUsers = typeof updater === 'function' ? updater(currentMapped) : updater;

    // 1. Check for Add
    if (nextUsers.length > currentMapped.length) {
      const addedU = nextUsers[0];
      try {
        const roleMapping = {
          'mubahhisin': 1,
          'muharrir': 2,
          'mushohih': 3,
          'admin': 4
        };
        const selectedRoleName = (addedU.role || '').trim().toLowerCase();
        const roleId = rolesList.find(r => (r.nama_role || '').trim().toLowerCase() === selectedRoleName)?.id || roleMapping[selectedRoleName] || '';

        // Build kelompok mapping dynamically from kelompokList fetched from DB
        const kelompokMapping = {};
        for (let i = 1; i <= 10; i++) {
          kelompokMapping[`kelompok ${i}`] = i;
        }
        let groupLookupName = (addedU.group || '').trim().toLowerCase();
        // Extract "kelompok N" pattern from any input format
        const groupMatch = groupLookupName.match(/kelompok\s*(\d+)/);
        if (groupMatch) groupLookupName = `kelompok ${groupMatch[1]}`;

        const kelompokId = kelompokList.find(k => (k.nama_kelompok || '').trim().toLowerCase() === groupLookupName)?.id || kelompokMapping[groupLookupName] || null;

        const res = await fetch('/api/admin-create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            email: addedU.email,
            password: addedU.password || 'SuperSecureUserPassword123!',
            nama_lengkap: addedU.fullName,
            role_id: roleId,
            kelompok_id: kelompokId
          })
        });

        if (!res.ok) {
          let errMsg = 'Gagal membuat user.';
          try {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          } catch (_) {}
          throw new Error(errMsg);
        }

        const resData = await res.json();

        showToast('Sukses! Pengguna baru berhasil didaftarkan.', 'success');
        fetchUsers();
        fetchStats();
      } catch (err) {
        showToast(err.message, 'error');
      }
      return;
    }

    // 2. Check for Delete
    if (nextUsers.length < currentMapped.length) {
      const deletedU = currentMapped.find(u => !nextUsers.some(nu => nu.id === u.id));
      if (deletedU) {
        try {
          const res = await fetch('/api/admin-delete-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ user_id: deletedU.id })
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Gagal menghapus user.');

          showToast('Sukses! Pengguna berhasil dihapus.', 'success');
          fetchUsers();
          fetchStats();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
      return;
    }

    // 3. Check for Update
    for (const nextU of nextUsers) {
      const prevU = currentMapped.find(u => u.id === nextU.id);
      if (!prevU) continue;

      if (
        nextU.fullName !== prevU.fullName || 
        nextU.email !== prevU.email || 
        nextU.role !== prevU.role || 
        nextU.group !== prevU.group ||
        Boolean(nextU.password)
      ) {
        try {
          const roleMapping = {
            'mubahhisin': 1,
            'muharrir': 2,
            'mushohih': 3,
            'admin': 4
          };
          const selectedRoleName = (nextU.role || '').trim().toLowerCase();
          const roleId = rolesList.find(r => (r.nama_role || '').trim().toLowerCase() === selectedRoleName)?.id || roleMapping[selectedRoleName] || '';

          // Build kelompok mapping dynamically from kelompokList fetched from DB
          const kelompokMapping = {};
          for (let i = 1; i <= 10; i++) {
            kelompokMapping[`kelompok ${i}`] = i;
          }
          let groupLookupName = (nextU.group || '').trim().toLowerCase();
          // Extract "kelompok N" pattern from any input format
          const groupMatch = groupLookupName.match(/kelompok\s*(\d+)/);
          if (groupMatch) groupLookupName = `kelompok ${groupMatch[1]}`;

          const kelompokId = kelompokList.find(k => (k.nama_kelompok || '').trim().toLowerCase() === groupLookupName)?.id || kelompokMapping[groupLookupName] || null;

          const res = await fetch('/api/admin-update-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              user_id: nextU.id,
              nama_lengkap: nextU.fullName,
              email: nextU.email !== prevU.email ? nextU.email : undefined,
              role_id: roleId,
              kelompok_id: kelompokId,
              password: nextU.password || undefined
            })
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Gagal memperbarui user.');

          showToast('Sukses! Profil pengguna berhasil diperbarui.', 'success');
          fetchUsers();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    }
  };

  const handleSetDocuments = async (updater) => {
    const currentMapped = getMappedDocuments();
    const nextDocs = typeof updater === 'function' ? updater(currentMapped) : updater;

    // 1. Check for Add (Upload)
    if (nextDocs.length > currentMapped.length) {
      const addedDoc = nextDocs[0];
      const file = addedDoc.fileObject;
      if (!file) return;

      try {
        // Convert file object to Base64 data URL
        const fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/admin-upload-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64,
            headline: addedDoc.headline,
            tagline: addedDoc.tagline,
            tanggalMasehi: addedDoc.tanggalMasehi,
            tahunSidang: addedDoc.tahunSidang,
            kategoriMasalah: addedDoc.kategoriMasalah
          })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Gagal mengunggah berkas PDF.');

        showToast(`Sukses! Berkas PDF '${file.name}' berhasil diunggah dan dipublikasikan di Repositori.`, 'success');
        fetchRepoDocs();
      } catch (err) {
        showToast(err.message || 'Gagal mengunggah berkas PDF.', 'error');
      }
      return;
    }

    // 2. Check for Delete (Remove PDF link & notify Realtime Repositori)
    if (nextDocs.length < currentMapped.length) {
      const deletedDoc = currentMapped.find(d => !nextDocs.some(nd => nd.id === d.id));
      if (deletedDoc) {
        try {
          const res = await fetch('/api/admin-upload-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              action: 'delete',
              docId: deletedDoc.id
            })
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Gagal menghapus PDF.');

          showToast('Sukses! Berkas PDF berhasil dihapus dari Repositori.', 'success');
          fetchRepoDocs();
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    }
  };

  if (loading) return <LoadingScreen />;
  if (!profile) return null;

  const mappedQuestions = getMappedQuestions();
  const mappedUsers = getMappedUsers();
  const mappedAuditLogs = getMappedAuditLogs();
  const mappedDocuments = getMappedDocuments();

  // Route forced sub-tab for BahtsulMasail component
  let bahtsulRole = isAdminOverride ? 'Mubahhisin' : 'Admin';
  let bahtsulGroup = isAdminOverride ? activeGroup : 'Panitia Pusat';
  let bahtsulSubTab = undefined;

  if (activeTab === 'mushohih-jawaban') { bahtsulRole = 'Mushohih'; bahtsulSubTab = 'mubahhisin'; }
  if (activeTab === 'mushohih-kitab') { bahtsulRole = 'Mushohih'; bahtsulSubTab = 'citations'; }
  if (activeTab === 'mushohih-natijah') { bahtsulRole = 'Mushohih'; bahtsulSubTab = 'mushohih-natijah'; }
  if (activeTab === 'mushohih-ketuk') { bahtsulRole = 'Mushohih'; bahtsulSubTab = 'ketuk'; }

  if (activeTab === 'muharrir-monitoring') { bahtsulRole = 'Muharrir'; bahtsulSubTab = 'monitoring'; }
  if (activeTab === 'muharrir-natijah') { bahtsulRole = 'Muharrir'; bahtsulSubTab = 'muharrir-natijah'; }
  if (activeTab === 'muharrir-kirim') { bahtsulRole = 'Muharrir'; bahtsulSubTab = 'kirim-jawaban'; }

  return (
    <>
      <Head>
        <title>Admin Panel - Mufid</title>
      </Head>

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdminOverride={isAdminOverride}
          activeGroup={activeGroup}
          user={{
            fullName: profile.nama_lengkap,
            email: profile.email,
            role: 'Admin',
            group: 'Super Admin',
          }}
          onLogout={handleLogout}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {error && (
            <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-sm">{error}</p>
                <p className="text-xs text-rose-600 mt-0.5">Sistem mendeteksi pemutusan koneksi atau server database tidak merespon. Pengambilan data otomatis dihentikan untuk mencegah overload.</p>
              </div>
            </div>
          )}
          {/* Mobile Header Toggle */}
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
              <div className={`p-4 rounded-2xl border text-xs font-bold ${
                notification.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}>
                {notification.message}
              </div>
            )}

            {/* Dashboard tab */}
            {activeTab === 'dashboard' && (
              <DashboardView
                questionsCount={mappedQuestions.length}
                usersCount={mappedUsers.length}
                isAdminOverride={isAdminOverride}
                setIsAdminOverride={setIsAdminOverride}
                activeGroup={activeGroup}
                auditLogs={mappedAuditLogs}
                setAuditLogs={(updater) => {
                  setAuditLogs(prevRaw => {
                    const prevMapped = prevRaw.map(l => ({
                      id: l.id,
                      timestamp: l.created_at,
                      operator: l.nama_operator,
                      action: l.aksi,
                      detail: l.keterangan_perubahan
                    }));
                    const nextMapped = typeof updater === 'function' ? updater(prevMapped) : updater;
                    return nextMapped.map(l => ({
                      id: l.id,
                      created_at: l.timestamp,
                      nama_operator: l.operator,
                      aksi: l.action,
                      keterangan_perubahan: l.detail
                    }));
                  });
                }}
                setActiveTab={setActiveTab}
              />
            )}

            {/* Soal CRUD */}
            {activeTab === 'soal' && (
              <ManajemenSoal
                questions={mappedQuestions}
                setQuestions={handleSetQuestions}
                addAuditLog={logAudit}
                isAdminOverride={isAdminOverride}
                activeGroup={activeGroup}
              />
            )}

            {/* User CRUD */}
            {activeTab === 'user' && (
              <ManajemenUser
                users={mappedUsers}
                setUsers={handleSetUsers}
                addAuditLog={logAudit}
                isAdminOverride={isAdminOverride}
                activeGroup={activeGroup}
              />
            )}

            {/* Bahtsul Masail (Either Default, or under simulated role) */}
            {['bahtsul', 'mushohih-jawaban', 'mushohih-kitab', 'mushohih-natijah', 'mushohih-ketuk', 'muharrir-monitoring', 'muharrir-natijah', 'muharrir-kirim'].includes(activeTab) && (
              <BahtsulMasail
                questions={mappedQuestions}
                setQuestions={handleSetQuestions}
                addAuditLog={logAudit}
                isAdminOverride={isAdminOverride}
                activeGroup={activeGroup}
                userRole={bahtsulRole}
                userGroup={bahtsulGroup}
                forcedSubTab={bahtsulSubTab}
              />
            )}

            {/* Upload PDF final */}
            {activeTab === 'upload' && (
              <UnggahDokumen
                documents={mappedDocuments}
                setDocuments={handleSetDocuments}
                addAuditLog={logAudit}
                isAdminOverride={isAdminOverride}
                activeGroup={activeGroup}
              />
            )}

            {/* Arsip Digital */}
            {activeTab === 'arsip' && (
              <ArsipDigital
                questions={mappedQuestions}
                userRole="Admin"
              />
            )}

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <SettingsView
                isAdminOverride={isAdminOverride}
                setIsAdminOverride={setIsAdminOverride}
                activeGroup={activeGroup}
                setActiveGroup={setActiveGroup}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
