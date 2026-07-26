import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Trash2, 
  Plus, 
  HelpCircle, 
  FileSpreadsheet,
  ArrowRight,
  Search,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  Clock,
  Edit3,
  Brain,
  Coins,
  Activity,
  ArrowLeft,
  UploadCloud,
  Play
} from "lucide-react";
import { Question } from "../types";
import { supabase } from "../src/config/supabaseClient";

interface ManajemenSoalProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  addAuditLog: (operator: string, action: "UPDATE" | "STATUS" | "INSERT" | "DELETE" | "OVERRIDE", detail: string) => void;
  isAdminOverride: boolean;
  activeGroup: string;
}

function formatDateIndo(dateStr?: string) {
  if (!dateStr) {
    const now = new Date();
    return `${now.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][now.getMonth()]} ${now.getFullYear()}`;
  }
  try {
    const cleanDateStr = dateStr.replace(' ', 'T');
    const dateObj = new Date(cleanDateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    const day = dateObj.getDate();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthName = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${monthName} ${year}`;
  } catch (_) {
    return dateStr;
  }
}

export default function ManajemenSoal({
  questions,
  setQuestions,
  addAuditLog,
  isAdminOverride,
  activeGroup
}: ManajemenSoalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"list" | "form">("list");
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Display 4 items per page exactly as in the mockup reference
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  // Menu State for individual question action dropdowns
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form State for Registrasi / Edit
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [problemDate, setProblemDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [categories, setCategories] = useState<string[]>(["Jinayat", "Muamalah"]);
  const [newTagInput, setNewTagInput] = useState("");
  const [waqiIyyah, setWaqiIyyah] = useState("");
  const [asilah, setAsilah] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim();
    if (cleanTag && !categories.includes(cleanTag)) {
      setCategories([...categories, cleanTag]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCategories(categories.filter(tag => tag !== tagToRemove));
  };

  const handleResetForm = () => {
    setEditingQuestionId(null);
    setTitle("");
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setProblemDate(`${y}-${m}-${d}`);
    setCategories(["Jinayat", "Muamalah"]);
    setNewTagInput("");
    setWaqiIyyah("");
    setAsilah("");
    setNotes("");
    setActiveSubTab("list");
  };

  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setTitle(q.title);
    
    if (q.createdAt) {
      const datePart = q.createdAt.split(' ')[0];
      setProblemDate(datePart);
    } else {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setProblemDate(`${y}-${m}-${d}`);
    }
    
    setCategories(q.categories && q.categories.length > 0 ? q.categories : ["Jinayat"]);
    setWaqiIyyah(q.waqiIyyah || "");
    setAsilah(q.asilah || "");
    setNotes(q.notes || "");
    setActiveSubTab("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !waqiIyyah || !asilah) {
      alert("Harap lengkapi semua field utama (Judul, Waqi'iyyah, dan Asilah)!");
      return;
    }

    const dateObj = new Date(problemDate);
    const selectedYear = isNaN(dateObj.getTime()) ? 2026 : dateObj.getFullYear();
    const formattedDate = isNaN(dateObj.getTime())
      ? new Date().toISOString().replace('T', ' ').substring(0, 19)
      : problemDate + " " + new Date().toTimeString().split(' ')[0];

    const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";

    if (editingQuestionId) {
      // Update existing question
      try {
        await supabase
          .from('masalah_sidang')
          .update({
            judul_pembahasan: title,
            deskripsi_masalah: waqiIyyah,
            soal_pertanyaan: asilah,
            kategori_masalah: categories,
            tahun_sidang: selectedYear,
          })
          .eq('id', editingQuestionId);
      } catch (err) {
        console.error("Gagal memperbarui database Supabase:", err);
      }

      setQuestions(prev => prev.map(q => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            title,
            year: selectedYear,
            categories,
            waqiIyyah,
            asilah,
            notes: notes || undefined
          };
        }
        return q;
      }));

      addAuditLog(
        operatorName,
        "UPDATE",
        `Mengedit masalah: '${title.substring(0, 40)}...'`
      );
    } else {
      // Create new question
      const newQuestion: Question & { notes?: string } = {
        id: `q-${Date.now()}`,
        title,
        year: selectedYear,
        categories,
        waqiIyyah,
        asilah,
        status: "Persiapan",
        arabicCitations: [],
        responses: [],
        finalFatwa: "",
        createdAt: formattedDate,
        notes: notes || undefined
      };

      setQuestions(prev => [newQuestion, ...prev]);
      
      addAuditLog(
        operatorName,
        "INSERT",
        `Mendaftarkan masalah baru: '${title.substring(0, 40)}...'`
      );
    }

    handleResetForm();
  };

  const handleDeleteQuestion = (id: string, qTitle: string) => {
    setDeleteConfirm({ id, title: qTitle });
  };

  const handleUpdateStatus = async (id: string, newStatus: string, qTitle: string) => {
    try {
      const { error } = await supabase
        .from('masalah_sidang')
        .update({ status_sidang: newStatus })
        .eq('id', id);

      if (error) throw error;

      setQuestions(prev => prev.map(q => {
        if (q.id === id) {
          return { ...q, status: newStatus };
        }
        return q;
      }));
      
      const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";
      addAuditLog(
        operatorName,
        "STATUS",
        `Mengubah status masalah '${qTitle.substring(0, 30)}...' menjadi [${newStatus}]`
      );
    } catch (err: any) {
      console.error("Gagal memperbarui status:", err.message);
    }
  };

  // Helper to resolve relevant icons based on titles or category tags
  const getQuestionIcon = (title: string, categories: string[]) => {
    const lowerTitle = title.toLowerCase();
    const lowerCategories = categories.map(c => c.toLowerCase());
    
    if (lowerTitle.includes("ai") || lowerTitle.includes("artificial") || lowerTitle.includes("seni") || lowerCategories.includes("seni & budaya")) {
      return <Brain className="w-5 h-5 text-emerald-600" />;
    }
    if (lowerTitle.includes("kripto") || lowerTitle.includes("crypto") || lowerTitle.includes("stablecoin") || lowerTitle.includes("wakalah") || lowerCategories.includes("keuangan")) {
      return <Coins className="w-5 h-5 text-emerald-600" />;
    }
    if (lowerTitle.includes("kloning") || lowerTitle.includes("stem") || lowerTitle.includes("transplantasi") || lowerTitle.includes("organ") || lowerTitle.includes("sel punca") || lowerCategories.includes("medis")) {
      return <Activity className="w-5 h-5 text-emerald-600" />;
    }
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  // Filtering actions resetting active pagination
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };
  const handleYearChange = (val: string) => {
    setSelectedYear(val);
    setCurrentPage(1);
  };
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };
  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  // Extract unique filter dropdown values dynamically from current database
  const uniqueYears = Array.from(new Set(questions.map(q => q.year.toString()))).sort((a, b) => b.localeCompare(a));
  const uniqueCategories = Array.from(new Set(questions.flatMap(q => q.categories))).sort();

  // Run the combined filter pipeline
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.waqiIyyah.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.asilah.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !selectedYear || selectedYear === "Semua Tahun" || q.year.toString().includes(selectedYear);
    const matchesCategory = selectedCategory === "Semua Kategori" || q.categories.includes(selectedCategory);
    const matchesStatus = selectedStatus === "Semua Status" || q.status.toLowerCase() === selectedStatus.toLowerCase();
    
    return matchesSearch && matchesYear && matchesCategory && matchesStatus;
  });

  // Pagination bounds calculation
  const totalItems = filteredQuestions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Adjust currentPage if it goes out of bounds of totalPages (e.g. after deletion of last item)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Pagination buttons logic generating dynamic buttons with dots ellipsis [...]
  const renderPaginationButtons = () => {
    const buttons: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return buttons.map((btn, idx) => {
      if (btn === "...") {
        return (
          <span key={`dots-${idx}`} className="px-2 text-xs font-bold text-slate-400 select-none">
            ...
          </span>
        );
      }
      
      const pageNumber = btn as number;
      const isActive = pageNumber === currentPage;
      
      return (
        <button
          key={`page-${pageNumber}`}
          onClick={() => setCurrentPage(pageNumber)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all focus:outline-none ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
          id={`page-btn-${pageNumber}`}
        >
          {pageNumber}
        </button>
      );
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Dynamic Header depending on Active Tab */}
      {activeSubTab === "list" ? (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
              Manajemen Soal
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Kelola dan distribusikan masalah fiqih kontemporer untuk kajian dan diskusi kelompok mubahhitsin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSubTab("list")}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              id="btn-daftar-masalah-top"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Daftar Masalah</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab("form")}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              id="btn-registrasi-baru-top"
            >
              <Plus className="w-4 h-4" />
              <span>Registrasi Baru</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
              {editingQuestionId ? "Edit Masalah" : "Registrasi Masalah"}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {editingQuestionId 
                ? "Perbarui kronologi, pertanyaan, dan catatan masalah hukum fiqih kontemporer." 
                : "Rumuskan kronologi masalah hukum fiqih kontemporer dan distribusikan ke kelompok mubahhasin."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleResetForm()}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
              id="btn-kembali-top"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali ke Daftar Masalah</span>
            </button>
          </div>
        </div>
      )}



      {activeSubTab === "list" ? (
        /* ================= REDESIGNED LIST SUBTAB ================= */
        <div className="space-y-4">
          
          {/* Main Card Layout container incorporating filters, list rows and pagination */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm" id="main-questions-card">
            
            {/* Filter Row Section */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white rounded-t-2xl">
              
              {/* Search query input */}
              <div className="space-y-1.5" id="pencarian-masalah-group">
                <label className="block text-xs font-bold text-slate-400 tracking-wide uppercase">
                  Pencarian Masalah
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari judul atau kata kunci..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full text-xs font-semibold pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all"
                    id="search-input"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Year filter input */}
              <div className="space-y-1.5" id="tahun-masalah-group">
                <label className="block text-xs font-bold text-slate-400 tracking-wide uppercase">
                  Tahun Masalah
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Semua Tahun"
                    value={selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full text-xs font-semibold pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all"
                    id="year-select"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Category select filter dropdown */}
              <div className="space-y-1.5" id="kategori-fiqih-group">
                <label className="block text-xs font-bold text-slate-400 tracking-wide uppercase">
                  Kategori Fiqih
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full text-xs font-semibold pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 appearance-none transition-all cursor-pointer"
                    id="category-select"
                  >
                    <option value="Semua Kategori">Semua Kategori</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status select filter dropdown */}
              <div className="space-y-1.5" id="status-group">
                <label className="block text-xs font-bold text-slate-400 tracking-wide uppercase">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full text-xs font-semibold pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 appearance-none transition-all cursor-pointer"
                    id="status-select"
                  >
                    <option value="Semua Status">Semua Status</option>
                    <option value="Persiapan">Persiapan</option>
                    <option value="Dimulai">Dimulai</option>
                    <option value="Perumusan">Perumusan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* List entries with bottom division lines */}
            <div className="divide-y divide-slate-100 border-t border-slate-100" id="questions-list-wrapper">
              {paginatedQuestions.map((q) => {
                const isMenuOpen = openMenuId === q.id;
                return (
                  <div 
                    key={q.id} 
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/40 relative"
                    id={`question-row-${q.id}`}
                  >
                    {/* Left Info Section Column */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      
                      {/* Dynamic Icon rounded wrapper */}
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-emerald-100/30">
                        {getQuestionIcon(q.title, q.categories)}
                      </div>

                      {/* Title & tags detail text wrapper */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="font-display font-bold text-slate-900 text-sm md:text-base leading-snug hover:text-emerald-700 transition-colors cursor-pointer block"
                          title={q.title}
                          id={`question-title-${q.id}`}
                        >
                          {q.title}
                        </h3>
                        
                        {/* Subinfo Row with creation parameters */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mt-1">
                          <span>Tahun {q.year}</span>
                          <span className="text-slate-300">•</span>
                          <span>Dibuat: {formatDateIndo(q.createdAt)}</span>
                        </div>

                        {/* Category Tags in Mufid Emerald design aesthetic */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {q.categories.map((cat, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] bg-emerald-50 hover:bg-emerald-100/70 text-emerald-700 font-extrabold px-3 py-1 rounded-full transition-colors cursor-default border border-emerald-100/30"
                              id={`tag-${q.id}-${idx}`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Action & Status Column */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      
                      {/* High-fidelity Status Badges replicating mockup exactly */}
                      {q.status === "Selesai" || q.status === "Disahkan" ? (
                        <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Selesai</span>
                        </span>
                      ) : q.status === "Perumusan" ? (
                        <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Perumusan</span>
                        </span>
                      ) : q.status === "Dimulai" || q.status === "Disetor" ? (
                        <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dimulai</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold bg-slate-50 text-slate-500 border border-slate-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Persiapan</span>
                        </span>
                      )}

                      {/* Dynamic three-dots interactive action dropdown overlay */}
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : q.id);
                          }}
                          className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all focus:outline-none cursor-pointer"
                          title="Menu Aksi"
                          id={`action-btn-${q.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown overlay */}
                        {isMenuOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              style={{ borderColor: "#1d3e8e" }}
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div 
                              className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 origin-top-right animate-fade-in"
                              style={{ borderColor: "#1d3e8e" }}
                            >
                              <p className="px-3 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Aksi Masalah</p>
                              
                              {/* Option 1: Mulai Sidang */}
                              {q.status !== "Dimulai" && (
                                <button
                                  onClick={() => {
                                    handleUpdateStatus(q.id, "Dimulai", q.title);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2 cursor-pointer"
                                >
                                  <span>🟢 Mulai Sidang</span>
                                </button>
                              )}
                              
                              {/* Option 2: Alihkan ke Perumusan */}
                              {q.status !== "Perumusan" && (
                                <button
                                  onClick={() => {
                                    handleUpdateStatus(q.id, "Perumusan", q.title);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2 cursor-pointer"
                                >
                                  <span>🕒 Alihkan ke Perumusan</span>
                                </button>
                              )}

                              {/* Option 3: Sahkan Hasil Sidang */}
                              {q.status !== "Selesai" && (
                                <button
                                  onClick={() => {
                                    handleUpdateStatus(q.id, "Selesai", q.title);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2 cursor-pointer"
                                >
                                  <span>✅ Sahkan Hasil Sidang</span>
                                </button>
                              )}

                              {/* Option 4: Edit Masalah */}
                              <button
                                onClick={() => {
                                  handleStartEdit(q);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 font-semibold flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Edit Masalah</span>
                              </button>

                              <div className="border-t border-slate-100 my-1" />

                              {/* Option 5: Hapus Masalah */}
                              <button
                                onClick={() => {
                                  handleDeleteQuestion(q.id, q.title);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Hapus Masalah</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Filtering Empty State */}
              {paginatedQuestions.length === 0 && (
                <div className="p-12 text-center bg-white" id="empty-state">
                  <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">Masalah Tidak Ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1">Tidak ada hasil yang sesuai dengan kriteria pencarian atau filter Anda.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls Footer replicating mockup layout exactly */}
            {totalItems > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/20 rounded-b-2xl" id="pagination-section">
                
                {/* Left side text showing bounds */}
                <span className="text-xs md:text-sm text-slate-500 font-medium">
                  Menampilkan <span className="font-bold text-slate-700">{startIndex + 1} - {endIndex}</span> dari <span className="font-bold text-slate-700">{totalItems}</span> masalah
                </span>

                {/* Right side page numbers control items */}
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  {/* Back button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                    title="Halaman Sebelumnya"
                    id="prev-page-btn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Generated sequence with possible dots ellipsis */}
                  {renderPaginationButtons()}

                  {/* Next button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all focus:outline-none cursor-pointer disabled:cursor-not-allowed"
                    title="Halaman Selanjutnya"
                    id="next-page-btn"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* ================= REGISTRASI FORM SUBTAB (Redesigned high-fidelity UI exactly matching mockup reference) ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden max-w-6xl" id="registrasi-masalah-card">
          {/* Card Form Header Section */}
          <div className="flex items-center justify-between p-6 md:p-8 pb-6 border-b border-slate-100" id="form-header-section">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  {editingQuestionId ? "Form Edit Masalah" : "Form Registrasi Masalah"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingQuestionId 
                    ? "Perbarui informasi dan redaksi masalah secara detail." 
                    : "Lengkapi informasi masalah secara detail dan sistematis."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Kembali ke Daftar</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Fields layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* JUDUL MASALAH */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-sm font-bold text-emerald-800">
                  Judul Masalah <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={150}
                    placeholder="Masukkan judul bahsul masail yang ringkas dan jelas..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs font-semibold pl-4 pr-16 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all shadow-sm"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                    {title.length}/150
                  </span>
                </div>
              </div>

              {/* TANGGAL MASALAH */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-emerald-800">
                  Tanggal Masalah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={problemDate}
                  onChange={(e) => setProblemDate(e.target.value)}
                  className="w-full text-xs font-semibold px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all cursor-pointer shadow-sm"
                  required
                />
              </div>
            </div>

            {/* KATEGORI FIQIH */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-emerald-800">
                Kategori Fiqih <span className="text-rose-500">*</span>
              </label>
              
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl min-h-[46px] pr-10 focus-within:ring-2 focus-within:ring-emerald-500/15 focus-within:border-emerald-600 transition-all shadow-sm">
                  {categories.map((cat) => (
                    <span 
                      key={cat} 
                      className="inline-flex items-center bg-emerald-50/70 text-emerald-700 border border-emerald-100 pl-3 pr-1.5 py-1 rounded-full text-xs font-bold space-x-1 shadow-sm"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(cat)}
                        className="w-4 h-4 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center text-[10px] transition-colors cursor-pointer focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Inline text entry for adding new category */}
                  <input
                    type="text"
                    placeholder={categories.length === 0 ? "Pilih atau tambahkan kategori..." : "Tambah kategori..."}
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(e);
                      }
                    }}
                    className="flex-1 min-w-[150px] text-xs font-semibold text-slate-800 placeholder-slate-400 bg-transparent py-1 focus:outline-none"
                  />
                  
                  {/* Dropdown Chevron Down indicator */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Suggestions display block */}
                {newTagInput.trim() && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-10 max-h-40 overflow-y-auto">
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg flex items-center justify-between"
                    >
                      <span>Tambahkan &ldquo;{newTagInput.trim()}&rdquo;</span>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Category Selector Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono mr-1">Rekomendasi Kategori:</span>
                  {["Thaharah", "Muamalah", "Jinayat", "Medis", "Teknologi", "Zakat", "Sosial Kemasyarakatan"].map((presetCat) => {
                    const isSelected = categories.includes(presetCat);
                    return (
                      <button
                        key={presetCat}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveTag(presetCat);
                          } else {
                            setCategories([...categories, presetCat]);
                          }
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {isSelected ? `✓ ${presetCat}` : `+ ${presetCat}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Waqi'iyyah & Asilah Textareas side-by-side as in mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* KONTEKS MASALAH (WAQI'IYYAH) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="block text-sm font-bold text-emerald-800">
                    Deskripsi Masalah (Waqi&apos;iyyah) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-600" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg w-48 z-10 leading-normal font-medium">
                      Deskripsikan kronologi atau konteks aktual dari masalah secara lengkap, jelas, dan sistematis.
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <textarea
                    rows={6}
                    maxLength={1000}
                    placeholder="Deskripsikan kronologi atau konteks aktual dari masalah secara lengkap, jelas, dan sistematis..."
                    value={waqiIyyah}
                    onChange={(e) => setWaqiIyyah(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl px-4 py-3 pb-8 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all leading-relaxed shadow-sm resize-none"
                    required
                  />
                  <span className="absolute right-4 bottom-3 text-[10px] font-semibold text-slate-400 pointer-events-none">
                    {waqiIyyah.length}/1000
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Jelaskan latar belakang, situasi, pihak terkait, dan detail penting lainnya
                </p>
              </div>

              {/* SOAL PERTANYAAN RESMI (ASILAH) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <label className="block text-sm font-bold text-emerald-800">
                    Soal Pertanyaan (Asilah) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <HelpCircle className="w-4 h-4 text-slate-400 cursor-help hover:text-slate-600" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg w-48 z-10 leading-normal font-medium">
                      Poin pertanyaan terstruktur hukum syara&apos; yang wajib dijawab oleh mubahhasin.
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={6}
                    maxLength={1000}
                    placeholder="Ketik poin pertanyaan utama (asilah) atau kronologi aktual yang wajib dijawab oleh mubahhasin..."
                    value={asilah}
                    onChange={(e) => setAsilah(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-200 rounded-xl px-4 py-3 pb-8 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all leading-relaxed shadow-sm resize-none"
                    required
                  />
                  <span className="absolute right-4 bottom-3 text-[10px] font-semibold text-slate-400 pointer-events-none">
                    {asilah.length}/1000
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Rumuskan pertanyaan inti yang menjadi fokus pembahasan
                </p>
              </div>
            </div>

            {/* CATATAN TAMBAHAN (OPTIONAL) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-emerald-800">
                Catatan Tambahan (Opsional)
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Informasi tambahan, referensi, atau catatan lain yang relevan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-4 py-3 pb-8 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all leading-relaxed shadow-sm resize-none"
                />
                <span className="absolute right-4 bottom-3 text-[10px] font-semibold text-slate-400 pointer-events-none">
                  {notes.length}/500
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Referensi kitab, sumber data, catatan khusus, atau informasi pendukung lainnya
              </p>
            </div>

            {/* Redesigned Footer Actions */}
            <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                id="btn-form-cancel"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                id="btn-form-submit"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{editingQuestionId ? "Simpan Perubahan" : "Simpan & Sinkronkan"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setDeleteConfirm(null)}
          />
          
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative z-10 animate-fade-in space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-display font-bold text-slate-900 text-base leading-snug">
                  Konfirmasi Hapus Masalah
                </h3>
                <p className="text-xs text-slate-500 leading-normal font-medium">
                  Apakah Anda yakin ingin menghapus masalah <span className="font-bold text-slate-800">"{deleteConfirm.title}"</span>? Tindakan ini tidak dapat dibatalkan dan semua riwayat terkait akan terhapus secara permanen.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestions(prev => prev.filter(q => q.id !== deleteConfirm.id));
                  
                  const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";
                  addAuditLog(
                    operatorName,
                    "DELETE",
                    `Menghapus masalah: '${deleteConfirm.title.substring(0, 40)}...'`
                  );
                  
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer animate-pulse-subtle"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
