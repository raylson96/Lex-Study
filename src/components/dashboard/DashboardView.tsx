import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getDaysUntil, getSubjectColor, getScheduleStatusBadge, formatDateShort } from '../../utils/formatters';
import {
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ArrowRight,
  Flame,
  Scale,
  FileText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardViewProps {
  onOpenEditor: () => void;
  onOpenSchedule: () => void;
  onOpenLibrary: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenEditor,
  onOpenSchedule,
}) => {
  const {
    profile,
    documents,
    schedule,
    library,
    sessions,
    pomodoroSeconds,
    isTimerRunning,
    timerSubject,
    setTimerSubject,
    startTimer,
    pauseTimer,
    resetTimer,
    cycleScheduleStatus,
    createDocument,
    setCurrentDocId,
    theme,
    subjects,
    getSubjectDisplayName,
  } = useApp();

  const handleOpenTaskEditor = (task: (typeof schedule)[0]) => {
    const existingDoc = documents.find(
      (d) => d.title.toLowerCase().trim() === task.topic.toLowerCase().trim()
    );
    if (existingDoc) {
      setCurrentDocId(existingDoc.id);
    } else {
      createDocument(task.topic, task.subject);
    }
    onOpenEditor();
  };

  const daysLeft = getDaysUntil(profile.targetExamDate);
  const completedSchedule = schedule.filter((s) => s.status === 'concluido').length;
  const progressPct = schedule.length > 0 ? Math.round((completedSchedule / schedule.length) * 100) : 0;

  // Real total hours dynamically calculated from study sessions
  const totalStudyHoursFormatted = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
    return (totalMinutes / 60).toFixed(1);
  }, [sessions]);

  // Real total words written across all documents
  const totalWordsWritten = useMemo(() => {
    return documents.reduce((sum, d) => sum + (d.wordCount || 0), 0);
  }, [documents]);

  // Today reference date: real current system date
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Split schedule for live accounting of active study goals in the notebook agenda
  const delayedScheduleItems = useMemo(() => {
    return schedule.filter((s) => s.date < todayStr && s.status !== 'concluido');
  }, [schedule, todayStr]);

  const todayScheduleItems = useMemo(() => {
    return schedule.filter((s) => s.date === todayStr);
  }, [schedule, todayStr]);

  const upcomingScheduleItems = useMemo(() => {
    return schedule.filter((s) => s.date > todayStr);
  }, [schedule, todayStr]);

  // Real study documents: includes all written notes with content
  const validDocuments = useMemo(() => {
    return documents.filter((d) => {
      if ((d.wordCount || 0) > 0) return true;
      const text = d.content ? d.content.replace(/<[^>]*>/g, '').trim() : '';
      const clean = text
        .replace(d.title, '')
        .replace(/anotações e doutrina sobre este assunto\.{3}/gi, '')
        .replace(/comece a escrever seus resumos, artigos de lei e anotações jurídicas aqui\.{3}/gi, '')
        .replace(/comece a escrever seus resumos/gi, '')
        .replace(/novo tópico de estudo/gi, '')
        .trim();
      return clean.length > 0;
    });
  }, [documents]);

  // Real study hours aggregated by day for the last 7 days from sessions
  const studyHoursData = useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = i === 0 ? 'Hoje' : dayNames[d.getDay()];

      const dayMinutes = sessions
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + s.minutes, 0);

      result.push({
        day: dayLabel,
        date: dateStr,
        horas: Number((dayMinutes / 60).toFixed(1)),
      });
    }
    return result;
  }, [sessions]);

  // Real average hours per day dynamically calculated
  const avgHoursPerDay = useMemo(() => {
    const totalWeekly = studyHoursData.reduce((acc, curr) => acc + curr.horas, 0);
    return (totalWeekly / 7).toFixed(1);
  }, [studyHoursData]);

  // Format timer minutes and seconds
  const minutes = Math.floor(pomodoroSeconds / 60);
  const seconds = pomodoroSeconds % 60;
  const timerFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const upcomingTasks = schedule.filter((s) => s.status !== 'concluido').slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Countdown Banner (Theme Adaptive: White on light, Black on dark) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl bg-white dark:bg-black border border-slate-200/90 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-300">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5 text-theme-accent" />
            <span>{profile.examTarget} • Prova em {formatDateShort(profile.targetExamDate)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {daysLeft > 0 ? `Faltam ${daysLeft} dias para a sua aprovação!` : 'Reta Final do Exame!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Mantenha o foco no cronograma e repetições espaçadas. Cada hora líquida dedicada aproxima você da carteira da OAB!
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3.5 bg-slate-50 dark:bg-zinc-950/90 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-slate-200/90 dark:border-white/10 shrink-0 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-theme-accent-tint border border-theme-accent/20 flex items-center justify-center text-theme-accent">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 uppercase font-semibold tracking-wider block">Meta Diária</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{profile.dailyGoalHours} horas/dia</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - All strictly unified with theme-accent and ray-sweep hover effect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hours */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Horas Estudadas
              </span>
              <span className="text-2xl font-extrabold text-theme-accent mt-1 block">
                {totalStudyHoursFormatted}h
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">{sessions.length} sessões registradas</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Study Notebooks & Agenda */}
        <div
          onClick={onOpenEditor}
          title="Abrir Caderno de Estudo e Agenda Ativa"
          className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15 cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Cadernos & Resumos
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-theme-accent">
                  {validDocuments.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  fichamentos
                </span>
              </div>

              {/* Contabilização clara da agenda de estudos do caderno */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {delayedScheduleItems.length} em atraso
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-theme-accent-tint text-theme-accent border border-theme-accent/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
                  {todayScheduleItems.length} hoje
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  {upcomingScheduleItems.length} futuros
                </span>
              </div>

              <span className="text-[11px] text-slate-400 dark:text-zinc-500 block mt-2 font-medium">
                {totalWordsWritten.toLocaleString('pt-BR')} palavras escritas
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Schedule Progress */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Edital Concluído
              </span>
              <span className="text-2xl font-extrabold text-theme-accent mt-1 block">
                {progressPct}%
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">{completedSchedule} de {schedule.length} tópicos</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Vade Mecum / Library */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Biblioteca Jurídica
              </span>
              <span className="text-2xl font-extrabold text-theme-accent mt-1 block">
                {library.length}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">{library.filter((l) => l.pinned).length} itens favoritados</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Row: Interactive Pomodoro Timer + Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pomodoro Timer Glass Card */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-theme-accent" />
                Cronômetro Pomodoro
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent/30">
                25 min
              </span>
            </div>

            <div className="my-5 text-center">
              <span className="text-5xl font-mono font-black text-slate-900 dark:text-white tracking-tight drop-shadow-xs">
                {timerFormatted}
              </span>
              <div className="mt-4">
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">Disciplina:</label>
                <select
                  value={timerSubject}
                  onChange={(e) => setTimerSubject(e.target.value as any)}
                  className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option
                      key={s}
                      value={s}
                      style={{
                        backgroundColor: theme === 'megapreto' ? '#000000' : theme === 'branco' ? '#ffffff' : '#090d16',
                        color: theme === 'branco' ? '#000000' : '#ffffff',
                      }}
                    >
                      {getSubjectDisplayName(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-200/60 dark:border-white/10">
            {isTimerRunning ? (
              <button
                type="button"
                onClick={pauseTimer}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Pause className="w-4 h-4" />
                Pausar Sessão
              </button>
            ) : (
              <button
                type="button"
                onClick={startTimer}
                className="flex-1 py-2.5 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-theme-accent"
              >
                <Play className="w-4 h-4" />
                Iniciar Sessão
              </button>
            )}

            <button
              type="button"
              onClick={resetTimer}
              title="Reiniciar cronômetro"
              className="p-2.5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly Study Hours Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Horas Líquidas de Estudo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dedicação diária aos estudos jurídicos na semana</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Média: {avgHoursPerDay}h / dia
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--app-accent)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="var(--app-accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'branco' ? '#e2e8f0' : '#27272a'} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: theme === 'branco' ? '#52525b' : '#a1a1aa' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: theme === 'branco' ? '#52525b' : '#a1a1aa' }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} horas`, 'Estudo']}
                  contentStyle={{
                    borderRadius: '16px',
                    backgroundColor: theme === 'branco' ? '#ffffff' : '#09090b',
                    borderColor: theme === 'branco' ? '#e2e8f0' : '#27272a',
                    color: theme === 'branco' ? '#000000' : '#ffffff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="horas"
                  stroke="var(--app-accent)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorStudy)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Upcoming Tasks & Quick Notebook Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Study Tasks */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Próximos Tópicos do Cronograma</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Metas programadas para a sua rotina</p>
            </div>
            <button
              onClick={onOpenSchedule}
              className="text-xs font-semibold text-theme-accent hover:opacity-80 flex items-center gap-1 cursor-pointer"
            >
              Ver tudo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                Nenhum tópico pendente no cronograma.
              </div>
            ) : (
              upcomingTasks.map((task) => {
                const subColor = getSubjectColor(task.subject);
                const statusBadge = getScheduleStatusBadge(task.status);

                return (
                  <div
                    key={task.id}
                    onClick={() => handleOpenTaskEditor(task)}
                    title={`Abrir caderno de estudo sobre ${task.topic}`}
                    className="group/task p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-theme-accent/50 hover:bg-theme-accent-tint/10 dark:hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleScheduleStatus(task.id);
                        }}
                        title="Marcar como concluído"
                        className="mt-0.5 text-slate-300 dark:text-zinc-600 hover:text-theme-accent transition-colors cursor-pointer shrink-0"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover/task:text-theme-accent transition-colors truncate">
                          {task.topic}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                          >
                            {getSubjectDisplayName(task.subject)}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            {task.durationMinutes} min • Data: {formatDateShort(task.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusBadge.color}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span className="text-xs font-bold text-theme-accent opacity-0 group-hover/task:opacity-100 transition-opacity flex items-center gap-1 pl-1">
                        Estudar <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Notebook Actions */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-theme-accent">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Cadernos de Estudo</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-theme-accent-tint text-theme-accent border border-theme-accent/30 font-mono">
                {validDocuments.length} cadernos
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Fichamentos doutrinários e anotações ativas vinculadas ao cronograma da OAB.
            </p>

            <div className="space-y-2">
              {validDocuments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 italic border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                  Nenhum caderno com conteúdo salvo ainda.
                </div>
              ) : (
                validDocuments.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setCurrentDocId(doc.id);
                      onOpenEditor();
                    }}
                    className="group/doc p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:border-theme-accent/40 hover:bg-theme-accent-tint/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover/doc:text-theme-accent transition-colors truncate">
                        {doc.title}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                        {doc.wordCount || 0} pal.
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{getSubjectDisplayName(doc.subject)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-white/10">
            <button
              onClick={() => {
                createDocument('Novo Fichamento Jurídico', 'Direito Constitucional');
                onOpenEditor();
              }}
              className="w-full py-2.5 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-theme-accent"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Caderno</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
