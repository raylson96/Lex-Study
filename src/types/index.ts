export type PredefinedLawSubject =
  | 'Direito Constitucional'
  | 'Direito Administrativo'
  | 'Direito Civil'
  | 'Processo Civil'
  | 'Direito Penal'
  | 'Processo Penal'
  | 'Direito do Trabalho'
  | 'Processo do Trabalho'
  | 'Direito Tributário'
  | 'Direito Empresarial'
  | 'Ética Profissional (OAB)'
  | 'Direitos Humanos'
  | 'Direito Ambiental'
  | 'Geral / Outros';

export type LawSubject = PredefinedLawSubject | (string & {});

export const DEFAULT_SUBJECTS_LIST: LawSubject[] = [
  'Direito Constitucional',
  'Direito Administrativo',
  'Direito Civil',
  'Processo Civil',
  'Direito Penal',
  'Processo Penal',
  'Direito do Trabalho',
  'Processo do Trabalho',
  'Direito Tributário',
  'Direito Empresarial',
  'Ética Profissional (OAB)',
  'Direitos Humanos',
  'Direito Ambiental',
  'Geral / Outros',
];

export type SubjectNamesMap = Record<string, string>;

export const DEFAULT_SUBJECT_NAMES: SubjectNamesMap = {
  'Direito Constitucional': 'Constitucional',
  'Direito Administrativo': 'Administrativo',
  'Direito Civil': 'Civil',
  'Processo Civil': 'P. Civil',
  'Direito Penal': 'Penal',
  'Processo Penal': 'P. Penal',
  'Direito do Trabalho': 'Trabalho',
  'Processo do Trabalho': 'P. Trabalho',
  'Direito Tributário': 'Tributário',
  'Direito Empresarial': 'Empresarial',
  'Ética Profissional (OAB)': 'Ética',
  'Direitos Humanos': 'D. Humanos',
  'Direito Ambiental': 'Ambiental',
  'Geral / Outros': 'Geral',
};

export type StudyLevel = 'basico' | 'intermediario' | 'avancado';

// Google Docs-style Study Document
export interface StudyDocument {
  id: string;
  title: string;
  subject: LawSubject;
  content: string; // HTML or structured rich text
  tags: string[];
  lastModified: string;
  createdAt: string;
  wordCount: number;
  favorite?: boolean;
  level?: StudyLevel;
  difficulty?: 'facil' | 'medio' | 'dificil';
}

// Study Schedule Task / Topic
export type ScheduleStatus = 'pendente' | 'em_andamento' | 'concluido' | 'revisao';
export type PriorityLevel = 'alta' | 'media' | 'baixa';

export interface ScheduleItem {
  id: string;
  subject: LawSubject;
  topic: string; // Ex: "Controle de Constitucionalidade Concentrado"
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  status: ScheduleStatus;
  priority: PriorityLevel;
  notes?: string;
  revisionD1?: boolean; // Revisão 24h
  revisionD7?: boolean; // Revisão 7 dias
  revisionD30?: boolean; // Revisão 30 dias
  difficulty?: 'facil' | 'medio' | 'dificil';
}

// Library Reference / Vade Mecum Item
export type LibraryCategory =
  | 'Constituição'
  | 'Códigos'
  | 'Súmulas'
  | 'Doutrina & Resumos'
  | 'Videoaulas'
  | 'Jurisprudência'
  | 'Manuais'
  | 'Jurisprudências';

export interface LibraryItem {
  id: string;
  title: string;
  category: LibraryCategory;
  subject: LawSubject;
  summary: string;
  content?: string;
  externalLink?: string;
  importantArticles?: string[];
  pinned?: boolean;
  author?: string; // Doutrinador / Autor (ex: Flávio Tartuce, Fredie Didier)
  edition?: string; // Edição ou Volume (ex: Vol. 1 • 2026)
  markdownContent?: string; // Conteúdo integral Markdown / Obsidian
  vaultPath?: string; // Caminho no cofre Obsidian (ex: "Doutrinas/Direito Civil/Contratos.md")
  source?: 'oab' | 'doutrina' | 'obsidian'; // Origem da obra
  createdAt?: string;
}

// Flashcard / Question for Law Exam
export interface LawQuestion {
  id: string;
  subject: LawSubject;
  topic: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  examOrigin?: string; // Ex: "OAB 46 - FGV"
  userAnswer?: string;
}

// Study Session (for tracking study time & Pomodoro)
export interface StudySession {
  id: string;
  subject: LawSubject;
  minutes: number;
  date: string;
  docId?: string;
  topic?: string;
}

export type PlatformIconType = 'scale' | 'book' | 'graduation' | 'award' | 'shield' | 'flame';

export interface CustomLabels {
  libraryTabOab?: string;
  libraryTabDoutrina?: string;
  shelfCodigos?: string;
  shelfManuais?: string;
  shelfJurisprudencias?: string;
  metricsTitle?: string;
  metricsSubtitle?: string;
  platformTitle?: string;
  platformSubtitle?: string;
}

export const DEFAULT_CUSTOM_LABELS: CustomLabels = {
  libraryTabOab: 'OAB',
  libraryTabDoutrina: 'Doutrina',
  shelfCodigos: 'Códigos',
  shelfManuais: 'Manuais',
  shelfJurisprudencias: 'Jurisprudências',
  metricsTitle: 'Contabilidade Analítica de Estudos',
  metricsSubtitle:
    'Acompanhe o volume real de horas líquidas, taxas de acerto em simulados FGV, maturidade em cada ramo jurídico e desenvolvimento do acervo.',
  platformTitle: 'LexStudy',
  platformSubtitle: 'Plataforma Jurídica',
};

// Student & Goal Settings
export interface StudentProfile {
  name: string;
  examTarget: string; // Ex: "Exame OAB 47"
  targetExamDate: string; // YYYY-MM-DD
  dailyGoalHours: number;
  totalStudyHours: number;
  platformTitle?: string;
  platformSubtitle?: string;
  platformIcon?: PlatformIconType;
  metricsTitle?: string;
  metricsSubtitle?: string;
  customLabels?: CustomLabels;
}

// Calendar Events (Integrated OAB + College + Personal)
export type CalendarCategory = 'oab' | 'faculdade' | 'compromisso' | 'prova' | 'outro';

export interface CalendarCustomEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: CalendarCategory;
  description?: string;
  location?: string;
  completed?: boolean;
}

export type ActiveTab = 'dashboard' | 'editor' | 'cronograma' | 'calendario' | 'biblioteca' | 'questoes' | 'metricas' | 'configuracoes';

export type ThemeMode = 'megapreto' | 'branco' | 'slate';
export type AccentColor = 'vermelho' | 'branco' | 'preto' | 'indigo' | 'dourado';
