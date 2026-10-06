import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarCategory, CalendarCustomEvent } from '../../types';
import { formatDateShort, getSubjectColor } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  Trash2,
  GraduationCap,
  Briefcase,
  AlertCircle,
  FileCheck,
  Scale,
  Sparkles,
  Layers,
  X,
  Target,
  ArrowRight,
} from 'lucide-react';

type CalendarViewMode = 'mensal' | 'semanal' | 'diario' | 'anual';

interface UnifiedEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: CalendarCategory;
  isScheduleItem?: boolean;
  subject?: string;
  description?: string;
  location?: string;
  completed?: boolean;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CATEGORY_CONFIG: Record<
  CalendarCategory,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  oab: {
    label: 'Meta OAB 48',
    bg: 'bg-theme-accent-tint',
    text: 'text-theme-accent font-bold',
    border: 'border-theme-accent/50',
    icon: <Scale className="w-3.5 h-3.5" />,
  },
  faculdade: {
    label: 'Faculdade / Trabalhos',
    bg: 'bg-purple-500/20 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-200 font-bold',
    border: 'border-purple-500/50',
    icon: <GraduationCap className="w-3.5 h-3.5" />,
  },
  compromisso: {
    label: 'Compromisso Pessoal / Estágio',
    bg: 'bg-emerald-500/20 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-200 font-bold',
    border: 'border-emerald-500/50',
    icon: <Briefcase className="w-3.5 h-3.5" />,
  },
  prova: {
    label: 'Prova / Prazo Fatal',
    bg: 'bg-rose-500/20 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-200 font-bold',
    border: 'border-rose-500/50',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  outro: {
    label: 'Outro / Lembrete',
    bg: 'bg-amber-500/20 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-200 font-bold',
    border: 'border-amber-500/50',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
};

export const CalendarView: React.FC = () => {
  const {
    schedule,
    customEvents,
    addCustomEvent,
    deleteCustomEvent,
    profile,
    showToast,
    setActiveTab,
    getSubjectDisplayName,
  } = useApp();

  // Today reference string
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('mensal');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Filter categories
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CalendarCategory | 'todos'>('todos');

  // Modal New Event
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<{
    title: string;
    date: string;
    time: string;
    category: CalendarCategory;
    description: string;
    location: string;
  }>({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: '14:00',
    category: 'faculdade',
    description: '',
    location: '',
  });

  // Event Detail Modal
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);

  // Merge OAB schedule items + customEvents into unified list
  const unifiedEvents = useMemo<UnifiedEvent[]>(() => {
    const list: UnifiedEvent[] = [];

    // OAB Schedule Items
    schedule.forEach((s) => {
      list.push({
        id: `oab-${s.id}`,
        title: s.topic,
        date: s.date,
        time: 'Estudo Diário',
        category: 'oab',
        isScheduleItem: true,
        subject: s.subject,
        description: `Matéria: ${getSubjectDisplayName(s.subject)} • Duração estimada: ${s.durationMinutes} min. Prioridade: ${s.priority.toUpperCase()}`,
        completed: s.status === 'concluido',
      });
    });

    // Custom Events (College, commitments, exams)
    customEvents.forEach((c) => {
      // If this is the official exam event, dynamically sync its date and title with profile
      const isOfficialExam = c.id === 'evt-6' || (c.category === 'oab' && c.title.toLowerCase().includes('exame'));
      list.push({
        id: c.id,
        title: isOfficialExam ? `Exame Oficial ${profile.examTarget}` : c.title,
        date: isOfficialExam && profile.targetExamDate ? profile.targetExamDate : c.date,
        time: c.time,
        category: c.category,
        description: c.description,
        location: c.location,
        completed: c.completed,
      });
    });

    return list;
  }, [schedule, customEvents, getSubjectDisplayName, profile.examTarget, profile.targetExamDate]);

  // Filtered by category
  const filteredEvents = useMemo(() => {
    if (activeCategoryFilter === 'todos') return unifiedEvents;
    return unifiedEvents.filter((e) => e.category === activeCategoryFilter);
  }, [unifiedEvents, activeCategoryFilter]);

  const matchingCategoryEvents = useMemo(() => {
    if (activeCategoryFilter === 'todos') return [];
    return unifiedEvents.filter((e) => e.category === activeCategoryFilter);
  }, [unifiedEvents, activeCategoryFilter]);

  const handleCategoryFilterClick = (cat: CalendarCategory | 'todos') => {
    setActiveCategoryFilter(cat);
    if (cat !== 'todos') {
      const matching = unifiedEvents.filter((e) => e.category === cat);
      if (matching.length > 0) {
        // Find upcoming event on or after today, or the first event in the category
        const target = matching.find((e) => e.date >= todayStr) || matching[0];
        const [y, m, d] = target.date.split('-').map(Number);
        setCurrentDate(new Date(y, m - 1, d, 12, 0, 0));
        setSelectedDate(target.date);
      }
    }
  };

  // Quick jump functions
  const jumpDay = (delta: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const jumpMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  const jumpYear = (delta: number) => {
    const d = new Date(currentDate);
    d.setFullYear(d.getFullYear() + delta);
    setCurrentDate(d);
  };

  const handleSelectDay = (dateStr: string, openDaily = false) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d, 12, 0, 0);
    setCurrentDate(targetDate);
    setSelectedDate(dateStr);
    if (openDaily) {
      setViewMode('diario');
    }
  };

  const handleSelectMonth = (mIndex: number) => {
    const d = new Date(currentDate);
    d.setMonth(mIndex);
    setCurrentDate(d);
  };

  const handleSelectYear = (yr: number) => {
    const d = new Date(currentDate);
    d.setFullYear(yr);
    setCurrentDate(d);
  };

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mensal') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'semanal') {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === 'diario') {
      d.setDate(d.getDate() - 1);
    } else if (viewMode === 'anual') {
      d.setFullYear(d.getFullYear() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'mensal') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'semanal') {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === 'diario') {
      d.setDate(d.getDate() + 1);
    } else if (viewMode === 'anual') {
      d.setFullYear(d.getFullYear() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Days in current month grid
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentDate, todayStr]);

  // Current week days
  const weekDays = useMemo(() => {
    const current = new Date(currentDate);
    const dayOfWeek = current.getDay();
    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      days.push({
        date: d,
        dateStr,
        dayName: WEEK_DAYS[i],
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentDate, todayStr]);

  // Events for a specific date
  const getEventsForDate = (dateStr: string) => {
    return filteredEvents.filter((e) => e.date === dateStr);
  };

  // Submit new custom event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim()) return;

    addCustomEvent({
      title: eventForm.title.trim(),
      date: eventForm.date,
      time: eventForm.time || undefined,
      category: eventForm.category,
      description: eventForm.description || undefined,
      location: eventForm.location || undefined,
    });

    setIsNewEventModalOpen(false);
    setEventForm({
      title: '',
      date: selectedDate,
      time: '14:00',
      category: 'faculdade',
      description: '',
      location: '',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] glass-panel bg-white dark:bg-black rounded-3xl overflow-hidden shadow-2xl transition-colors w-full border border-slate-200/80 dark:border-white/10">
      {/* Top Main Navigation Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-black backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent">
            <CalendarIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize">
                {MONTH_NAMES[currentDate.getMonth()]} de {currentDate.getFullYear()}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-theme-accent-tint text-theme-accent border border-theme-accent/30">
                {profile.examTarget} ({formatDateShort(profile.targetExamDate)})
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Cronograma Jurídico Integrado • Faculdade, Compromissos e Simulados
            </p>
          </div>
        </div>

        {/* View mode switcher & actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Buttons */}
          <div className="grid grid-cols-4 bg-slate-200/60 dark:bg-zinc-950 rounded-xl p-1 text-xs font-bold gap-1 border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('mensal')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'mensal'
                  ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setViewMode('semanal')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'semanal'
                  ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setViewMode('diario')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'diario'
                  ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Diário
            </button>
            <button
              type="button"
              onClick={() => setViewMode('anual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'anual'
                  ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anual
            </button>
          </div>

          {/* Add New Event Button */}
          <button
            type="button"
            onClick={() => {
              setEventForm((prev) => ({ ...prev, date: selectedDate }));
              setIsNewEventModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-theme-accent cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Bar: Direct Month & Year Selectors, -1/+1 Jumpers and Today */}
      <div className="px-4 py-2.5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-black flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">
            Navegar:
          </span>

          {/* Direct Month Dropdown */}
          <select
            value={currentDate.getMonth()}
            onChange={(e) => handleSelectMonth(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-950 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-theme-accent cursor-pointer"
          >
            {MONTH_NAMES.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          {/* Direct Year Dropdown */}
          <select
            value={currentDate.getFullYear()}
            onChange={(e) => handleSelectYear(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-950 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-theme-accent cursor-pointer"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Jump buttons: -1/+1 Day, -1/+1 Month, -1/+1 Year */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-zinc-900/80 p-0.5 rounded-xl border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => jumpDay(-1)}
              className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Voltar 1 Dia"
            >
              -1 Dia
            </button>
            <button
              type="button"
              onClick={() => jumpDay(1)}
              className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Avançar 1 Dia"
            >
              +1 Dia
            </button>
            <div className="w-px h-3.5 bg-slate-300 dark:bg-white/10 mx-0.5" />
            <button
              type="button"
              onClick={() => jumpMonth(-1)}
              className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Voltar 1 Mês"
            >
              -1 Mês
            </button>
            <button
              type="button"
              onClick={() => jumpMonth(1)}
              className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Avançar 1 Mês"
            >
              +1 Mês
            </button>
            <div className="w-px h-3.5 bg-slate-300 dark:bg-white/10 mx-0.5" />
            <button
              type="button"
              onClick={() => jumpYear(-1)}
              className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Voltar 1 Ano"
            >
              -1 Ano
            </button>
            <button
              type="button"
              onClick={() => jumpYear(1)}
              className="px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Avançar 1 Ano"
            >
              +1 Ano
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToday}
          className="px-3 py-1.5 rounded-xl bg-theme-accent-tint text-theme-accent border border-theme-accent/30 font-bold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
        >
          📍 Ir Para Hoje
        </button>
      </div>

      {/* Category Legend & Filter Bar */}
      <div className="px-4 py-2 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-950 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Filtrar:
        </span>

        <button
          type="button"
          onClick={() => handleCategoryFilterClick('todos')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
            activeCategoryFilter === 'todos'
              ? 'bg-theme-accent text-white shadow-theme-accent'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/10'
          }`}
        >
          Todos ({unifiedEvents.length})
        </button>

        {(Object.keys(CATEGORY_CONFIG) as CalendarCategory[]).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const count = unifiedEvents.filter((e) => e.category === cat).length;
          const isSelected = activeCategoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryFilterClick(cat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold border transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-indigo-500/30`
                  : 'bg-white/50 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              {cfg.icon}
              <span>{cfg.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Active Panel: Direct list of all filtered events */}
      {activeCategoryFilter !== 'todos' && (
        <div className="px-4 py-3 bg-slate-100/90 dark:bg-zinc-950 border-b border-slate-200/80 dark:border-white/10 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${CATEGORY_CONFIG[activeCategoryFilter].bg} ${CATEGORY_CONFIG[activeCategoryFilter].text}`}>
                {CATEGORY_CONFIG[activeCategoryFilter].icon}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{CATEGORY_CONFIG[activeCategoryFilter].label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-white/10 font-mono font-extrabold text-theme-accent">
                    {matchingCategoryEvents.length} {matchingCategoryEvents.length === 1 ? 'evento agendado' : 'eventos agendados'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Exibindo todas as tarefas desta categoria. Clique em qualquer card abaixo para focar a data no calendário.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCategoryFilterClick('todos')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-2xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtro (Ver Todos)</span>
            </button>
          </div>

          {/* Cards for each matching event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {matchingCategoryEvents.map((evt) => {
              const isEventSelected = selectedDate === evt.date;
              return (
                <div
                  key={evt.id}
                  onClick={() => handleSelectDay(evt.date, false)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-2xs group ${
                    isEventSelected
                      ? 'bg-white dark:bg-black border-theme-accent ring-2 ring-theme-accent/20'
                      : 'bg-white/80 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-300 font-mono block w-fit mb-1">
                        📅 {formatDateShort(evt.date)} {evt.time ? `• ${evt.time}` : ''}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate group-hover:text-theme-accent transition-colors">
                        {evt.title}
                      </h4>
                      {evt.description && (
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5 text-[10px]">
                    <span className="text-slate-400 font-medium truncate max-w-[140px]">
                      {evt.location ? `📍 ${evt.location}` : 'Agendado no Sistema'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDay(evt.date, true);
                      }}
                      className="px-2 py-0.5 rounded-md bg-theme-accent text-white font-bold text-[9px] hover:opacity-90 shadow-2xs shrink-0"
                    >
                      Ver no Dia ➔
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: MONTHLY CALENDAR GRID (MENSAL)                    */}
      {/* ========================================================= */}
      {viewMode === 'mensal' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Weekday column headers */}
          <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-white/10 text-center py-2 bg-slate-100/50 dark:bg-black text-xs font-bold text-slate-500 dark:text-zinc-400 shrink-0">
            {WEEK_DAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* 42 Days Matrix */}
          <div className="grid grid-cols-7 flex-1 min-h-[550px] divide-x divide-y divide-slate-200/60 dark:divide-white/5">
            {monthDays.map((d, index) => {
              const dayEvents = getEventsForDate(d.dateStr);
              const isSelected = selectedDate === d.dateStr;
              const isFilterActive = activeCategoryFilter !== 'todos';
              const hasMatchingFilterEvents = isFilterActive && dayEvents.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => handleSelectDay(d.dateStr, false)}
                  onDoubleClick={() => handleSelectDay(d.dateStr, true)}
                  className={`p-1.5 sm:p-2 transition-all flex flex-col min-h-[90px] relative group cursor-pointer ${
                    !d.isCurrentMonth
                      ? 'bg-slate-100/30 dark:bg-zinc-950/40 text-slate-400 dark:text-zinc-600'
                      : isFilterActive && !hasMatchingFilterEvents
                      ? 'bg-white/20 dark:bg-black/40 opacity-40 hover:opacity-100 text-slate-600 dark:text-zinc-400'
                      : 'bg-white/40 dark:bg-black text-slate-800 dark:text-zinc-100'
                  } ${
                    hasMatchingFilterEvents
                      ? 'ring-2 ring-theme-accent border-2 border-theme-accent shadow-md bg-theme-accent-tint/15'
                      : isSelected
                      ? 'ring-2 ring-theme-accent ring-inset bg-theme-accent-tint/15'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-950/80'
                  }`}
                  title={
                    dayEvents.length > 0
                      ? `${dayEvents.length} tarefas em ${d.dateStr}:\n` +
                        dayEvents.map((e) => `• ${e.time ? e.time + ' - ' : ''}${e.title}`).join('\n') +
                        '\n(Dê dois cliques para abrir no Modo Diário)'
                      : undefined
                  }
                >
                  {/* Day number header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        d.isToday
                          ? 'bg-theme-accent text-white font-extrabold shadow-md shadow-theme-accent'
                          : isSelected
                          ? 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white font-extrabold'
                          : 'text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {d.dayNumber}
                    </span>

                    {/* Quick Add Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventForm((prev) => ({ ...prev, date: d.dateStr }));
                        setIsNewEventModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-theme-accent rounded-md transition-opacity cursor-pointer"
                      title="Adicionar evento neste dia"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Clean Single Task Count Pill (Sem sobreposição, seguindo paleta) */}
                  {dayEvents.length > 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-1">
                      <div
                        className={`w-full py-1.5 px-2 rounded-xl text-center text-[10px] font-bold shadow-2xs transition-transform hover:scale-[1.02] ${
                          hasMatchingFilterEvents
                            ? 'bg-theme-accent text-white shadow-xs'
                            : 'bg-theme-accent-tint text-theme-accent border border-theme-accent/30'
                        }`}
                      >
                        {dayEvents.length === 1 ? '1 tarefa' : `${dayEvents.length} tarefas`}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {/* 1-Click "Ver no Dia" Action on Selected Cell with Events */}
                  {isSelected && dayEvents.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDay(d.dateStr, true);
                      }}
                      className="mt-1 w-full py-1 bg-theme-accent hover:opacity-95 text-white text-[9px] font-bold rounded-md shadow-xs flex items-center justify-center gap-1 transition-opacity"
                    >
                      <span>Ver no Dia ({dayEvents.length})</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: WEEKLY VIEW (SEMANAL)                             */}
      {/* ========================================================= */}
      {viewMode === 'semanal' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((wd) => {
              const dayEvents = getEventsForDate(wd.dateStr);
              return (
                <div
                  key={wd.dateStr}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[500px] ${
                    wd.isToday
                      ? 'bg-theme-accent-tint border-theme-accent/40'
                      : 'bg-white/60 dark:bg-black border-slate-200/80 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-white/10">
                    <div
                      onClick={() => handleSelectDay(wd.dateStr, true)}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      title="Ver tarefas deste dia no Modo Diário"
                    >
                      <span className="text-xs font-bold text-slate-400 uppercase block">
                        {wd.dayName}
                      </span>
                      <span
                        className={`text-base font-extrabold ${
                          wd.isToday ? 'text-theme-accent' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {wd.dayNumber} {MONTH_NAMES[wd.date.getMonth()].slice(0, 3)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEventForm((prev) => ({ ...prev, date: wd.dateStr }));
                        setIsNewEventModalOpen(true);
                      }}
                      className="p-1 rounded-lg bg-theme-accent-tint text-theme-accent hover:bg-theme-accent hover:text-white transition-colors cursor-pointer"
                      title="Adicionar evento"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayEvents.length === 0 ? (
                      <span className="text-[11px] text-slate-400 block text-center pt-4 italic">
                        Sem compromissos
                      </span>
                    ) : (
                      dayEvents.map((evt) => {
                        const cfg = CATEGORY_CONFIG[evt.category];
                        return (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-transform hover:scale-[1.02] ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                {cfg.icon}
                                {cfg.label}
                              </span>
                              {evt.time && (
                                <span className="text-[10px] font-mono opacity-80">{evt.time}</span>
                              )}
                            </div>
                            <h4 className="font-bold leading-snug">{evt.title}</h4>
                            {evt.location && (
                              <div className="text-[10px] opacity-75 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{evt.location}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: DAILY VIEW (DIÁRIO)                               */}
      {/* ========================================================= */}
      {viewMode === 'diario' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
          <div className="mb-4 pb-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-theme-accent uppercase tracking-wider">
                Visão Diária do Estudante
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {currentDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                const dateStr = `${currentDate.getFullYear()}-${String(
                  currentDate.getMonth() + 1
                ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                setEventForm((prev) => ({ ...prev, date: dateStr }));
                setIsNewEventModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-theme-accent hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-theme-accent cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Neste Dia</span>
            </button>
          </div>

          {/* Day's Events List */}
          {(() => {
            const dateStr = `${currentDate.getFullYear()}-${String(
              currentDate.getMonth() + 1
            ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            const events = getEventsForDate(dateStr);

            if (events.length === 0) {
              return (
                <div className="p-12 text-center text-slate-400 bg-white/40 dark:bg-black rounded-2xl border border-slate-200/80 dark:border-white/10">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Nenhuma atividade agendada para este dia.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Aproveite para adiantar metas do cronograma da OAB 48!
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {events.map((evt) => {
                  const cfg = CATEGORY_CONFIG[evt.category];
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          {cfg.icon}
                          {cfg.label}
                        </span>
                        {evt.time && (
                          <span className="text-xs font-mono font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {evt.time}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        {evt.title}
                      </h4>

                      {evt.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                          {evt.description}
                        </p>
                      )}

                      {evt.location && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 4: YEARLY OVERVIEW (ANUAL)                           */}
      {/* ========================================================= */}
      {viewMode === 'anual' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Panorama Anual de {currentDate.getFullYear()}
              </h3>
              <p className="text-xs text-slate-400">
                Visualize a densidade de estudos e a contagem regressiva para a prova
              </p>
            </div>

            <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Scale className="w-4 h-4" />
              <span>{profile.examTarget} Prevista para {formatDateShort(profile.targetExamDate)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MONTH_NAMES.map((mName, mIdx) => {
              const year = currentDate.getFullYear();
              const firstDay = new Date(year, mIdx, 1).getDay();
              const totalDays = new Date(year, mIdx + 1, 0).getDate();

              return (
                <div
                  key={mName}
                  onClick={() => {
                    setCurrentDate(new Date(year, mIdx, 1));
                    setViewMode('mensal');
                  }}
                  className="p-3 bg-white/60 dark:bg-black rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-theme-accent/50 transition-all cursor-pointer"
                >
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-2 text-center uppercase tracking-wider">
                    {mName}
                  </h4>

                  <div className="grid grid-cols-7 gap-1 text-[9px] text-center font-bold text-slate-400 mb-1">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((wd, i) => (
                      <span key={i}>{wd}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <span key={`pad-${i}`} />
                    ))}
                    {Array.from({ length: totalDays }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(
                        dayNum
                      ).padStart(2, '0')}`;
                      const events = getEventsForDate(dateStr);
                      const hasOab = events.some((e) => e.category === 'oab');
                      const hasFaculdade = events.some((e) => e.category === 'faculdade');
                      const hasProva = events.some((e) => e.category === 'prova');

                      let dotClass = 'text-slate-600 dark:text-slate-300';
                      if (hasProva) {
                        dotClass = 'bg-rose-500 text-white font-bold rounded-full';
                      } else if (hasFaculdade) {
                        dotClass = 'bg-purple-500 text-white font-bold rounded-full';
                      } else if (hasOab) {
                        dotClass = 'bg-theme-accent text-white font-bold rounded-full';
                      }

                      return (
                        <span
                          key={dayNum}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDay(dateStr, true);
                          }}
                          className={`p-0.5 rounded transition-all cursor-pointer hover:scale-125 ${dotClass}`}
                          title={`Ver ${dateStr} no Modo Diário`}
                        >
                          {dayNum}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NOVO COMPROMISSO / EVENTO                          */}
      {/* ========================================================= */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-theme-accent" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Novo Compromisso ou Prazo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Título do Compromisso / Tarefa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Entrega Trabalho Direito Penal, Audiência NPJ..."
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, category: e.target.value as CalendarCategory })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="faculdade">🟣 Faculdade / Trabalho</option>
                    <option value="compromisso">🟢 Compromisso / Estágio</option>
                    <option value="prova">🔴 Prova / Prazo Fatal</option>
                    <option value="oab">🔵 Meta OAB 48</option>
                    <option value="outro">🟡 Outro / Lembrete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Horário (Opcional)
                  </label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Local / Link (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sala 302, Teams, NPJ..."
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações / Detalhes
                </label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais, temas da prova ou instruções..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-theme-accent hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-theme-accent cursor-pointer"
                >
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DETALHES DO EVENTO                                 */}
      {/* ========================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-white/10">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${
                    CATEGORY_CONFIG[selectedEvent.category].bg
                  } ${CATEGORY_CONFIG[selectedEvent.category].text} ${
                    CATEGORY_CONFIG[selectedEvent.category].border
                  }`}
                >
                  {CATEGORY_CONFIG[selectedEvent.category].icon}
                  {CATEGORY_CONFIG[selectedEvent.category].label}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                  {selectedEvent.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-theme-accent" />
                <span>
                  <strong>Data:</strong> {formatDateShort(selectedEvent.date)}
                </span>
              </div>

              {selectedEvent.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-theme-accent" />
                  <span>
                    <strong>Horário:</strong> {selectedEvent.time}
                  </span>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-theme-accent" />
                  <span>
                    <strong>Local / Plataforma:</strong> {selectedEvent.location}
                  </span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200/60 dark:border-white/5 leading-relaxed">
                  {selectedEvent.description}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10">
              {/* If it's a schedule item, allow opening study notebook */}
              {selectedEvent.isScheduleItem ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
                    setActiveTab('editor');
                  }}
                  className="px-3 py-1.5 bg-theme-accent hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-theme-accent cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Abrir Caderno de Estudo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    deleteCustomEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
