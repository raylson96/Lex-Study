import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  StudyDocument,
  ScheduleItem,
  LibraryItem,
  LawQuestion,
  StudySession,
  ActiveTab,
  LawSubject,
  ScheduleStatus,
  CalendarCustomEvent,
  ThemeMode,
  AccentColor,
  SubjectNamesMap,
  DEFAULT_SUBJECT_NAMES,
  DEFAULT_SUBJECTS_LIST,
  DEFAULT_CUSTOM_LABELS,
} from '../types';
import {
  initialProfile,
  initialDocuments,
  initialSchedule,
  initialLibrary,
  initialQuestions,
  initialSessions,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Student Profile
  profile: StudentProfile;
  updateProfile: (profile: Partial<StudentProfile>, silent?: boolean) => void;

  // Documents (Google Docs style)
  documents: StudyDocument[];
  currentDocId: string | null;
  setCurrentDocId: (id: string | null) => void;
  createDocument: (title?: string, subject?: LawSubject) => StudyDocument;
  updateDocument: (id: string, fields: Partial<StudyDocument>) => void;
  deleteDocument: (id: string, silent?: boolean) => void;
  clearAllDocuments: (silent?: boolean) => void;
  toggleDocFavorite: (id: string) => void;

  // Schedule (Cronograma)
  schedule: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  cycleScheduleStatus: (id: string) => void;
  toggleRevision: (id: string, type: 'D1' | 'D7' | 'D30') => void;
  importScheduleItems: (items: ScheduleItem[], replace: boolean) => void;

  // Library / Vade Mecum
  library: LibraryItem[];
  addLibraryItem: (item: Omit<LibraryItem, 'id'>) => void;
  updateLibraryItem: (id: string, item: Partial<LibraryItem>) => void;
  deleteLibraryItem: (id: string) => void;
  togglePinLibraryItem: (id: string) => void;

  // Questions / Simulados
  questions: LawQuestion[];
  answerQuestion: (id: string, selectedOptionId: string) => void;
  importQuestions: (newQuestions: LawQuestion[], replace?: boolean) => void;
  clearQuestionAnswers: () => void;

  // Study Sessions & Pomodoro Timer
  sessions: StudySession[];
  pomodoroSeconds: number;
  setPomodoroSeconds: (seconds: number) => void;
  isTimerRunning: boolean;
  timerSubject: LawSubject;
  setTimerSubject: (s: LawSubject) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  logSession: (subject: LawSubject, minutes: number, docId?: string) => void;
  clearAllSessions: () => void;

  // Security & Authentication Zone
  isAuthenticated: boolean;
  login: (password?: string, rememberToday?: boolean) => boolean;
  logout: () => void;

  // Notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Calendar & Commitments
  customEvents: CalendarCustomEvent[];
  addCustomEvent: (event: Omit<CalendarCustomEvent, 'id'>) => void;
  updateCustomEvent: (id: string, event: Partial<CalendarCustomEvent>) => void;
  deleteCustomEvent: (id: string) => void;
  deleteEmptyDocuments: () => void;

  // Theme & UI state
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  toggleTheme: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;

  // Subject Management (Add, Remove, Custom Names)
  subjects: LawSubject[];
  addSubject: (name: string, shortName?: string) => void;
  removeSubject: (subject: string) => void;
  subjectNames: SubjectNamesMap;
  updateSubjectName: (subject: LawSubject, name: string) => void;
  resetSubjectNames: () => void;
  getSubjectDisplayName: (subject: LawSubject) => string;

  // Reset
  resetToDemoData: () => void;
}

