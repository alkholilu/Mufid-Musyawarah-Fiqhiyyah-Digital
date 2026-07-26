import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Send, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock,
  AlertTriangle, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Star,
  Printer,
  Download,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  Undo,
  Check,
  Activity,
  UserCheck,
  Scale
} from "lucide-react";
import { Question, ArabicCitation, GroupResponse } from "../types";
import MubahhisinPanel from "./MubahhisinPanel";
import { MuharrirPanel } from "./MuharrirPanel";
import MushohihPanel from "./MushohihPanel";
import PdfPreviewModal from "./PdfPreviewModal";

interface BahtsulMasailProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  addAuditLog: (operator: string, action: "UPDATE" | "STATUS" | "INSERT" | "DELETE" | "OVERRIDE", detail: string) => void;
  isAdminOverride: boolean;
  activeGroup: string;
  userRole?: "Admin" | "Mubahhisin" | "Muharrir" | "Mushohih";
  userGroup?: string;
  forcedSubTab?: "mubahhisin" | "citations" | "mushohih-natijah" | "muharrir-natijah" | "ketuk" | "monitoring" | "kirim-jawaban";
}

const DEFAULT_GROUPS = [
  { id: "gp-1", name: "Kelompok 1" },
  { id: "gp-2", name: "Kelompok 2" },
  { id: "gp-3", name: "Kelompok 3" },
  { id: "gp-4", name: "Kelompok 4" },
  { id: "gp-5", name: "Kelompok 5" }
];

