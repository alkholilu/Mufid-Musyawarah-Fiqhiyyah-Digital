import React, { useState } from "react";
const MufidLogo = "/Mufid-Logo.png";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  UploadCloud, 
  Users, 
  Archive, 
  Settings, 
  FileCheck,
  LogOut,
  Scale,
  X,
  ChevronLeft,
  Moon,
  Sparkle,
  Folder,
  Send
} from "lucide-react";

// SVG Emblem component replicating the Menara Kudus dome logo
export function LogoEmblem({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mufid-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D7C40" />
          <stop offset="100%" stopColor="#0B5E30" />
        </linearGradient>
        <linearGradient id="mufid-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>
      </defs>
      
      {/* Outer Dome Path */}
      <path 
        d="M60 12 C48 24 28 32 28 58 C28 80 40 88 60 88 C80 88 92 80 92 58 C92 32 72 24 60 12 Z" 
        fill="white" 
        stroke="url(#mufid-green)" 
        strokeWidth="4" 
        strokeLinejoin="round" 
      />
      
      {/* Inner Dome Accent line */}
      <path 
        d="M60 18 C51 28 34 35 34 58 C34 76 44 82 60 82 C76 82 86 76 86 58 C86 35 69 28 60 18 Z" 
        stroke="url(#mufid-gold)" 
        strokeWidth="1.2" 
        strokeDasharray="3 2" 
        opacity="0.9"
      />

      {/* Menara (Mosque Tower) inside */}
      <g transform="translate(60, 52) scale(0.75)">
        {/* Foundation */}
        <path d="M-12 24 L12 24 L10 32 L-10 32 Z" fill="url(#mufid-green)" />
        {/* Tower Body */}
        <rect x="-8" y="-12" width="16" height="36" fill="white" stroke="url(#mufid-green)" strokeWidth="2.5" />
        {/* Horizontal brick lines on tower body */}
        <line x1="-8" y1="-6" x2="8" y2="-6" stroke="url(#mufid-green)" strokeWidth="1.5" />
        <line x1="-8" y1="2" x2="8" y2="2" stroke="url(#mufid-green)" strokeWidth="1.5" />
        <line x1="-8" y1="10" x2="8" y2="10" stroke="url(#mufid-green)" strokeWidth="1.5" />
        <line x1="-8" y1="18" x2="8" y2="18" stroke="url(#mufid-green)" strokeWidth="1.5" />
        {/* Arched Window/Door */}
        <path d="M-4 12 L4 12 L4 24 L-4 24 Z M-4 12 C-4 8 4 8 4 12" fill="none" stroke="url(#mufid-green)" strokeWidth="1.5" />
        
        {/* Clock Section */}
        <rect x="-6" y="-22" width="12" height="10" fill="white" stroke="url(#mufid-green)" strokeWidth="2" />
        <circle cx="0" cy="-17" r="2.5" fill="none" stroke="url(#mufid-green)" strokeWidth="1.2" />
        {/* Arched windows in clock section */}
        <rect x="-4" y="-14" width="2" height="2" fill="url(#mufid-green)" />
        <rect x="2" y="-14" width="2" height="2" fill="url(#mufid-green)" />

        {/* Roof Base */}
        <path d="M-10 -22 L10 -22 L8 -26 L-8 -26 Z" fill="url(#mufid-green)" />
        {/* Roof Top */}
        <path d="M-8 -26 L8 -26 L0 -35 Z" fill="url(#mufid-green)" />
        {/* Spire */}
        <line x1="0" y1="-35" x2="0" y2="-42" stroke="url(#mufid-green)" strokeWidth="2" />
        <circle cx="0" cy="-44" r="1.5" fill="url(#mufid-gold)" />
      </g>

      {/* Arabic Calligraphy 'Mufid' (مفيد) styled at bottom of the dome */}
      <path 
        d="M 36,80 C 40,78 44,79 46,81 C 48,82 52,80 54,78 C 58,74 62,75 66,79 C 70,81 74,80 78,76 C 82,78 84,82 82,84 C 74,86 64,86 56,84 C 48,86 40,84 36,80 Z" 
        fill="url(#mufid-green)" 
      />
      {/* Calligraphy highlights / dots */}
      <circle cx="53" cy="88" r="2" fill="url(#mufid-green)" />
      <circle cx="59" cy="88" r="2" fill="url(#mufid-green)" />
      <path d="M42 75 C45 73 48 74 50 76" stroke="url(#mufid-green)" strokeWidth="2" strokeLinecap="round" />

      {/* Decorative leafy cradle/crest at the bottom */}
      <path 
        d="M16 80 C 32 102 50 106 60 106 C 70 106 88 102 104 80 C 88 94 68 96 60 96 C 52 96 32 94 16 80 Z" 
        fill="url(#mufid-green)" 
      />
      <path 
        d="M24 85 C 36 100 50 103 60 103 C 70 103 84 100 96 85 C 84 94 68 96 60 96 C 52 96 36 94 24 85 Z" 
        fill="url(#mufid-gold)" 
        opacity="0.85"
      />
    </svg>
  );
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminOverride: boolean;
  activeGroup: string;
  user: {
    fullName: string;
    email: string;
    role: "Admin" | "Mubahhisin" | "Muharrir" | "Mushohih";
    group: string;
  } | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isAdminOverride,
  activeGroup,
  user,
  onLogout,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const [darkMode, setDarkMode] = useState(false);
  
  // Dynamic grouped menu generation based on user role
  const getMenuSections = (): MenuSection[] => {
    if (!user) return [];
    
    switch (user.role) {
      case "Admin":
        return [
          {
            items: [{ id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard }]
          },
          {
            title: "MASTER DATA",
            items: [
              { id: "soal", label: "Manajemen Soal", icon: FileText },
              { id: "user", label: "Manajemen User", icon: Users }
            ]
          },
          {
            title: "FORUM KEPUTUSAN",
            items: [
              { id: "bahtsul", label: "Bahtsul Masail", icon: BookOpen },
              { id: "upload", label: "Unggah Dokumen", icon: UploadCloud }
            ]
          },
          {
            title: "SIDANG MUSHOHIH",
            items: [
              { id: "mushohih-jawaban", label: " Jawaban Kelompok", icon: Folder },
              { id: "mushohih-kitab", label: " Kitab Kuning", icon: BookOpen },
              { id: "mushohih-natijah", label: " Koreksi Natijah", icon: FileCheck },
              { id: "mushohih-ketuk", label: " Ketuk Palu Sidang", icon: Scale }
            ]
          },
          {
            title: "SIDANG MUHARRIR",
            items: [
              { id: "muharrir-monitoring", label: " Monitoring Delegasi", icon: Users },
              { id: "muharrir-natijah", label: " Penyusunan Natijah", icon: FileCheck },
              { id: "muharrir-kirim", label: " Kirim Jawaban", icon: Send }
            ]
          },
          {
            title: "SISTEM & ARSIP",
            items: [
              { id: "arsip", label: "Arsip Digital", icon: Archive },
              { id: "settings", label: "System Settings", icon: Settings }
            ]
          }
        ];
      case "Mubahhisin":
        return [
          {
            title: "SIDANG MUBAHHITSIN",
            items: [
              { id: "bahtsul", label: "Sidang Mubahhitsin", icon: BookOpen }
            ]
          },
          {
            title: "SISTEM ARSIP DIGITAL",
            items: [
              { id: "arsip", label: "Arsip Digital", icon: Archive }
            ]
          }
        ];
      case "Muharrir":
        return [
          {
            title: "SIDANG MUHARRIR",
            items: [
              { id: "muharrir-monitoring", label: "Monitoring Delegasi", icon: Users },
              { id: "muharrir-natijah", label: "Penyusunan Natijah", icon: FileCheck },
              { id: "muharrir-kirim", label: "Kirim Jawaban", icon: Send }
            ]
          },
          {
            title: "SISTEM ARSIP DIGITAL",
            items: [
              { id: "arsip", label: "Arsip Digital", icon: Archive }
            ]
          }
        ];
      case "Mushohih":
        return [
          {
            title: "SIDANG MUSHOhiH",
            items: [
              { id: "mushohih-jawaban", label: "Jawaban Kelompok", icon: Folder },
              { id: "mushohih-kitab", label: "Kitab Kuning", icon: BookOpen },
              { id: "mushohih-natijah", label: "Koreksi Natijah", icon: FileCheck },
              { id: "mushohih-ketuk", label: "Ketuk Palu Sidang", icon: Scale }
            ]
          },
          {
            title: "SISTEM ARSIP DIGITAL",
            items: [
              { id: "arsip", label: "Arsip Digital", icon: Archive }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const menuSections = getMenuSections();

  const getAvatarPlaceholder = () => {
    if (!user) return "US";
    return user.fullName.substring(0, 2).toUpperCase();
  };

  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      if (onClose) onClose();
    }
  };

  // Prevent body scroll when sidebar is open in mobile/tablet
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay for mobile and tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 min-[1440px]:hidden transition-opacity duration-300 animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        onTouchEnd={handleTouchEnd}
        className={`
          /* Base styles, flex container and background/borders */
          fixed inset-y-0 left-0 bg-white border-r border-slate-100 flex flex-col justify-between h-screen z-50 font-sans 
          /* Smooth transition for width, translation, margin and transformation hardware acceleration */
          transition-all duration-300 ease-in-out transform-gpu
          
          /* Mobile (< 768px) */
          max-[767px]:w-[85%] max-[767px]:max-w-[320px] max-[767px]:fixed
          ${isOpen ? "max-[767px]:translate-x-0" : "max-[767px]:-translate-x-full"}
          
          /* Tablet (768px - 1439px) */
          min-[768px]:max-[1439px]:w-[280px] min-[768px]:max-[1439px]:fixed
          ${isOpen ? "min-[768px]:max-[1439px]:translate-x-0" : "min-[768px]:max-[1439px]:-translate-x-full"}
          
          /* Desktop (≥ 1440px) */
          min-[1440px]:sticky min-[1440px]:top-0 min-[1440px]:self-start min-[1440px]:translate-x-0
          ${isCollapsed ? "min-[1440px]:w-[88px] min-[1440px]:min-w-[88px] min-[1440px]:max-w-[88px]" : "min-[1440px]:w-[280px] min-[1440px]:min-w-[280px] min-[1440px]:max-w-[280px]"}
        `}
      >

        {/* Brand Header */}
        {isCollapsed ? (
          <div className="flex items-center justify-center py-5 border-b border-slate-50 bg-white shrink-0">
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-12 h-12 rounded-[16px] bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-all duration-200 overflow-hidden"
                title="Expand Sidebar"
              >
                <img src={MufidLogo} className="w-8 h-8 object-contain" alt="Mufid Logo" referrerPolicy="no-referrer" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 bg-white shrink-0">
            <div className="flex items-center space-x-3.5">
              {/* Clean Emblem Logo Box */}
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm select-none shrink-0 overflow-hidden">
                <img src={MufidLogo} className="w-7 h-7 object-contain" alt="Mufid Logo" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[15px] font-black text-slate-900 tracking-tight leading-none">
                  Mufid Portal
                </h2>
                <span className="text-xs text-slate-400 font-semibold tracking-wide leading-none mt-1.5">
                  Sistem Keputusan
                </span>
              </div>
            </div>

            {/* Toggle Trigger */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-all duration-200 shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Navigation Area */}
        <div className="flex flex-col overflow-y-auto flex-1 min-h-0">
          {/* Navigation Items (Grouped Sections) */}
          <nav className="px-4 py-6 space-y-6">
            {isCollapsed ? (
              <div className="space-y-3.5 flex flex-col items-center">
                {menuSections.map((section) => 
                  section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (onClose) onClose();
                        }}
                        className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-200 relative group cursor-pointer ${
                          isActive
                            ? "bg-[#16a34a] text-white shadow-[0_6px_20px_rgba(22,163,74,0.35)]"
                            : "text-slate-400 hover:text-[#16a34a] hover:bg-emerald-50/50"
                        }`}
                        title={item.label}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        
                        {/* Tooltip */}
                        <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 whitespace-nowrap z-50 font-sans font-semibold">
                          {item.label}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {menuSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    {section.title && (
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2 mt-2 select-none">
                        {section.title}
                      </div>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              if (onClose) onClose();
                            }}
                            className={`w-full flex items-center text-[13px] font-bold transition-all duration-200 text-left relative cursor-pointer group px-4 py-3.5 rounded-xl ${
                              isActive
                                ? "bg-[#16a34a] text-white shadow-[0_4px_14px_rgba(22,163,74,0.3)]"
                                : "text-slate-500 hover:text-[#16a34a] hover:bg-emerald-50/30"
                            }`}
                          >
                            <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#16a34a]"}`} />
                            <span className="ml-3.5 transition-all duration-300 font-semibold">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </nav>
        </div>

        {/* User profile & Settings footer section at the bottom */}
        <div className="p-5 border-t border-slate-50 space-y-3.5 shrink-0 bg-white">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4 py-2">
              {/* Log Out button */}
              <button
                onClick={onLogout}
                className="w-12 h-12 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-[16px] transition-colors cursor-pointer group relative"
                title="Keluar"
              >
                <LogOut className="w-5 h-5 text-rose-500 transform rotate-180" />
                <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 whitespace-nowrap z-50 font-sans font-semibold">
                  Keluar
                </div>
              </button>

              {/* Profile avatar only */}
              <div className="relative group/avatar cursor-pointer">
                <div className="w-11 h-11 rounded-full bg-[#EC4899] text-white flex items-center justify-center font-extrabold text-base shadow-[0_2px_8px_rgba(236,72,153,0.25)] select-none">
                  {getAvatarPlaceholder().substring(0, 1)}
                </div>
                <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover/avatar:opacity-100 group-hover/avatar:pointer-events-auto transition-opacity duration-200 whitespace-nowrap z-50">
                  <div className="font-bold">{user?.fullName || "Pemilik Bisnis"}</div>
                  <div className="text-[10px] text-slate-400">{user?.role || "Owner"}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Log Out button row */}
              <button
                onClick={onLogout}
                className="w-full flex items-center py-1 px-1 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer select-none"
              >
                <LogOut className="w-5 h-5 text-rose-500 shrink-0 transform rotate-180" />
                <span className="text-rose-600 font-bold text-[13px] ml-3.5">Keluar</span>
              </button>

              {/* Profile details */}
              <div className="h-px bg-slate-100 my-4" />

              <div className="flex items-center space-x-3.5">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-[#EC4899] text-white flex items-center justify-center font-extrabold text-base shadow-[0_2px_8px_rgba(236,72,153,0.25)] select-none">
                    {getAvatarPlaceholder().substring(0, 1)}
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-slate-800 truncate leading-tight">
                    {user?.fullName || "Pemilik Bisnis"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium truncate mt-1.5 leading-none">
                    {user?.role || "Owner"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
