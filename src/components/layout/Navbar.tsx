import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Plus,
  Clock,
  Scale,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  FolderSync,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onNewDocument: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileSidebar, onNewDocument }) => {
  const {
    activeTab,
    profile,
    pomodoroSeconds,
    setPomodoroSeconds,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    theme,
    toggleTheme,
    isVaultConnected,
    vaultName,
    isVaultSyncing,
    connectObsidianVault,
    syncNowToVault,
  } = useApp();

  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Menu', subtitle: 'Acompanhe seu progresso, metas e horas líquidas de estudo' },
    editor: { title: 'Caderno', subtitle: 'Editor de estudos formato documento estilo Google Docs' },
    cronograma: { title: 'Cronograma', subtitle: `Organização do edital ${profile.examTarget} com repetição espaçada` },
    calendario: { title: 'Calendário', subtitle: `Compromissos, faculdade e metas ${profile.examTarget} integrados` },
    biblioteca: { title: 'Biblioteca', subtitle: 'Legislação fundamental, súmulas e materiais de apoio' },
    questoes: { title: 'Questões', subtitle: 'Treino prático de questões com gabarito comentado' },
    metricas: {
      title: profile.metricsTitle || 'Métricas',
      subtitle: profile.metricsSubtitle || 'Contabilidade analítica de horas líquidas, rendimento em questões e domínio por matéria',
    },
    configuracoes: { title: 'Configurações', subtitle: 'Defina a data da prova, metas e exporte backups' },
  };

  const current = tabTitles[activeTab] || { title: 'Estudos', subtitle: '' };

  const minutes = Math.floor(pomodoroSeconds / 60);
  const seconds = pomodoroSeconds % 60;
  const timerFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <header className="h-18 glass-nav px-6 flex items-center justify-between sticky top-0 z-30 transition-colors print:hidden">
      <div className="flex items-center gap-3">
        {/* Mobile toggle */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {current.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Interactive Universal Pomodoro Control Pill (Works across all tabs) */}
        <div className="relative">
          <div className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 bg-white/70 dark:bg-black/60 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => (isTimerRunning ? pauseTimer() : startTimer())}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isTimerRunning
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-theme-accent text-white shadow-theme-accent'
              }`}
              title={isTimerRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro de estudo'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowTimerMenu(!showTimerMenu)}
              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Ajustar tempo do cronômetro"
            >
              <Clock className="w-3.5 h-3.5 text-theme-accent" />
              <span className={`text-xs font-mono font-bold ${isTimerRunning ? 'text-theme-accent animate-pulse' : 'text-slate-800 dark:text-slate-200'}`}>
                {timerFormatted}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={resetTimer}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Reiniciar cronômetro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Duration Preset Dropdown */}
          {showTimerMenu && (
            <div className="absolute top-full mt-2 right-0 w-48 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 px-2 py-1 block tracking-wider">
                Tempo da Sessão
              </span>
              <div className="space-y-1">
                {[
                  { label: '15 min • Revisão Rápida', sec: 15 * 60 },
                  { label: '25 min • Pomodoro Clássico', sec: 25 * 60 },
                  { label: '45 min • Doutrina & Leitura', sec: 45 * 60 },
                  { label: '60 min • Simulado Intensivo', sec: 60 * 60 },
                ].map((preset) => (
                  <button
                    key={preset.sec}
                    type="button"
                    onClick={() => {
                      pauseTimer();
                      setPomodoroSeconds(preset.sec);
                      setShowTimerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      pomodoroSeconds === preset.sec
                        ? 'bg-theme-accent-tint text-theme-accent font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Obsidian Vault Sync Indicator / Quick Button */}
        {isVaultConnected ? (
          <button
            type="button"
            onClick={syncNowToVault}
            disabled={isVaultSyncing}
            title={`Cofre Obsidian: "${vaultName || 'Conectado'}". Clique para sincronizar agora.`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isVaultSyncing ? 'animate-spin text-purple-400' : 'text-purple-500'}`}
            />
            <span className="hidden sm:inline font-bold">Obsidian:</span>
            <span className="truncate max-w-[90px]">{isVaultSyncing ? 'Sincronizando...' : (vaultName || 'Ativo')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={connectObsidianVault}
            title="Conectar pasta local do Obsidian (Sincronização Bidirecional)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-purple-500 dark:hover:text-purple-400 border border-slate-200/80 dark:border-white/10 hover:border-purple-500/30 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <FolderSync className="w-3.5 h-3.5 text-purple-500" />
            <span>Conectar Obsidian</span>
          </button>
        )}

        {/* Theme Toggle Button (Branco <-> Mega Preto) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'branco' ? 'Alternar para Mega Preto' : 'Alternar para Branco Puro'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer shadow-2xs"
        >
          {theme === 'branco' ? (
            <Moon className="w-4 h-4 text-slate-900" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Quick action: New Document */}
        <button
          onClick={onNewDocument}
          className="flex items-center gap-2 px-4 py-2 bg-theme-accent hover:opacity-95 text-white text-sm font-semibold rounded-xl shadow-theme-accent transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Caderno</span>
        </button>

        {/* Student Avatar / Info */}
        <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200/80 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-white/10">
            <Scale className="w-4 h-4 text-theme-accent" />
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate max-w-[140px]">
              {profile.name}
            </span>
            <span className="text-[10px] text-theme-accent font-semibold block">
              {profile.examTarget}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
