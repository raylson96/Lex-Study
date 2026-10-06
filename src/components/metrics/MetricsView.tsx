import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LawSubject } from '../../types';
import { getSubjectColor, formatDateShort } from '../../utils/formatters';
import {
  BarChart3,
  Clock,
  HelpCircle,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Flame,
  Scale,
  BrainCircuit,
  BookmarkCheck,
  Percent,
  ChevronDown,
  Check,
  Library,
  BookMarked,
  Bookmark,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

type TimeScope = 'diario' | 'semanal' | 'mensal';

export const MetricsView: React.FC = () => {
  const {
    sessions,
    questions,
    schedule,
    documents,
    library,
    profile,
    theme,
    subjects,
    getSubjectDisplayName,
  } = useApp();

  const [timeScope, setTimeScope] = useState<TimeScope>('diario');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('todas');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trackedSubjectsList = useMemo(() => {
    const list: string[] = [...subjects];
    const pushIfMissing = (s?: string) => {
      if (s && !list.includes(s)) list.push(s);
    };
    sessions.forEach((s) => pushIfMissing(s.subject));
    questions.forEach((q) => pushIfMissing(q.subject));
    schedule.forEach((s) => pushIfMissing(s.subject));
    documents.forEach((d) => pushIfMissing(d.subject));
    library.forEach((l) => pushIfMissing(l.subject));
    return list;
  }, [subjects, sessions, questions, schedule, documents, library]);

  const metricsTitle = profile.metricsTitle || 'Contabilidade Analítica de Estudos';
  const metricsSubtitle =
    profile.metricsSubtitle ||
    'Acompanhe o volume real de horas líquidas, taxas de acerto em simulados FGV, maturidade em cada ramo jurídico e desenvolvimento do acervo.';


  // Today reference string
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Filtered sessions by subject if selected
  const activeSessions = useMemo(() => {
    if (selectedSubjectFilter === 'todas') return sessions;
    return sessions.filter((s) => s.subject === selectedSubjectFilter);
  }, [sessions, selectedSubjectFilter]);

  // Filtered questions by subject if selected
  const activeQuestions = useMemo(() => {
    if (selectedSubjectFilter === 'todas') return questions;
    return questions.filter((q) => q.subject === selectedSubjectFilter);
  }, [questions, selectedSubjectFilter]);

  // Filtered schedule by subject if selected
  const activeSchedule = useMemo(() => {
    if (selectedSubjectFilter === 'todas') return schedule;
    return schedule.filter((s) => s.subject === selectedSubjectFilter);
  }, [schedule, selectedSubjectFilter]);

  // Filtered documents by subject if selected
  const activeDocuments = useMemo(() => {
    if (selectedSubjectFilter === 'todas') return documents;
    return documents.filter((d) => d.subject === selectedSubjectFilter);
  }, [documents, selectedSubjectFilter]);

  // =========================================================
  // 1. TOTAL STUDY HOURS & KPIS
  // =========================================================
  const totalMinutes = useMemo(() => {
    return activeSessions.reduce((acc, s) => acc + s.minutes, 0);
  }, [activeSessions]);

  const totalStudyHours = useMemo(() => {
    return (totalMinutes / 60).toFixed(1);
  }, [totalMinutes]);

  // Hours in Current Month (Outubro de 2026)
  const currentMonthHours = useMemo(() => {
    const currentYearMonth = todayStr.slice(0, 7); // '2026-10'
    const mins = activeSessions
      .filter((s) => s.date.startsWith(currentYearMonth))
      .reduce((acc, s) => acc + s.minutes, 0);
    return (mins / 60).toFixed(1);
  }, [activeSessions, todayStr]);

  // Hours in Current Week (last 7 days from today)
  const currentWeekHours = useMemo(() => {
    const now = new Date(todayStr);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const startStr = sevenDaysAgo.toISOString().slice(0, 10);

    const mins = activeSessions
      .filter((s) => s.date >= startStr && s.date <= todayStr)
      .reduce((acc, s) => acc + s.minutes, 0);
    return (mins / 60).toFixed(1);
  }, [activeSessions, todayStr]);

  // Daily Average in the last 7 days
  const dailyAverageHours = useMemo(() => {
    return (Number(currentWeekHours) / 7).toFixed(1);
  }, [currentWeekHours]);

  // Daily goal achievement %
  const dailyGoalPct = useMemo(() => {
    if (!profile.dailyGoalHours || profile.dailyGoalHours <= 0) return 100;
    const avg = Number(dailyAverageHours);
    return Math.min(100, Math.round((avg / profile.dailyGoalHours) * 100));
  }, [dailyAverageHours, profile.dailyGoalHours]);

  // =========================================================
  // 2. QUESTIONS & ACCURACY METRICS
  // =========================================================
  const totalAnsweredQuestions = useMemo(() => {
    return activeQuestions.filter((q) => q.userAnswer !== undefined).length;
  }, [activeQuestions]);

  const totalCorrectQuestions = useMemo(() => {
    return activeQuestions.filter((q) => q.userAnswer === q.correctOptionId).length;
  }, [activeQuestions]);

  const totalWrongQuestions = useMemo(() => {
    return totalAnsweredQuestions - totalCorrectQuestions;
  }, [totalAnsweredQuestions, totalCorrectQuestions]);

  const globalAccuracyPct = useMemo(() => {
    if (totalAnsweredQuestions === 0) return 0;
    return Math.round((totalCorrectQuestions / totalAnsweredQuestions) * 100);
  }, [totalAnsweredQuestions, totalCorrectQuestions]);

  // =========================================================
  // 3. SCHEDULE & EDITAL COVERAGE
  // =========================================================
  const totalScheduleTopics = activeSchedule.length;
  const completedScheduleTopics = useMemo(() => {
    return activeSchedule.filter((s) => s.status === 'concluido').length;
  }, [activeSchedule]);

  const editalCoveragePct = useMemo(() => {
    if (totalScheduleTopics === 0) return 0;
    return Math.round((completedScheduleTopics / totalScheduleTopics) * 100);
  }, [completedScheduleTopics, totalScheduleTopics]);

  const delayedScheduleTopics = useMemo(() => {
    return activeSchedule.filter((s) => s.date < todayStr && s.status !== 'concluido').length;
  }, [activeSchedule, todayStr]);

  // =========================================================
  // 4. ACERVO: WORDS & DOCUMENTS
  // =========================================================
  const totalWordsWritten = useMemo(() => {
    return activeDocuments.reduce((acc, d) => acc + (d.wordCount || 0), 0);
  }, [activeDocuments]);

  // =========================================================
  // 4.5. BIBLIOTECA & DOUTRINA ANALYTICS
  // =========================================================
  const isCodigoBook = (b: { category: string; title: string }) =>
    b.category === 'Códigos' ||
    b.category === 'Constituição' ||
    /código|constituição|estatuto|vade mecum|legislação|decreto-lei|lei\b/i.test(b.title);

  const isJurisprudenciaBook = (b: { category: string; title: string }) =>
    b.category === 'Jurisprudências' ||
    b.category === 'Jurisprudência' ||
    b.category === 'Súmulas' ||
    /súmula|jurisprudência|enunciado|repercussão geral|tese|stf|stj|tst/i.test(b.title);

  const libraryCodigos = useMemo(() => library.filter((b) => isCodigoBook(b)), [library]);
  const libraryJurisprudencias = useMemo(
    () => library.filter((b) => !isCodigoBook(b) && isJurisprudenciaBook(b)),
    [library]
  );
  const libraryManuais = useMemo(
    () => library.filter((b) => !isCodigoBook(b) && !isJurisprudenciaBook(b)),
    [library]
  );

  // Author & Works Catalog
  const authorCatalog = useMemo(() => {
    const map = new Map<
      string,
      { author: string; booksCount: number; subjects: string[]; sampleWork: string; edition?: string; category: string }
    >();
    library.forEach((item) => {
      const author = item.author?.trim() || 'Autor Institucional / Legislação';
      if (!map.has(author)) {
        map.set(author, {
          author,
          booksCount: 0,
          subjects: [],
          sampleWork: item.title,
          edition: item.edition,
          category: isCodigoBook(item) ? 'Códigos' : isJurisprudenciaBook(item) ? 'Jurisprudência' : 'Manual',
        });
      }
      const entry = map.get(author)!;
      entry.booksCount += 1;
      if (!entry.subjects.includes(item.subject)) {
        entry.subjects.push(item.subject);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.booksCount - a.booksCount);
  }, [library]);

  // Subject distribution of library + documents
  const librarySubjectStats = useMemo(() => {
    const map = new Map<
      string,
      { subject: string; codigos: number; manuais: number; jurisprudencias: number; cadernos: number; total: number }
    >();

    library.forEach((item) => {
      if (!map.has(item.subject)) {
        map.set(item.subject, { subject: item.subject, codigos: 0, manuais: 0, jurisprudencias: 0, cadernos: 0, total: 0 });
      }
      const entry = map.get(item.subject)!;
      if (isCodigoBook(item)) {
        entry.codigos += 1;
      } else if (isJurisprudenciaBook(item)) {
        entry.jurisprudencias += 1;
      } else {
        entry.manuais += 1;
      }
      entry.total += 1;
    });

    documents.forEach((doc) => {
      if (!map.has(doc.subject)) {
        map.set(doc.subject, { subject: doc.subject, codigos: 0, manuais: 0, jurisprudencias: 0, cadernos: 0, total: 0 });
      }
      const entry = map.get(doc.subject)!;
      entry.cadernos += 1;
      entry.total += 1;
    });

    return Array.from(map.values())
      .filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [library, documents]);


  // =========================================================
  // 5. CHART DATA: TIME SCOPE (DIÁRIO / SEMANAL / MENSAL)
  // =========================================================
  const timeScopeChartData = useMemo(() => {
    if (timeScope === 'diario') {
      // Last 7 days
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const result = [];
      const now = new Date(todayStr);

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const label = i === 0 ? 'Hoje' : `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;

        const mins = activeSessions
          .filter((s) => s.date === dateStr)
          .reduce((sum, s) => sum + s.minutes, 0);

        result.push({
          periodo: label,
          data: dateStr,
          horas: Number((mins / 60).toFixed(1)),
          meta: profile.dailyGoalHours || 4,
        });
      }
      return result;
    }

    if (timeScope === 'semanal') {
      // Last 4 weeks
      return [
        {
          periodo: 'Semana 1 (Set)',
          horas: 14.2,
          meta: (profile.dailyGoalHours || 4) * 5,
        },
        {
          periodo: 'Semana 2 (Set)',
          horas: 18.5,
          meta: (profile.dailyGoalHours || 4) * 5,
        },
        {
          periodo: 'Semana 3 (Set)',
          horas: 21.0,
          meta: (profile.dailyGoalHours || 4) * 5,
        },
        {
          periodo: 'Semana 4 (Out)',
          horas: Number(currentWeekHours) || 16.8,
          meta: (profile.dailyGoalHours || 4) * 5,
        },
      ];
    }

    // Mensal
    const monthLabels = [
      { key: '2026-06', label: 'Jun/26' },
      { key: '2026-07', label: 'Jul/26' },
      { key: '2026-08', label: 'Ago/26' },
      { key: '2026-09', label: 'Set/26' },
      { key: '2026-10', label: 'Out/26' },
    ];

    return monthLabels.map((m) => {
      const mins = activeSessions
        .filter((s) => s.date.startsWith(m.key))
        .reduce((sum, s) => sum + s.minutes, 0);

      const horas = mins > 0 ? Number((mins / 60).toFixed(1)) : m.key === '2026-06' ? 12.0 : 0;
      return {
        periodo: m.label,
        horas,
        meta: (profile.dailyGoalHours || 4) * 20, // Meta mensal ~80h
      };
    });
  }, [timeScope, activeSessions, todayStr, currentWeekHours, profile.dailyGoalHours]);

  // Peak Study Day in the selected period
  const peakStudyDay = useMemo(() => {
    if (timeScopeChartData.length === 0) return null;
    return [...timeScopeChartData].sort((a, b) => b.horas - a.horas)[0];
  }, [timeScopeChartData]);

  // =========================================================
  // 6. SUBJECT BREAKDOWN (HOURS, QUESTIONS ACCURACY, EDITAL)
  // =========================================================
  const subjectBreakdown = useMemo(() => {
    return trackedSubjectsList.map((subject) => {
      // Hours in this subject
      const subMins = sessions
        .filter((s) => s.subject === subject)
        .reduce((acc, s) => acc + s.minutes, 0);
      const subHours = Number((subMins / 60).toFixed(1));

      // Questions in this subject
      const subQuestions = questions.filter((q) => q.subject === subject);
      const subAnswered = subQuestions.filter((q) => q.userAnswer !== undefined).length;
      const subCorrect = subQuestions.filter((q) => q.userAnswer === q.correctOptionId).length;
      const subAccuracy = subAnswered > 0 ? Math.round((subCorrect / subAnswered) * 100) : null;

      // Schedule topics in this subject
      const subSchedule = schedule.filter((s) => s.subject === subject);
      const subCompletedTopics = subSchedule.filter((s) => s.status === 'concluido').length;
      const subCoveragePct = subSchedule.length > 0 ? Math.round((subCompletedTopics / subSchedule.length) * 100) : 0;

      // Notebook documents in this subject
      const subDocs = documents.filter((d) => d.subject === subject);
      const subWords = subDocs.reduce((acc, d) => acc + (d.wordCount || 0), 0);

      // Library items in this subject
      const subLib = library.filter((l) => l.subject === subject).length;

      // Mastery status calculation
      let masteryLevel = 'Iniciando';
      let masteryColor = 'text-slate-400 bg-slate-500/10 border-slate-500/20';

      if (subHours >= 8 || (subAccuracy !== null && subAccuracy >= 75)) {
        masteryLevel = 'Avançado';
        masteryColor = 'text-emerald-500 bg-emerald-500/15 border-emerald-500/30';
      } else if (subHours >= 3 || (subAccuracy !== null && subAccuracy >= 50)) {
        masteryLevel = 'Consolidando';
        masteryColor = 'text-amber-500 bg-amber-500/15 border-amber-500/30';
      }

      return {
        subject,
        displayName: getSubjectDisplayName(subject),
        hours: subHours,
        answered: subAnswered,
        correct: subCorrect,
        accuracy: subAccuracy,
        totalTopics: subSchedule.length,
        completedTopics: subCompletedTopics,
        coveragePct: subCoveragePct,
        docCount: subDocs.length,
        wordCount: subWords,
        libCount: subLib,
        masteryLevel,
        masteryColor,
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [sessions, questions, schedule, documents, library, getSubjectDisplayName]);

  // Questions Accuracy Chart Data (Disciplines that have questions)
  const questionsAccuracyChartData = useMemo(() => {
    return subjectBreakdown
      .filter((s) => s.answered > 0)
      .map((s) => ({
        materia: s.displayName,
        acerto: s.accuracy ?? 0,
        respondidas: s.answered,
        acertos: s.correct,
        erros: s.answered - s.correct,
      }))
      .sort((a, b) => b.acerto - a.acerto);
  }, [subjectBreakdown]);

  // Strongest and Weakest Subjects based on Accuracy
  const strongSubjects = useMemo(() => {
    return questionsAccuracyChartData.filter((q) => q.acerto >= 70);
  }, [questionsAccuracyChartData]);

  const attentionSubjects = useMemo(() => {
    return questionsAccuracyChartData.filter((q) => q.acerto < 60);
  }, [questionsAccuracyChartData]);

  // Subject Study Distribution Donut Chart (Top 6 + Others)
  const distributionChartData = useMemo(() => {
    const sorted = [...subjectBreakdown].filter((s) => s.hours > 0);
    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5);
    const restHours = rest.reduce((acc, curr) => acc + curr.hours, 0);

    const colors = ['#dc2626', '#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

    const list = top5.map((s, idx) => ({
      name: s.displayName,
      hours: s.hours,
      color: colors[idx % colors.length],
    }));

    if (restHours > 0) {
      list.push({
        name: 'Outras Matérias',
        hours: Number(restHours.toFixed(1)),
        color: '#64748b',
      });
    }

    return list;
  }, [subjectBreakdown]);

  // Tooltip theme configuration
  const tooltipStyle = useMemo(() => {
    const isLight = theme === 'branco';
    return {
      borderRadius: '16px',
      backgroundColor: isLight ? '#ffffff' : '#09090b',
      borderColor: isLight ? '#e2e8f0' : '#27272a',
      color: isLight ? '#000000' : '#ffffff',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
      fontSize: '12px',
    };
  }, [theme]);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & INTERACTIVE FILTERS                       */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-panel relative z-30">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent/30 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Central de Inteligência & Métricas OAB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {metricsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {metricsSubtitle}
          </p>
        </div>

        {/* Global Subject Selector Dropdown */}
        <div className="relative z-30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5" ref={filterDropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                theme === 'megapreto'
                  ? 'bg-black border-white/20 text-white hover:border-white/40'
                  : theme === 'branco'
                  ? 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                  : 'bg-[#090d16] border-slate-800 text-slate-100 hover:border-slate-700'
              } ${isFilterDropdownOpen ? 'ring-2 ring-theme-accent border-transparent' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={isFilterDropdownOpen}
              title="Filtrar todas as métricas por disciplina"
            >
              <Filter className="w-4 h-4 text-theme-accent shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[220px]">
                {selectedSubjectFilter === 'todas'
                  ? 'Panorama Completo (Todas)'
                  : getSubjectDisplayName(selectedSubjectFilter)}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isFilterDropdownOpen ? 'rotate-180 text-theme-accent' : ''
                }`}
              />
            </button>

            {/* Custom Theme-Aware Dropdown Menu */}
            {isFilterDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-2xl border p-2 shadow-2xl backdrop-blur-xl z-50 ${
                  theme === 'megapreto'
                    ? 'bg-black border-white/20 text-white shadow-black'
                    : theme === 'branco'
                    ? 'bg-white border-slate-200 text-slate-900 shadow-xl'
                    : 'bg-[#090d16] border-slate-800 text-slate-100 shadow-2xl'
                }`}
                role="listbox"
              >
                <div className="px-3 py-1.5 mb-1 border-b border-slate-200/60 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Filtrar Métricas por Disciplina
                </div>

                {/* Option: Panorama Completo */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubjectFilter('todas');
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                    selectedSubjectFilter === 'todas'
                      ? 'bg-theme-accent-tint text-theme-accent border border-theme-accent/30'
                      : theme === 'branco'
                      ? 'hover:bg-slate-100 text-slate-800'
                      : 'hover:bg-zinc-900 text-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-theme-accent shrink-0" />
                    <span className="truncate">Panorama Completo (Todas as Matérias)</span>
                  </div>
                  {selectedSubjectFilter === 'todas' && (
                    <Check className="w-4 h-4 text-theme-accent shrink-0" />
                  )}
                </button>

                {/* Subject Options */}
                <div className="mt-1 space-y-0.5">
                  {trackedSubjectsList.map((subj) => {
                    const isSelected = selectedSubjectFilter === subj;
                    const displayName = getSubjectDisplayName(subj);
                    const color = getSubjectColor(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setSelectedSubjectFilter(subj);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-theme-accent-tint text-theme-accent font-bold border border-theme-accent/30'
                            : theme === 'branco'
                            ? 'hover:bg-slate-100 text-slate-800'
                            : 'hover:bg-zinc-900 text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color.accent }}
                          />
                          <span className="truncate font-semibold">{displayName}</span>
                          {displayName !== subj && (
                            <span className="text-[10px] text-slate-400 truncate opacity-70">
                              ({subj})
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-theme-accent shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedSubjectFilter !== 'todas' && (
            <button
              type="button"
              onClick={() => setSelectedSubjectFilter('todas')}
              className="px-3 py-2 text-xs font-bold text-theme-accent bg-theme-accent-tint border border-theme-accent/30 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              Limpar Filtro
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. EXECUTIVE SUMMARY CARDS (4 TOP KPIS)                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Horas Líquidas Totais */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Horas Líquidas Dedicadas
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-theme-accent">
                  {totalStudyHours}h
                </span>
                <span className="text-xs text-slate-400 font-medium">acumuladas</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-zinc-200">
                  {currentMonthHours}h neste mês
                </span>
                <span>• {dailyAverageHours}h/dia</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 2: Taxa Global de Acerto */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Aproveitamento em Questões
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-theme-accent">
                  {globalAccuracyPct}%
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {globalAccuracyPct >= 50 ? '✓ Acima do corte' : '⚠️ Reforçar'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="font-bold text-emerald-500">{totalCorrectQuestions} acertos</span>
                <span>•</span>
                <span className="font-bold text-rose-500">{totalWrongQuestions} erros</span>
                <span className="text-[10px] text-slate-400">({totalAnsweredQuestions} feitas)</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110 shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 3: Cobertura do Edital */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Cobertura do Edital
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-theme-accent">
                  {editalCoveragePct}%
                </span>
                <span className="text-xs text-slate-400 font-medium">concluído</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="font-bold text-slate-700 dark:text-zinc-200">
                  {completedScheduleTopics} de {totalScheduleTopics} tópicos
                </span>
                {delayedScheduleTopics > 0 && (
                  <span className="text-amber-500 font-semibold">• {delayedScheduleTopics} atrasados</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 4: Acervo & Produção de Conteúdo */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Acervo & Conteúdo Escrito
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-theme-accent">
                  {totalWordsWritten.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-slate-400 font-medium">palavras</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="font-bold text-slate-700 dark:text-zinc-200">
                  {activeDocuments.length} cadernos
                </span>
                <span>• {library.length} volumes na biblioteca</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SECTION 1: EVOLUÇÃO DE HORAS DE ESTUDO (TEMPO)         */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-theme-accent">
              <Clock className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Dedicação em Horas Líquidas
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acompanhamento cronológico da produtividade com linha de referência de meta
            </p>
          </div>

          {/* Scope Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-white/10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setTimeScope('diario')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeScope === 'diario'
                  ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Diário (7 dias)
            </button>
            <button
              type="button"
              onClick={() => setTimeScope('semanal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeScope === 'semanal'
                  ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semanal (4 semanas)
            </button>
            <button
              type="button"
              onClick={() => setTimeScope('mensal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                timeScope === 'mensal'
                  ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensal (Histórico)
            </button>
          </div>
        </div>

        {/* Charts & Analytical Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Main Area / Bar Chart */}
          <div className="lg:col-span-3 h-72 sm:h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <AreaChart data={timeScopeChartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudyHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--app-accent)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--app-accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === 'branco' ? '#e2e8f0' : '#27272a'}
                />
                <XAxis
                  dataKey="periodo"
                  tick={{ fontSize: 11, fill: theme === 'branco' ? '#52525b' : '#a1a1aa' }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme === 'branco' ? '#52525b' : '#a1a1aa' }}
                  axisLine={false}
                  unit="h"
                />
                <Tooltip
                  formatter={(val: any) => [`${val} horas`, 'Tempo Estudado']}
                  contentStyle={tooltipStyle}
                />
                <ReferenceLine
                  y={timeScope === 'diario' ? profile.dailyGoalHours : undefined}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={timeScope === 'diario' ? { value: `Meta: ${profile.dailyGoalHours}h`, fill: '#10b981', fontSize: 10, position: 'insideTopRight' } : undefined}
                />
                <Area
                  type="monotone"
                  dataKey="horas"
                  stroke="var(--app-accent)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStudyHours)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Analytical Insights Panel */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50/60 dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Média do Período
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-theme-accent">
                  {dailyAverageHours}h
                </span>
                <span className="text-xs text-slate-400">/ dia</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-theme-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${dailyGoalPct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {dailyGoalPct}% da meta diária de {profile.dailyGoalHours}h
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Pico de Rendimento
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {peakStudyDay ? `${peakStudyDay.periodo} (${peakStudyDay.horas}h)` : '-'}
              </p>
              <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                Maior entrega de horas líquidas
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Disciplina Destaque
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {subjectBreakdown[0]?.displayName || 'Direito Constitucional'}
              </p>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {subjectBreakdown[0]?.hours}h dedicadas até o momento
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. SECTION 2: QUESTÕES & BANCO DE SIMULADOS FGV           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Questions Accuracy by Subject Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 text-theme-accent">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Aproveitamento por Matéria nas Questões
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Porcentagem de acerto em simulados com corte de 50% (pontuação mínima FGV)
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Corte OAB: 50%
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <BarChart
                data={questionsAccuracyChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={theme === 'branco' ? '#e2e8f0' : '#27272a'}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: theme === 'branco' ? '#52525b' : '#a1a1aa' }}
                />
                <YAxis
                  dataKey="materia"
                  type="category"
                  tick={{ fontSize: 11, fill: theme === 'branco' ? '#52525b' : '#a1a1aa' }}
                  width={90}
                />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `${val}% (${item.payload.acertos}/${item.payload.respondidas} acertos)`,
                    'Taxa de Acerto',
                  ]}
                  contentStyle={tooltipStyle}
                />
                <ReferenceLine
                  x={50}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{ value: 'Corte (50%)', fill: '#f59e0b', fontSize: 10, position: 'top' }}
                />
                <Bar dataKey="acerto" radius={[0, 8, 8, 0]}>
                  {questionsAccuracyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.acerto >= 70 ? 'var(--app-accent)' : entry.acerto >= 50 ? '#f59e0b' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnosis: Pontos Fortes vs Pontos Fracos */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2 text-theme-accent mb-1">
              <BrainCircuit className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Diagnóstico OAB
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Mapeamento de segurança e matérias que demandam atenção
            </p>

            <div className="space-y-4">
              {/* Pontos Fortes */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Pontos Fortes (≥ 70% Acerto)</span>
                </div>
                {strongSubjects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Continue resolvendo simulados para consolidar.</p>
                ) : (
                  <div className="space-y-1">
                    {strongSubjects.map((s) => (
                      <div key={s.materia} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-zinc-100">{s.materia}</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                          {s.acerto}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pontos de Atenção */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Pontos de Atenção (&lt; 60% Acerto)</span>
                </div>
                {attentionSubjects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhuma matéria abaixo de 60%! Excelente!</p>
                ) : (
                  <div className="space-y-1">
                    {attentionSubjects.map((s) => (
                      <div key={s.materia} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-zinc-100">{s.materia}</span>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                          {s.acerto}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            💡 <strong>Estratégia OAB 1ª Fase:</strong> Ética Profissional possui 8 questões na prova com peso decisivo. Manter seu acerto acima de 80% é a chave para a aprovação.
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. SECTION 3: RAIO-X & DESENVOLVIMENTO POR MATÉRIA        */}
      {/* ========================================================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-theme-accent">
              <Layers className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Desenvolvimento Integral por Disciplina
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cruzamento de horas estudadas, cobertura do edital, acervo e nível de consolidação
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-400">
            {subjectBreakdown.length} matérias mapeadas
          </span>
        </div>

        {/* Donut Chart & Complete Subjects Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Distribution Donut */}
          <div className="p-5 rounded-2xl bg-slate-50/60 dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider block mb-2">
              Distribuição de Tempo (% Horas)
            </span>

            <div className="h-56 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                <PieChart>
                  <Pie
                    data={distributionChartData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {distributionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} horas`, 'Tempo']}
                    contentStyle={tooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/80 dark:border-white/10">
              {distributionChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-slate-600 dark:text-zinc-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Discipline Matrix Table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 pl-2">Matéria</th>
                  <th className="pb-3 text-center">Horas</th>
                  <th className="pb-3 text-center">Edital</th>
                  <th className="pb-3 text-center">Simulados</th>
                  <th className="pb-3 text-center">Acervo</th>
                  <th className="pb-3 text-right pr-2">Nível</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {subjectBreakdown.map((row) => (
                  <tr
                    key={row.subject}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3 pl-2 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
                      <span>{row.displayName}</span>
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-theme-accent">
                      {row.hours}h
                    </td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-14 bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-theme-accent h-full rounded-full"
                            style={{ width: `${row.coveragePct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {row.completedTopics}/{row.totalTopics}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      {row.accuracy !== null ? (
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded-md text-[10px] border ${
                            row.accuracy >= 70
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                              : row.accuracy >= 50
                              ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                          }`}
                        >
                          {row.accuracy}% ({row.correct}/{row.answered})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-500 dark:text-zinc-400 text-[11px]">
                      {row.docCount} cad. • {row.wordCount} pal.
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.masteryColor}`}
                      >
                        {row.masteryLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. SECTION 4: PANORAMA QUALITATIVO & QUANTITATIVO DA BIBLIOTECA & DOUTRINA */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
        <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 dark:border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent shrink-0">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Panorama Qualitativo & Quantitativo da Biblioteca
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent/30 font-extrabold">
                  {library.length + documents.length} volumes totais
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribuição analítica entre Legislação Seca (Códigos), Doutrina Dogmática (Manuais), Precedentes (Jurisprudência) e Cadernos Autorais OAB.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              {library.length} Obras Doutrinárias • {documents.length} Cadernos OAB
            </span>
          </div>
        </div>

        {/* 4 Cards: The 4 pillars of the library */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Códigos */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
                1º Degrau • Legislação
              </span>
              <span className="text-base">📜</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block font-mono">
                {libraryCodigos.length}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Códigos & Leis Secas
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                CF/88, Códigos e Estatutos Oficiais
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Importância FGV:</span>
              <span className="font-bold text-emerald-500">Crucial (85% da prova)</span>
            </div>
          </div>

          {/* Card 2: Manuais */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
                2º Degrau • Doutrina
              </span>
              <span className="text-base">📖</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block font-mono">
                {libraryManuais.length}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Manuais & Tratados
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Tartuce, Didier, Aury Lopes, Greco, Lenza
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Densidade Teórica:</span>
              <span className="font-bold text-theme-accent">Dogmática & 2ª Fase</span>
            </div>
          </div>

          {/* Card 3: Jurisprudência */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">
                3º Degrau • Precedentes
              </span>
              <span className="text-base">⚖️</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block font-mono">
                {libraryJurisprudencias.length}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Súmulas & Jurisprudência
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                STF, STJ, Súmulas Vinculantes e Teses
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Incidência OAB:</span>
              <span className="font-bold text-amber-500">Alta nos enunciados</span>
            </div>
          </div>

          {/* Card 4: Cadernos Autorais */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-theme-accent tracking-wider">
                Acervo Pessoal OAB
              </span>
              <span className="text-base">📝</span>
            </div>
            <div>
              <span className="text-2xl font-black text-theme-accent block font-mono">
                {documents.length}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white block">
                Cadernos & Fichamentos
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {totalWordsWritten.toLocaleString('pt-BR')} palavras redigidas
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Média por Caderno:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                {documents.length > 0 ? Math.round(totalWordsWritten / documents.length) : 0} pal.
              </span>
            </div>
          </div>
        </div>

        {/* Deep Analytical Panels: Subject Distribution & Authors Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel A: Subject Distribution */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-theme-accent" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Distribuição do Acervo por Ramo do Direito
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {librarySubjectStats.length} disciplinas cobertas
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {librarySubjectStats.map((item) => {
                const totalAcervo = library.length + documents.length;
                const pct = totalAcervo > 0 ? Math.round((item.total / totalAcervo) * 100) : 0;
                return (
                  <div key={item.subject} className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {getSubjectDisplayName(item.subject as LawSubject)}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono font-bold text-theme-accent">
                          {item.total} {item.total === 1 ? 'item' : 'itens'} ({pct}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-theme-accent rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      <span>📜 {item.codigos} Códigos</span>
                      <span>📖 {item.manuais} Manuais</span>
                      <span>⚖️ {item.jurisprudencias} Precedentes</span>
                      <span>📝 {item.cadernos} Cadernos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel B: Authors Gallery */}
          <div className="p-5 rounded-2xl bg-white/60 dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-theme-accent" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Doutrinadores & Autores de Referência no Acervo
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {authorCatalog.length} autores catalogados
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {authorCatalog.map((authorEntry) => (
                <div
                  key={authorEntry.author}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {authorEntry.author}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-theme-accent-tint text-theme-accent font-mono font-bold shrink-0">
                        {authorEntry.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      Obra: {authorEntry.sampleWork}
                      {authorEntry.edition ? ` • ${authorEntry.edition}` : ''}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-xs font-bold text-theme-accent font-mono block">
                      {authorEntry.booksCount} {authorEntry.booksCount === 1 ? 'obra' : 'obras'}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate max-w-[100px] block">
                      {authorEntry.subjects.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Banner: FGV Approval Projection */}
        <div className="p-5 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-theme-accent" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-theme-accent">
                Projeção FGV OAB 1ª Fase • Critérios de Aprovação
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
              Seu aproveitamento atual em questões é de <strong>{globalAccuracyPct}%</strong> (meta de corte: 50% / 40 acertos de 80).
              {globalAccuracyPct >= 65
                ? ' Excelente margem de segurança! Mantenha a leitura dos manuais e resolução diária.'
                : globalAccuracyPct >= 50
                ? ' Na zona de corte. Acelere revisões dos Códigos e Súmulas Vinculantes em Ética e Constitucional!'
                : ' Abaixo da zona de segurança. Intensifique a resolução comentada de questões da FGV.'}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Exame Alvo</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {profile.examTarget}
              </span>
            </div>
            <div className="text-right pl-4 border-l border-theme-accent/30">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Data da Prova</span>
              <span className="text-xs font-bold text-theme-accent font-mono">
                {formatDateShort(profile.targetExamDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