const STORAGE_KEYS = {
  ACTIVE_TAB: 'lexstudy_active_tab_v5',
  PROFILE: 'lexstudy_profile_v5',
  DOCUMENTS: 'lexstudy_documents_v5',
  SCHEDULE: 'lexstudy_schedule_v5',
  LIBRARY: 'lexstudy_library_v5',
  QUESTIONS: 'lexstudy_questions_v5',
  SESSIONS: 'lexstudy_sessions_v5',
  THEME: 'lexstudy_theme_v2',
  ACCENT: 'lexstudy_accent_v2',
  SIDEBAR: 'lexstudy_sidebar_collapsed_v1',
  CALENDAR_EVENTS: 'lexstudy_calendar_events_v5',
  SUBJECT_NAMES: 'lexstudy_subject_names_v5',
  SUBJECTS_LIST: 'lexstudy_subjects_list_v5',
  AUTH_SESSION: 'lexstudy_auth_session_v2',
  AUTH_PASSWORD: 'lexstudy_auth_password_v2',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hard purge: wipe all legacy mock data permanently from browser storage
  if (typeof window !== 'undefined') {
    const isHardPurged = localStorage.getItem('lexstudy_hard_purge_v8');
    if (!isHardPurged) {
      try {
        localStorage.setItem('lexstudy_hard_purge_v8', 'true');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (
            k &&
            k.startsWith('lexstudy_') &&
            k !== STORAGE_KEYS.THEME &&
            k !== STORAGE_KEYS.ACCENT &&
            k !== STORAGE_KEYS.AUTH_SESSION &&
            k !== STORAGE_KEYS.AUTH_PASSWORD &&
            k !== 'lexstudy_hard_purge_v8'
          ) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(initialQuestions));
      } catch (e) {
        console.error('Hard purge error:', e);
      }
    }
  }

  // Authentication & Security Zone
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If user explicitly clicked logout/lock, lock screen
        if (parsed.loggedOut) return false;
        // If user previously logged in on this device and hasn't logged out, stay connected!
        if (parsed.loggedIn) {
          return true;
        }
      }
    } catch {}
    // Default: false, shows login screen on open
    return false;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as ActiveTab | null;
    const validTabs: ActiveTab[] = [
      'dashboard',
      'editor',
      'cronograma',
      'calendario',
      'biblioteca',
      'questoes',
      'metricas',
      'configuracoes',
    ];
    if (saved && validTabs.includes(saved)) {
      return saved;
    }
    return 'dashboard';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent States
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialProfile,
          ...parsed,
          totalStudyHours: 0, // Clean baseline
          customLabels: {
            ...DEFAULT_CUSTOM_LABELS,
            ...(initialProfile.customLabels || {}),
            ...(parsed.customLabels || {}),
          },
        };
      } catch {
        return {
          ...initialProfile,
          totalStudyHours: 0,
          customLabels: {
            ...DEFAULT_CUSTOM_LABELS,
            ...(initialProfile.customLabels || {}),
          },
        };
      }
    }
    return {
      ...initialProfile,
      totalStudyHours: 0,
      customLabels: {
        ...DEFAULT_CUSTOM_LABELS,
        ...(initialProfile.customLabels || {}),
      },
    };
  });

  const [documents, setDocuments] = useState<StudyDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback to initial
      }
    }
    return initialDocuments;
  });

  const [currentDocId, setCurrentDocId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed[0]?.id || null;
      } catch {}
    }
    return initialDocuments[0]?.id || null;
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback to initial
      }
    }
    return initialSchedule;
  });

  const [library, setLibrary] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LIBRARY);
    return saved ? JSON.parse(saved) : initialLibrary;
  });

  const [questions, setQuestions] = useState<LawQuestion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialQuestions.length) {
          return parsed;
        }
      } catch {}
    }
    return initialQuestions;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  // Pomodoro Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSubject, setTimerSubject] = useState<LawSubject>('Ética Profissional (OAB)');

