import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScheduleItem, LawSubject, PriorityLevel, ScheduleStatus } from '../../types';
import {
  getSubjectColor,
  getScheduleStatusBadge,
  getPriorityBadge,
  formatDateShort,
} from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ImportScheduleModal } from './ImportScheduleModal';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Filter,
  Search,
  RotateCcw,
  Sparkles,
  BookmarkCheck,
  Printer,
  Scale,
} from 'lucide-react';

const LAW_SUBJECTS: LawSubject[] = [
  'Ética Profissional (OAB)',
  'Direito Constitucional',
  'Direito Civil',
  'Processo Civil',
  'Direito Penal',
  'Processo Penal',
  'Direito Administrativo',
  'Direito Tributário',
  'Direito do Trabalho',
  'Processo do Trabalho',
  'Direitos Humanos',
  'Direito Empresarial',
  'Geral / Outros',
];

export const ScheduleView: React.FC = () => {
  const {
    schedule,
    profile,
    addScheduleItem,
    deleteScheduleItem,
    cycleScheduleStatus,
    toggleRevision,
    subjects,
    theme,
    getSubjectDisplayName,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ScheduleItem | null>(null);

  // New item form
  const [formData, setFormData] = useState({
    subject: 'Ética Profissional (OAB)' as LawSubject,
    topic: '',
    date: new Date().toISOString().slice(0, 10),
    durationMinutes: 90,
    priority: 'alta' as PriorityLevel,
    notes: '',
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    addScheduleItem({
      ...formData,
      status: 'pendente',
      revisionD1: false,
      revisionD7: false,
      revisionD30: false,
    });

    setFormData({
      subject: 'Ética Profissional (OAB)',
      topic: '',
      date: new Date().toISOString().slice(0, 10),
      durationMinutes: 90,
      priority: 'alta',
      notes: '',
    });
    setIsAddModalOpen(false);
  };

  const completedCount = schedule.filter((s) => s.status === 'concluido').length;
  const progressPct = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  const filteredSchedule = schedule.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'todas' || item.subject === subjectFilter;
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Cronograma Oficial de Estudos • {profile.examTarget}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Aluno: <strong>{profile.name}</strong> • Data da Prova: <strong>{formatDateShort(profile.targetExamDate)}</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-indigo-700">
              {completedCount} de {schedule.length} concluídos ({progressPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Top Progress & Metrics Summary (All obey unified theme-accent) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Progress Card */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Progresso do Cronograma
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-theme-accent">{progressPct}%</span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                ({completedCount}/{schedule.length} concluídos)
              </span>
            </div>
            <div className="w-full bg-slate-200/60 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-theme-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pending Items */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Metas Pendentes
              </span>
              <span className="text-2xl font-extrabold text-theme-accent mt-1 block">
                {schedule.filter((s) => s.status === 'pendente' || s.status === 'em_andamento').length}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">Tópicos para estudar</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Spaced Revisions Active */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Revisões Espaçadas
              </span>
              <span className="text-2xl font-extrabold text-theme-accent mt-1 block">
                {schedule.filter((s) => s.revisionD1 || s.revisionD7).length}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">Ciclos ativos (D1/D7/D30)</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110">
              <RotateCcw className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Priority Focus */}
        <div className="relative overflow-hidden group p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-black transition-all duration-300 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--app-accent)]/15">
          <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[var(--app-accent)]/25 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Alta Prioridade ({profile.examTarget})
              </span>
              <span className="text-2xl font-extrabold text-theme-accent mt-1 block">
                {schedule.filter((s) => s.priority === 'alta' && s.status !== 'concluido').length}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">Matérias estratégicas</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 flex items-center justify-center text-theme-accent transition-transform duration-300 group-hover:scale-110">
              <BookmarkCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search, Filter, Print, AI Import, Add Meta (Hidden on print) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar meta ou tópico do edital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option
              value="todas"
              style={{
                backgroundColor: theme === 'megapreto' ? '#000000' : theme === 'branco' ? '#ffffff' : '#090d16',
                color: theme === 'branco' ? '#000000' : '#ffffff',
              }}
            >
              Todas as disciplinas
            </option>
            {(subjects || LAW_SUBJECTS).map((s) => (
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-800/70 text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="revisao">Para Revisar</option>
          </select>
        </div>

        {/* Action Buttons: AI Import, Export PDF/Print, Add Meta */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF / Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            title="Exportar em PDF ou Imprimir Cronograma"
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Exportar PDF</span>
          </button>

          {/* AI / Text Importer Button */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/25 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Importar com IA</span>
          </button>

          {/* Add Manual Item */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-theme-accent hover:opacity-95 text-white rounded-xl text-sm font-semibold transition-colors shadow-theme-accent cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Schedule Items Table */}
      <div className="glass-panel rounded-3xl overflow-hidden print:border-none print:shadow-none">
        {filteredSchedule.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            Nenhuma meta cadastrada no cronograma com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold print:bg-slate-100">
                <tr>
                  <th className="py-3.5 px-6 print:py-2 print:px-3">Data</th>
                  <th className="py-3.5 px-6 print:py-2 print:px-3">Disciplina</th>
                  <th className="py-3.5 px-6 print:py-2 print:px-3">Tópico do Edital</th>
                  <th className="py-3.5 px-6 text-center print:py-2 print:px-3">Revisões (24h / 7d / 30d)</th>
                  <th className="py-3.5 px-6 print:py-2 print:px-3">Prioridade</th>
                  <th className="py-3.5 px-6 print:py-2 print:px-3">Status</th>
                  <th className="py-3.5 px-6 text-right print:hidden">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 print:divide-slate-200">
                {filteredSchedule.map((item) => {
                  const subColor = getSubjectColor(item.subject);
                  const statusBadge = getScheduleStatusBadge(item.status);
                  const priorityBadge = getPriorityBadge(item.priority);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      {/* Date & Duration */}
                      <td className="py-4 px-6 print:py-2.5 print:px-3">
                        <div className="text-slate-900 dark:text-white font-medium">
                          {formatDateShort(item.date)}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5 print:hidden">
                          <Clock className="w-3 h-3" />
                          <span>{item.durationMinutes} min</span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-6 print:py-2.5 print:px-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                        >
                          {getSubjectDisplayName(item.subject)}
                        </span>
                      </td>

                      {/* Topic & Notes */}
                      <td className="py-4 px-6 max-w-sm print:py-2.5 print:px-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.topic}</p>
                        {item.notes && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate print:text-slate-500">
                            {item.notes}
                          </p>
                        )}
                      </td>

                      {/* Spaced Revisions */}
                      <td className="py-4 px-6 text-center print:py-2.5 print:px-3">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 p-1 rounded-lg print:border-none print:bg-transparent">
                          <button
                            type="button"
                            onClick={() => toggleRevision(item.id, 'D1')}
                            title="Revisão 24 horas"
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                              item.revisionD1
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                          >
                            [D+1]
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleRevision(item.id, 'D7')}
                            title="Revisão 7 dias"
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                              item.revisionD7
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                          >
                            [D+7]
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleRevision(item.id, 'D30')}
                            title="Revisão 30 dias"
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${
                              item.revisionD30
                                ? 'bg-purple-600 text-white'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                          >
                            [D+30]
                          </button>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-6 print:py-2.5 print:px-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${priorityBadge.color}`}
                        >
                          {priorityBadge.label}
                        </span>
                      </td>

                      {/* Status (Clickable to advance) */}
                      <td className="py-4 px-6 print:py-2.5 print:px-3">
                        <button
                          type="button"
                          onClick={() => cycleScheduleStatus(item.id)}
                          title="Clique para alternar o status da meta"
                          className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer hover:shadow-xs transition-all ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right print:hidden">
                        <button
                          onClick={() => {
                            setItemToDelete(item);
                            setIsConfirmOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Schedule Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nova Meta de Estudo">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Disciplina Jurídica *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value as LawSubject })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {(subjects || LAW_SUBJECTS).map((s) => (
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Tópico / Conteúdo do Edital *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Controle Concentrado de Constitucionalidade (ADI e ADC)"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Data do Estudo
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Tempo Previsto (min)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Prioridade na Prova
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="alta" className="dark:bg-slate-850">Alta (Mais cobrado na FGV / Provas)</option>
              <option value="media" className="dark:bg-slate-850">Média</option>
              <option value="baixa" className="dark:bg-slate-850">Baixa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Anotações / Artigos da Lei a Ler
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Ler Art. 102 e 103 da CF/88; resolver 10 questões comentadas."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Adicionar Meta
            </button>
          </div>
        </form>
      </Modal>

      {/* Import with AI Modal */}
      <ImportScheduleModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteScheduleItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        title="Remover Meta do Cronograma"
        message={`Deseja excluir a meta "${itemToDelete?.topic}"?`}
      />
    </div>
  );
};
