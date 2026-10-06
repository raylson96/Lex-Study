import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  CalendarDays,
  BookOpen,
  HelpCircle,
  BarChart3,
  Settings,
  Scale,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  Award,
  ShieldCheck,
  Flame,
  Lock,
} from 'lucide-react';

const renderPlatformIcon = (type?: string, className = "w-5 h-5 text-white") => {
  switch (type) {
    case 'book': return <BookOpen className={className} />;
    case 'graduation': return <GraduationCap className={className} />;
    case 'award': return <Award className={className} />;
    case 'shield': return <ShieldCheck className={className} />;
    case 'flame': return <Flame className={className} />;
    case 'scale':
    default:
      return <Scale className={className} />;
  }
};

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    documents,
    schedule,
    profile,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    logout,
  } = useApp();

  const pendingScheduleCount = schedule.filter((s) => s.status !== 'concluido').length;

  const mainMenuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Menu',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'editor',
      label: 'Caderno',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      badge: documents.length > 0 ? documents.length : undefined,
    },
    {
      id: 'cronograma',
      label: 'Cronograma',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
      badge: pendingScheduleCount > 0 ? pendingScheduleCount : undefined,
    },
    {
      id: 'calendario',
      label: 'Calendário',
      icon: <CalendarDays className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca',
      icon: <BookOpen className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'questoes',
      label: 'Questões',
      icon: <HelpCircle className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'metricas',
      label: profile.metricsTitle || 'Métricas',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Glass Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 glass-sidebar shadow-2xl print:hidden ${
          isSidebarCollapsed ? 'w-[76px]' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding & Main Navigation */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Header */}
          <div
            className={`border-b border-slate-200/80 dark:border-white/10 px-3 transition-all duration-300 relative group/header ${
              isSidebarCollapsed
                ? 'flex flex-col items-center justify-center py-3.5 min-h-[76px]'
                : 'h-18 flex items-center justify-between px-4'
            }`}
          >
            {isSidebarCollapsed ? (
              /* Collapsed Header: Platform Icon itself IS the expand button! */
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                title="Clique no ícone para expandir o menu lateral"
                className="w-11 h-11 rounded-2xl bg-theme-accent flex items-center justify-center shadow-theme-accent shrink-0 transition-all cursor-pointer group/icon relative hover:scale-105 active:scale-95"
              >
                {/* Default platform icon: smooth fade on hover */}
                <div className="transition-all duration-200 group-hover/icon:opacity-0 group-hover/icon:scale-75 absolute">
                  {renderPlatformIcon(profile.platformIcon)}
                </div>
                {/* Expand icon: pops up cleanly inside the icon on hover */}
                <div className="opacity-0 scale-75 transition-all duration-200 group-hover/icon:opacity-100 group-hover/icon:scale-100 absolute text-white">
                  <PanelLeftOpen className="w-5 h-5" />
                </div>
              </button>
            ) : (
              /* Expanded Header: Customizable Branding + Icon as Collapse Button */
              <>
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <button
                    type="button"
                    onClick={toggleSidebarCollapsed}
                    title="Clique no ícone para recolher o menu lateral"
                    className="w-10 h-10 rounded-2xl bg-theme-accent flex items-center justify-center shadow-theme-accent shrink-0 transition-all cursor-pointer group/icon relative hover:scale-105 active:scale-95"
                  >
                    <div className="transition-all duration-200 group-hover/icon:opacity-0 group-hover/icon:scale-75 absolute">
                      {renderPlatformIcon(profile.platformIcon)}
                    </div>
                    <div className="opacity-0 scale-75 transition-all duration-200 group-hover/icon:opacity-100 group-hover/icon:scale-100 absolute text-white">
                      <PanelLeftClose className="w-5 h-5" />
                    </div>
                  </button>

                  <div className="animate-in fade-in duration-200 truncate min-w-0">
                    <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base truncate block">
                      {profile.platformTitle || 'LexStudy'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block tracking-wide truncate">
                      {profile.platformSubtitle || 'Plataforma Jurídica'}
                    </span>
                  </div>
                </div>

                {/* Mobile close button */}
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {mainMenuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                      isSidebarCollapsed
                        ? 'justify-center p-3'
                        : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-theme-accent shadow-theme-accent font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-theme-accent-tint text-theme-accent border border-theme-accent'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip on Collapsed State */}
                  {isSidebarCollapsed && (
                    <div className="fixed left-20 ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap dark:bg-slate-800 dark:border dark:border-white/10 flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.2 bg-theme-accent text-white text-[10px] rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Extreme Bottom: Settings & Logout Buttons */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 space-y-1">
          <div className="relative group">
            <button
              onClick={() => {
                setActiveTab('configuracoes');
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                isSidebarCollapsed
                  ? 'justify-center p-3'
                  : 'justify-start gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'configuracoes'
                  ? 'bg-theme-accent shadow-theme-accent font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Configurações</span>}
            </button>

            {isSidebarCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap dark:bg-slate-800 dark:border dark:border-white/10">
                Configurações
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              onClick={() => {
                logout();
                setIsMobileOpen(false);
              }}
              title="Bloquear Acesso / Sair para tela de Login"
              className={`w-full flex items-center rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 ${
                isSidebarCollapsed
                  ? 'justify-center p-2.5'
                  : 'justify-start gap-3 px-3.5 py-2'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-500" />
              {!isSidebarCollapsed && <span className="truncate">Bloquear Acesso</span>}
            </button>

            {isSidebarCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap dark:bg-slate-800 dark:border dark:border-white/10">
                Bloquear / Sair
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