const initialCustomEvents: CalendarCustomEvent[] = [];

  // Theme, Accent & Sidebar States
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'megapreto' || saved === 'branco' || saved === 'slate') return saved;
    if (saved === 'light') return 'branco';
    if (saved === 'dark') return 'megapreto';
    return 'megapreto'; // Default to Mega Preto as requested!
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCENT);
    if (
      saved === 'vermelho' ||
      saved === 'branco' ||
      saved === 'preto' ||
      saved === 'indigo' ||
      saved === 'dourado'
    ) {
      return saved;
    }
    return 'vermelho'; // Default to Vermelho as in user's example!
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
    return saved === 'false' ? false : true; // Default to collapsed as requested!
  });

  const [customEvents, setCustomEvents] = useState<CalendarCustomEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
    if (!saved) return initialCustomEvents;
    try {
      return JSON.parse(saved);
    } catch {
      return initialCustomEvents;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(customEvents));
  }, [customEvents]);

  // Theme & Accent synchronization effect
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'megapreto', 'branco', 'slate');
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accentColor);

    if (theme === 'megapreto') {
      root.classList.add('dark', 'megapreto');
    } else if (theme === 'slate') {
      root.classList.add('dark', 'slate');
    } else {
      root.classList.add('branco');
    }

    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    localStorage.setItem(STORAGE_KEYS.ACCENT, accentColor);
  }, [theme, accentColor]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'branco' ? 'megapreto' : 'branco'));
  };

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Active Subjects List Management (Add, Remove, Custom subjects)
  const [subjects, setSubjects] = useState<LawSubject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS_LIST);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_SUBJECTS_LIST;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS_LIST, JSON.stringify(subjects));
  }, [subjects]);

  // Subject Names Management
  const [subjectNames, setSubjectNames] = useState<SubjectNamesMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECT_NAMES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SUBJECT_NAMES, ...parsed };
      } catch {
        return DEFAULT_SUBJECT_NAMES;
      }
    }
    return DEFAULT_SUBJECT_NAMES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECT_NAMES, JSON.stringify(subjectNames));
  }, [subjectNames]);

  const updateSubjectName = (subject: LawSubject, name: string) => {
    setSubjectNames((prev) => ({
      ...prev,
      [subject]: name.trim() || DEFAULT_SUBJECT_NAMES[subject] || subject,
    }));
  };

  const addSubject = (name: string, shortName?: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Por favor, informe o nome da matéria.', 'info');
      return;
    }
    if (subjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Esta matéria já existe no catálogo.', 'info');
      return;
    }
    const displayShort = (shortName && shortName.trim()) || trimmed;
    setSubjects((prev) => [...prev, trimmed]);
    setSubjectNames((prev) => ({
      ...prev,
      [trimmed]: displayShort,
    }));
    showToast(`Matéria "${trimmed}" adicionada com sucesso!`);
  };

  const removeSubject = (subjectToRemove: string) => {
    if (subjects.length <= 1) {
      showToast('Você precisa manter pelo menos uma matéria ativa no sistema.', 'info');
      return;
    }
    const displayName = getSubjectDisplayName(subjectToRemove);
    setSubjects((prev) => prev.filter((s) => s !== subjectToRemove));
    showToast(`Matéria "${displayName}" removida do catálogo ativo.`);
  };

  const resetSubjectNames = () => {
    setSubjects(DEFAULT_SUBJECTS_LIST);
    setSubjectNames(DEFAULT_SUBJECT_NAMES);
    showToast('Catálogo de matérias e nomes padrão restaurados!');
  };

  const getSubjectDisplayName = (subject: LawSubject): string => {
    return subjectNames[subject] || DEFAULT_SUBJECT_NAMES[subject] || subject;
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  // Keep totalStudyHours in sync with sessions
  useEffect(() => {
    const computedHours = parseFloat(
      (sessions.reduce((sum, s) => sum + s.minutes, 0) / 60).toFixed(1)
    );
    if (profile.totalStudyHours !== computedHours) {
      setProfile((prev) => ({ ...prev, totalStudyHours: computedHours }));
    }
  }, [sessions, profile.totalStudyHours]);

  // Pomodoro Interval Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      logSession(timerSubject, 25);
      showToast(`Ciclo Pomodoro concluído! +25 minutos registrados em ${timerSubject}! 🎉`);
      setPomodoroSeconds(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds, timerSubject]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateProfile = (fields: Partial<StudentProfile>, silent = false) => {
    setProfile((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    });
    if (!silent) {
      showToast('Metas e perfil atualizados com sucesso!');
    }
  };

  // Document actions
  const createDocument = (title?: string, subject?: LawSubject): StudyDocument => {
    const newDoc: StudyDocument = {
      id: `doc-${Date.now()}`,
      title: title || 'Caderno de Estudo Sem Título',
      subject: subject || 'Direito Constitucional',
      content: '<h2>Novo Tópico de Estudo</h2><p>Comece a escrever seus resumos, artigos de lei e anotações jurídicas aqui...</p>',
      tags: ['Anotações'],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      wordCount: 15,
      favorite: false,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
    setActiveTab('editor');
    showToast(`Documento "${newDoc.title}" criado com sucesso!`);
    return newDoc;
  };

  const updateDocument = (id: string, fields: Partial<StudyDocument>) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...fields,
              lastModified: new Date().toISOString(),
            }
          : d
      )
    );
  };

  const deleteDocument = (id: string, silent = false) => {
    const targetDoc = documents.find((d) => d.id === id);
    setDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      return remaining;
    });
    // Remove study sessions associated with this deleted document
    setSessions((prev) => prev.filter((s) => s.docId !== id));

    // Clean up any matching schedule topic so it doesn't linger in Hoje / Atrasados / Futuros
    if (targetDoc) {
      setSchedule((prev) =>
        prev.filter(
          (s) =>
            s.topic.toLowerCase().trim() !== targetDoc.title.toLowerCase().trim() &&
            !targetDoc.title.toLowerCase().includes(s.topic.toLowerCase())
        )
      );
    }

    setCurrentDocId((prevId) => {
      if (prevId === id) {
        const remaining = documents.filter((d) => d.id !== id);
        return remaining[0]?.id || null;
      }
      return prevId;
    });
    if (!silent) {
      showToast('Caderno de estudo excluído.', 'info');
    }
  };

  const clearAllDocuments = (silent = false) => {
    setDocuments([]);
    setCurrentDocId(null);
    setSessions([]);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    setProfile((prev) => ({ ...prev, totalStudyHours: 0 }));
    if (!silent) {
      showToast('Todos os cadernos e horas de estudo foram removidos.', 'info');
    }
  };

  const toggleDocFavorite = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
    );
  };

  const deleteEmptyDocuments = () => {
    setDocuments((prev) => {
      const remaining = prev.filter((d) => {
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
      return remaining;
    });
  };

  // Calendar Event actions
  const addCustomEvent = (eventData: Omit<CalendarCustomEvent, 'id'>) => {
    const newEvent: CalendarCustomEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setCustomEvents((prev) => [newEvent, ...prev]);
    showToast('Compromisso adicionado ao calendário!');
  };

  const updateCustomEvent = (id: string, updated: Partial<CalendarCustomEvent>) => {
    setCustomEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    showToast('Compromisso atualizado!');
  };

  const deleteCustomEvent = (id: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Compromisso removido.', 'info');
  };

  // Schedule actions
  const addScheduleItem = (itemData: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...itemData,
      id: `sch-${Date.now()}`,
    };
    setSchedule((prev) => [newItem, ...prev]);
    showToast(`Meta "${newItem.topic}" adicionada ao cronograma!`);
  };

  const updateScheduleItem = (id: string, fields: Partial<ScheduleItem>) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...fields } : s))
    );
    showToast('Cronograma atualizado!');
  };

  const deleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
    showToast('Item do cronograma removido.', 'info');
  };

  const cycleScheduleStatus = (id: string) => {
    const statusCycle: ScheduleStatus[] = ['pendente', 'em_andamento', 'concluido', 'revisao'];
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const currentIndex = statusCycle.indexOf(s.status);
          const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const toggleRevision = (id: string, type: 'D1' | 'D7' | 'D30') => {
    setSchedule((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (type === 'D1') return { ...s, revisionD1: !s.revisionD1 };
          if (type === 'D7') return { ...s, revisionD7: !s.revisionD7 };
          if (type === 'D30') return { ...s, revisionD30: !s.revisionD30 };
        }
        return s;
      })
    );
    showToast('Status de revisão atualizado!');
  };

  const importScheduleItems = (items: ScheduleItem[], replace: boolean) => {
    if (replace) {
      setSchedule(items);
      showToast(`${items.length} tópicos importados com sucesso no seu cronograma!`);
    } else {
      setSchedule((prev) => [...items, ...prev]);
      showToast(`${items.length} novos tópicos adicionados ao cronograma!`);
    }
  };

  // Library actions
  const addLibraryItem = (itemData: Omit<LibraryItem, 'id'>) => {
    const newItem: LibraryItem = {
      ...itemData,
      id: `lib-${Date.now()}`,
    };
    setLibrary((prev) => [newItem, ...prev]);
    showToast(`"${newItem.title}" adicionado à Biblioteca Jurídica!`);
  };

  const updateLibraryItem = (id: string, fields: Partial<LibraryItem>) => {
    setLibrary((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...fields } : l))
    );
    showToast('Item da biblioteca atualizado!');
  };

  const deleteLibraryItem = (id: string) => {
    setLibrary((prev) => prev.filter((l) => l.id !== id));
    showToast('Item removido da biblioteca.', 'info');
  };

  const togglePinLibraryItem = (id: string) => {
    setLibrary((prev) =>
      prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l))
    );
  };

  // Questions actions
  const answerQuestion = (id: string, selectedOptionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, userAnswer: selectedOptionId } : q))
    );
  };

  const clearQuestionAnswers = () => {
    setQuestions((prev) => prev.map((q) => ({ ...q, userAnswer: undefined })));
    showToast('Respostas zeradas! Todos os simulados estão limpos (0 questões respondidas).', 'info');
  };

  const importQuestions = (newQuestions: LawQuestion[], replace: boolean = false) => {
    if (replace) {
      setQuestions(newQuestions);
      showToast(`${newQuestions.length} questões importadas (banco substituído)!`, 'success');
    } else {
      setQuestions((prev) => [...prev, ...newQuestions]);
      showToast(`${newQuestions.length} novas questões adicionadas ao banco de questões!`, 'success');
    }
  };

  // Sessions and Timer actions
  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setPomodoroSeconds(25 * 60);
  };

  const logSession = (subject: LawSubject, minutes: number, docId?: string) => {
    const newSession: StudySession = {
      id: `s-${Date.now()}`,
      subject,
      minutes,
      date: new Date().toISOString().slice(0, 10),
      docId,
    };
    setSessions((prev) => [newSession, ...prev]);
    setProfile((prev) => ({
      ...prev,
      totalStudyHours: parseFloat((prev.totalStudyHours + minutes / 60).toFixed(1)),
    }));
  };

  const clearAllSessions = () => {
    setSessions([]);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    setProfile((prev) => ({ ...prev, totalStudyHours: 0 }));
    showToast('Histórico de horas e sessões de estudo zerado (0.0h)!', 'info');
  };

  const login = (password?: string, rememberToday: boolean = true): boolean => {
    const storedPass = localStorage.getItem(STORAGE_KEYS.AUTH_PASSWORD) || 'oab2026';
    const inputPass = (password || '').trim();
    if (inputPass !== storedPass) {
      showToast('Senha de segurança incorreta.', 'error');
      return false;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const sessionData = {
      loggedIn: true,
      lastLoginDate: todayStr,
      rememberDevice: rememberToday,
      loggedOut: false,
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
    setIsAuthenticated(true);
    showToast('Acesso autorizado! Bem-vindo(a) ao LexStudy.', 'success');
    return true;
  };

  const logout = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        STORAGE_KEYS.AUTH_SESSION,
        JSON.stringify({ ...parsed, loggedIn: false, loggedOut: true })
      );
    } catch {}
    setIsAuthenticated(false);
    showToast('Sessão encerrada com sucesso. Acesso bloqueado.', 'info');
  };

  const resetToDemoData = () => {
    setProfile({ ...initialProfile, totalStudyHours: 0 });
    setDocuments([]);
    setCurrentDocId(null);
    setSchedule([]);
    setLibrary([]);
    setCustomEvents([]);
    setQuestions(initialQuestions);
    setSessions([]);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(initialQuestions));
    showToast('Base zero restaurada com sucesso!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        profile,
        updateProfile,
        documents,
        currentDocId,
        setCurrentDocId,
        createDocument,
        updateDocument,
        deleteDocument,
        clearAllDocuments,
        toggleDocFavorite,
        schedule,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        cycleScheduleStatus,
        toggleRevision,
        importScheduleItems,
        library,
        addLibraryItem,
        updateLibraryItem,
        deleteLibraryItem,
        togglePinLibraryItem,
        questions,
        answerQuestion,
        clearQuestionAnswers,
        importQuestions,
        sessions,
        pomodoroSeconds,
        setPomodoroSeconds,
        isTimerRunning,
        timerSubject,
        setTimerSubject,
        startTimer,
        pauseTimer,
        resetTimer,
        logSession,
        clearAllSessions,
        isAuthenticated,
        login,
        logout,
        toasts,
        showToast,
        removeToast,
        customEvents,
        addCustomEvent,
        updateCustomEvent,
        deleteCustomEvent,
        deleteEmptyDocuments,
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        toggleTheme,
        isSidebarCollapsed,
        toggleSidebarCollapsed,
        subjects,
        addSubject,
        removeSubject,
        subjectNames,
        updateSubjectName,
        resetSubjectNames,
        getSubjectDisplayName,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
