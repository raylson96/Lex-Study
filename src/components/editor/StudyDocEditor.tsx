import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { LawSubject, ScheduleItem, StudyDocument } from '../../types';
import { getSubjectColor, formatDateShort, getPriorityBadge } from '../../utils/formatters';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Search,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Scale,
  Clock,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertTriangle,
  Rocket,
  CheckCircle2,
  BookOpen,
  Maximize2,
  Minimize2,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  ListTree,
  Lightbulb,
  Sparkles,
  Columns2,
  BookMarked,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Quote,
  X,
  Calendar,
  Layers,
  Undo2,
  Redo2,
  Table,
  Minus,
  RemoveFormatting,
  Indent,
  Outdent,
  CheckSquare,
  Palette,
  CalendarDays,
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

interface OutlineHeading {
  id: number;
  level: string;
  text: string;
}

export const StudyDocEditor: React.FC = () => {
  const {
    documents,
    currentDocId,
    setCurrentDocId,
    createDocument,
    updateDocument,
    deleteDocument,
    schedule,
    deleteScheduleItem,
    profile,
    cycleScheduleStatus,
    updateScheduleItem,
    addScheduleItem,
    toggleRevision,
    logSession,
    setActiveTab,
    showToast,
    subjects,
    theme,
    getSubjectDisplayName,
    isVaultConnected,
    vaultName,
    isVaultSyncing,
    syncNowToVault,
  } = useApp();

  // Navigation and filtering
  const [searchDoc, setSearchDoc] = useState('');
  const [showDocListMobile, setShowDocListMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scheduleFilter, setScheduleFilter] = useState<'hoje' | 'atrasados' | 'futuros' | 'estudados' | 'todos'>('hoje');

  // Modal Iniciar Novo Estudo
  const [isNewStudyModalOpen, setIsNewStudyModalOpen] = useState(false);
  const [freeTitle, setFreeTitle] = useState('');
  const [freeSubject, setFreeSubject] = useState<LawSubject>('Direito Constitucional');

  // Spaced Revision (24h / 7d / 30d) & Study Completion Modal
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionDifficulty, setRevisionDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [revisionD1, setRevisionD1] = useState(true);
  const [revisionD7, setRevisionD7] = useState(true);
  const [revisionD30, setRevisionD30] = useState(true);

  // Document Deletion Confirmation Modal
  const [docToDelete, setDocToDelete] = useState<StudyDocument | null>(null);

  // Premium Workstation View Modes & Typography
  const [zenMode, setZenMode] = useState(false);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('justify');
  const [showMarginGuide, setShowMarginGuide] = useState(true);
  const [showOutline, setShowOutline] = useState(false);

  // Word-style dropdown menus
  const [showHighlighterMenu, setShowHighlighterMenu] = useState(false);
  const [showBlocksMenu, setShowBlocksMenu] = useState(false);
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);

  // Auto-save feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Today reference date: matches mock data reference or system date
  const todayStr = useMemo(() => {
    const sysDate = new Date().toISOString().slice(0, 10);
    return sysDate.startsWith('2026-10') ? sysDate : '2026-10-06';
  }, []);

  // Split schedule into Delayed, Today, Upcoming and Completed
  const delayedItems = useMemo(() => {
    return schedule.filter((s) => s.date < todayStr && s.status !== 'concluido');
  }, [schedule, todayStr]);

  const todayItems = useMemo(() => {
    return schedule.filter((s) => s.date === todayStr);
  }, [schedule, todayStr]);

  const upcomingItems = useMemo(() => {
    return schedule.filter((s) => s.date > todayStr);
  }, [schedule, todayStr]);

  const completedItems = useMemo(() => {
    return schedule.filter((s) => s.status === 'concluido');
  }, [schedule]);

  const completedCount = completedItems.length;
  const progressPct = schedule.length > 0 ? Math.round((completedCount / schedule.length) * 100) : 0;

  // Selected document (safe fallback to null if list is empty)
  const currentDoc = useMemo(() => {
    if (!documents || documents.length === 0) return null;
    return documents.find((d) => d.id === currentDocId) || documents[0] || null;
  }, [documents, currentDocId]);

  // Linked schedule item
  const linkedScheduleItem = useMemo(() => {
    if (!currentDoc) return null;
    return schedule.find(
      (s) =>
        s.topic.toLowerCase().includes(currentDoc.title.toLowerCase()) ||
        currentDoc.title.toLowerCase().includes(s.topic.toLowerCase()) ||
        (s.subject === currentDoc.subject && s.date === todayStr)
    );
  }, [currentDoc, schedule, todayStr]);

  // Advancement Status
  const studyTimelineStatus = useMemo(() => {
    if (!linkedScheduleItem) return null;
    if (linkedScheduleItem.status === 'concluido') return 'concluido';
    if (linkedScheduleItem.date < todayStr) return 'atrasado';
    if (linkedScheduleItem.date === todayStr) return 'hoje';
    return 'adiantado';
  }, [linkedScheduleItem, todayStr]);

  // Dynamic Outline (Sumário) extracted from H1 and H2 in current document
  const outlineHeadings = useMemo<OutlineHeading[]>(() => {
    if (!currentDoc?.content) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentDoc.content, 'text/html');
      const elements = Array.from(doc.querySelectorAll('h1, h2, h3'));
      return elements.map((el, idx) => ({
        id: idx,
        level: el.tagName.toLowerCase(),
        text: el.textContent?.trim() || `Tópico ${idx + 1}`,
      }));
    } catch {
      return [];
    }
  }, [currentDoc?.content]);

  // Calculated Spaced Revision Dates based on todayStr
  const revisionDates = useMemo(() => {
    const baseDate = new Date(todayStr + 'T12:00:00Z');

    const d1Date = new Date(baseDate);
    d1Date.setDate(d1Date.getDate() + 1);

    const d7Date = new Date(baseDate);
    d7Date.setDate(d7Date.getDate() + 7);

    const d30Date = new Date(baseDate);
    d30Date.setDate(d30Date.getDate() + 30);

    const formatBr = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return {
      d1: formatBr(d1Date),
      d7: formatBr(d7Date),
      d30: formatBr(d30Date),
    };
  }, [todayStr]);

  const openRevisionModal = () => {
    if (!currentDoc) return;
    const currentDiff = currentDoc.difficulty || linkedScheduleItem?.difficulty || 'medio';
    setRevisionDifficulty(currentDiff);
    if (linkedScheduleItem) {
      setRevisionD1(linkedScheduleItem.revisionD1 ?? (currentDiff !== 'facil'));
      setRevisionD7(linkedScheduleItem.revisionD7 ?? true);
      setRevisionD30(linkedScheduleItem.revisionD30 ?? true);
    } else {
      setRevisionD1(currentDiff !== 'facil');
      setRevisionD7(true);
      setRevisionD30(true);
    }
    setIsRevisionModalOpen(true);
  };

  const handleDifficultyChange = (diff: 'facil' | 'medio' | 'dificil') => {
    setRevisionDifficulty(diff);
    if (diff === 'facil') {
      setRevisionD1(false);
      setRevisionD7(true);
      setRevisionD30(true);
    } else if (diff === 'medio') {
      setRevisionD1(true);
      setRevisionD7(true);
      setRevisionD30(true);
    } else {
      setRevisionD1(true);
      setRevisionD7(true);
      setRevisionD30(true);
    }
  };

  const handleConfirmRevisionAndCompletion = () => {
    if (!currentDoc) return;

    // 1. Update document difficulty
    updateDocument(currentDoc.id, { difficulty: revisionDifficulty });

    // 2. Update or create schedule item
    if (linkedScheduleItem) {
      updateScheduleItem(linkedScheduleItem.id, {
        status: 'concluido',
        revisionD1,
        revisionD7,
        revisionD30,
        difficulty: revisionDifficulty,
      });
    } else {
      addScheduleItem({
        subject: currentDoc.subject,
        topic: currentDoc.title,
        date: todayStr,
        durationMinutes: 60,
        status: 'concluido',
        priority: revisionDifficulty === 'dificil' ? 'alta' : 'media',
        revisionD1,
        revisionD7,
        revisionD30,
        difficulty: revisionDifficulty,
      });
    }

    // 3. Register study session
    logSession(currentDoc.subject, 30);

    setIsRevisionModalOpen(false);
    showToast(`Parabéns! Estudo de "${currentDoc.title}" concluído com revisões agendadas! 🎉`);
  };

  const handleQuickToggleRevision = (type: 'D1' | 'D7' | 'D30') => {
    if (!currentDoc) return;
    if (!linkedScheduleItem) {
      addScheduleItem({
        subject: currentDoc.subject,
        topic: currentDoc.title,
        date: todayStr,
        durationMinutes: 60,
        status: 'em_andamento',
        priority: 'media',
        revisionD1: type === 'D1',
        revisionD7: type === 'D7',
        revisionD30: type === 'D30',
        difficulty: revisionDifficulty,
      });
      showToast(`Ciclo ${type} ativado para este estudo!`);
      return;
    }
    toggleRevision(linkedScheduleItem.id, type);
  };

  // Sync editor content when currentDoc changes
  useEffect(() => {
    if (editorRef.current && currentDoc) {
      if (editorRef.current.innerHTML !== currentDoc.content) {
        editorRef.current.innerHTML = currentDoc.content;
      }
    }
  }, [currentDoc?.id]);

  // Listen to Escape to exit Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zenMode) {
        setZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zenMode]);

  // Helper: Detect if a document is an unsaved empty temporary draft
  const isDiscardableDraft = (doc: StudyDocument, currentText?: string) => {
    // Documents with words written must NEVER be deleted automatically
    if ((doc.wordCount || 0) > 0) return false;

    const raw = currentText !== undefined ? currentText : doc.content ? doc.content.replace(/<[^>]*>/g, '').trim() : '';
    if (!raw) return true;
    const clean = raw
      .replace(doc.title, '')
      .replace(/anotações e doutrina sobre este assunto\.{3}/gi, '')
      .replace(/comece a escrever seus resumos, artigos de lei e anotações jurídicas aqui\.{3}/gi, '')
      .replace(/comece a escrever seus resumos/gi, '')
      .replace(/novo tópico de estudo/gi, '')
      .trim();
    return clean.length === 0;
  };

  // Safe Document Selection: discard empty temporary drafts silently when switching
  const selectDoc = (nextDocId: string) => {
    if (currentDoc && currentDoc.id !== nextDocId) {
      const text = editorRef.current?.innerText?.trim() || '';
      if (isDiscardableDraft(currentDoc, text)) {
        // Discard empty temporary zombie document silently without toast notifications
        deleteDocument(currentDoc.id, true);
      }
    }
    setCurrentDocId(nextDocId);
    setShowDocListMobile(false);
  };

  // Start study from topic or schedule item
  const handleStartStudy = (topic: string, subject: LawSubject) => {
    // Check if current document was an empty temporary draft
    if (currentDoc) {
      const text = editorRef.current?.innerText?.trim() || '';
      if (isDiscardableDraft(currentDoc, text)) {
        deleteDocument(currentDoc.id, true);
      }
    }

    // Check if matching doc already exists
    const existing = documents.find(
      (d) =>
        d.title.toLowerCase().trim() === topic.toLowerCase().trim() ||
        (d.subject === subject && d.title.toLowerCase().includes(topic.toLowerCase()))
    );

    if (existing) {
      setCurrentDocId(existing.id);
      showToast(`Caderno aberto: ${existing.title}`);
    } else {
      const starterHtml = `
        <h1 style="color: #4f46e5; font-size: 1.5rem; font-weight: 800; border-bottom: 2px solid rgba(99, 102, 241, 0.25); padding-bottom: 8px; margin-bottom: 16px;">
          ${topic}
        </h1>
        <p style="color: #64748b; font-style: italic;">Anotações e doutrina sobre este assunto...</p>
      `;
      const newDoc = createDocument(topic, subject);
      updateDocument(newDoc.id, {
        content: starterHtml,
        wordCount: 0,
      });
      setCurrentDocId(newDoc.id);
      showToast(`Caderno preparado para: ${topic}`);
    }

    setIsNewStudyModalOpen(false);
    setShowDocListMobile(false);
  };

  // Auto-save & input synchronization
  const handleInput = useCallback(() => {
    if (!editorRef.current || !currentDoc) return;
    const newContent = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      updateDocument(currentDoc.id, {
        content: newContent,
        wordCount: words,
      });
      setIsSaving(false);
      const now = new Date();
      setLastSavedTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
          now.getSeconds()
        ).padStart(2, '0')}`
      );
    }, 400);
  }, [currentDoc, updateDocument]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentDoc) return;
    updateDocument(currentDoc.id, { title: e.target.value });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!currentDoc) return;
    updateDocument(currentDoc.id, { subject: e.target.value as LawSubject });
  };

  // Standard WYSIWYG commands
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Text highlighter handler
  const applyHighlight = (color: string) => {
    if (color === 'clear') {
      document.execCommand('backColor', false, 'transparent');
    } else {
      document.execCommand('backColor', false, color);
    }
    setShowHighlighterMenu(false);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Insert 6 Legal Study Callout Blocks
  const insertLegalCallout = (
    type: 'lei' | 'jurisprudencia' | 'oab' | 'mnemonico' | 'doutrina' | 'comparativo'
  ) => {
    let html = '';

    if (type === 'lei') {
      html = `
        <div style="border-left: 4px solid #2563eb; background: rgba(37, 99, 235, 0.08); padding: 14px 18px; margin: 18px 0; border-radius: 8px; font-family: inherit;">
          <div style="font-weight: 800; font-size: 13px; color: #1d4ed8; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            ⚖️ Artigo de Lei • Dispositivo Legal Aplicável
          </div>
          <p style="margin: 0; font-style: italic; font-weight: 500;">
            <strong>Art. ...</strong> - "Todos são iguais perante a lei, sem distinção de qualquer natureza..."
          </p>
          <div style="margin-top: 8px; font-size: 13px; opacity: 0.9;">
            <strong>§ 1º</strong> [Insira aqui o parágrafo ou exceção normativa]
          </div>
        </div><p><br></p>
      `;
    } else if (type === 'jurisprudencia') {
      html = `
        <div style="border-left: 4px solid #7c3aed; background: rgba(124, 58, 237, 0.08); padding: 14px 18px; margin: 18px 0; border-radius: 8px; font-family: inherit;">
          <div style="font-weight: 800; font-size: 13px; color: #6d28d9; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            🏛️ Súmula & Jurisprudência Vinculante • STF / STJ
          </div>
          <p style="margin: 0; font-style: italic;">
            <strong>Súmula Vinculante nº ...:</strong> "A incidência da súmula ou tese firmada em sede de repercussão geral..."
          </p>
          <p style="margin-top: 8px; margin-bottom: 0; font-size: 13px; opacity: 0.9;">
            <strong>Aplicação na OAB:</strong> [Como a FGV costuma cobrar o distinguishing ou tese fixada]
          </p>
        </div><p><br></p>
      `;
    } else if (type === 'oab') {
      html = `
        <div style="border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 14px 18px; margin: 18px 0; border-radius: 8px; font-family: inherit;">
          <div style="font-weight: 800; font-size: 13px; color: #b45309; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            ⚠️ Atenção FGV • Pegadinha Comum da OAB 48
          </div>
          <p style="margin: 0; font-weight: 600;">
            <strong>Cuidado:</strong> [A banca costuma trocar a regra geral pela exceção ou confundir prazos neste tópico!]
          </p>
          <div style="margin-top: 6px; font-size: 13px;">
            • <strong>Regra Geral:</strong> [Regra padrão do Código]<br>
            • <strong>Pegadinha FGV:</strong> [Exceção cobrada frequentemente na 1ª Fase]
          </div>
        </div><p><br></p>
      `;
    } else if (type === 'mnemonico') {
      html = `
        <div style="border-left: 4px solid #059669; background: rgba(5, 150, 105, 0.08); padding: 14px 18px; margin: 18px 0; border-radius: 8px; font-family: inherit;">
          <div style="font-weight: 800; font-size: 13px; color: #047857; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            💡 Mnemônico OAB • Macete de Memorização Rápida
          </div>
          <div style="display: inline-block; font-size: 15px; font-weight: 900; letter-spacing: 1.5px; color: #047857; background: rgba(5, 150, 105, 0.15); padding: 4px 12px; border-radius: 6px; margin-bottom: 8px;">
            PALAVRA-CHAVE: [MACETE]
          </div>
          <div style="font-size: 13px; line-height: 1.6;">
            • <strong>L</strong> - [Elemento 1]<br>
            • <strong>I</strong> - [Elemento 2]<br>
            • <strong>M</strong> - [Elemento 3]<br>
            • <strong>P</strong> - [Elemento 4]<br>
            • <strong>E</strong> - [Elemento 5]
          </div>
        </div><p><br></p>
      `;
    } else if (type === 'doutrina') {
      html = `
        <div style="border-left: 4px solid #b45309; background: rgba(180, 83, 9, 0.08); padding: 14px 18px; margin: 18px 0; border-radius: 8px; font-family: inherit;">
          <div style="font-weight: 800; font-size: 13px; color: #92400e; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 6px;">
            📜 Conceito Doutrinário & Divergência
          </div>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Conceito Fundamental:</strong> [Definição do instituto segundo a doutrina jurídica dominante]</p>
          <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 13px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 6px;">
              <strong style="color: #047857;">1ª Corrente (Majoritária - FGV):</strong><br>
              [Entendimento predominante cobrado na prova]
            </div>
            <div style="flex: 1; min-width: 200px; padding: 10px; background: rgba(0,0,0,0.03); border-radius: 6px;">
              <strong style="color: #6d28d9;">2ª Corrente (Minoritária):</strong><br>
              [Entendimento em desuso ou isolado]
            </div>
          </div>
        </div><p><br></p>
      `;
    } else if (type === 'comparativo') {
      html = `
        <div style="border: 1px solid rgba(148, 163, 184, 0.3); background: rgba(248, 250, 252, 0.6); padding: 14px 18px; margin: 18px 0; border-radius: 8px; font-family: inherit;">
          <div style="font-weight: 800; font-size: 13px; color: #475569; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px;">
            📊 Quadro Comparativo • Diferenciação FGV
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(148, 163, 184, 0.4);">
                <th style="padding: 6px 8px; font-weight: bold;">Critério</th>
                <th style="padding: 6px 8px; font-weight: bold; color: #2563eb;">Instituto A</th>
                <th style="padding: 6px 8px; font-weight: bold; color: #7c3aed;">Instituto B</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(148, 163, 184, 0.2);">
                <td style="padding: 6px 8px; font-weight: 600;">Natureza</td>
                <td style="padding: 6px 8px;">[Definição A]</td>
                <td style="padding: 6px 8px;">[Definição B]</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; font-weight: 600;">Prazo / Efeito</td>
                <td style="padding: 6px 8px;">[Prazo ou Efeito A]</td>
                <td style="padding: 6px 8px;">[Prazo ou Efeito B]</td>
              </tr>
            </tbody>
          </table>
        </div><p><br></p>
      `;
    }

    document.execCommand('insertHTML', false, html);
    setShowBlocksMenu(false);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const applyTextColor = (color: string) => {
    document.execCommand('foreColor', false, color);
    setShowTextColorMenu(false);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid rgba(148, 163, 184, 0.4); font-size: 13px;">
        <thead>
          <tr style="background: rgba(0, 0, 0, 0.05); border-bottom: 2px solid rgba(148, 163, 184, 0.5);">
            <th style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px; font-weight: bold; text-align: left;">Artigo / Tópico</th>
            <th style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px; font-weight: bold; text-align: left;">Regra Geral</th>
            <th style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px; font-weight: bold; text-align: left;">Exceção / Prazo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px;">Item 1</td>
            <td style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px;">Texto explicativo...</td>
            <td style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px;">Exceção normativa...</td>
          </tr>
          <tr>
            <td style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px;">Item 2</td>
            <td style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px;">Texto explicativo...</td>
            <td style="border: 1px solid rgba(148, 163, 184, 0.3); padding: 8px 12px;">Exceção normativa...</td>
          </tr>
        </tbody>
      </table><p><br></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertChecklist = () => {
    const checkHtml = `
      <div style="display: flex; align-items: center; gap: 8px; margin: 6px 0;">
        <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;" />
        <span style="font-size: 14px;">Item de checagem do estudo...</span>
      </div><p><br></p>
    `;
    document.execCommand('insertHTML', false, checkHtml);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const insertDateStamp = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const html = `<span style="font-weight: 700; font-size: 12px; color: var(--app-accent); background: rgba(0,0,0,0.06); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--app-accent);">📅 ${dateStr}</span>&nbsp;`;
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const clearFormatting = () => {
    document.execCommand('removeFormat', false, undefined);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  // Jump to heading in the document
  const handleScrollToHeading = (index: number) => {
    if (!editorRef.current) return;
    const headings = editorRef.current.querySelectorAll('h1, h2, h3');
    const target = headings[index] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-2', 'ring-offset-2', 'ring-[var(--app-accent)]', 'rounded-md', 'transition-all');
      setTimeout(() => {
        target.classList.remove('ring-2', 'ring-offset-2', 'ring-[var(--app-accent)]', 'rounded-md');
      }, 1500);
    }
  };

  // Pure Legal Document Print Generator (Zero app chrome, pure formatted text and headings)
  const handlePrintDocument = () => {
    if (!currentDoc) return;

    // Get current HTML content from editor or fallback to currentDoc
    const bodyContent = editorRef.current?.innerHTML || currentDoc.content || '<p>Sem anotações.</p>';

    // Format date in Portuguese
    const docDate = new Date(currentDoc.lastModified || Date.now()).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const subjectName = getSubjectDisplayName(currentDoc.subject);

    // Reuse or create properly sized off-screen iframe (1024px width avoids collapsed 0x0 layout bugs)
    let printFrame = document.getElementById('study-print-iframe') as HTMLIFrameElement | null;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'study-print-iframe';
      printFrame.style.position = 'fixed';
      printFrame.style.left = '-10000px';
      printFrame.style.top = '0';
      printFrame.style.width = '1024px';
      printFrame.style.height = '100vh';
      printFrame.style.border = '0';
      printFrame.style.opacity = '0';
      printFrame.style.pointerEvents = 'none';
      document.body.appendChild(printFrame);
    } else {
      printFrame.style.position = 'fixed';
      printFrame.style.left = '-10000px';
      printFrame.style.top = '0';
      printFrame.style.width = '1024px';
      printFrame.style.height = '100vh';
      printFrame.style.border = '0';
      printFrame.style.opacity = '0';
      printFrame.style.pointerEvents = 'none';
    }

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${currentDoc.title} — ${subjectName}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 20mm 18mm 20mm 18mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Georgia', 'Cambria', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #111827;
            background: #ffffff;
          }
          .header-box {
            border-bottom: 2pt solid #0f172a;
            padding-bottom: 12pt;
            margin-bottom: 18pt;
          }
          .header-pre {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 8.5pt;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #475569;
            font-weight: 700;
            margin-bottom: 6pt;
          }
          .header-badge {
            background: #f1f5f9;
            color: #0f172a;
            padding: 3pt 8pt;
            border-radius: 4pt;
            border: 1pt solid #cbd5e1;
          }
          h1.doc-title {
            font-size: 20pt;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.25;
            margin: 4pt 0 8pt 0;
            font-family: 'Georgia', serif;
          }
          .header-meta {
            font-size: 9pt;
            color: #64748b;
            display: flex;
            gap: 16pt;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .content-body {
            font-size: 11pt;
            color: #1f2937;
          }
          .content-body p {
            margin: 0 0 10pt 0;
            text-align: justify;
          }
          .content-body h1 {
            font-size: 16pt;
            font-weight: 800;
            color: #0f172a;
            margin: 18pt 0 8pt 0;
            page-break-after: avoid;
            break-after: avoid;
          }
          .content-body h2 {
            font-size: 13.5pt;
            font-weight: 700;
            color: #1e293b;
            margin: 14pt 0 6pt 0;
            page-break-after: avoid;
            break-after: avoid;
          }
          .content-body h3 {
            font-size: 12pt;
            font-weight: 700;
            color: #334155;
            margin: 12pt 0 4pt 0;
            page-break-after: avoid;
            break-after: avoid;
          }
          .content-body blockquote {
            margin: 12pt 0;
            padding: 8pt 14pt;
            border-left: 3pt solid #334155;
            background: #f8fafc;
            color: #1e293b;
            font-style: italic;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .content-body table {
            width: 100%;
            border-collapse: collapse;
            margin: 14pt 0;
            page-break-inside: avoid;
            break-inside: avoid;
            font-size: 10pt;
          }
          .content-body th, .content-body td {
            border: 1pt solid #cbd5e1;
            padding: 6pt 10pt;
            text-align: left;
          }
          .content-body th {
            background: #f1f5f9;
            font-weight: bold;
          }
          .content-body ul, .content-body ol {
            margin: 8pt 0 12pt 0;
            padding-left: 20pt;
          }
          .content-body li {
            margin-bottom: 4pt;
          }
          .content-body mark, 
          .content-body [style*="background-color: yellow"], 
          .content-body [style*="background-color: #fef08a"],
          .content-body .hl-amarelo {
            background-color: #fef08a !important;
            color: #713f12 !important;
            padding: 1pt 3pt;
          }
          .content-body .hl-verde {
            background-color: #bbf7d0 !important;
            color: #14532d !important;
            padding: 1pt 3pt;
          }
          .content-body .hl-roxo {
            background-color: #e9d5ff !important;
            color: #581c87 !important;
            padding: 1pt 3pt;
          }
          .content-body .hl-rosa {
            background-color: #fecdd3 !important;
            color: #881337 !important;
            padding: 1pt 3pt;
          }
          .content-body strong, .content-body b {
            font-weight: 700;
            color: #0f172a;
          }
          .content-body hr {
            border: none;
            border-top: 1pt solid #e2e8f0;
            margin: 16pt 0;
          }
          .footer-box {
            margin-top: 28pt;
            padding-top: 10pt;
            border-top: 1pt solid #cbd5e1;
            font-size: 8.5pt;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            font-family: system-ui, -apple-system, sans-serif;
            page-break-before: auto;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-pre">
            <span class="header-badge">${subjectName} • OAB 48</span>
            <span>PLATAFORMA DE ESTUDOS JURÍDICOS</span>
          </div>
          <h1 class="doc-title">${currentDoc.title}</h1>
          <div class="header-meta">
            <span>📅 Data: ${docDate}</span>
            <span>✍️ Extensão: ${currentDoc.wordCount || 0} palavras</span>
            <span>📚 Nível: ${currentDoc.level ? currentDoc.level.toUpperCase() : 'GERAL'}</span>
          </div>
        </div>

        <div class="content-body">
          ${bodyContent}
        </div>

        <div class="footer-box">
          <span>Caderno de Estudos Jurídicos • Preparatório Exame de Ordem</span>
          <span>Impresso em ${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(printHtml);
    frameDoc.close();

    setTimeout(() => {
      printFrame?.contentWindow?.focus();
      printFrame?.contentWindow?.print();
    }, 250);
  };

  const handleToggleCompleteLinkedTask = () => {
    if (!linkedScheduleItem) return;
    cycleScheduleStatus(linkedScheduleItem.id);
    showToast(
      linkedScheduleItem.status === 'concluido'
        ? 'Meta reaberta no cronograma.'
        : `Parabéns! Meta marcada como Concluída no cronograma ${profile.examTarget}.`
    );
  };

  const subjectColor = currentDoc
    ? getSubjectColor(currentDoc.subject)
    : { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };

  // Filtered schedule items by search term
  const filterSchedule = (items: ScheduleItem[]) => {
    if (!searchDoc.trim()) return items;
    const q = searchDoc.toLowerCase();
    return items.filter((it) => it.topic.toLowerCase().includes(q) || it.subject.toLowerCase().includes(q));
  };

  // Filtered documents by search term
  const filteredDocuments = useMemo(() => {
    if (!searchDoc.trim()) return documents;
    const q = searchDoc.toLowerCase();
    return documents.filter((d) => d.title.toLowerCase().includes(q) || d.subject.toLowerCase().includes(q));
  }, [documents, searchDoc]);

  // Studied notebooks (wordCount > 10 or linked to completed schedule item)
  const studiedDocuments = useMemo(() => {
    return documents.filter((d) => {
      const isCompletedInSchedule = schedule.some(
        (s) => s.status === 'concluido' && (s.topic === d.title || d.title.includes(s.topic))
      );
      return (d.wordCount && d.wordCount > 10) || isCompletedInSchedule;
    });
  }, [documents, schedule]);

  return (
    <div
      className={`flex h-[calc(100vh-6.5rem)] glass-panel rounded-3xl overflow-hidden shadow-2xl transition-all w-full relative ${
        zenMode ? 'fixed inset-3 z-50 h-[calc(100vh-1.5rem)] rounded-2xl bg-slate-950/95 backdrop-blur-2xl' : ''
      }`}
    >
      {/* ========================================================= */}
      {/* LEFT SIDEBAR: AGENDA DO CADERNO & ORGANIZAÇÃO             */}
      {/* ========================================================= */}
      {!zenMode && (
        <div
          className={`border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-black backdrop-blur-md flex flex-col shrink-0 transition-all duration-300 print:hidden ${
            sidebarCollapsed ? 'w-16 items-center' : 'w-full md:w-88'
          } ${showDocListMobile ? 'block' : 'hidden md:flex'}`}
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-200/80 dark:border-white/10 space-y-3 w-full bg-slate-50/50 dark:bg-black">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2 w-full py-1">
                {/* Top Expand Button in Collapsed Mode */}
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 text-slate-400 hover:text-theme-accent dark:hover:text-theme-accent rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Expandir agenda lateral"
                >
                  <PanelLeftOpen className="w-4.5 h-4.5" />
                </button>

                {/* New Study Button */}
                <button
                  type="button"
                  onClick={() => setIsNewStudyModalOpen(true)}
                  className="w-10 h-10 p-0 mx-auto bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-theme-accent"
                  title="Iniciar Novo Estudo (Metas de Hoje ou Atrasadas)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-theme-accent-tint border border-theme-accent/30 text-theme-accent">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-xs truncate">
                      Agenda do Caderno
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                      {profile.examTarget} • {completedCount}/{schedule.length} ({progressPct}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Button "Novo": Opens Priority Picker Modal */}
                  <button
                    type="button"
                    onClick={() => setIsNewStudyModalOpen(true)}
                    className="bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 px-3 py-1.5 transition-all cursor-pointer shadow-theme-accent"
                    title="Iniciar Novo Estudo (Metas de Hoje ou Atrasadas)"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Novo</span>
                  </button>

                  {/* Sidebar Collapse Toggle */}
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Recolher agenda lateral"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {!sidebarCollapsed && (
              <>
                {/* Filter Tabs: Hoje, Atrasados, Futuros, Já Estudados, Todos */}
                <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setScheduleFilter('hoje')}
                    className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer ${
                      scheduleFilter === 'hoje'
                        ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Hoje</span>
                    <span className="text-[9px] px-1 bg-theme-accent-tint rounded-full font-mono text-theme-accent">
                      {todayItems.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleFilter('atrasados')}
                    className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer ${
                      scheduleFilter === 'atrasados'
                        ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Atraso</span>
                    <span className="text-[9px] px-1 bg-theme-accent-tint rounded-full font-mono text-theme-accent">
                      {delayedItems.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleFilter('futuros')}
                    className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer ${
                      scheduleFilter === 'futuros'
                        ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Futuros</span>
                    <span className="text-[9px] px-1 bg-theme-accent-tint rounded-full font-mono text-theme-accent">
                      {upcomingItems.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleFilter('estudados')}
                    className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer ${
                      scheduleFilter === 'estudados'
                        ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Estudos</span>
                    <span className="text-[9px] px-1 bg-theme-accent-tint rounded-full font-mono text-theme-accent">
                      {studiedDocuments.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleFilter('todos')}
                    className={`py-1.5 rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer ${
                      scheduleFilter === 'todos'
                        ? 'bg-white dark:bg-black text-theme-accent shadow-xs border border-theme-accent/30'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Todos</span>
                    <span className="text-[9px] px-1 bg-theme-accent-tint rounded-full font-mono text-theme-accent">
                      {documents.length}
                    </span>
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar tópico ou matéria..."
                    value={searchDoc}
                    onChange={(e) => setSearchDoc(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent"
                  />
                </div>
              </>
            )}
          </div>

          {/* List Content in Expanded Mode */}
          {!sidebarCollapsed ? (
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/30 dark:bg-black">
              {/* Filter 1: Hoje */}
              {scheduleFilter === 'hoje' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent px-2 block">
                    🎯 Metas Programadas para Hoje:
                  </span>
                  {filterSchedule(todayItems).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhuma meta programada para hoje.
                    </div>
                  ) : (
                    filterSchedule(todayItems).map((item) => {
                      const subColor = getSubjectColor(item.subject);
                      const isDone = item.status === 'concluido';
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleStartStudy(item.topic, item.subject)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            linkedScheduleItem?.id === item.id
                              ? 'bg-theme-accent-tint/15 border-theme-accent text-theme-accent shadow-xs'
                              : 'bg-white/60 dark:bg-zinc-950/80 border-slate-200/70 dark:border-white/10 hover:border-theme-accent/40 hover:bg-white dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                            >
                              {getSubjectDisplayName(item.subject)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-theme-accent font-bold flex items-center gap-1">
                                {isDone ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Concluído</span>
                                  </>
                                ) : (
                                  <span>{item.durationMinutes} min</span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScheduleItem(item.id);
                                }}
                                title="Excluir meta de hoje"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {item.topic}
                          </h4>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Filter 2: Atrasados */}
              {scheduleFilter === 'atrasados' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent px-2 block">
                    ⚠️ Metas Pendentes em Atraso:
                  </span>
                  {filterSchedule(delayedItems).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Parabéns! Nenhuma meta em atraso.
                    </div>
                  ) : (
                    filterSchedule(delayedItems).map((item) => {
                      const subColor = getSubjectColor(item.subject);
                      const priority = getPriorityBadge(item.priority);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleStartStudy(item.topic, item.subject)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            linkedScheduleItem?.id === item.id
                              ? 'bg-theme-accent-tint/15 border-theme-accent text-theme-accent shadow-xs'
                              : 'bg-white/60 dark:bg-zinc-950/80 border-slate-200/70 dark:border-white/10 hover:border-theme-accent/40 hover:bg-white dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                            >
                              {getSubjectDisplayName(item.subject)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-theme-accent font-bold">
                                Venceu {formatDateShort(item.date)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScheduleItem(item.id);
                                }}
                                title="Excluir meta em atraso"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {item.topic}
                          </h4>
                          <span className={`inline-block text-[9px] font-semibold mt-1 px-1.5 py-0.2 rounded border ${priority.color}`}>
                            Prioridade {priority.label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Filter 3: Futuros */}
              {scheduleFilter === 'futuros' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent px-2 block">
                    🚀 Próximas Metas para Adiantar:
                  </span>
                  {filterSchedule(upcomingItems).length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhuma meta futura cadastrada.
                    </div>
                  ) : (
                    filterSchedule(upcomingItems).map((item) => {
                      const subColor = getSubjectColor(item.subject);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleStartStudy(item.topic, item.subject)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            linkedScheduleItem?.id === item.id
                              ? 'bg-theme-accent-tint/15 border-theme-accent text-theme-accent shadow-xs'
                              : 'bg-white/60 dark:bg-zinc-950/80 border-slate-200/70 dark:border-white/10 hover:border-theme-accent/40 hover:bg-white dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                            >
                              {getSubjectDisplayName(item.subject)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-slate-400">
                                {formatDateShort(item.date)}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScheduleItem(item.id);
                                }}
                                title="Excluir meta futura"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {item.topic}
                          </h4>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Filter 4: Já Estudados */}
              {scheduleFilter === 'estudados' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-theme-accent px-2 block">
                    ✅ Arquivos e Cadernos Já Estudados:
                  </span>
                  {studiedDocuments.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Nenhum estudo concluído ainda. Inicie seu primeiro resumo!
                    </div>
                  ) : (
                    studiedDocuments.map((doc) => {
                      const isSelected = currentDoc?.id === doc.id;
                      const subColor = getSubjectColor(doc.subject);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => selectDoc(doc.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-theme-accent-tint/15 border-theme-accent text-theme-accent shadow-xs'
                              : 'bg-white/60 dark:bg-zinc-950/80 border-slate-200/70 dark:border-white/10 hover:border-theme-accent/40 hover:bg-white dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                            >
                              {getSubjectDisplayName(doc.subject)}
                            </span>
                            <span className="text-[10px] text-theme-accent font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{doc.wordCount || 0} pal.</span>
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
                            {doc.title}
                          </h4>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Filter 5: Todos os Cadernos */}
              {scheduleFilter === 'todos' && (
                <div className="space-y-1.5">
                  {filteredDocuments.map((doc) => {
                    const isSelected = currentDoc?.id === doc.id;
                    const subColor = getSubjectColor(doc.subject);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => selectDoc(doc.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-theme-accent-tint/15 border-theme-accent text-theme-accent shadow-xs'
                            : 'bg-white/60 dark:bg-zinc-950/80 border-slate-200/70 dark:border-white/10 hover:border-theme-accent/40 hover:bg-white dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                          >
                            {getSubjectDisplayName(doc.subject)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.wordCount || 0} pal.
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug truncate">
                          {doc.title}
                        </h4>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* COLLAPSED ICON STRIP: SHOWS NOTEBOOK ICONS & EXPAND BTN   */
            /* ========================================================= */
            <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col items-center gap-2 w-full bg-slate-50/50 dark:bg-black">
              {/* Stack of Caderno Icons */}
              {documents.map((doc) => {
                const isSelected = currentDoc?.id === doc.id;
                return (
                  <div key={doc.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => selectDoc(doc.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-theme-accent text-white shadow-theme-accent scale-105'
                          : 'bg-white/80 dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-theme-accent/50'
                      }`}
                      title={doc.title}
                    >
                      <BookMarked className="w-5 h-5 shrink-0" />
                    </button>

                    {/* Tooltip on hover showing title and subject */}
                    <div className="fixed left-20 ml-3 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/10 space-y-0.5">
                      <span className="text-[9px] font-bold text-theme-accent uppercase block">
                        {getSubjectDisplayName(doc.subject)}
                      </span>
                      <p className="font-bold">{doc.title}</p>
                      <span className="text-[10px] text-zinc-400 block">
                        {doc.wordCount || 0} palavras
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Expand Button */}
              <div className="mt-auto pt-2 border-t border-slate-200/60 dark:border-white/10 w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
                  title="Expandir agenda lateral"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* RIGHT MAIN WORKSPACE: LUXURY LEGAL PAPER WORKSTATION      */}
      {/* ========================================================= */}
      {currentDoc ? (
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
          {/* Top Advancement Banner & Title (Hidden in Zen Mode) */}
          {!zenMode && (
            <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowDocListMobile(!showDocListMobile)}
                  className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                  {/* Visual Demarcation Tag */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {studyTimelineStatus === 'atrasado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ASSUNTO EM ATRASO</span>
                      </span>
                    )}

                    {studyTimelineStatus === 'hoje' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <Target className="w-3 h-3" />
                        <span>ASSUNTO DO DIA • HOJE</span>
                      </span>
                    )}

                    {studyTimelineStatus === 'adiantado' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                        <Rocket className="w-3 h-3" />
                        <span>TÓPICO ADIANTADO</span>
                      </span>
                    )}

                    {studyTimelineStatus === 'concluido' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>META CONCLUÍDA NO CRONOGRAMA</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                      • {profile.examTarget} ({formatDateShort(profile.targetExamDate)}) • {completedCount}/{schedule.length} concluídos ({progressPct}%)
                    </span>
                  </div>

                  {/* Document Title Input */}
                  <input
                    type="text"
                    value={currentDoc.title}
                    onChange={handleTitleChange}
                    className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white border-none bg-transparent hover:bg-white/50 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-indigo-400 px-2 py-0.5 rounded-lg transition-colors w-full"
                    placeholder="Título do Caderno de Estudo..."
                  />
                </div>
              </div>

              {/* Actions, Spaced Revision Quick Pills & Complete Goal Button */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                {/* Quick Revision Pills (D+1, D+7, D+30) */}
                <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-slate-200/60 dark:border-white/10 text-[11px]">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase px-1">
                    Revisão:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickToggleRevision('D1')}
                    title={`Revisão 24h (D+1) • ${revisionDates.d1} (Amanhã)`}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                      linkedScheduleItem?.revisionD1
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    24h {linkedScheduleItem?.revisionD1 ? '✓' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickToggleRevision('D7')}
                    title={`Revisão 7 Dias (D+7) • ${revisionDates.d7} (Em 1 semana)`}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                      linkedScheduleItem?.revisionD7
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    7d {linkedScheduleItem?.revisionD7 ? '✓' : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickToggleRevision('D30')}
                    title={`Revisão 30 Dias (D+30) • ${revisionDates.d30} (Em 1 mês)`}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                      linkedScheduleItem?.revisionD30
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    30d {linkedScheduleItem?.revisionD30 ? '✓' : ''}
                  </button>
                </div>

                {/* Finalizar Estudo & Revisão Espaçada (Palpável) */}
                <button
                  type="button"
                  onClick={openRevisionModal}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    linkedScheduleItem?.status === 'concluido'
                      ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-500/25'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                  }`}
                  title="Finalizar este estudo e calibrar as datas de revisão espaçada (24h, 7d, 30d)"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {linkedScheduleItem?.status === 'concluido' ? 'Concluído • Ajustar Revisão' : 'Finalizar & Revisar'}
                  </span>
                </button>

                {/* View in Bookshelf Shortcut */}
                <button
                  type="button"
                  onClick={() => setActiveTab('biblioteca')}
                  title="Ver este estudo na prateleira de livros da Biblioteca 3D"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Na Estante</span>
                </button>

                {/* Zen Focus Mode Button */}
                <button
                  type="button"
                  onClick={() => setZenMode(true)}
                  title="Modo Foco Sem Distrações"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Foco</span>
                </button>

                {/* Print / PDF */}
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  title="Imprimir / Exportar PDF de Estudo (Documento Limpo & Formatado)"
                  className="p-2 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Delete with Confirmation Dialog */}
                <button
                  type="button"
                  onClick={() => setDocToDelete(currentDoc)}
                  title="Excluir Caderno de Estudo"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TOOLBAR: FORMATTING, HIGHLIGHTERS, LEGAL CARDS & OUTLINE  */}
          {/* ========================================================= */}
          <div
            className={`relative z-20 border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-1.5 shrink-0 text-slate-700 dark:text-slate-300 backdrop-blur-md transition-all print:hidden ${
              zenMode
                ? 'bg-black/90 border-zinc-800 shadow-xl sticky top-0 z-30'
                : 'bg-white/80 dark:bg-black'
            }`}
          >
            {/* Left Group: Word-style formatting tools */}
            <div className="flex items-center flex-wrap gap-1">
              {zenMode && (
                <button
                  type="button"
                  onClick={() => setZenMode(false)}
                  className="px-2.5 py-1.5 mr-2 rounded-xl bg-theme-accent-tint hover:opacity-90 text-theme-accent border border-theme-accent/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Sair do Modo Foco (Esc)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Sair do Foco (Esc)</span>
                </button>
              )}

              {/* Undo / Redo */}
              <button
                type="button"
                onClick={() => execCmd('undo')}
                title="Desfazer (Ctrl+Z)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('redo')}
                title="Refazer (Ctrl+Y)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

              {/* Headings: H1, H2, H3, Quote, Normal */}
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<h1>')}
                title="Título Principal (H1)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 font-black cursor-pointer"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<h2>')}
                title="Subtítulo Jurídico (H2)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 font-bold cursor-pointer"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<h3>')}
                title="Seção / Item (H3)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 font-semibold cursor-pointer"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<blockquote>')}
                title="Citação / Jurisprudência (Recuo ABNT)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('formatBlock', '<p>')}
                title="Parágrafo Normal"
                className="px-2 py-1 text-xs rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 font-medium cursor-pointer"
              >
                Normal
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

              {/* Basic Styles: Bold, Italic, Underline, Strikethrough, Sub/Sup */}
              <button
                type="button"
                onClick={() => execCmd('bold')}
                title="Negrito (Ctrl+B)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('italic')}
                title="Itálico (Ctrl+I)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('underline')}
                title="Sublinhado (Ctrl+U)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('strikeThrough')}
                title="Tachado"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('subscript')}
                title="Subscrito (ex: H₂O)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Subscript className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('superscript')}
                title="Sobrescrito (ex: 1º, X²)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Superscript className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

              {/* Font Color Picker Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowTextColorMenu(!showTextColorMenu);
                    setShowHighlighterMenu(false);
                  }}
                  title="Cor da Fonte"
                  className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 flex items-center gap-1 cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-theme-accent" />
                </button>

                {showTextColorMenu && (
                  <div className="absolute top-full left-0 mt-1.5 p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-40 w-48 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase px-1 block">
                      Cor do Texto:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 p-1">
                      <button
                        type="button"
                        onClick={() => applyTextColor('#000000')}
                        className="w-7 h-7 rounded-lg bg-black border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                        title="Preto Puro"
                      />
                      <button
                        type="button"
                        onClick={() => applyTextColor('#ffffff')}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-300 cursor-pointer hover:scale-110 transition-transform"
                        title="Branco Puro"
                      />
                      <button
                        type="button"
                        onClick={() => applyTextColor('var(--app-accent)')}
                        className="w-7 h-7 rounded-lg bg-theme-accent border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                        title="Cor Destaque Atual"
                      />
                      <button
                        type="button"
                        onClick={() => applyTextColor('#dc2626')}
                        className="w-7 h-7 rounded-lg bg-red-600 border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                        title="Vermelho"
                      />
                      <button
                        type="button"
                        onClick={() => applyTextColor('#2563eb')}
                        className="w-7 h-7 rounded-lg bg-blue-600 border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                        title="Azul Forense"
                      />
                      <button
                        type="button"
                        onClick={() => applyTextColor('#16a34a')}
                        className="w-7 h-7 rounded-lg bg-emerald-600 border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                        title="Verde"
                      />
                      <button
                        type="button"
                        onClick={() => applyTextColor('#d97706')}
                        className="w-7 h-7 rounded-lg bg-amber-600 border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                        title="Dourado"
                      />
                      <button
                        type="button"
                        onClick={() => applyTextColor('#7c3aed')}
                        className="w-7 h-7 rounded-lg bg-purple-600 border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                        title="Roxo"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Text Highlighters Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowHighlighterMenu(!showHighlighterMenu);
                    setShowTextColorMenu(false);
                  }}
                  title="Marcador de Texto OAB"
                  className="px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Marca-Texto</span>
                </button>

                {showHighlighterMenu && (
                  <div className="absolute top-full left-0 mt-1.5 p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 z-40 w-52 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase px-1 block">
                      Marcadores OAB:
                    </span>
                    <button
                      type="button"
                      onClick={() => applyHighlight('#fef08a')}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-200 cursor-pointer"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-300 border border-amber-400" />
                      <span>Amarelo (Doutrina / Regra)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHighlight('#bbf7d0')}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 cursor-pointer"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-300 border border-emerald-400" />
                      <span>Verde (Artigo de Lei / Prazos)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHighlight('#e9d5ff')}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-800 dark:text-purple-200 cursor-pointer"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-purple-300 border border-purple-400" />
                      <span>Roxo (Súmula / Jurisprudência)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHighlight('#fecdd3')}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-200 cursor-pointer"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-300 border border-rose-400" />
                      <span>Rosa (Atenção FGV / Exceção)</span>
                    </button>
                    <div className="border-t border-slate-100 dark:border-white/5 my-1" />
                    <button
                      type="button"
                      onClick={() => applyHighlight('clear')}
                      className="w-full text-left px-2 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      Remover Destaque
                    </button>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

              {/* Direct Paragraph Alignment */}
              <button
                type="button"
                onClick={() => execCmd('justifyLeft')}
                title="Alinhar à Esquerda"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyCenter')}
                title="Centralizar"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyRight')}
                title="Alinhar à Direita"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyFull')}
                title="Justificar"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

              {/* Lists: Bullets, Numbers, Checklist */}
              <button
                type="button"
                onClick={() => execCmd('insertUnorderedList')}
                title="Lista com Marcadores"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('insertOrderedList')}
                title="Lista Numerada"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={insertChecklist}
                title="Inserir Checklist / Tarefa"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              {/* Indent / Outdent */}
              <button
                type="button"
                onClick={() => execCmd('outdent')}
                title="Diminuir Recuo"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Outdent className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('indent')}
                title="Aumentar Recuo"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Indent className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

              {/* Insert Table & Horizontal Rule & Date Stamp */}
              <button
                type="button"
                onClick={insertTable}
                title="Inserir Tabela Jurídica (Word)"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCmd('insertHorizontalRule')}
                title="Inserir Linha Divisória"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={insertDateStamp}
                title="Carimbo de Data Atual"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={clearFormatting}
                title="Limpar Formatação"
                className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 cursor-pointer"
              >
                <RemoveFormatting className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

              {/* 1-Click Legal Cards Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBlocksMenu(!showBlocksMenu)}
                  title="Inserir Blocos de Estudo Jurídico"
                  className="px-2.5 py-1 bg-theme-accent-tint hover:opacity-90 text-theme-accent rounded-lg text-xs font-bold flex items-center gap-1.5 border border-theme-accent/30 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Blocos OAB</span>
                </button>

                {showBlocksMenu && (
                  <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 p-3 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-slate-300 dark:border-zinc-700 z-50 w-72 sm:w-80 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                        Modelos de Doutrina e Lei OAB:
                      </span>
                      <span className="text-[9px] text-theme-accent font-semibold">1 clique para inserir</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        insertLegalCallout('lei');
                        setShowBlocksMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                        <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="font-bold block">Artigo de Lei & Dispositivo</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Citação de código, artigo e caput</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        insertLegalCallout('jurisprudencia');
                        setShowBlocksMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                        <Quote className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <span className="font-bold block">Súmula STF/STJ & Jurisprudência</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Precedentes qualificados e temas</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        insertLegalCallout('oab');
                        setShowBlocksMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <span className="font-bold block">Alerta FGV & Pegadinha da Prova</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Exceções e armadilhas recorrentes</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        insertLegalCallout('mnemonico');
                        setShowBlocksMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-bold block">Mnemônico & Macete OAB</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Técnicas de fixação rápida</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        insertLegalCallout('doutrina');
                        setShowBlocksMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                        <BookMarked className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                      </div>
                      <div>
                        <span className="font-bold block">Doutrina Majoritária vs Minoritária</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Conceitos clássicos e divergências</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        insertLegalCallout('comparativo');
                        setShowBlocksMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                        <Columns2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <span className="font-bold block">Quadro Comparativo (A vs B)</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">Tabela lado a lado para diferenciação</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Group: Typography, Dynamic Outline & Status */}
            <div className="flex items-center gap-2">
              {/* Typography Controls */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTypographyMenu(!showTypographyMenu)}
                  title="Configurações de Tipografia e Formatação da Página"
                  className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <Type className="w-4 h-4" />
                  <span className="hidden md:inline">Tipografia</span>
                </button>

                {showTypographyMenu && (
                  <div className="absolute top-full right-0 mt-1.5 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-40 w-64 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1.5">
                        Fonte Jurídica:
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => setFontFamily('serif')}
                          className={`px-2 py-1 rounded text-xs font-serif ${
                            fontFamily === 'serif'
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200'
                          }`}
                        >
                          Serif
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontFamily('sans')}
                          className={`px-2 py-1 rounded text-xs font-sans ${
                            fontFamily === 'sans'
                              ? 'bg-theme-accent text-white font-bold'
                              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200'
                          }`}
                        >
                          Sans
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontFamily('mono')}
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            fontFamily === 'mono'
                              ? 'bg-theme-accent text-white font-bold'
                              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200'
                          }`}
                        >
                          Mono
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1.5">
                        Tamanho do Texto:
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setFontSize('sm')}
                          className={`py-1 rounded ${
                            fontSize === 'sm'
                              ? 'bg-theme-accent text-white'
                              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200'
                          }`}
                        >
                          A-
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontSize('base')}
                          className={`py-1 rounded ${
                            fontSize === 'base'
                              ? 'bg-theme-accent text-white'
                              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200'
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontSize('lg')}
                          className={`py-1 rounded ${
                            fontSize === 'lg'
                              ? 'bg-theme-accent text-white'
                              : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200'
                          }`}
                        >
                          A+
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1.5">
                        Alinhamento da Folha:
                      </span>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setTextAlign('left')}
                          className={`p-1.5 flex justify-center rounded ${
                            textAlign === 'left' ? 'bg-theme-accent text-white' : 'bg-slate-100 dark:bg-white/5'
                          }`}
                          title="Alinhar à Esquerda"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTextAlign('center')}
                          className={`p-1.5 flex justify-center rounded ${
                            textAlign === 'center' ? 'bg-theme-accent text-white' : 'bg-slate-100 dark:bg-white/5'
                          }`}
                          title="Centralizado"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTextAlign('right')}
                          className={`p-1.5 flex justify-center rounded ${
                            textAlign === 'right' ? 'bg-theme-accent text-white' : 'bg-slate-100 dark:bg-white/5'
                          }`}
                          title="Alinhar à Direita"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTextAlign('justify')}
                          className={`p-1.5 flex justify-center rounded ${
                            textAlign === 'justify' ? 'bg-theme-accent text-white' : 'bg-slate-100 dark:bg-white/5'
                          }`}
                          title="Justificado (Padrão Forense)"
                        >
                          <AlignJustify className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/5 pt-2">
                      <label className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                        <span>Margem Guia Vermelha:</span>
                        <input
                          type="checkbox"
                          checked={showMarginGuide}
                          onChange={(e) => setShowMarginGuide(e.target.checked)}
                          className="rounded text-theme-accent focus:ring-theme-accent cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Outline (Sumário) Toggle Button */}
              <button
                type="button"
                onClick={() => setShowOutline(!showOutline)}
                title="Abrir Sumário Dinâmico dos Tópicos"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  showOutline
                    ? 'bg-theme-accent text-white'
                    : 'hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                }`}
              >
                <ListTree className="w-4 h-4" />
                <span className="hidden lg:inline">Sumário</span>
                {outlineHeadings.length > 0 && (
                  <span className="text-[10px] px-1 bg-white/20 rounded-full font-mono">
                    {outlineHeadings.length}
                  </span>
                )}
              </button>

              {/* Auto-save Status Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 pl-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSaving
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  }`}
                />
                <span>{isSaving ? 'Salvando...' : 'Salvo'}</span>
              </div>

              {isVaultConnected && (
                <button
                  type="button"
                  onClick={syncNowToVault}
                  title={`Sincronizado no cofre Obsidian "${vaultName}". Clique para sincronizar agora.`}
                  className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/25 hover:bg-purple-500/20 transition-all cursor-pointer"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isVaultSyncing ? 'bg-amber-400 animate-ping' : 'bg-purple-500'
                    }`}
                  />
                  <span>{isVaultSyncing ? 'Obsidian...' : 'Obsidian Sync'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* DOCUMENT SHEET CANVAS AREA & OPTIONAL DYNAMIC OUTLINE     */}
          {/* ========================================================= */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Scrollable Paper Canvas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-100/50 dark:bg-black">
              <div
                className="w-full max-w-4xl min-h-[920px] rounded-2xl relative transition-all text-slate-900 dark:text-slate-100 legal-parchment-sheet shadow-2xl printable-notebook-sheet print:shadow-none print:border-none print:m-0 print:p-0"
              >
                {/* Genuine Notebook Red Margin Guide Line (Strictly to the left of all text) */}
                {showMarginGuide && (
                  <div className="print:hidden">
                    <div className="absolute top-0 bottom-0 left-14 sm:left-20 w-[1.5px] bg-red-500/40 dark:bg-red-500/35 pointer-events-none z-10" />
                    {/* Authentic notebook perforations in the left margin gutter */}
                    <div className="absolute top-12 left-4 sm:left-6 flex flex-col gap-28 pointer-events-none opacity-20 dark:opacity-15">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-700 dark:border-slate-300" />
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-700 dark:border-slate-300" />
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-700 dark:border-slate-300" />
                    </div>
                  </div>
                )}

                {/* Inner Sheet Content Container: Strictly starts past the red line */}
                <div
                  className={`p-6 sm:p-12 transition-all print:p-0 print:m-0 ${
                    showMarginGuide ? 'pl-20 sm:pl-28' : 'pl-6 sm:pl-12'
                  }`}
                >
                  {/* Parchment Top Header & Metadata */}
                  <div className="mb-6 pb-4 border-b border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 print:border-b-2 print:border-black print:text-black">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-md font-semibold border ${subjectColor.bg} ${subjectColor.text} ${subjectColor.border} print:border-none print:bg-transparent print:text-black print:font-bold print:p-0`}
                      >
                        {getSubjectDisplayName(currentDoc.subject)}
                      </span>
                      <select
                        value={currentDoc.subject}
                        onChange={handleSubjectChange}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-md px-2 py-0.5 focus:outline-none cursor-pointer print:hidden"
                      >
                        {LAW_SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {getSubjectDisplayName(s)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono print:text-black">
                      <span className="hidden sm:inline text-theme-accent font-bold print:text-black">
                        EXAME DE ORDEM XLVIII
                      </span>
                      <span>•</span>
                      <span>{currentDoc.wordCount || 0} palavras</span>
                      <span className="print:hidden">•</span>
                      <span className="print:hidden">~{Math.ceil((currentDoc.wordCount || 1) / 180)} min de leitura</span>
                    </div>
                  </div>

                  {/* Title Highlight Display (Estilo Título Destacado) */}
                  <div className="mb-6 pb-2 border-b-2 border-theme-accent/30 print:border-b-2 print:border-black">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-theme-accent block mb-1 print:text-black">
                      Assunto em Estudo • OAB 48
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight print:text-black print:text-2xl">
                      {currentDoc.title}
                    </h2>
                  </div>

                  {/* Dynamic Outline (Sumário Interativo na Folha - Oculto na Impressão) */}
                  {outlineHeadings.length > 0 && (
                    <div className="mb-6 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-950/80 not-prose print:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                          <ListTree className="w-3.5 h-3.5 text-theme-accent" />
                          Sumário do Caderno ({outlineHeadings.length} seções)
                        </span>
                        <span className="text-[10px] text-slate-400">Clique para navegar diretamente na folha</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {outlineHeadings.map((h, i) => (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => handleScrollToHeading(i)}
                            className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-black border border-slate-200/80 dark:border-white/10 hover:border-theme-accent text-slate-700 dark:text-slate-200 hover:text-theme-accent transition-all cursor-pointer font-medium flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="text-[10px] font-mono text-theme-accent font-bold">§{i + 1}</span>
                            <span className="truncate max-w-[220px]">{h.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vertical Running Content Editable Document */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className={`printable-notebook-content outline-none min-h-[700px] space-y-4 selection:bg-[var(--app-accent)] selection:text-white transition-all print:min-h-0 print:space-y-3 ${
                      fontFamily === 'serif'
                        ? 'font-serif leading-loose'
                        : fontFamily === 'mono'
                        ? 'font-mono leading-relaxed'
                        : 'font-sans leading-relaxed'
                    } ${
                      fontSize === 'sm'
                        ? 'text-sm'
                        : fontSize === 'lg'
                        ? 'text-lg'
                        : 'text-base'
                    } ${
                      textAlign === 'justify'
                        ? 'text-justify'
                        : textAlign === 'center'
                        ? 'text-center'
                        : textAlign === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                    style={{ minHeight: '700px' }}
                  />

                  {/* Bottom Stationery Sign-off */}
                  <div className="mt-14 pt-6 border-t border-slate-200/60 dark:border-white/10 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 print:hidden">
                    <div className="flex items-center gap-2">
                      <BookMarked className="w-3.5 h-3.5 text-theme-accent" />
                      <span>Caderno Jurídico OAB 48 • Sincronizado com Cronograma</span>
                    </div>
                    <div className="font-mono text-[11px]">
                      {lastSavedTime ? `Última sincronização às ${lastSavedTime}` : 'Sincronizado automaticamente'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Outline Drawer (Right Floating Sidebar) */}
            {showOutline && (
              <div className="w-72 border-l border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md p-4 flex flex-col shrink-0 transition-all z-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10 mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                    <ListTree className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Sumário do Estudo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOutline(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {outlineHeadings.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                      <p>Nenhum título identificado ainda.</p>
                      <p className="text-[10px]">
                        Utilize os botões <strong>H1</strong> e <strong>H2</strong> na barra de ferramentas para criar seções no estudo!
                      </p>
                    </div>
                  ) : (
                    outlineHeadings.map((heading) => (
                      <button
                        key={heading.id}
                        type="button"
                        onClick={() => handleScrollToHeading(heading.id)}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-colors hover:bg-indigo-500/10 cursor-pointer ${
                          heading.level === 'h1'
                            ? 'font-bold text-slate-900 dark:text-white pl-2'
                            : 'font-medium text-slate-600 dark:text-slate-300 pl-5 text-[11px]'
                        }`}
                      >
                        <span className="truncate block">{heading.text}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
            Nenhum caderno selecionado
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Selecione uma meta da rotina de hoje na barra lateral para começar a estudar.
          </p>
          <button
            onClick={() => setIsNewStudyModalOpen(true)}
            className="px-4 py-2 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-theme-accent cursor-pointer"
          >
            Iniciar Novo Estudo
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INICIAR NOVO ESTUDO (HOJE, ATRASADOS OU LIVRE)     */}
      {/* ========================================================= */}
      {isNewStudyModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Iniciar Novo Estudo no Caderno
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecione uma meta prioritária do {profile.examTarget} ou crie um caderno livre
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewStudyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Section 1: Metas de Hoje (Prioridade 1) */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>🎯 Metas de Hoje ({todayItems.length}) • Prioridade Recomendada</span>
                </span>

                {todayItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic pl-2">Nenhuma meta programada para hoje.</p>
                ) : (
                  <div className="space-y-1.5">
                    {todayItems.map((item) => {
                      const subColor = getSubjectColor(item.subject);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleStartStudy(item.topic, item.subject)}
                          className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-all cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                            >
                              {getSubjectDisplayName(item.subject)}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                              {item.topic}
                            </h4>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-xl shrink-0">
                            Estudar Agora
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Metas em Atraso (Prioridade Máxima) */}
              {delayedItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>⚠️ Metas em Atraso ({delayedItems.length}) • Regularização Urgente</span>
                  </span>

                  <div className="space-y-1.5">
                    {delayedItems.slice(0, 3).map((item) => {
                      const subColor = getSubjectColor(item.subject);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleStartStudy(item.topic, item.subject)}
                          className="p-3 rounded-2xl border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 transition-all cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                            >
                              {getSubjectDisplayName(item.subject)}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                              {item.topic}
                            </h4>
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono">
                              Venceu em {formatDateShort(item.date)}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 bg-rose-600 text-white text-[11px] font-bold rounded-xl shrink-0">
                            Colocar em Dia
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Criar Caderno Livre */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  ✍️ Ou Crie um Caderno Livre Personalizado:
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Assunto / Tópico do Estudo:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Recursos no CPC, Crimes Contra a Vida, Teoria da Pena..."
                    value={freeTitle}
                    onChange={(e) => setFreeTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Matéria Jurídica:
                    </label>
                    <select
                      value={freeSubject}
                      onChange={(e) => setFreeSubject(e.target.value as LawSubject)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
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

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        const title = freeTitle.trim() || 'Meu Resumo Jurídico';
                        handleStartStudy(title, freeSubject);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer whitespace-nowrap"
                    >
                      Criar Caderno
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FINALIZAR ESTUDO & REVISÃO ESPAÇADA (24H / 7D / 30D) */}
      {/* ========================================================= */}
      {isRevisionModalOpen && currentDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-theme-accent-tint border border-theme-accent/30 text-theme-accent">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Finalizar Estudo & Ciclo de Revisão
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Defina o ciclo de repetição espaçada na curva de Ebbinghaus
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Topic Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-white/10">
              <span className="text-[10px] font-bold text-theme-accent uppercase tracking-wider block">
                {getSubjectDisplayName(currentDoc.subject)}
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {currentDoc.title}
              </h4>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-1">
                {currentDoc.wordCount || 0} palavras escritas neste caderno
              </span>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                1. Nível de Dificuldade & Retenção do Conteúdo:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDifficultyChange('facil')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    revisionDifficulty === 'facil'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'border-slate-200 dark:border-white/10 hover:border-emerald-500/40 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🟢</span>
                  <span className="text-xs font-bold block">Fácil</span>
                  <span className="text-[10px] opacity-80 block">Dispensar D+1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultyChange('medio')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    revisionDifficulty === 'medio'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'border-slate-200 dark:border-white/10 hover:border-amber-500/40 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🟡</span>
                  <span className="text-xs font-bold block">Médio</span>
                  <span className="text-[10px] opacity-80 block">Ciclo Completo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultyChange('dificil')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    revisionDifficulty === 'dificil'
                      ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'border-slate-200 dark:border-white/10 hover:border-rose-500/40 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="text-lg block mb-0.5">🔴</span>
                  <span className="text-xs font-bold block">Difícil</span>
                  <span className="text-[10px] opacity-80 block">Reforço Urgente</span>
                </button>
              </div>
            </div>

            {/* Spaced Intervals Checklist with Calculated Dates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                2. Datas de Revisão Espaçada (Curva do Esquecimento):
              </label>
              <div className="space-y-2">
                {/* D+1 */}
                <label className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  revisionD1
                    ? 'border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/5'
                    : 'border-slate-200 dark:border-white/10 opacity-70'
                }`}>
                  <input
                    type="checkbox"
                    checked={revisionD1}
                    onChange={(e) => setRevisionD1(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Revisão de 24 Horas (D+1)
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {revisionDates.d1} (Amanhã)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      Revisão imediata de 15 minutos para bloquear a perda rápida de memória recente.
                    </span>
                  </div>
                </label>

                {/* D+7 */}
                <label className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  revisionD7
                    ? 'border-blue-500/50 bg-blue-500/10 dark:bg-blue-500/5'
                    : 'border-slate-200 dark:border-white/10 opacity-70'
                }`}>
                  <input
                    type="checkbox"
                    checked={revisionD7}
                    onChange={(e) => setRevisionD7(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Revisão de 7 Dias (D+7)
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {revisionDates.d7} (Em 1 semana)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      Fixação das teses principais, artigos de lei e jurisprudência sumulada.
                    </span>
                  </div>
                </label>

                {/* D+30 */}
                <label className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  revisionD30
                    ? 'border-purple-500/50 bg-purple-500/10 dark:bg-purple-500/5'
                    : 'border-slate-200 dark:border-white/10 opacity-70'
                }`}>
                  <input
                    type="checkbox"
                    checked={revisionD30}
                    onChange={(e) => setRevisionD30(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        Revisão de 30 Dias (D+30)
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                        {revisionDates.d30} (Em 1 mês)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      Resolução de questões práticas e consolidação na memória de longo prazo para a prova.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevisionAndCompletion}
                className="px-5 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-bold transition-all shadow-theme-accent flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Conclusão & Agendar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DO CADERNO                     */}
      {/* ========================================================= */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Excluir Caderno de Estudo?
                </h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Esta ação não pode ser desfeita
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Tem certeza de que deseja excluir permanentemente o caderno{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{docToDelete.title}"</strong>?
              O texto e seu respectivo livro serão removidos da biblioteca e do acervo.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const matchingSchedule = schedule.find(
                    (s) =>
                      s.topic.toLowerCase().trim() === docToDelete.title.toLowerCase().trim() ||
                      docToDelete.title.toLowerCase().includes(s.topic.toLowerCase())
                  );
                  deleteDocument(docToDelete.id);
                  if (matchingSchedule) {
                    deleteScheduleItem(matchingSchedule.id);
                  }
                  setDocToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 cursor-pointer"
              >
                Sim, Excluir Caderno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
