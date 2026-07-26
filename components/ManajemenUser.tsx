import React, { useState } from "react";
import { 
  Users, 
  Search, 
  X, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Plus, 
  Check, 
  ShieldAlert,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { User, UserRole } from "../types";

interface IndexUserProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addAuditLog: (operator: string, action: "UPDATE" | "STATUS" | "INSERT" | "DELETE" | "OVERRIDE", detail: string) => void;
  isAdminOverride: boolean;
  activeGroup: string;
}

export default function ManajemenUser({
  users,
  setUsers,
  addAuditLog,
  isAdminOverride,
  activeGroup
}: IndexUserProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Drawer / Side Panel State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form fields inside drawer
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState<UserRole>("Mubahhisin");
  const [formGroup, setFormGroup] = useState("Kelompok 1");

  // Loading & feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Confirmation modal for create
  const [createConfirm, setCreateConfirm] = useState(false);

  // Filter pills list
  const rolesFilterList = ["All", "Mubahhisin", "Muharrir", "Mushohih"];

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Search filter calculation
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.group.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = 
      selectedRoleFilter === "All" || user.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormName(user.fullName);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormGroup(user.group);
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("Mubahhisin");
    setFormGroup("Kelompok 1");
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingUser(null);
    setFormErrors({});
    setCreateConfirm(false);
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formName.trim()) {
      errors.name = "Nama lengkap harus diisi.";
    }

    if (!formEmail.trim()) {
      errors.email = "Email harus diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      errors.email = "Format email tidak valid.";
    }

    // Password validation
    if (!editingUser) {
      if (!formPassword) {
        errors.password = "Password harus diisi untuk pengguna baru.";
      } else if (formPassword.length < 6) {
        errors.password = "Password minimal 6 karakter.";
      }
    } else if (formPassword && formPassword.length < 6) {
      errors.password = "Password minimal 6 karakter jika ingin diubah.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission — if creating, show confirmation first
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!editingUser) {
      // Show confirmation modal for new user
      setCreateConfirm(true);
    } else {
      // Direct save for edit
      executeSave();
    }
  };

  // Execute the actual save (create or update)
  const executeSave = async () => {
    setIsSaving(true);
    setCreateConfirm(false);

    const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";

    try {
      if (editingUser) {
        // Edit mode
        setUsers(prev => prev.map(u => {
          if (u.id === editingUser.id) {
            return {
              ...u,
              fullName: formName,
              email: formEmail,
              role: formRole,
              group: formGroup,
              ...(formPassword ? { password: formPassword } : {})
            };
          }
          return u;
        }));

        addAuditLog(
          operatorName,
          "UPDATE",
          `Mengubah profil pengguna: '${formName}' (${formRole})`
        );

        showToast(`Profil '${formName}' berhasil diperbarui.`, 'success');
      } else {
        // Create mode
        const newUser: User = {
          id: `usr-${Date.now()}`,
          fullName: formName,
          email: formEmail,
          role: formRole,
          group: formGroup,
          password: formPassword
        };

        setUsers(prev => [newUser, ...prev]);

        addAuditLog(
          operatorName,
          "INSERT",
          `Mendaftarkan pengguna baru: '${formName}' (${formRole})`
        );

        showToast(`Pengguna '${formName}' berhasil didaftarkan.`, 'success');
      }

      handleCloseDrawer();
    } catch (err: any) {
      showToast(err?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));

      const operatorName = isAdminOverride ? `Kholil (${activeGroup})` : "Mufid Admin";
      addAuditLog(
        operatorName,
        "DELETE",
        `Mencabut hak akses pengguna: '${deleteConfirm.name}'`
      );

      showToast(`Hak akses '${deleteConfirm.name}' berhasil dicabut.`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus pengguna.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 font-sans relative">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[10001] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl animate-fade-in transition-all duration-300 max-w-md ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' 
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> 
            : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          }
          <span className="text-xs font-bold leading-snug">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto p-0.5 hover:opacity-70 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {/* Title & Add Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            Manajemen User & Akses Peran
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Definisikan peran dewan mushohih, muharrir, dan delegasi ponpes (mubahhitsin).
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-[#038543] hover:bg-[#026c36] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 duration-150"
          >
            <UserPlus className="w-4 h-4" strokeWidth={1.75} />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Search, Pills and Table Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: List table with search and filters (8 or 12 cols based on drawer) */}
        <div className={`transition-all duration-300 ${isDrawerOpen ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-2xl border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            
            {/* Search and Filters Bar */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
              
              {/* Pills filter */}
              <div className="flex flex-wrap gap-2">
                {rolesFilterList.map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setSelectedRoleFilter(pill)}
                    className={`px-5 py-2 text-xs font-bold rounded-full transition-all duration-200 border ${
                      selectedRoleFilter === pill
                        ? "bg-[#038543] text-white border-[#038543] shadow-sm shadow-[#038543]/20"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Search Bar matching screenshot */}
              <div className="flex items-center space-x-2 max-w-md w-full">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-455" strokeWidth={1.5} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari Nama/Peran/Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#038543] focus:border-[#038543] placeholder-slate-400 transition-all"
                  />
                </div>
                <button className="bg-[#038543] hover:bg-[#026c36] text-white p-2.5 rounded-lg transition-colors shadow-sm shrink-0 flex items-center justify-center">
                  <Search className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>

            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white">
                    <th className="py-4 px-6 font-bold">NAMA LENGKAP</th>
                    <th className="py-4 px-6 font-bold">EMAIL</th>
                    <th className="py-4 px-6 font-bold">PERAN</th>
                    <th className="py-4 px-6 text-right font-bold pr-10">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((user) => {
                    let roleBadge = "bg-slate-100 text-slate-700";
                    if (user.role === "Mubahhisin") roleBadge = "text-blue-600 bg-blue-50/50 border border-blue-100";
                    if (user.role === "Muharrir") roleBadge = "text-purple-600 bg-purple-50/50 border border-purple-100";
                    if (user.role === "Mushohih") roleBadge = "text-emerald-600 bg-emerald-50/50 border border-emerald-100";
                    if (user.role === "Admin") roleBadge = "text-rose-600 bg-rose-50/50 border border-rose-100";

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-9 h-9 rounded-full bg-[#E6F3EC] flex items-center justify-center font-bold text-xs text-[#038543] border border-emerald-100/50 shrink-0">
                              {user.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-tight">{user.fullName}</p>
                              <p className="text-[11px] text-slate-400 font-medium mt-1 leading-none">{user.group}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-normal select-all">
                          {user.email}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-[6px] ${roleBadge}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 pr-10">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-slate-400 hover:text-[#038543] rounded-lg hover:bg-slate-50 transition-all duration-155"
                              title="Edit Profil"
                            >
                              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.fullName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all duration-155"
                              title="Hapus Hak Akses"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada pengguna yang cocok dengan kriteria pencarian atau filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Drawer: Detail Pengguna Drawer (4 Columns when open) */}
        {isDrawerOpen && (
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden animate-in slide-in-from-right duration-250">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                {editingUser ? "Detail Pengguna" : "Tambah Pengguna Baru"}
              </h3>
              <button 
                onClick={handleCloseDrawer}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              
              {/* Profile avatar photo edit indicator */}
              <div className="flex flex-col items-center py-2 space-y-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#E6F3EC] flex items-center justify-center font-display font-bold text-2xl text-[#038543] border border-emerald-100/50">
                    {formName ? formName.substring(0,2).toUpperCase() : "?"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer shadow-sm hover:text-slate-900 hover:border-slate-350 transition-all">
                    <span className="text-[10px]">📷</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">FOTO DELEGASI / ULAMA</span>
              </div>

              {/* FULL NAME */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Ketik nama lengkap..."
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormErrors(prev => ({ ...prev, name: '' })); }}
                  className={`w-full text-xs border rounded-lg px-3 py-2.5 bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-[#038543] focus:border-[#038543] transition-all placeholder-slate-400 ${
                    formErrors.name ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400' : 'border-slate-200'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Email</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={formEmail}
                  onChange={(e) => { setFormEmail(e.target.value); setFormErrors(prev => ({ ...prev, email: '' })); }}
                  className={`w-full text-xs border rounded-lg px-3 py-2.5 bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-[#038543] focus:border-[#038543] transition-all placeholder-slate-400 ${
                    formErrors.email ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400' : 'border-slate-200'
                  }`}
                  required
                />
                {formErrors.email && (
                  <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {formErrors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD WITH VISIBILITY TOGGLE */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  Password {editingUser && <span className="text-slate-400 font-normal lowercase">(opsional)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah password" : "Minimal 6 karakter..."}
                    value={formPassword}
                    onChange={(e) => { setFormPassword(e.target.value); setFormErrors(prev => ({ ...prev, password: '' })); }}
                    className={`w-full text-xs border rounded-lg pl-3 pr-10 py-2.5 bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-[#038543] focus:border-[#038543] transition-all placeholder-slate-400 ${
                      formErrors.password ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-950 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" /> {formErrors.password}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1">
                  {editingUser 
                    ? "Isi password baru jika ingin mengganti password pengguna ini."
                    : "Password ini digunakan untuk login pertama kali pengguna."
                  }
                </p>
              </div>

              {/* ROLE SELECT */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Role Select</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full text-xs border border-slate-200 rounded-lg bg-white px-3 py-2.5 text-slate-950 focus:outline-none focus:ring-1 focus:ring-[#038543] focus:border-[#038543]"
                >
                  <option value="Mubahhisin">Mubahhisin (Delegasi Pesantren)</option>
                  <option value="Muharrir">Muharrir (Sekretaris Perumus)</option>
                  <option value="Mushohih">Mushohih (Lembaga Fatwa Utama)</option>
                  <option value="Admin">Admin (Otoritas Sistem)</option>
                </select>
              </div>

              {/* GROUP SELECTION */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Group Selection</label>
                <input
                  type="text"
                  placeholder="Ketik nama kelompok/ponpes..."
                  value={formGroup}
                  onChange={(e) => setFormGroup(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 bg-white text-slate-950 focus:outline-none focus:ring-1 focus:ring-[#038543] focus:border-[#038543] placeholder-slate-400"
                  required
                />
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  disabled={isSaving}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#038543] hover:bg-[#026c36] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingUser ? "Simpan Perubahan" : "Tambah Pengguna"}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>

      {/* Confirmation Modal for New User Creation */}
      {createConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setCreateConfirm(false)}
          />
          
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative z-10 animate-fade-in space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#038543] shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-display font-bold text-slate-900 text-base leading-snug">
                  Konfirmasi Pendaftaran
                </h3>
                <p className="text-xs text-slate-500 leading-normal font-medium">
                  Anda akan mendaftarkan pengguna baru dengan detail berikut:
                </p>
                <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5 border border-slate-100 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Nama</span>
                    <span className="font-bold text-slate-900">{formName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Email</span>
                    <span className="font-bold text-slate-900">{formEmail}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Peran</span>
                    <span className="font-bold text-slate-900">{formRole}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Kelompok</span>
                    <span className="font-bold text-slate-900">{formGroup}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreateConfirm(false)}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSave}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-[#038543] hover:bg-[#026c36] rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Daftarkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for User Deletion */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => !isDeleting && setDeleteConfirm(null)}
          />
          
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl p-6 relative z-10 animate-fade-in space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-display font-bold text-slate-900 text-base leading-snug">
                  Cabut Hak Akses Pengguna
                </h3>
                <p className="text-xs text-slate-500 leading-normal font-medium">
                  Apakah Anda yakin ingin mencabut hak akses pengguna <span className="font-bold text-slate-800">"{deleteConfirm.name}"</span>? Akun terkait tidak akan dapat mengakses sistem forum ini lagi.
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Cabut Akses
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
