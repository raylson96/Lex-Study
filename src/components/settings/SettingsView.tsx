import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  StudentProfile,
  ThemeMode,
  AccentColor,
  PlatformIconType,
  LawSubject,
  DEFAULT_SUBJECT_NAMES,
  SubjectNamesMap,
  CustomLabels,
  DEFAULT_CUSTOM_LABELS,
} from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { exportToObsidianVault } from '../../utils/obsidianExport';
import {
  User,
  Calendar,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Save,
  Database,
  Award,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Check,
  CheckCircle2,
  Flame,
  Scale,
  Sliders,
  Layers,
  BookOpen,
  GraduationCap,
  Shield,
  Layout,
  Plus,
  Trash2,
  BarChart3,
  Tag,
  Target,
  Bookmark,
  FileText,
  Library,
  BookMarked,
  Eye,
  Lock,
  FolderSync,
  RefreshCw,
  Unlink,
} from 'lucide-react';

export type SettingsTab = 'nomes' | 'aparencia' | 'materias' | 'metas' | 'dados';

const PLATFORM_ICON_OPTIONS: {
  id: PlatformIconType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { id: 'scale', label: 'Balança', description: 'Justiça & Direito', icon: <Scale className="w-5 h-5" /> },
  { id: 'book', label: 'Livro', description: 'Vade Mecum & Doutrina', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'graduation', label: 'Graduação', description: 'Carreira Jurídica', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'award', label: 'Mérito', description: 'Aprovação OAB', icon: <Award className="w-5 h-5" /> },
  { id: 'shield', label: 'Escudo', description: 'Prerrogativas & Defesa', icon: <Shield className="w-5 h-5" /> },
  { id: 'flame', label: 'Foco / Fogo', description: 'Alta Performance', icon: <Flame className="w-5 h-5" /> },
];

const THEME_OPTIONS: {
  id: ThemeMode;
  title: string;
  subtitle: string;
  bgPreview: string;
  textPreview: string;
  cardPreview: string;
  borderPreview: string;
  tag: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'branco',
    title: 'Branco Puro',
    subtitle: 'Fundo 100% branco editorial, painéis claros e letras em preto nítido com máximo contraste para leitura diurna.',
    bgPreview: 'bg-white',
    textPreview: 'text-black',
    cardPreview: 'bg-slate-50 border-slate-200',
    borderPreview: 'border-slate-300',
    tag: 'Fundo Branco • Letras Pretas',
    icon: <Sun className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'megapreto',
    title: 'Mega Preto AMOLED',
    subtitle: 'Fundo 100% preto absoluto (#000000), painéis em preto profundo e letras 100% brancas sem reflexos ou vazamento de luz.',
    bgPreview: 'bg-black',
    textPreview: 'text-white',
    cardPreview: 'bg-zinc-950 border-zinc-800',
    borderPreview: 'border-zinc-700',
    tag: 'Fundo Mega Preto • Letras Brancas',
    icon: <Moon className="w-5 h-5 text-zinc-100" />,
  },
  {
    id: 'slate',
    title: 'Grafite Clássico (Slate)',
    subtitle: 'Fundo azul-ardósia escuro com acabamento aveludado para quem aprecia tons de cinza escuro balanceados.',
    bgPreview: 'bg-[#090d16]',
    textPreview: 'text-slate-100',
    cardPreview: 'bg-slate-900 border-slate-700',
    borderPreview: 'border-slate-700',
    tag: 'Fundo Grafite • Letras Brancas',
    icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
  },
];

const ACCENT_OPTIONS: {
  id: AccentColor;
  name: string;
  description: string;
  colorHex: string;
  bgClass: string;
  badgeClass: string;
}[] = [
  {
    id: 'vermelho',
    name: 'Vermelho Rubro',
    description: 'Energia alta, marcações vívidas e destaque marcante sobre preto ou branco.',
    colorHex: '#dc2626',
    bgClass: 'bg-red-600',
    badgeClass: 'bg-red-500/15 text-red-500 border-red-500/30',
  },
  {
    id: 'branco',
    name: 'Branco Minimal',
    description: 'Estética monocromática de alto luxo (botões brancos com texto preto no Mega Preto).',
    colorHex: '#ffffff',
    bgClass: 'bg-white',
    badgeClass: 'bg-white/20 text-white border-white/40',
  },
  {
    id: 'preto',
    name: 'Preto Ônix',
    description: 'Minimalismo editorial sóbrio (botões pretos com texto branco no Branco Puro).',
    colorHex: '#09090b',
    bgClass: 'bg-zinc-950',
    badgeClass: 'bg-zinc-900/15 text-zinc-900 dark:text-zinc-100 border-zinc-900/30 dark:border-zinc-100/30',
  },
  {
    id: 'indigo',
    name: 'Índigo Real',
    description: 'Azul jurídico clássico, tradicional e acadêmico.',
    colorHex: '#4f46e5',
    bgClass: 'bg-indigo-600',
    badgeClass: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
  },
  {
    id: 'dourado',
    name: 'Dourado OAB',
    description: 'Ouro e âmbar nobre evocando o prestígio das insígnias da advocacia.',
    colorHex: '#d97706',
    bgClass: 'bg-amber-600',
    badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  },
];