export default function BahtsulMasail({
  questions,
  setQuestions,
  addAuditLog,
  isAdminOverride,
  activeGroup,
  userRole,
  userGroup,
  forcedSubTab
}: BahtsulMasailProps) {
  // Sesi Peran: "Mubahhisin" | "Muharrir" | "Mushohih" | "Public"
  const [activeRole, setActiveRole] = useState<"Mubahhisin" | "Muharrir" | "Mushohih" | "Public">(() => {
    if (forcedSubTab) {
      if (["monitoring", "muharrir-natijah", "kirim-jawaban"].includes(forcedSubTab)) {
        return "Muharrir";
      }
      return "Mushohih";
    }
    if (userRole && userRole !== "Admin") {
      return userRole;
    }
    return "Mubahhisin";
  });
  
  // Currently selected question ID for discussion
  const [selectedQId, setSelectedQId] = useState<string | number>(questions[0]?.id || "");
  
  // Find current question object
  const currentQ = questions.find(q => q.id === selectedQId);

  // Mubahhisin state variables
  const [mubahhisGroup, setMubahhisGroup] = useState<string>(() => {
    if (userRole === "Mubahhisin" && userGroup) {
      return userGroup;
    }
    return "Kelompok 3";
  });
  const [responseText, setResponseText] = useState("");
  const [kitabName, setKitabName] = useState("");
  const [juzKe, setJuzKe] = useState("");
  const [halamanBerapa, setHalamanBerapa] = useState("");
  const [karanganSiapa, setKaranganSiapa] = useState("");
  const [statusHukum, setStatusHukum] = useState<string>("Boleh");
  const [arabicText, setArabicText] = useState("");
  const [translation, setTranslation] = useState("");
  const [mubahhisEditingCitId, setMubahhisEditingCitId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Muharrir state variables
  const [natijahText, setNatijahText] = useState("");

  // Mushohih inline edits state
  const [editingCitationId, setEditingCitationId] = useState<string | null>(null);
  const [editArabic, setEditArabic] = useState("");
  const [editTranslation, setEditTranslation] = useState("");
  const [editKitab, setEditKitab] = useState("");
  const [gavelStruck, setGavelStruck] = useState(false);

  // Mushohih Workspace state variables
  const [mushohihSubTab, setMushohihSubTab] = useState<"mubahhisin" | "citations" | "natijah" | "ketuk">(() => {
    if (forcedSubTab) {
      if (forcedSubTab === "mushohih-natijah") return "natijah";
      if (!["monitoring", "muharrir-natijah", "kirim-jawaban"].includes(forcedSubTab)) {
        return forcedSubTab as "mubahhisin" | "citations" | "natijah" | "ketuk";
      }
    }
    return "mubahhisin";
  });
  
  // Muharrir Workspace state variables
  const [muharrirSubTab, setMuharrirSubTab] = useState<"monitoring" | "natijah" | "kirim-jawaban">(() => {
    if (forcedSubTab) {
      if (forcedSubTab === "muharrir-natijah") return "natijah";
      if (["monitoring", "kirim-jawaban"].includes(forcedSubTab)) {
        return forcedSubTab as "monitoring" | "natijah" | "kirim-jawaban";
      }
    }
    return "monitoring";
  });
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupEditText, setGroupEditText] = useState("");
  const [groupEditNote, setGroupEditNote] = useState("");
  
  // Emergency reference adding state
  const [newCitKitab, setNewCitKitab] = useState("");
  const [newCitArabic, setNewCitArabic] = useState("");
  const [newCitTranslation, setNewCitTranslation] = useState("");
  const [newCitGroupId, setNewCitGroupId] = useState("");
  const [mushohihNote, setMushohihNote] = useState("");
  const [pdfModalQ, setPdfModalQ] = useState<Question | null>(null);

  // Sync forcedSubTab to activeRole and subtabs
  useEffect(() => {
    if (forcedSubTab) {
      if (["monitoring", "muharrir-natijah", "kirim-jawaban"].includes(forcedSubTab)) {
        setMuharrirSubTab(forcedSubTab === "muharrir-natijah" ? "natijah" : forcedSubTab as "monitoring" | "kirim-jawaban");
        setActiveRole("Muharrir");
      } else {
        setMushohihSubTab(forcedSubTab === "mushohih-natijah" ? "natijah" : forcedSubTab as "mubahhisin" | "citations" | "ketuk");
        setActiveRole("Mushohih");
      }
    } else {
      setActiveRole(prev => {
        if (prev === "Muharrir" || prev === "Mushohih") {
          return "Mubahhisin";
        }
        return prev;
      });
    }
  }, [forcedSubTab]);

  // Sync workspace group name specifically for Muharrir's Kirim Jawaban tab
  useEffect(() => {
    if (activeRole === "Muharrir" && muharrirSubTab === "kirim-jawaban") {
      setMubahhisGroup("Tim Perumus");
    } else if (activeRole === "Mubahhisin" && userRole === "Mubahhisin" && userGroup) {
      setMubahhisGroup(userGroup);
    } else {
      setMubahhisGroup(userGroup || "Kelompok 3");
    }
  }, [activeRole, muharrirSubTab, userRole, userGroup]);

  // Sync props to state if they change
  useEffect(() => {
    if (userRole && userRole !== "Admin") {
      setActiveRole(userRole);
    }
    if (userRole === "Mubahhisin" && userGroup) {
      setMubahhisGroup(userGroup);
    }
  }, [userRole, userGroup]);

  // Sync selectedQId if the currently selected question no longer exists in the list
  useEffect(() => {
    if (questions.length > 0) {
      const exists = questions.some(q => q.id === selectedQId);
      if (!exists) {
        setSelectedQId(questions[0].id);
      }
    } else {
      setSelectedQId("");
    }
  }, [questions, selectedQId]);

  // Sync state whenever selected question changes
  useEffect(() => {
    if (currentQ) {
      setNatijahText(currentQ.finalFatwa || "");
      
      // Load current group response text and citation if exists
      const userGroupResp = currentQ.responses?.find(r => r.groupName === mubahhisGroup);
      if (userGroupResp) {
        // Skip placeholders
        const isPlaceholder = userGroupResp.text?.startsWith("Draf jawaban hukum sedang dirumuskan") || 
                              userGroupResp.text?.startsWith("Keputusan hukum awal yang disusun oleh Tim Perumus");

        if (!isPlaceholder) {
          setResponseText(userGroupResp.text || "");
          const cit = userGroupResp.citations?.[0];
          if (cit) {
            setKitabName(cit.namaKitab || "");
            setJuzKe(cit.juzKe || "");
            setHalamanBerapa(cit.halamanBerapa || "");
            setKaranganSiapa(cit.karanganSiapa || "");
            setStatusHukum((cit.statusHukum as "Boleh" | "Tidak Boleh") || "Boleh");
            setArabicText(cit.arabicText || "");
            setTranslation(cit.translation || "");
          } else {
            setKitabName("");
            setJuzKe("");
            setHalamanBerapa("");
            setKaranganSiapa("");
            setStatusHukum("Boleh");
            setArabicText("");
            setTranslation("");
          }
        } else {
          setResponseText("");
          setKitabName("");
          setJuzKe("");
          setHalamanBerapa("");
          setKaranganSiapa("");
          setStatusHukum("Boleh");
          setArabicText("");
          setTranslation("");
        }
      } else {
        setResponseText("");
        setKitabName("");
        setJuzKe("");
        setHalamanBerapa("");
        setKaranganSiapa("");
        setStatusHukum("Boleh");
        setArabicText("");
        setTranslation("");
      }
    }
  }, [selectedQId, mubahhisGroup, currentQ]);

  useEffect(() => {
    if (!currentQ) return;

    let updated = false;
    const existingResponses = currentQ.responses || [];
    const newResponses = [...existingResponses];

    const allExpected = [
      ...DEFAULT_GROUPS,
      { id: "g-perumus", name: "Tim Perumus" }
    ];

    allExpected.forEach(g => {
      const found = existingResponses.find(r => r.groupName === g.name);
      if (!found) {
        updated = true;
        newResponses.push({
          groupId: g.id,
          groupName: g.name,
          text: g.name === "Kelompok 3" && currentQ.id === "q-1" 
            ? "Karya seni AI pada dasarnya diperbolehkan selama tidak mengandung unsur maksiat atau pemalsuan. Mengenai hak kepemilikannya, hukum Fiqh mengakui 'Haql Ibtikar' (hak cipta inovasi) bagi pembuat prompt yang mengarahkan algoritma secara spesifik dan terstruktur."
            : g.name === "Tim Perumus"
            ? "Keputusan hukum awal yang disusun oleh Tim Perumus (Muharrir) berdasarkan intisari dalil rujukan utama delegasi..."
            : `Draf jawaban hukum sedang dirumuskan oleh delegasi ${g.name}. Meneliti keabsahan kitab rujukan kontemporer...`,
          citations: g.name === "Kelompok 3" && currentQ.id === "q-1" ? [
            {
              id: "cit-sub-1",
              kitab: "Nihayatul Muhtaj, Juz 4",
              arabicText: "الْأَصْلُ فِي الْأَشْيَاءِ النَّافِعَةِ الْإِبَاحَةُ حَتَّى يَدُلَّ الدَّلِيلُ عَلَى التَّحْرِيمِ.",
              translation: "Hukum asal segala sesuatu yang bermanfaat adalah boleh (mubah) hingga terdapat dalil yang menunjukkan keharamannya."
            }
          ] : [],
          status: "Draft",
          isReferensiUtama: false,
          evaluationNote: ""
        });
      }
    });

    if (updated) {
      setQuestions(prev => prev.map(q => {
        if (q.id === selectedQId) {
          return { ...q, responses: newResponses };
        }
        return q;
      }));
    }
  }, [selectedQId, currentQ, setQuestions]);

  if (!currentQ) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-border-hairline shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Tidak ada masalah sidang yang aktif.</p>
        <p className="text-xs text-slate-500 mt-1">Daftarkan masalah baru di menu Manajemen Soal terlebih dahulu.</p>
      </div>
    );
  }

  const isLocked = currentQ.status === "Disahkan";

  // Mubahhisin Actions
  const handleSaveMubahhisDraft = (submitToPerumus: boolean) => {
    const targetStatus = submitToPerumus ? "Disetor" : "Draft";
    
    // Package form citation state if any main fields are filled
    const hasCitationInput = kitabName || arabicText || translation || karanganSiapa;
    const formCitation: ArabicCitation | null = hasCitationInput ? {
      id: mubahhisEditingCitId || `cit-mub-${Date.now()}`,
      kitab: `${kitabName}, Juz ${juzKe || '-'}, Hal. ${halamanBerapa || '-'} (Karya: ${karanganSiapa || '-'}) [Hukum: ${statusHukum}]`,
      arabicText,
      translation,
      namaKitab: kitabName,
      juzKe,
      halamanBerapa,
      karanganSiapa,
      statusHukum
    } : null;

    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const responses = q.responses || [];
        const existingIdx = responses.findIndex(r => r.groupName === mubahhisGroup);
        const updatedResponses = [...responses];

        const currentCitations = existingIdx > -1 ? (updatedResponses[existingIdx].citations || []) : [];
        let citations = [...currentCitations];

        if (formCitation) {
          if (mubahhisEditingCitId) {
            citations = citations.map(c => c.id === mubahhisEditingCitId ? formCitation : c);
          } else {
            const exists = citations.some(c => c.id === formCitation.id || (c.kitab === formCitation.kitab && c.arabicText === formCitation.arabicText));
            if (!exists) {
              citations.push(formCitation);
            }
          }
        }

        if (existingIdx > -1) {
          updatedResponses[existingIdx] = {
            ...updatedResponses[existingIdx],
            text: responseText,
            status: targetStatus,
            citations: citations
          };
        } else {
          updatedResponses.push({
            groupId: `g-resp-${Date.now()}`,
            groupName: mubahhisGroup,
            text: responseText,
            citations: citations,
            status: targetStatus,
            isReferensiUtama: false,
            evaluationNote: ""
          });
        }

        return { ...q, responses: updatedResponses };
      }
      return q;
    }));

    // Reset form states
    setKitabName("");
    setJuzKe("");
    setHalamanBerapa("");
    setKaranganSiapa("");
    setStatusHukum("Boleh");
    setArabicText("");
    setTranslation("");
    setMubahhisEditingCitId(null);

    const operatorName = activeRole === "Muharrir" ? "Muharrir (Tim Perumus)" : `${mubahhisGroup} (Mubahhisin)`;

    addAuditLog(
      operatorName,
      "UPDATE",
      `${submitToPerumus ? "Menyetor" : "Menyimpan draf"} draf jawaban kelompok '${mubahhisGroup}' untuk Masalah: '${currentQ.title.substring(0, 30)}...'`
    );

    setNotification({
      message: activeRole === "Muharrir"
        ? (submitToPerumus 
          ? `Sukses! Draf jawaban untuk ${mubahhisGroup} resmi disetor ke Sidang Pleno Perumus.`
          : `Sukses! Draf jawaban untuk ${mubahhisGroup} berhasil disimpan sebagai draf lokal perumusan.`)
        : (submitToPerumus 
          ? "Sukses! Draf jawaban kelompok Anda berhasil disetor ke Tim Perumus (Muharrir)." 
          : "Sukses! Draf jawaban kelompok Anda berhasil disimpan secara lokal."),
      type: "success"
    });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleStartEditMubahhisCitation = (citId: string, kitab: string, arabic: string, trans: string) => {
    setMubahhisEditingCitId(citId);
    setArabicText(arabic);
    setTranslation(trans);
    const activeGroupResp = currentQ?.responses?.find(r => r.groupName === mubahhisGroup);
    const citObj = activeGroupResp?.citations?.find(c => c.id === citId);
    if (citObj) {
      setKitabName(citObj.namaKitab || "");
      setJuzKe(citObj.juzKe || "");
      setHalamanBerapa(citObj.halamanBerapa || "");
      setKaranganSiapa(citObj.karanganSiapa || "");
      setStatusHukum(citObj.statusHukum || "Boleh");
    } else {
      setKitabName(kitab);
      setJuzKe("");
      setHalamanBerapa("");
      setKaranganSiapa("");
      setStatusHukum("Boleh");
    }
  };

  const handleCancelEditMubahhisCitation = () => {
    setMubahhisEditingCitId(null);
    setKitabName("");
    setJuzKe("");
    setHalamanBerapa("");
    setKaranganSiapa("");
    setStatusHukum("Boleh");
    setArabicText("");
    setTranslation("");
  };

  const handleAddMubahhisCitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitabName || !arabicText) {
      alert("Harap lengkapi nama Kitab dan teks Arab!");
      return;
    }

    const formattedKitab = `${kitabName}, Juz ${juzKe || '-'}, Hal. ${halamanBerapa || '-'} (Karya: ${karanganSiapa || '-'}) [Hukum: ${statusHukum}]`;

    if (mubahhisEditingCitId) {
      // Perform UPDATE/EDIT
      setQuestions(prev => prev.map(q => {
        if (q.id === selectedQId) {
          const responses = q.responses || [];
          const existingIdx = responses.findIndex(r => r.groupName === mubahhisGroup);
          const updatedResponses = [...responses];

          if (existingIdx > -1) {
            const updatedCitations = (updatedResponses[existingIdx].citations || []).map(c => {
              if (c.id === mubahhisEditingCitId) {
                return {
                  ...c,
                  kitab: formattedKitab,
                  arabicText,
                  translation,
                  namaKitab: kitabName,
                  juzKe,
                  halamanBerapa,
                  karanganSiapa,
                  statusHukum
                };
              }
              return c;
            });
            updatedResponses[existingIdx] = {
              ...updatedResponses[existingIdx],
              citations: updatedCitations
            };
          }

          return { ...q, responses: updatedResponses };
        }
        return q;
      }));

      addAuditLog(
        `${mubahhisGroup} (Mubahhisin)`,
        "UPDATE",
        `Mengubah referensi '${kitabName}' pada draf jawaban kelompok.`
      );

      // Reset
      setMubahhisEditingCitId(null);
      setKitabName("");
      setJuzKe("");
      setHalamanBerapa("");
      setKaranganSiapa("");
      setStatusHukum("Boleh");
      setArabicText("");
      setTranslation("");

      setNotification({
        message: `Sukses! Perubahan rujukan kitab '${kitabName}' berhasil disimpan.`,
        type: "success"
      });
      setTimeout(() => setNotification(null), 4500);
      return;
    }

    const newCitation: ArabicCitation = {
      id: `cit-mub-${Date.now()}`,
      kitab: formattedKitab,
      arabicText,
      translation,
      namaKitab: kitabName,
      juzKe,
      halamanBerapa,
      karanganSiapa,
      statusHukum
    };

    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const responses = q.responses || [];
        const existingIdx = responses.findIndex(r => r.groupName === mubahhisGroup);
        const updatedResponses = [...responses];

        if (existingIdx > -1) {
          updatedResponses[existingIdx] = {
            ...updatedResponses[existingIdx],
            citations: [...(updatedResponses[existingIdx].citations || []), newCitation]
          };
        } else {
          updatedResponses.push({
            groupId: `g-resp-${Date.now()}`,
            groupName: mubahhisGroup,
            text: responseText,
            citations: [newCitation],
            status: "Draft",
            isReferensiUtama: false,
            evaluationNote: ""
          });
        }

        return { ...q, responses: updatedResponses };
      }
      return q;
    }));

    addAuditLog(
      `${mubahhisGroup} (Mubahhisin)`,
      "INSERT",
      `Menyematkan referensi '${kitabName}' ke draf jawaban kelompok.`
    );

    setNotification({
      message: `Sukses! Rujukan kitab '${kitabName}' berhasil ditambahkan ke draf kelompok.`,
      type: "success"
    });
    setTimeout(() => setNotification(null), 4500);

    // Reset fields
    setKitabName("");
    setJuzKe("");
    setHalamanBerapa("");
    setKaranganSiapa("");
    setStatusHukum("Boleh");
    setArabicText("");
    setTranslation("");
  };

  const handleRemoveMubahhisCitation = (citId: string) => {
    if (mubahhisEditingCitId === citId) {
      setMubahhisEditingCitId(null);
      setKitabName("");
      setJuzKe("");
      setHalamanBerapa("");
      setKaranganSiapa("");
      setStatusHukum("Boleh");
      setArabicText("");
      setTranslation("");
    }
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const responses = q.responses || [];
        const existingIdx = responses.findIndex(r => r.groupName === mubahhisGroup);
        const updatedResponses = [...responses];

        if (existingIdx > -1) {
          updatedResponses[existingIdx] = {
            ...updatedResponses[existingIdx],
            citations: (updatedResponses[existingIdx].citations || []).filter(c => c.id !== citId)
          };
        }
        return { ...q, responses: updatedResponses };
      }
      return q;
    }));

    setNotification({
      message: "Sukses! Rujukan kitab berhasil dihapus dari draf kelompok.",
      type: "success"
    });
    setTimeout(() => setNotification(null), 4500);
  };
  
  // Muharrir Actions
  const handleTogglePrimaryReference = (groupName: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const updated = (q.responses || []).map(r => {
          if (r.groupName === groupName) {
            return { ...r, isReferensiUtama: !r.isReferensiUtama };
          }
          return r;
        });
        return { ...q, responses: updated };
      }
      return q;
    }));

    addAuditLog(
      "Muharrir (Tim Perumus)",
      "UPDATE",
      `Mengubah status referensi utama untuk kelompok '${groupName}'`
    );
  };

  const handleSaveEvaluationNote = async (groupName: string, note: string) => {
    try {
      await setQuestions(prev => prev.map(q => {
        if (q.id === selectedQId) {
          const updated = (q.responses || []).map(r => {
            if (r.groupName === groupName) {
              return { ...r, evaluationNote: note };
            }
            return r;
          });
          return { ...q, responses: updated };
        }
        return q;
      }));
    } catch (err) {
      console.error("Error saving evaluation note:", err);
    }
  };

  const handleReturnToRevision = async (groupName: string) => {
    try {
      await setQuestions(prev => prev.map(q => {
        if (q.id === selectedQId) {
          const updated = (q.responses || []).map(r => {
            if (r.groupName === groupName) {
              return { ...r, status: "Revisi" as const };
            }
            return r;
          });
          return { ...q, responses: updated };
        }
        return q;
      }));

      addAuditLog(
        "Muharrir (Tim Perumus)",
        "STATUS",
        `Mengembalikan draf kelompok '${groupName}' menjadi status REVISI untuk penyuntingan ulang.`
      );

      setNotification({
        message: `Sukses! Gembok edit untuk ${groupName} berhasil dibuka kembali (Status: Revisi).`,
        type: "success"
      });
      setTimeout(() => {
        setNotification(null);
      }, 4500);
    } catch (err) {
      console.error("Error returning to revision:", err);
    }
  };

  const handleSetorNatijah = () => {
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        return { 
          ...q, 
          status: "Disetor",
          finalFatwa: natijahText
        };
      }
      return q;
    }));

    addAuditLog(
      "Muharrir (Tim Perumus)",
      "STATUS",
      `Menyetor draf Kesimpulan Global (Natijah) untuk disidangkan oleh Dewan Mushohih.`
    );

    setNotification({
      message: "Sukses! Draf Kesimpulan Global (Natijah) berhasil disetor ke Dewan Mushohih.",
      type: "success"
    });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Mushohih Actions
  const handleInlineEditCitation = (citId: string, citation: ArabicCitation) => {
    setEditingCitationId(citId);
    setEditKitab(citation.kitab);
    setEditArabic(citation.arabicText);
    setEditTranslation(citation.translation);
  };

  const handleSaveInlineCitation = (groupId: string) => {
    if (!editingCitationId) return;

    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const updatedResponses = (q.responses || []).map(r => {
          if (r.groupId === groupId) {
            const updatedCits = (r.citations || []).map(c => {
              if (c.id === editingCitationId) {
                return {
                  ...c,
                  kitab: editKitab,
                  arabicText: editArabic,
                  translation: editTranslation
                };
              }
              return c;
            });
            return { ...r, citations: updatedCits };
          }
          return r;
        });
        return { ...q, responses: updatedResponses };
      }
      return q;
    }));

    addAuditLog(
      "Mushohih (Dewan Penyelia)",
      "UPDATE",
      `Koreksi langsung redaksi kitab '${editKitab}' di lembar pratinjau final.`
    );

    setEditingCitationId(null);
  };

  // Mushohih Actions
  const handleMushohihSaveGroupText = (groupId: string, newText: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const updated = (q.responses || []).map(r => {
          if (r.groupId === groupId) {
            return { ...r, text: newText };
          }
          return r;
        });
        return { ...q, responses: updated };
      }
      return q;
    }));

    addAuditLog(
      "Mushohih (Dewan Penyelia)",
      "UPDATE",
      `Mengoreksi langsung naskah draf jawaban mubahhisin.`
    );
  };

  const handleMushohihSetStatus = (groupId: string, newStatus: "Draft" | "Revisi" | "Disetor" | "Disahkan", note?: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const updated = (q.responses || []).map(r => {
          if (r.groupId === groupId) {
            return { 
              ...r, 
              status: newStatus,
              evaluationNote: note !== undefined ? note : r.evaluationNote
            };
          }
          return r;
        });
        return { ...q, responses: updated };
      }
      return q;
    }));

    addAuditLog(
      "Mushohih (Dewan Penyelia)",
      "STATUS",
      `Mengubah status draf kelompok menjadi ${newStatus.toUpperCase()}${note ? ` dengan catatan: "${note}"` : ""}.`
    );
  };

  const handleMushohihSetPrimary = (groupId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const updated = (q.responses || []).map(r => {
          if (r.groupId === groupId) {
            return { ...r, isReferensiUtama: !r.isReferensiUtama };
          }
          return r;
        });
        return { ...q, responses: updated };
      }
      return q;
    }));

    addAuditLog(
      "Mushohih (Dewan Penyelia)",
      "UPDATE",
      `Mengubah status Referensi Utama draf jawaban kelompok.`
    );
  };

  const handleMushohihAddCitation = (groupId: string, kitab: string, arabic: string, translation: string) => {
    const newCitation: ArabicCitation = {
      id: `cit-mub-${Date.now()}`,
      kitab,
      arabicText: arabic,
      translation
    };

    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const updated = (q.responses || []).map(r => {
          if (String(r.groupId) === String(groupId)) {
            return {
              ...r,
              citations: [...(r.citations || []), newCitation]
            };
          }
          return r;
        });
        return { ...q, responses: updated };
      }
      return q;
    }));

    addAuditLog(
      "Mushohih (Dewan Penyelia)",
      "INSERT",
      `Menambahkan rujukan kitab '${kitab}' secara langsung ke jawaban kelompok.`
    );
  };

  const handleMushohihDeleteCitation = (groupId: string, citId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        const updated = (q.responses || []).map(r => {
          if (String(r.groupId) === String(groupId)) {
            return {
              ...r,
              citations: (r.citations || []).filter(c => c.id !== citId)
            };
          }
          return r;
        });
        return { ...q, responses: updated };
      }
      return q;
    }));

    addAuditLog(
      "Mushohih (Dewan Penyelia)",
      "DELETE",
      `Menghapus rujukan kitab kuning dari jawaban kelompok.`
    );
  };

  const handlePrintPdf = (q: Question, customNatijah?: string, customNote?: string) => {
    const title = q.title || "";
    const waqiIyyah = q.waqiIyyah || "";
    const asilah = q.asilah || "";
    
    let jawabanText = customNatijah !== undefined ? customNatijah : (q.finalFatwa || "");
    const noteText = customNote !== undefined ? customNote : "";
    
    if (!jawabanText) {
      // Find the primary response
      const primaryResp = q.responses?.find(r => r.isReferensiUtama);
      if (primaryResp) {
        jawabanText = primaryResp.text;
      } else if (q.responses && q.responses.length > 0) {
        jawabanText = q.responses[0].text;
      }
    }

    // Filter citations from responses marked as isReferensiUtama
    const primaryResponses = q.responses?.filter(r => r.isReferensiUtama) || [];
    let citations = primaryResponses.flatMap(r => r.citations || []).filter(c => !c.excludedFromPdf);
    if (citations.length === 0) {
      citations = q.responses?.flatMap(r => r.citations || []).filter(c => !c.excludedFromPdf) || [];
    }

    const formattedAsilahLines = asilah
      ? asilah.split("\n").filter(line => line.trim().length > 0)
      : [];

    const citationsHtml = citations.map(c => `
      <div style="margin-bottom: 24px; page-break-inside: avoid;">
        <div style="text-align: right; font-size: 11pt; font-style: italic; margin-bottom: 8px; font-family: 'Times New Roman', serif;">
          (${c.kitab})
        </div>
        <div dir="rtl" style="text-align: right; font-family: 'Amiri', 'Traditional Arabic', 'Scheherazade', 'Times New Roman', serif; font-size: 15pt; line-height: 1.8; margin-bottom: 8px; direction: rtl;">
          ${c.arabicText}
        </div>
        ${c.translation ? `
          <p style="font-size: 10.5pt; font-style: italic; color: #333; margin: 4px 0 0 0; text-align: justify; line-height: 1.5; font-family: 'Times New Roman', serif; text-indent: 15px;">
            Artinya: "${c.translation}"
          </p>
        ` : ''}
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Times New Roman', Times, 'Amiri', 'Georgia', serif;
            color: #000000;
            background-color: #ffffff;
            line-height: 1.6;
            margin: 40px;
            padding: 0;
          }
          
          .title-container {
            text-align: center;
            margin-bottom: 35px;
          }
          
          .title {
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            line-height: 1.4;
            letter-spacing: 0.5px;
          }
          
          .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin: 25px 0 10px 0;
          }
          
          .content-text {
            font-size: 11pt;
            text-align: justify;
            margin: 0;
            line-height: 1.6;
          }
          
          .waqi-text {
            text-indent: 35px;
          }
          
          .asilah-item {
            margin-bottom: 8px;
          }
          
          .arabic-text {
            font-family: 'Amiri', 'Traditional Arabic', 'Scheherazade', 'Times New Roman', serif;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            .section-container {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="title-container">
          <h1 class="title">${title}</h1>
        </div>

        <div class="section-container">
          <h2 class="section-title">Deskripsi Masalah:</h2>
          <p class="content-text waqi-text">${waqiIyyah}</p>
        </div>

        <div class="section-container" style="margin-top: 20px;">
          <h2 class="section-title">Soal :</h2>
          <div class="content-text">
            ${formattedAsilahLines.map(line => `<p class="asilah-item">${line}</p>`).join('')}
          </div>
        </div>

        <div class="section-container" style="margin-top: 20px;">
          <h2 class="section-title">Jawaban :</h2>
          <p class="content-text">${jawabanText}</p>
          ${noteText ? `
            <div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 10px;">
              <p style="font-size: 10pt; font-style: italic; color: #444; margin: 8px 0 0 0; font-family: 'Times New Roman', serif;">
                <strong>Catatan Pentashih Dewan Mushohih:</strong> ${noteText}
              </p>
            </div>
          ` : ''}
        </div>

        ${citationsHtml ? `
          <div class="section-container" style="margin-top: 25px;">
            <h2 class="section-title">Referensi :</h2>
            <div style="margin-top: 12px;">
              ${citationsHtml}
            </div>
          </div>
        ` : ''}

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    let iframe = document.getElementById("pdf-print-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "pdf-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    }
  };

  const handleKetukPalu = () => {
    setGavelStruck(true);

    const combinedFatwa = mushohihNote 
      ? `${natijahText}\n\n=== CATATAN PENTASHIH DEWAN MUSHOhiH ===\n${mushohihNote}`
      : natijahText;

    const updatedQ: Question = {
      ...currentQ,
      status: "Disahkan",
      finalFatwa: combinedFatwa,
      responses: (currentQ.responses || []).map(r => ({
        ...r,
        status: "Disahkan" as const
      }))
    };

    // Set Question status to Disahkan, and update final Natijah
    setQuestions(prev => prev.map(q => {
      if (q.id === selectedQId) {
        return updatedQ;
      }
      return q;
    }));

    addAuditLog(
      "Mushohih (Dewan Penyelia)",
      "STATUS",
      `[KETUK PALU] Mengesahkan keputusan hukum fatwa akhir untuk Masalah: '${currentQ.title}'.`
    );

    // Do not automatically open the PDF preview modal
    setTimeout(() => {
      setGavelStruck(false);
      setNotification({
        message: "⚖️ KETUK PALU BERHASIL! Keputusan sidang resmi DISAHKAN dan dipublikasikan secara nasional.",
        type: "success"
      });
      setTimeout(() => {
        setNotification(null);
      }, 5500);
    }, 500);
  };

  // Helper to get active group's response
  const activeGroupResp = currentQ?.responses?.find(r => r.groupName === mubahhisGroup);
  const mubahhisStatus = activeGroupResp?.status || "Draft";
  const isMubahhisLocked = mubahhisStatus === "Disetor" || mubahhisStatus === "Disahkan" || currentQ?.status === "Disahkan" || currentQ?.status === "Persiapan" || currentQ?.status === "Perumusan";

  const isMuharrirForced = !!(forcedSubTab && ["monitoring", "muharrir-natijah", "kirim-jawaban"].includes(forcedSubTab));
  const isMushohihForced = !!(forcedSubTab && !["monitoring", "muharrir-natijah", "kirim-jawaban"].includes(forcedSubTab));

  if (questions.length === 0 || !currentQ) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
        <h3 className="font-display font-bold text-slate-800">Tidak Ada Masalah Sidang Aktif</h3>
        <p className="text-xs text-slate-500 mt-1">Belum ada masalah sidang yang aktif atau dibuka oleh Admin saat ini.</p>
      </div>
    );
  }

  // Render Role Header Selector
  return (
    <div className="space-y-8 font-sans relative">
      {/* Success/Status Notification Toast */}
      {notification && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md text-white rounded-2xl shadow-2xl border p-4 flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 animate-toast-in animate-bounce-subtle ${
          notification.type === 'error'
            ? 'bg-rose-900 border-rose-700/50 shadow-rose-950/40'
            : 'bg-emerald-900 border-emerald-700/50 shadow-emerald-950/40'
        }`}>
          <div className={`p-2.5 rounded-xl shrink-0 border ${
            notification.type === 'error'
              ? 'bg-rose-800 text-rose-300 border-rose-700'
              : 'bg-emerald-800 text-emerald-300 border-emerald-700'
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

      {/* Brand Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#15803d] border border-emerald-400/30 p-7 rounded-3xl text-white shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/40 via-transparent to-transparent"></div>
        <div className="relative z-10 space-y-3.5">
          <span className="inline-block text-[10px] bg-emerald-400/30 text-white border border-emerald-300/40 px-3 py-1 rounded-full uppercase tracking-widest font-extrabold mb-3">
            Musyawarah Fiqhiyyah Digital
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
            Forum Sidang Bahtsul Masail
          </h1>
          <p className="text-xs md:text-sm text-emerald-50/95 font-medium max-w-xl leading-relaxed">
            Sistem Mubahhitsin, Muharrir dan Mushohih hukum islam secara real-time
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1 lg:mt-0">
          <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider shrink-0 mb-1 sm:mb-0">Bahas Masalah:</span>
          <select
            value={selectedQId}
            onChange={(e) => {
              const val = e.target.value;
              const parsed = /^\d+$/.test(val) ? parseInt(val, 10) : val;
              setSelectedQId(parsed);
            }}
            className="text-xs md:text-sm border border-white/20 bg-white/10 hover:bg-white/20 font-bold text-white px-4 py-2.5 rounded-2xl max-w-xs focus:outline-none focus:ring-2 focus:ring-white/40 transition-all shadow-inner backdrop-blur-md cursor-pointer"
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id} className="bg-[#15803d] text-white font-bold">
                [{q.status}] {q.title.substring(0, 42)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Section: Sesi Peran Aktif & Masalah Aktif (Stacked Vertically) */}
      <div className="w-full mb-6">
        <div className="flex flex-col gap-4 w-full">
          
          {/* Sesi Peran Aktif (Simulator Playground) */}
          {(!userRole || userRole === "Admin") && (
            <div className="bg-white rounded-2xl border border-border-hairline p-3 shadow-sm space-y-2 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <div className="space-y-0.5">
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Sesi Peran Aktif (Simulasi)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-normal leading-tight">
                    Uji hak akses dan alur otorisasi multi-role.
                  </p>
                </div>
                
                <div className="flex flex-wrap bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 shadow-inner shrink-0">
                  {!forcedSubTab && (
                    <button
                      onClick={() => setActiveRole("Mubahhisin")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                        activeRole === "Mubahhisin" 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>Mubahhisin</span>
                    </button>
                  )}
                  {isMuharrirForced && (
                    <button
                      onClick={() => setActiveRole("Muharrir")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                        activeRole === "Muharrir" 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Muharrir</span>
                    </button>
                  )}
                  {isMushohihForced && (
                    <button
                      onClick={() => setActiveRole("Mushohih")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                        activeRole === "Mushohih" 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Scale className="w-3 h-3" />
                      <span>Mushohih</span>
                    </button>
                  )}
                  {!forcedSubTab && (
                    <button
                      onClick={() => setActiveRole("Public")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                        activeRole === "Public" 
                          ? "bg-emerald-600 text-white shadow-sm" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Publik</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic description of permissions */}
              <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-600 leading-normal">
                {activeRole === "Mubahhisin" && (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Mode Mubahhisin:</span> Hanya dapat menyetor jawaban milik kelompok di bawah. Terkunci jika status <span className="font-bold text-slate-800">"Disetor"</span> atau <span className="font-bold text-emerald-700">"Disahkan"</span>.
                    </div>
                  </>
                )}
                {activeRole === "Muharrir" && (
                  <>
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Mode Muharrir:</span> Memantau 5 kelompok secara real-time. Menetapkan <span className="font-bold text-emerald-700">Referensi Utama</span>, koreksi, merumuskan <span className="font-bold text-slate-800">Natijah Global</span>, / buka gembok.
                    </div>
                  </>
                )}
                {activeRole === "Mushohih" && (
                  <>
                    <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Mode Mushohih:</span> Hak mutlak edit teks rujukan, terjemahan, dan Natijah pada lembar cetak gabungan real-time sebelum <span className="font-bold text-emerald-700">Ketuk Palu Resmi</span>.
                    </div>
                  </>
                )}
                {activeRole === "Public" && (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Pratinjau Publik:</span> Tampilan transparan bagi masyarakat umum untuk memantau jalannya persidangan, referensi dalil resmi, dan hasil fatwa yang disahkan.
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Overhauled Question Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 w-full space-y-6">
            {/* Top Header Row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">
                MASALAH AKTIF
              </span>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
                currentQ.status === "Disahkan" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : currentQ.status === "Disetor"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {currentQ.status === "Disahkan" ? "Disahkan Mushohih" : currentQ.status}
              </span>
            </div>

            {/* Title & Badge Row */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {currentQ.title}
              </h2>

              <div className="flex flex-wrap gap-2 shrink-0 md:mt-1">
                {currentQ.categories.map((c, i) => (
                  <span key={i} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                    {c}
                  </span>
                ))}
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                  Tahun {currentQ.year}
                </span>
              </div>
            </div>

            {/* Waqi'iyyah (Konteks Masalah) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                DESKRIPSI MASALAH (WAQI'IYYAH)
              </h4>
              <p className="text-base md:text-lg text-slate-800 font-normal leading-relaxed text-justify whitespace-pre-line">
                {currentQ.waqiIyyah}
              </p>
            </div>

            {/* Divider Line */}
            <div className="border-t border-slate-100 my-6"></div>

            {/* Asilah (Soal Pertanyaan) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                SOAL PERTANYAAN (AS'ILAH)
              </h4>
              <div className="text-base md:text-lg text-slate-800 font-normal leading-relaxed space-y-4 whitespace-pre-line pl-4">
                {currentQ.asilah.split("\n").map((aLine, aIdx) => {
                  const trimmed = aLine.trim();
                  if (!trimmed) return null;
                  return (
                    <p key={aIdx} className="leading-relaxed text-slate-800 font-normal">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Catatan Tambahan (Notes) jika tersedia */}
            {currentQ.notes && currentQ.notes.trim().length > 0 && (
              <>
                <div className="border-t border-slate-100 my-6"></div>
                <div className="space-y-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    CATATAN TAMBAHAN (REFERENSI PENDUKUNG)
                  </h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                    {currentQ.notes}
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Dynamic Role Panel Content (Memanjang kebawah saja seperti semula - FULL WIDTH) */}
      <div className="space-y-6 w-full">
        {/* DYNAMIC ROLE PANEL CONTENT */}

        {/* 1. MUBAHHISIN PANEL */}
        {activeRole === "Mubahhisin" && (
          <MubahhisinPanel
              currentQ={currentQ}
              mubahhisGroup={mubahhisGroup}
              setMubahhisGroup={setMubahhisGroup}
              userRole={userRole}
              activeGroupResp={activeGroupResp}
              mubahhisStatus={mubahhisStatus}
              isMubahhisLocked={isMubahhisLocked}
              responseText={responseText}
              setResponseText={setResponseText}
              kitabName={kitabName}
              setKitabName={setKitabName}
              juzKe={juzKe}
              setJuzKe={setJuzKe}
              halamanBerapa={halamanBerapa}
              setHalamanBerapa={setHalamanBerapa}
              karanganSiapa={karanganSiapa}
              setKaranganSiapa={setKaranganSiapa}
              statusHukum={statusHukum}
              setStatusHukum={setStatusHukum}
              arabicText={arabicText}
              setArabicText={setArabicText}
              translation={translation}
              setTranslation={setTranslation}
              handleAddMubahhisCitation={handleAddMubahhisCitation}
              handleRemoveMubahhisCitation={handleRemoveMubahhisCitation}
              handleSaveMubahhisDraft={handleSaveMubahhisDraft}
              defaultGroups={DEFAULT_GROUPS}
              mubahhisEditingCitId={mubahhisEditingCitId}
              handleStartEditMubahhisCitation={handleStartEditMubahhisCitation}
              handleCancelEditMubahhisCitation={handleCancelEditMubahhisCitation}
            />
          )}

          {/* 2. MUHARRIR PANEL */}
          {activeRole === "Muharrir" && (
            <MuharrirPanel
              currentQ={currentQ}
              isLocked={isLocked}
              natijahText={natijahText}
              setNatijahText={setNatijahText}
              handleSetorNatijah={handleSetorNatijah}
              handleSaveEvaluationNote={handleSaveEvaluationNote}
              handleTogglePrimaryReference={handleTogglePrimaryReference}
              handleReturnToRevision={handleReturnToRevision}
              mubahhisGroup={mubahhisGroup}
              setMubahhisGroup={setMubahhisGroup}
              activeGroupResp={activeGroupResp}
              responseText={responseText}
              setResponseText={setResponseText}
              kitabName={kitabName}
              setKitabName={setKitabName}
              juzKe={juzKe}
              setJuzKe={setJuzKe}
              halamanBerapa={halamanBerapa}
              setHalamanBerapa={setHalamanBerapa}
              karanganSiapa={karanganSiapa}
              setKaranganSiapa={setKaranganSiapa}
              statusHukum={statusHukum}
              setStatusHukum={setStatusHukum}
              arabicText={arabicText}
              setArabicText={setArabicText}
              translation={translation}
              setTranslation={setTranslation}
              handleAddMubahhisCitation={handleAddMubahhisCitation}
              handleRemoveMubahhisCitation={handleRemoveMubahhisCitation}
              handleSaveMubahhisDraft={handleSaveMubahhisDraft}
              defaultGroups={DEFAULT_GROUPS}
              activeSubTab={muharrirSubTab}
              mubahhisEditingCitId={mubahhisEditingCitId}
              handleStartEditMubahhisCitation={handleStartEditMubahhisCitation}
              handleCancelEditMubahhisCitation={handleCancelEditMubahhisCitation}
            />
          )}

          {/* 3. MUSHOhiH PANEL */}
          {activeRole === "Mushohih" && (
            <MushohihPanel
              currentQ={currentQ}
              isLocked={isLocked}
              mushohihSubTab={mushohihSubTab}
              setMushohihSubTab={setMushohihSubTab}
              editingGroupId={editingGroupId}
              setEditingGroupId={setEditingGroupId}
              groupEditText={groupEditText}
              setGroupEditText={setGroupEditText}
              handleMushohihSaveGroupText={handleMushohihSaveGroupText}
              handleMushohihSetStatus={handleMushohihSetStatus}
              handleMushohihSetPrimary={handleMushohihSetPrimary}
              editingCitationId={editingCitationId}
              setEditingCitationId={setEditingCitationId}
              editKitab={editKitab}
              setEditKitab={setEditKitab}
              editArabic={editArabic}
              setEditArabic={setEditArabic}
              editTranslation={editTranslation}
              setEditTranslation={setEditTranslation}
              handleSaveInlineCitation={handleSaveInlineCitation}
              handleMushohihDeleteCitation={handleMushohihDeleteCitation}
              newCitGroupId={newCitGroupId}
              setNewCitGroupId={setNewCitGroupId}
              newCitKitab={newCitKitab}
              setNewCitKitab={setNewCitKitab}
              newCitArabic={newCitArabic}
              setNewCitArabic={setNewCitArabic}
              newCitTranslation={newCitTranslation}
              setNewCitTranslation={setNewCitTranslation}
              handleMushohihAddCitation={handleMushohihAddCitation}
              natijahText={natijahText}
              setNatijahText={setNatijahText}
              mushohihNote={mushohihNote}
              setMushohihNote={setMushohihNote}
              handleKetukPalu={handleKetukPalu}
              gavelStruck={gavelStruck}
              hideSubTabs={!!forcedSubTab}
            />
          )}

          {/* 4. PUBLIC VIEW PANEL */}
          {activeRole === "Public" && (
            <div className="bg-white rounded-2xl border border-border-hairline shadow-sm overflow-hidden p-5 md:p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Portal Publikasi Masyarakat
                  </h3>
                  <p className="text-[11px] text-slate-400">Halaman transparansi hasil keputusan syariat yang dapat diunduh publik.</p>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                  Masyarakat
                </span>
              </div>

              {currentQ.status === "Disahkan" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider block">✅ KEPUTUSAN HUKUM RESMI TERBIT</span>
                    <p className="font-normal text-slate-700">
                      Fatwa hukum tentang masalah ini telah disahkan oleh Dewan Mushohih dan sah menjadi panduan syariat bagi masyarakat Nahdliyin.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-border-hairline space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">DOKUMEN FATWA FINAL:</h4>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed font-sans border-l-4 border-emerald-600 pl-4">
                      {currentQ.finalFatwa}
                    </p>
                  </div>

                   <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfModalQ(currentQ)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Resmi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfModalQ(currentQ)}
                      className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto animate-pulse" />
                  <p className="text-xs font-extrabold text-slate-700 uppercase">Sedang Dalam Tahap Sidang</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal leading-relaxed">
                    Hasil keputusan belum diterbitkan karena Dewan Mushohih belum melakukan ketok palu pengesahan. Silakan pantau siaran live log.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {pdfModalQ && (
        <PdfPreviewModal
          question={pdfModalQ}
          isOpen={!!pdfModalQ}
          onClose={() => setPdfModalQ(null)}
          customNatijah={pdfModalQ.id === currentQ.id ? natijahText : undefined}
          customNote={pdfModalQ.id === currentQ.id ? mushohihNote : undefined}
        />
      )}
    </div>
  );
}
