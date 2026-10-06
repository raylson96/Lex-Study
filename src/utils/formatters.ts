import { LawSubject, ScheduleStatus, PriorityLevel } from '../types';

export function formatDateShort(dateString: string): string {
  if (!dateString) return '-';
  try {
    // If dateString is YYYY-MM-DD, format directly to avoid UTC midnight timezone shifts in Brazil (UTC-3)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getDaysUntil(targetDateStr: string): number {
  if (!targetDateStr) return 0;
  try {
    let targetYear: number, targetMonth: number, targetDay: number;
    if (/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
      const [y, m, d] = targetDateStr.split('-').map(Number);
      targetYear = y;
      targetMonth = m - 1;
      targetDay = d;
    } else {
      const parsed = new Date(targetDateStr);
      targetYear = parsed.getFullYear();
      targetMonth = parsed.getMonth();
      targetDay = parsed.getDate();
    }
    // Compare at noon local time to avoid daylight saving and timezone edge cases
    const target = new Date(targetYear, targetMonth, targetDay, 12, 0, 0);
    const today = new Date();
    const todayRef = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
    const diffTime = target.getTime() - todayRef.getTime();
    return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

export function getSubjectColor(subject: LawSubject): { bg: string; text: string; border: string; accent: string } {
  switch (subject) {
    case 'Ética Profissional (OAB)':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', accent: '#f59e0b' };
    case 'Direito Constitucional':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', accent: '#6366f1' };
    case 'Direito Civil':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: '#10b981' };
    case 'Processo Civil':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', accent: '#14b8a6' };
    case 'Direito Penal':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', accent: '#f43f5e' };
    case 'Processo Penal':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: '#f97316' };
    case 'Direito Administrativo':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: '#3b82f6' };
    case 'Direito Tributário':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', accent: '#a855f7' };
    case 'Direito do Trabalho':
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', accent: '#06b6d4' };
    case 'Processo do Trabalho':
      return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', accent: '#0284c7' };
    case 'Direitos Humanos':
      return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', accent: '#ec4899' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', accent: '#64748b' };
  }
}

export function getScheduleStatusBadge(status: ScheduleStatus) {
  switch (status) {
    case 'concluido':
      return { label: 'Concluído', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'em_andamento':
      return { label: 'Em Andamento', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'revisao':
      return { label: 'Para Revisar', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'pendente':
    default:
      return { label: 'Pendente', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function getPriorityBadge(priority: PriorityLevel) {
  switch (priority) {
    case 'alta':
      return { label: 'Alta', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'media':
      return { label: 'Média', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'baixa':
      return { label: 'Baixa', color: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
}