const SUBJECT_CONFIG_LIST: { subject: LawSubject; icon: string; defaultShort: string }[] = [
  { subject: 'Direito Constitucional', icon: '🏛️', defaultShort: 'Constitucional' },
  { subject: 'Ética Profissional (OAB)', icon: '⚖️', defaultShort: 'Ética' },
  { subject: 'Direito Penal', icon: '⚔️', defaultShort: 'Penal' },
  { subject: 'Processo Penal', icon: '⚖️', defaultShort: 'P. Penal' },
  { subject: 'Direito Civil', icon: '📜', defaultShort: 'Civil' },
  { subject: 'Processo Civil', icon: '🛡️', defaultShort: 'P. Civil' },
  { subject: 'Direito Administrativo', icon: '🏢', defaultShort: 'Administrativo' },
  { subject: 'Direito Tributário', icon: '💰', defaultShort: 'Tributário' },
  { subject: 'Direito do Trabalho', icon: '🔨', defaultShort: 'Trabalho' },
  { subject: 'Processo do Trabalho', icon: '🔨', defaultShort: 'P. Trabalho' },
  { subject: 'Direitos Humanos', icon: '🕊️', defaultShort: 'D. Humanos' },
  { subject: 'Direito Empresarial', icon: '💼', defaultShort: 'Empresarial' },
  { subject: 'Direito Ambiental', icon: '🌿', defaultShort: 'Ambiental' },
  { subject: 'Geral / Outros', icon: '📚', defaultShort: 'Geral' },
];

const getSubjectIcon = (subj: string) => {
  const match = SUBJECT_CONFIG_LIST.find((s) => s.subject === subj);
  if (match) return match.icon;
  const lower = subj.toLowerCase();
  if (lower.includes('previd')) return '🛡️';
  if (lower.includes('eleitor')) return '🗳️';
  if (lower.includes('filoso')) return '🧠';
  if (lower.includes('crim')) return '🔍';
  if (lower.includes('inter')) return '🌍';
  if (lower.includes('finan')) return '💵';
  if (lower.includes('consum')) return '🛒';
  return '📖';
};

export const SettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    documents,
    schedule,
    library,
    questions,
    sessions,
    resetToDemoData,
    showToast,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    subjects,
    addSubject,
    removeSubject,
    subjectNames,
    updateSubjectName,
    resetSubjectNames,
    clearAllSessions,
    logout,
    isVaultConnected,
    vaultName,
    isVaultSyncing,
    lastVaultSync,
    connectObsidianVault,
    disconnectObsidianVault,
    syncNowToVault,
    pullFromVault,
  } = useApp();

  // Active Category Switcher State
  const [activeTab, setActiveTab] = useState<SettingsTab>('nomes');

  // Form State
  const [formData, setFormData] = useState<StudentProfile>(() => ({
    ...profile,
    platformTitle: profile.customLabels?.platformTitle || profile.platformTitle || 'LexStudy',
    platformSubtitle: profile.customLabels?.platformSubtitle || profile.platformSubtitle || 'Plataforma Jurídica',
    platformIcon: profile.platformIcon || 'scale',
    metricsTitle: profile.customLabels?.metricsTitle || profile.metricsTitle || 'Contabilidade Analítica de Estudos',
    metricsSubtitle:
      profile.customLabels?.metricsSubtitle ||
      profile.metricsSubtitle ||
      'Acompanhe o volume real de horas líquidas, taxas de acerto em simulados FGV, maturidade em cada ramo jurídico e desenvolvimento do acervo.',
    customLabels: {
      ...DEFAULT_CUSTOM_LABELS,
      ...(profile.customLabels || {}),
    },
  }));

  useEffect(() => {
    setFormData({
      ...profile,
      platformTitle: profile.customLabels?.platformTitle || profile.platformTitle || 'LexStudy',
      platformSubtitle: profile.customLabels?.platformSubtitle || profile.platformSubtitle || 'Plataforma Jurídica',
      platformIcon: profile.platformIcon || 'scale',
      metricsTitle: profile.customLabels?.metricsTitle || profile.metricsTitle || 'Contabilidade Analítica de Estudos',
      metricsSubtitle:
        profile.customLabels?.metricsSubtitle ||
        profile.metricsSubtitle ||
        'Acompanhe o volume real de horas líquidas, taxas de acerto em simulados FGV, maturidade em cada ramo jurídico e desenvolvimento do acervo.',
      customLabels: {
        ...DEFAULT_CUSTOM_LABELS,
        ...(profile.customLabels || {}),
      },
    });
  }, [profile]);

  // Dialogs
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearSessionsConfirmOpen, setIsClearSessionsConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isExportingObsidian, setIsExportingObsidian] = useState(false);

  // Add Subject Form State
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectFullName, setNewSubjectFullName] = useState('');
  const [newSubjectShortName, setNewSubjectShortName] = useState('');

  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectFullName.trim()) {
      showToast('Por favor, informe o nome completo da matéria.', 'info');
      return;
    }
    addSubject(newSubjectFullName.trim(), newSubjectShortName.trim() || undefined);
    setNewSubjectFullName('');
    setNewSubjectShortName('');
    setIsAddSubjectOpen(false);
  };

  // Editable Subject Names State
  const [localSubjectNames, setLocalSubjectNames] = useState<SubjectNamesMap>({
    ...DEFAULT_SUBJECT_NAMES,
    ...subjectNames,
  });

  useEffect(() => {
    setLocalSubjectNames((prev) => ({
      ...DEFAULT_SUBJECT_NAMES,
      ...prev,
      ...subjectNames,
    }));
  }, [subjectNames]);

  const handleSaveSubjectNames = () => {
    subjects.forEach((subj) => {
      if (localSubjectNames[subj]) {
        updateSubjectName(subj as LawSubject, localSubjectNames[subj]);
      }
    });
    showToast('Nomes personalizados das matérias salvos com sucesso!');
  };

  const handleResetSubjectNames = () => {
    resetSubjectNames();
    setLocalSubjectNames(DEFAULT_SUBJECT_NAMES);
  };

  const handleRemoveSubject = (subjectName: string) => {
    removeSubject(subjectName);
  };

  // Update Custom Labels helper
  const handleCustomLabelChange = (field: keyof CustomLabels, value: string) => {
    setFormData((prev) => {
      const nextLabels = {
        ...(prev.customLabels || DEFAULT_CUSTOM_LABELS),
        [field]: value,
      };
      return {
        ...prev,
        customLabels: nextLabels,
        ...(field === 'platformTitle' ? { platformTitle: value } : {}),
        ...(field === 'platformSubtitle' ? { platformSubtitle: value } : {}),
        ...(field === 'metricsTitle' ? { metricsTitle: value } : {}),
        ...(field === 'metricsSubtitle' ? { metricsSubtitle: value } : {}),
      };
    });
  };

  const handleSaveCustomLabels = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      platformTitle: formData.customLabels?.platformTitle || formData.platformTitle,
      platformSubtitle: formData.customLabels?.platformSubtitle || formData.platformSubtitle,
      metricsTitle: formData.customLabels?.metricsTitle || formData.metricsTitle,
      metricsSubtitle: formData.customLabels?.metricsSubtitle || formData.metricsSubtitle,
      customLabels: formData.customLabels,
    });
    showToast('Nomes das abas, prateleiras e títulos salvos com sucesso!');
  };

  const handleResetCustomLabels = () => {
    setFormData((prev) => ({
      ...prev,
      platformTitle: DEFAULT_CUSTOM_LABELS.platformTitle,
      platformSubtitle: DEFAULT_CUSTOM_LABELS.platformSubtitle,
      metricsTitle: DEFAULT_CUSTOM_LABELS.metricsTitle,
      metricsSubtitle: DEFAULT_CUSTOM_LABELS.metricsSubtitle,
      customLabels: { ...DEFAULT_CUSTOM_LABELS },
    }));
    updateProfile({
      platformTitle: DEFAULT_CUSTOM_LABELS.platformTitle,
      platformSubtitle: DEFAULT_CUSTOM_LABELS.platformSubtitle,
      metricsTitle: DEFAULT_CUSTOM_LABELS.metricsTitle,
      metricsSubtitle: DEFAULT_CUSTOM_LABELS.metricsSubtitle,
      customLabels: { ...DEFAULT_CUSTOM_LABELS },
    });
    showToast('Nomes e menus restaurados para o padrão original!');
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      examTarget: formData.examTarget,
      targetExamDate: formData.targetExamDate,
      dailyGoalHours: formData.dailyGoalHours,
    });
    showToast('Metas do aluno e exame OAB salvas com sucesso!');
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      platform: 'LexStudy Pro OAB',
      theme,
      accentColor,
      profile,
      documents,
      schedule,
      library,
      questions,
      sessions,
      subjects,
      subjectNames,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-lexstudy-estudos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup completo dos seus estudos exportado com sucesso!');
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.documents && data.schedule) {
          localStorage.setItem('lexstudy_documents_v1', JSON.stringify(data.documents));
          localStorage.setItem('lexstudy_schedule_v1', JSON.stringify(data.schedule));
          if (data.profile) localStorage.setItem('lexstudy_profile_v1', JSON.stringify(data.profile));
          if (data.library) localStorage.setItem('lexstudy_library_v1', JSON.stringify(data.library));
          if (data.questions) localStorage.setItem('lexstudy_questions_v1', JSON.stringify(data.questions));
          if (data.sessions) localStorage.setItem('lexstudy_sessions_v1', JSON.stringify(data.sessions));
          if (data.subjects) localStorage.setItem('lexstudy_subjects_list_v1', JSON.stringify(data.subjects));
          if (data.subjectNames) localStorage.setItem('lexstudy_subject_names_v1', JSON.stringify(data.subjectNames));
          if (data.theme) localStorage.setItem('lexstudy_theme_v2', data.theme);
          if (data.accentColor) localStorage.setItem('lexstudy_accent_v2', data.accentColor);

          showToast('Backup restaurado! Recarregando sistema...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('Arquivo de backup inválido ou incompatível.', 'error');
        }
      } catch (err) {
        showToast('Erro ao importar arquivo de backup.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Export to Obsidian Vault (.ZIP)
  const handleExportObsidian = async () => {
    setIsExportingObsidian(true);
    try {
      await exportToObsidianVault({
        profile,
        documents,
        schedule,
        library,
        questions,
        sessions,
      });
      showToast('Cofre Obsidian exportado com sucesso (.ZIP baixado)!', 'success');
    } catch (err: any) {
      showToast('Erro ao exportar cofre para o Obsidian: ' + (err.message || 'Falha inesperada'), 'error');
    } finally {
      setIsExportingObsidian(false);
    }
  };

  // Days left to exam calculation
  const daysToExam = useMemo(() => {
    if (!formData.targetExamDate) return null;
    const exam = new Date(formData.targetExamDate + 'T00:00:00');
    const now = new Date();
    const diffTime = exam.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [formData.targetExamDate]);

  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[1];
  const currentAccentObj = ACCENT_OPTIONS.find((a) => a.id === accentColor) || ACCENT_OPTIONS[0];

  const SETTINGS_TABS: {
    id: SettingsTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    subtitle: string;
  }[] = [
    {
      id: 'nomes',
      label: 'Nomes & Menus',
      icon: <Tag className="w-4 h-4" />,
      subtitle: 'Abas da biblioteca, prateleiras, títulos e cabeçalhos',
    },
    {
      id: 'aparencia',
      label: 'Aparência & Tema',
      icon: <Palette className="w-4 h-4" />,
      subtitle: 'Mega Preto, Branco Puro, cor de destaque e ícone',
    },
    {
      id: 'materias',
      label: 'Matérias & Siglas',
      icon: <BookOpen className="w-4 h-4" />,
      badge: `${subjects.length}`,
      subtitle: 'Catálogo de matérias, novas disciplinas e lombadas',
    },
    {
      id: 'metas',
      label: 'Metas & Exame OAB',
      icon: <Target className="w-4 h-4" />,
      subtitle: 'Exame alvo, data da prova objetiva e horas/dia',
    },
    {
      id: 'dados',
      label: 'Dados & Acervo',
      icon: <Database className="w-4 h-4" />,
      subtitle: 'Backup JSON, restauração e redefinição de fábrica',
    },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-20">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BANNER (FULL WIDTH)                         */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Painel de Controle • Personalização Integral</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Central de Configurações
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Organize a plataforma como desejar: altere nomes de abas e prateleiras, ajuste temas de alto contraste, gerencie as matérias ativas, configure suas metas de aprovação e faça backup seguro.
          </p>
        </div>

        {/* Live Active Pill */}
        <div className="relative z-10 p-4 rounded-2xl bg-white/70 dark:bg-black/60 border border-slate-200/80 dark:border-white/10 shrink-0 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-theme-accent flex items-center justify-center text-white shadow-theme-accent">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tema Ativo</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
              {currentThemeObj.title}
            </span>
            <span className="text-[11px] font-semibold text-theme-accent">
              Destaque {currentAccentObj.name}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CATEGORY TAB SELECTOR (5 CLEAN TABS)                   */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-white/10">
        {SETTINGS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-theme-accent text-white border-theme-accent shadow-theme-accent scale-[1.02]'
                  : 'bg-white/60 dark:bg-black/40 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-theme-accent'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-theme-accent-tint text-theme-accent'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: 🏷️ NOMES & MENUS                                   */}
      {/* ========================================================= */}
      {activeTab === 'nomes' && (
        <form onSubmit={handleSaveCustomLabels} className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Personalização de Nomes, Menus & Prateleiras
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina como deseja chamar as abas da biblioteca, os 3 degraus de livros, o título do cabeçalho e a área de métricas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCustomLabels}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-theme-accent text-white rounded-xl text-xs font-bold shadow-theme-accent hover:opacity-95 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>

            {/* Group 1: Library Tabs & Shelves */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-theme-accent" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
                  1. Abas & Prateleiras da Biblioteca
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tab OAB */}
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Nome da 1ª Aba da Biblioteca (Cadernos & Resumos OAB)
                  </label>
                  <input
                    type="text"
                    value={formData.customLabels?.libraryTabOab || 'OAB'}
                    onChange={(e) => handleCustomLabelChange('libraryTabOab', e.target.value)}
                    placeholder="Ex: OAB"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                  <p className="text-[11px] text-slate-400">
                    Aba dedicada aos seus cadernos pessoais, resumos e anotações para o Exame de Ordem.
                  </p>
                </div>

                {/* Tab Doutrina */}
                <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Nome da 2ª Aba da Biblioteca (Doutrinas, Códigos & Súmulas)
                  </label>
                  <input
                    type="text"
                    value={formData.customLabels?.libraryTabDoutrina || 'Doutrina'}
                    onChange={(e) => handleCustomLabelChange('libraryTabDoutrina', e.target.value)}
                    placeholder="Ex: Doutrina"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                  <p className="text-[11px] text-slate-400">
                    Aba da estante em carvalho escuro com os livros doutrinários, manuais e códigos.
                  </p>
                </div>
              </div>

              {/* The 3 Shelves of Doutrina */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Placas de Latão das 3 Prateleiras da Doutrina:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Shelf 1 */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 dark:bg-amber-950/15 border border-amber-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                        1º Degrau (Superior)
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-mono">Legislação</span>
                    </div>
                    <input
                      type="text"
                      value={formData.customLabels?.shelfCodigos || 'Códigos'}
                      onChange={(e) => handleCustomLabelChange('shelfCodigos', e.target.value)}
                      placeholder="Ex: Códigos"
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-800/40 bg-white dark:bg-black text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-amber-200/60 leading-tight">
                      Constituição Federal, Códigos, Leis Complementares e Vade Mecum.
                    </p>
                  </div>

                  {/* Shelf 2 */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 dark:bg-amber-950/15 border border-amber-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                        2º Degrau (Central)
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-mono">Doutrina</span>
                    </div>
                    <input
                      type="text"
                      value={formData.customLabels?.shelfManuais || 'Manuais'}
                      onChange={(e) => handleCustomLabelChange('shelfManuais', e.target.value)}
                      placeholder="Ex: Manuais"
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-800/40 bg-white dark:bg-black text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-amber-200/60 leading-tight">
                      Manuais de autores consagrados (Tartuce, Didier, Aury Lopes Jr., Greco, Lenza).
                    </p>
                  </div>

                  {/* Shelf 3 */}
                  <div className="p-4 rounded-2xl bg-amber-950/20 dark:bg-amber-950/15 border border-amber-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                        3º Degrau (Inferior)
                      </span>
                      <span className="text-[10px] text-amber-400/80 font-mono">Precedentes</span>
                    </div>
                    <input
                      type="text"
                      value={formData.customLabels?.shelfJurisprudencias || 'Jurisprudências'}
                      onChange={(e) => handleCustomLabelChange('shelfJurisprudencias', e.target.value)}
                      placeholder="Ex: Jurisprudências"
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-800/40 bg-white dark:bg-black text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[10px] text-amber-200/60 leading-tight">
                      Súmulas Vinculantes, Enunciados do STF, STJ, TST e teses pacificadas.
                    </p>
                  </div>
                </div>

                {/* Live Brass Plaque Preview */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#180e09] via-[#24140d] to-[#120a06] border border-amber-900/50 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    <span className="text-xs font-serif text-amber-200 tracking-wider">
                      Preview das Placas de Latão na Estante:
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-200 text-xs font-serif font-extrabold tracking-widest">
                      {formData.customLabels?.shelfCodigos || 'Códigos'}
                    </span>
                    <span className="text-amber-500/50">•</span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-200 text-xs font-serif font-extrabold tracking-widest">
                      {formData.customLabels?.shelfManuais || 'Manuais'}
                    </span>
                    <span className="text-amber-500/50">•</span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-200 text-xs font-serif font-extrabold tracking-widest">
                      {formData.customLabels?.shelfJurisprudencias || 'Jurisprudências'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2: Platform Header & Sidebar Title */}
            <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-theme-accent" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
                  2. Título & Subtítulo da Plataforma (Slidebar & Topo)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={formData.customLabels?.platformTitle || formData.platformTitle || ''}
                    onChange={(e) => handleCustomLabelChange('platformTitle', e.target.value)}
                    placeholder="Ex: LexStudy"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subtítulo / Descrição
                  </label>
                  <input
                    type="text"
                    value={formData.customLabels?.platformSubtitle || formData.platformSubtitle || ''}
                    onChange={(e) => handleCustomLabelChange('platformSubtitle', e.target.value)}
                    placeholder="Ex: Plataforma Jurídica"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/70 dark:border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-theme-accent flex items-center justify-center text-white shadow-theme-accent shrink-0">
                  {PLATFORM_ICON_OPTIONS.find((i) => i.id === (formData.platformIcon || 'scale'))?.icon}
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Preview do Topo</span>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                    {formData.customLabels?.platformTitle || formData.platformTitle || 'LexStudy'}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                    {formData.customLabels?.platformSubtitle || formData.platformSubtitle || 'Plataforma Jurídica'}
                  </p>
                </div>
              </div>
            </div>

            {/* Group 3: Metrics & Contabilidade */}
            <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-theme-accent" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
                  3. Nome da Área de Métricas & Contabilidade
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Título da Zona de Métricas
                  </label>
                  <input
                    type="text"
                    value={formData.customLabels?.metricsTitle || formData.metricsTitle || ''}
                    onChange={(e) => handleCustomLabelChange('metricsTitle', e.target.value)}
                    placeholder="Ex: Contabilidade Analítica de Estudos"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subtítulo / Descrição da Área
                  </label>
                  <input
                    type="text"
                    value={formData.customLabels?.metricsSubtitle || formData.metricsSubtitle || ''}
                    onChange={(e) => handleCustomLabelChange('metricsSubtitle', e.target.value)}
                    placeholder="Ex: Acompanhe o volume real de horas líquidas..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/70 dark:border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-theme-accent-tint border border-theme-accent/40 flex items-center justify-center text-theme-accent shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Preview de Métricas</span>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                    {formData.customLabels?.metricsTitle || formData.metricsTitle || 'Contabilidade Analítica de Estudos'}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                    {formData.customLabels?.metricsSubtitle ||
                      formData.metricsSubtitle ||
                      'Acompanhe o volume real de horas líquidas e simulados FGV'}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-extrabold transition-all shadow-theme-accent cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Nomes & Menus</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: 🎨 APARÊNCIA & TEMA                                */}
      {/* ========================================================= */}
      {activeTab === 'aparencia' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Identidade Visual & Cores do Aparato
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecione o fundo da tela (Branco Puro ou Mega Preto), a cor de destaque para botões e o ícone de insígnia da plataforma.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent">
              Paleta Inteligente Ativa
            </span>
          </div>

          {/* SECTION A: THEME SELECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Escolha o Tema de Fundo (Preto ou Branco)
              </h3>
              <span className="text-xs text-slate-400">As fontes acompanham o contraste automaticamente</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = theme === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden group ${
                      isSelected
                        ? 'border-theme-accent bg-white/80 dark:bg-black/60 shadow-xl ring-2 ring-theme-accent/20'
                        : 'border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/5 opacity-80 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/10">
                          {opt.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {opt.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {opt.tag}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-theme-accent text-white shadow-sm'
                            : 'border border-slate-300 dark:border-white/20 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <div className={`p-3.5 rounded-xl border ${opt.cardPreview} ${opt.bgPreview} space-y-2 shadow-inner`}>
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-black ${opt.textPreview}`}>
                          Título em {opt.id === 'branco' ? 'Preto Nítido' : 'Branco Puro'}
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-theme-accent text-white">
                          Destaque
                        </span>
                      </div>
                      <div className={`text-[11px] leading-tight ${opt.id === 'branco' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        Se o fundo é {opt.id === 'branco' ? 'branco' : 'preto'}, a tipografia adapta-se com legibilidade absoluta.
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {opt.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: ACCENT COLOR SELECTION */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Escolha a Cor de Destaque do Aparato
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aplica-se em botões de ação, itens ativos do menu lateral, ícones selecionados e barras de progresso.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-theme-accent">
                Ativo: {currentAccentObj.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {ACCENT_OPTIONS.map((accent) => {
                const isSelected = accentColor === accent.id;
                return (
                  <button
                    key={accent.id}
                    type="button"
                    onClick={() => setAccentColor(accent.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-between gap-3 cursor-pointer text-center relative group ${
                      isSelected
                        ? 'border-theme-accent bg-white/90 dark:bg-black/70 shadow-lg ring-2 ring-theme-accent/20 -translate-y-0.5'
                        : 'border-slate-200/80 dark:border-white/10 bg-white/40 dark:bg-white/5 opacity-80 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-2xl shadow-md flex items-center justify-center transition-transform group-hover:scale-105 border-2 ${
                          accent.id === 'branco'
                            ? 'bg-white border-zinc-300 text-black'
                            : accent.id === 'preto'
                            ? 'bg-black border-zinc-700 text-white'
                            : `${accent.bgClass} border-transparent text-white`
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-5 h-5 stroke-[3]" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {accent.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                        {accent.description}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-theme-accent-tint text-theme-accent border-theme-accent'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent'
                      }`}
                    >
                      {isSelected ? 'Selecionado' : 'Aplicar'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION C: PLATFORM ICON */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Ícone da Plataforma (Insígnia Superior)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exibido no botão de expansão do menu lateral e na identidade geral do sistema.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {PLATFORM_ICON_OPTIONS.map((ico) => {
                const isSelected = (formData.platformIcon || 'scale') === ico.id;
                return (
                  <button
                    key={ico.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, platformIcon: ico.id }));
                      updateProfile({ platformIcon: ico.id }, true);
                      showToast(`Ícone alterado para "${ico.label}"!`);
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-theme-accent bg-theme-accent-tint text-theme-accent shadow-sm scale-105'
                        : 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                    title={`${ico.label} • ${ico.description}`}
                  >
                    <div className={isSelected ? 'text-theme-accent' : 'text-slate-600 dark:text-zinc-300'}>
                      {ico.icon}
                    </div>
                    <span className="text-[10px] font-bold truncate max-w-full">
                      {ico.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION D: LIVE APPARATUS SHOWCASE */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-theme-accent text-white shadow-theme-accent">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Demonstração do Aparato em Tempo Real
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Veja como os botões e barras reagem à sua combinação: Fundo {currentThemeObj.title} + Destaque {currentAccentObj.name}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent">
                {theme === 'branco' ? 'Fundo Branco' : 'Fundo Mega Preto'} • Destaque {currentAccentObj.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 flex flex-col justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Botão de Ação Primário
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Cor de destaque com contraste automático no texto.
                  </p>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-theme-accent shadow-theme-accent flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Flame className="w-4 h-4" />
                  <span>Iniciar Estudo Jurídico</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Ícone & Destaque
                  </span>
                  <span className="text-xl font-black text-theme-accent mt-0.5 block">
                    86.5 Horas
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Total de horas líquidas
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0 shadow-xs">
                  <Scale className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-white/5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      Meta do Cronograma
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 block">
                      {profile.examTarget}
                    </span>
                  </div>
                  <span className="text-sm font-black text-theme-accent">
                    72%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-theme-accent rounded-full transition-all duration-500"
                    style={{ width: '72%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: 📚 MATÉRIAS & SIGLAS                               */}
      {/* ========================================================= */}
      {activeTab === 'materias' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Catálogo de Matérias & Lombadas</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent/30 font-extrabold">
                    {subjects.length} ativas
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Adicione novas matérias, retire disciplinas que não deseja estudar e ajuste os nomes de exibição nas lombadas e filtros.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddSubjectOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-theme-accent-tint text-theme-accent border border-theme-accent/30 hover:bg-theme-accent/20 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Matéria</span>
              </button>
              <button
                type="button"
                onClick={handleResetSubjectNames}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão OAB</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSubjectNames}
                className="flex items-center gap-1.5 px-4 py-2 bg-theme-accent text-white rounded-xl text-xs font-bold shadow-theme-accent hover:opacity-95 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Lombadas</span>
              </button>
            </div>
          </div>

          {/* Form: Add New Subject */}
          {isAddSubjectOpen && (
            <form
              onSubmit={handleAddNewSubject}
              className="p-5 rounded-2xl border-2 border-theme-accent/40 bg-slate-50/90 dark:bg-zinc-950 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-theme-accent text-white flex items-center justify-center font-black text-sm">
                    +
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Adicionar Nova Disciplina ao Sistema
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  ✕ Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Completo da Disciplina *
                  </label>
                  <input
                    type="text"
                    value={newSubjectFullName}
                    onChange={(e) => setNewSubjectFullName(e.target.value)}
                    placeholder="Ex: Direito Previdenciário, Filosofia do Direito..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome Curto / Lombada (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newSubjectShortName}
                    onChange={(e) => setNewSubjectShortName(e.target.value)}
                    placeholder="Ex: Previdenciário, Filosofia..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-theme-accent text-white text-xs font-bold shadow-theme-accent hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Cadastrar Matéria
                </button>
              </div>
            </form>
          )}

          {/* Active Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {subjects.map((subj) => {
              const currentVal = localSubjectNames[subj] ?? (DEFAULT_SUBJECT_NAMES[subj] || subj);
              const icon = getSubjectIcon(subj);
              return (
                <div
                  key={subj}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-black/50 flex flex-col justify-between gap-2.5 transition-all hover:border-theme-accent/50 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{icon}</span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                          {subj}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                      title={`Tirar "${subj}" do catálogo ativo`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Nome de Exibição / Lombada
                    </label>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) =>
                        setLocalSubjectNames((prev) => ({
                          ...prev,
                          [subj]: e.target.value,
                        }))
                      }
                      placeholder={subj}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                    />
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Lombada:</span>
                    <span className="px-2 py-0.5 rounded-md bg-theme-accent-tint text-theme-accent border border-theme-accent/30 text-[10px] font-black uppercase tracking-wider truncate max-w-[140px]">
                      {currentVal || subj}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: 🎯 METAS & EXAME OAB                               */}
      {/* ========================================================= */}
      {activeTab === 'metas' && (
        <form onSubmit={handleSaveGoals} className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Metas do Aluno & Preparação OAB
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sincronize a data da prova objetiva com o contador do painel, estabeleça sua meta diária de horas e configure seu exame alvo.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-theme-accent text-white rounded-xl text-xs font-bold shadow-theme-accent hover:opacity-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Metas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-theme-accent" />
                  <span>Nome do Estudante / Candidato</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                />
                <p className="text-[11px] text-slate-400">
                  Exibido na saudação do painel inicial e nas fichas de estudo.
                </p>
              </div>

              {/* Exam Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-theme-accent" />
                  <span>Exame Alvo da OAB</span>
                </label>
                <input
                  type="text"
                  value={formData.examTarget}
                  onChange={(e) => setFormData({ ...formData, examTarget: e.target.value })}
                  placeholder="Ex: 48º Exame de Ordem (OAB 48)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                />
                <p className="text-[11px] text-slate-400">
                  Referência do edital e histórico de simulados FGV.
                </p>
              </div>

              {/* Target Exam Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-theme-accent" />
                  <span>Data da Prova Objetiva (1ª Fase FGV)</span>
                </label>
                <input
                  type="date"
                  value={formData.targetExamDate}
                  onChange={(e) => setFormData({ ...formData, targetExamDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                />
                <p className="text-[11px] text-slate-400">
                  Alimenta diretamente o contador regressivo de dias do painel principal.
                </p>
              </div>

              {/* Daily Goal Hours */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-theme-accent" />
                  <span>Meta Diária de Estudo (Horas Líquidas)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  step="0.5"
                  value={formData.dailyGoalHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dailyGoalHours: parseFloat(e.target.value) || 4,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-theme-accent"
                />
                <p className="text-[11px] text-slate-400">
                  Meta para o cronômetro Pomodoro e indicador de rendimento diário.
                </p>
              </div>
            </div>

            {/* Countdown & Weekly Summary Pill */}
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Contagem Regressiva</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {daysToExam !== null ? `${daysToExam} dias` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Até a prova FGV</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Meta Semanal Estimada</span>
                  <span className="text-lg font-black text-theme-accent">
                    {((formData.dailyGoalHours || 4) * 7).toFixed(0)}h / semana
                  </span>
                  <span className="text-[10px] text-slate-400 block">7 dias de estudo</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Foco de Preparação</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                    {formData.examTarget || 'Exame de Ordem'}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold block">Sincronizado</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-extrabold transition-all shadow-theme-accent cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Metas & Exame OAB</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 5: 💾 DADOS & ACERVO                                  */}
      {/* ========================================================= */}
      {activeTab === 'dados' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Backup, Segurança & Gestão do Acervo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exporte o banco de dados completo em formato JSON para salvar no computador ou restaurar em outro dispositivo.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              Dados Salvos Localmente
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export JSON */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-black/40 flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Exportar Backup Completo (.JSON)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gera um arquivo de segurança contendo todos os seus cadernos, cronograma de estudos, livros da biblioteca, histórico de questões e configurações.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4 text-theme-accent" />
                <span>Baixar Backup dos Estudos (.JSON)</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-black/40 flex flex-col justify-between gap-4">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Restaurar Backup Anterior (.JSON)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Carregue um arquivo JSON previamente salvo para restabelecer todos os seus dados em um novo navegador ou máquina.
                </p>
              </div>

              <label className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer shadow-xs active:scale-95">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Selecionar Arquivo .JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          {/* Obsidian Vault Live 2-Way Sync & Transfer Card */}
          <div className="p-6 sm:p-7 rounded-2xl border-2 border-purple-500/30 dark:border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <FolderSync className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Cofre Local do Obsidian (Sincronização Bidirecional)
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        isVaultConnected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {isVaultConnected ? `🟢 Conectado: ${vaultName}` : '⚪ Desconectado'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed max-w-2xl">
                    Interliga seus estudos diretamente à pasta do Obsidian no seu computador ou Google Drive (<code className="text-purple-400 font-mono">G:\Meu Drive\Lex\LexStudy</code>). Edite no Obsidian ou aqui no LexStudy — os cadernos, cronograma e flashcards sincronizam em tempo real nos dois sentidos.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Pasta Vinculada</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {vaultName ? `📁 ${vaultName}` : 'Nenhuma pasta selecionada'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Última Sincronização</span>
                <span className="font-semibold text-purple-300 block">
                  {lastVaultSync || 'Ainda não sincronizado'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Sincronização Automática</span>
                <span className="font-semibold text-emerald-400 block">
                  {isVaultConnected ? '⚡ Ativa ao salvar & ao focar janela' : 'Inativa'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-purple-500/20">
              {isVaultConnected ? (
                <>
                  <button
                    type="button"
                    onClick={syncNowToVault}
                    disabled={isVaultSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isVaultSyncing ? 'animate-spin' : ''}`} />
                    <span>{isVaultSyncing ? 'Sincronizando...' : 'Sincronizar Tudo Agora'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={pullFromVault}
                    disabled={isVaultSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                    <span>Puxar Alterações do Obsidian</span>
                  </button>

                  <button
                    type="button"
                    onClick={disconnectObsidianVault}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer ml-auto"
                  >
                    <Unlink className="w-4 h-4" />
                    <span>Desconectar Cofre</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={connectObsidianVault}
                  disabled={isVaultSyncing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:brightness-110 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-purple-600/25 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <FolderSync className="w-4 h-4" />
                  <span>Conectar Pasta do Obsidian (G:\Meu Drive\Lex\LexStudy)</span>
                </button>
              )}

              {/* Manual ZIP Backup Download Option */}
              <button
                type="button"
                onClick={handleExportObsidian}
                disabled={isExportingObsidian}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Baixar cofre compactado (.zip) como backup estático"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingObsidian ? 'Baixando...' : 'Baixar Backup .ZIP do Cofre'}</span>
              </button>
            </div>
          </div>

          {/* Danger Zone & Operations */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 space-y-4">
            {/* Zerar Horas & Sessões */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Zerar Horas Estudadas & Histórico de Sessões</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold uppercase">
                    Rendimento
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  Redefine o contador de horas líquidas para 0.0h e limpa o registro de sessões de estudo. Ideal para iniciar um novo ciclo de preparação com as métricas limpas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsClearSessionsConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Zerar Horas (0.0h)</span>
              </button>
            </div>

            {/* Bloquear Acesso / Logout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-500/5 border border-zinc-500/20">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-theme-accent" />
                  <span>Segurança: Bloquear Acesso da Plataforma</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-accent-tint text-theme-accent font-bold uppercase">
                    Sessão
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  Encerra a sessão ativa neste dispositivo e redireciona imediatamente para a tela de autenticação jurídica do LexStudy.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-zinc-500/10 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bloquear Agora</span>
              </button>
            </div>

            {/* Danger Zone: Reset to Base Zero */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Limpar Tudo & Iniciar Base Zero</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 font-bold uppercase">
                    Base Zero
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  Apaga todos os cadernos, metas do cronograma, livros da biblioteca, eventos do calendário e horas estudadas, deixando a plataforma 100% limpa para início dos seus estudos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Toda a Plataforma</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear Sessions Dialog */}
      <ConfirmDialog
        isOpen={isClearSessionsConfirmOpen}
        onClose={() => setIsClearSessionsConfirmOpen(false)}
        onConfirm={() => {
          clearAllSessions();
          setIsClearSessionsConfirmOpen(false);
          showToast('Horas de estudo e histórico de sessões zerados com sucesso (0.0h).', 'info');
        }}
        title="Zerar Horas e Histórico de Sessões"
        message="Tem certeza de que deseja zerar todas as sessões registradas e redefinir o contador de horas para 0.0h? Essa ação não pode ser desfeita."
        confirmLabel="Sim, Zerar Horas (0.0h)"
      />

      {/* Confirm Logout Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          logout();
        }}
        title="Bloquear Acesso à Plataforma"
        message="Deseja sair e bloquear o acesso agora? Você precisará autenticar novamente para acessar o acervo."
        confirmLabel="Sim, Bloquear Acesso"
      />

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          setIsResetConfirmOpen(false);
          resetToDemoData();
        }}
        title="Limpar Toda a Plataforma (Base Zero)"
        message="Tem certeza de que deseja apagar todos os cadernos, metas do cronograma, livros da biblioteca, eventos do calendário e horas de estudo? Esta ação deixará a plataforma 100% zerada para um novo ciclo."
        confirmLabel="Sim, Limpar Todos os Dados"
      />
    </div>
  );
};
