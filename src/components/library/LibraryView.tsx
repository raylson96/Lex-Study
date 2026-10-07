import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { LawSubject, StudyLevel, LibraryCategory } from '../../types';
import { convertMarkdownToHtml } from '../../utils/markdown';
import {
  BookOpen,
  Search,
  Plus,
  Scale,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Scroll,
  BookMarked,
  Edit3,
  X,
  FileText,
  Clock,
  Trash2,
  Library,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderSync,
} from 'lucide-react';

const LAW_SUBJECTS: LawSubject[] = [
  'Direito Constitucional',
  'Ética Profissional (OAB)',
  'Direito Penal',
  'Direito Civil',
  'Processo Civil',
  'Direito Administrativo',
  'Direito Tributário',
  'Direito do Trabalho',
  'Processo do Trabalho',
  'Direitos Humanos',
  'Direito Empresarial',
  'Geral / Outros',
];

// Aesthetic Spine Colors & Cover Styling per Law Subject
interface SubjectSpineTheme {
  displayName: string;
  shortName: string;
  icon: string;
  spineGradient: string;
  coverGradient: string;
  borderColor: string;
  ribbonColor: string;
  accentText: string;
}

// Classical Ornate Brass Corner Bracket for Hardcover Book
const GoldCorner = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`w-6 h-6 text-amber-300/85 pointer-events-none absolute z-20 ${className || ''}`}
  >
    <path
      d="M2 2H13C13 8.075 8.075 13 2 13V2Z"
      stroke="currentColor"
      strokeWidth="1.2"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M2 2L10 10M2 6C6 6 6 2 6 2M2 10C10 10 10 2 10 2"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    <circle cx="4" cy="4" r="1.2" fill="currentColor" />
  </svg>
);

const SUBJECT_SPINE_THEMES: Record<string, SubjectSpineTheme> = {
  'Direito Constitucional': {
    displayName: 'DIREITO CONSTITUCIONAL',
    shortName: 'CONSTITUCIONAL',
    icon: '🏛️',
    spineGradient: 'from-[#420914] via-[#631021] to-[#30050e]',
    coverGradient: 'from-[#450914] via-[#28040b] to-[#150205]',
    borderColor: 'border-amber-400/60',
    ribbonColor: 'bg-amber-400',
    accentText: 'text-rose-200',
  },
  'Ética Profissional (OAB)': {
    displayName: 'ÉTICA PROFISSIONAL (OAB)',
    shortName: 'ÉTICA',
    icon: '⚖️',
    spineGradient: 'from-[#3d1e07] via-[#5c2f0e] to-[#281303]',
    coverGradient: 'from-[#3f1f08] via-[#241103] to-[#120801]',
    borderColor: 'border-amber-300/70',
    ribbonColor: 'bg-amber-300',
    accentText: 'text-amber-200',
  },
  'Direito Civil': {
    displayName: 'DIREITO CIVIL',
    shortName: 'CIVIL',
    icon: '📜',
    spineGradient: 'from-[#0b291e] via-[#134433] to-[#081e16]',
    coverGradient: 'from-[#0e3325] via-[#092017] to-[#040e0a]',
    borderColor: 'border-emerald-400/60',
    ribbonColor: 'bg-emerald-400',
    accentText: 'text-emerald-200',
  },
  'Processo Civil': {
    displayName: 'PROCESSO CIVIL',
    shortName: 'P. CIVIL',
    icon: '⚖️',
    spineGradient: 'from-[#0e273c] via-[#153f60] to-[#0a1c2b]',
    coverGradient: 'from-[#11314b] via-[#0b1f30] to-[#050e16]',
    borderColor: 'border-sky-400/60',
    ribbonColor: 'bg-sky-400',
    accentText: 'text-sky-200',
  },
  'Direito Penal': {
    displayName: 'DIREITO PENAL',
    shortName: 'PENAL',
    icon: '🛡️',
    spineGradient: 'from-[#2e0b14] via-[#481220] to-[#22080f]',
    coverGradient: 'from-[#330c16] via-[#1e070d] to-[#0f0306]',
    borderColor: 'border-red-400/60',
    ribbonColor: 'bg-red-400',
    accentText: 'text-red-200',
  },
  'Processo Penal': {
    displayName: 'PROCESSO PENAL',
    shortName: 'P. PENAL',
    icon: '⚔️',
    spineGradient: 'from-[#2a133d] via-[#431f61] to-[#1c0d29]',
    coverGradient: 'from-[#2f1545] via-[#1d0d2b] to-[#0d0614]',
    borderColor: 'border-purple-400/60',
    ribbonColor: 'bg-purple-400',
    accentText: 'text-purple-200',
  },
  'Direito Administrativo': {
    displayName: 'DIREITO ADMINISTRATIVO',
    shortName: 'ADMINISTRATIVO',
    icon: '🏢',
    spineGradient: 'from-[#3c2a08] via-[#5c400d] to-[#281c05]',
    coverGradient: 'from-[#422e09] via-[#261b05] to-[#120d02]',
    borderColor: 'border-yellow-400/60',
    ribbonColor: 'bg-yellow-400',
    accentText: 'text-amber-200',
  },
  'Direito Tributário': {
    displayName: 'DIREITO TRIBUTÁRIO',
    shortName: 'TRIBUTÁRIO',
    icon: '💰',
    spineGradient: 'from-[#102d28] via-[#19453e] to-[#0a1e1b]',
    coverGradient: 'from-[#133630] via-[#0b211e] to-[#050f0e]',
    borderColor: 'border-teal-400/60',
    ribbonColor: 'bg-teal-400',
    accentText: 'text-teal-200',
  },
  'Direito do Trabalho': {
    displayName: 'DIREITO DO TRABALHO',
    shortName: 'TRABALHO',
    icon: '🔨',
    spineGradient: 'from-[#3d1808] via-[#5e250c] to-[#2b1106]',
    coverGradient: 'from-[#431a09] via-[#260f05] to-[#130702]',
    borderColor: 'border-orange-400/60',
    ribbonColor: 'bg-orange-400',
    accentText: 'text-orange-200',
  },
  'Processo do Trabalho': {
    displayName: 'PROCESSO DO TRABALHO',
    shortName: 'P. TRABALHO',
    icon: '📑',
    spineGradient: 'from-[#3d240c] via-[#5a3512] to-[#261708]',
    coverGradient: 'from-[#41270d] via-[#251607] to-[#120b03]',
    borderColor: 'border-amber-400/60',
    ribbonColor: 'bg-amber-400',
    accentText: 'text-amber-200',
  },
  'Direitos Humanos': {
    displayName: 'DIREITOS HUMANOS',
    shortName: 'D. HUMANOS',
    icon: '🕊️',
    spineGradient: 'from-[#0e3133] via-[#164d50] to-[#092122]',
    coverGradient: 'from-[#10383a] via-[#0a2324] to-[#041011]',
    borderColor: 'border-cyan-400/60',
    ribbonColor: 'bg-cyan-400',
    accentText: 'text-cyan-200',
  },
  'Direito Empresarial': {
    displayName: 'DIREITO EMPRESARIAL',
    shortName: 'EMPRESARIAL',
    icon: '💼',
    spineGradient: 'from-[#1e1b4b] via-[#312e81] to-[#17153a]',
    coverGradient: 'from-[#221f55] via-[#151336] to-[#090817]',
    borderColor: 'border-indigo-400/60',
    ribbonColor: 'bg-indigo-400',
    accentText: 'text-indigo-200',
  },
};

const DEFAULT_SPINE_THEME: SubjectSpineTheme = {
  displayName: 'DIREITO GERAL',
  shortName: 'GERAL',
  icon: '📚',
  spineGradient: 'from-[#1a1a20] via-[#2b2b35] to-[#121216]',
  coverGradient: 'from-[#1a1a20] via-[#121216] to-[#09090b]',
  borderColor: 'border-amber-400/40',
  ribbonColor: 'bg-amber-400',
  accentText: 'text-amber-200',
};

// Level ordering & badges
const LEVEL_CONFIG: Record<
  StudyLevel,
  { label: string; roman: string; badge: string; color: string; order: number }
> = {
  basico: {
    label: 'Básico',
    roman: 'VOL. I • BÁSICO',
    badge: '🥉 Nível 1 - Básico (Fundamentos)',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    order: 1,
  },
  intermediario: {
    label: 'Intermediário',
    roman: 'VOL. II • INTERMED.',
    badge: '🥈 Nível 2 - Intermediário (Doutrina)',
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    order: 2,
  },
  avancado: {
    label: 'Avançado',
    roman: 'VOL. III • AVANÇADO',
    badge: '🥇 Nível 3 - Avançado (Súmulas & OAB)',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    order: 3,
  },
};

// Logical Page Structure for Notebook Reading
interface LogicalStudyPage {
  pageNumber: number;
  sectionTitle: string;
  htmlContent: string;
}

// Splits study HTML logically by chapters/headings (Sumário) or keeps as complete cohesive chapter
function extractLogicalPages(htmlContent: string, defaultTitle: string): LogicalStudyPage[] {
  if (!htmlContent || !htmlContent.trim()) {
    return [
      {
        pageNumber: 1,
        sectionTitle: defaultTitle || 'Anotações Gerais',
        htmlContent: '<p>Sem anotações registradas neste caderno ainda.</p>',
      },
    ];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));

    if (headings.length > 0) {
      const pages: LogicalStudyPage[] = [];
      const children = Array.from(doc.body.children);

      let currentSectionTitle = headings[0].textContent?.trim() || defaultTitle;
      let currentSectionNodes: Element[] = [];
      let pageIndex = 1;

      children.forEach((child) => {
        const isHeading = ['H1', 'H2', 'H3'].includes(child.tagName);
        if (isHeading && currentSectionNodes.length > 0) {
          const tempDiv = document.createElement('div');
          currentSectionNodes.forEach((n) => tempDiv.appendChild(n.cloneNode(true)));
          pages.push({
            pageNumber: pageIndex++,
            sectionTitle: currentSectionTitle,
            htmlContent: tempDiv.innerHTML,
          });
          currentSectionNodes = [];
          currentSectionTitle = child.textContent?.trim() || `Capítulo ${pageIndex}`;
        } else if (isHeading && currentSectionNodes.length === 0) {
          currentSectionTitle = child.textContent?.trim() || `Capítulo ${pageIndex}`;
        }
        currentSectionNodes.push(child);
      });

      if (currentSectionNodes.length > 0) {
        const tempDiv = document.createElement('div');
        currentSectionNodes.forEach((n) => tempDiv.appendChild(n.cloneNode(true)));
        pages.push({
          pageNumber: pageIndex,
          sectionTitle: currentSectionTitle,
          htmlContent: tempDiv.innerHTML,
        });
      }

      if (pages.length > 0) return pages;
    }
  } catch (err) {
    console.error('Erro ao estruturar páginas do livro:', err);
  }

  // Fallback: If no headings are present, keep as one comprehensive chapter (Fundamentos)
  return [
    {
      pageNumber: 1,
      sectionTitle: defaultTitle || 'Capítulo 1 • Fundamentos & Resumo Integral',
      htmlContent: htmlContent,
    },
  ];
}

// Book Item derived from Caderno or Doctrinal Library
interface BookItem {
  id: string;
  docId?: string;
  title: string;
  subject: LawSubject;
  level: StudyLevel;
  content: string;
  wordCount: number;
  lastModified: string;
  tags: string[];
  author?: string;
  edition?: string;
  source?: 'oab' | 'doutrina' | 'obsidian';
  category?: string;
}

export const LibraryView: React.FC = () => {
  const {
    documents,
    library,
    addLibraryItem,
    deleteLibraryItem,
    clearAllDocuments,
    deleteDocument,
    setActiveTab,
    setCurrentDocId,
    createDocument,
    profile,
    theme,
    subjects,
    getSubjectDisplayName,
    showToast,
    isVaultConnected,
    isVaultSyncing,
    pullFromVault,
    connectObsidianVault,
  } = useApp();

  // Mode Switcher: OAB Notebooks vs Doctrinal Vault
  const [libraryMode, setLibraryMode] = useState<'oab' | 'doutrina'>(() => {
    return (localStorage.getItem('lexstudy_lib_mode_v2') as any) || 'oab';
  });

  useEffect(() => {
    localStorage.setItem('lexstudy_lib_mode_v2', libraryMode);
  }, [libraryMode]);

  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('lexstudy_lib_search_v2') || '';
  });
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>(() => {
    return localStorage.getItem('lexstudy_lib_subject_filter_v2') || 'todas';
  });

  useEffect(() => {
    localStorage.setItem('lexstudy_lib_search_v2', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem('lexstudy_lib_subject_filter_v2', selectedSubjectFilter);
  }, [selectedSubjectFilter]);

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [inspectingCoverBook, setInspectingCoverBook] = useState<BookItem | null>(null);

  // Expanded Shelf Modal (when a shelf has many books or user clicks "Ver mais")
  const [expandedShelfCategory, setExpandedShelfCategory] = useState<{
    id: string;
    title: string;
    books: BookItem[];
  } | null>(null);
  const [expandedSearchTerm, setExpandedSearchTerm] = useState('');

  const [isNewDoctrinalModalOpen, setIsNewDoctrinalModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocAuthor, setNewDocAuthor] = useState('');
  const [newDocSubject, setNewDocSubject] = useState<LawSubject>('Direito Civil');
  const [newDocCategory, setNewDocCategory] = useState<LibraryCategory>('Manuais');
  const [newDocEdition, setNewDocEdition] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  // Delete Confirmation Dialog
  const [bookToDelete, setBookToDelete] = useState<{ id: string; title: string; mode: 'oab' | 'doutrina' } | null>(null);

  // Clear Demo Confirmation Dialog
  const [isClearDemoDialogOpen, setIsClearDemoDialogOpen] = useState(false);

  // Reader state
  const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageTurnDirection, setPageTurnDirection] = useState<'forward' | 'backward' | null>(null);
  const [isFocusDimmed, setIsFocusDimmed] = useState(false);
  const verticalScrollRef = useRef<HTMLDivElement>(null);

  // 1. OAB Study Notebooks
  const oabBooks: BookItem[] = useMemo(() => {
    return documents.map((doc) => {
      let level: StudyLevel = doc.level || 'basico';
      if (!doc.level) {
        const titleLower = doc.title.toLowerCase();
        if (
          titleLower.includes('controle') ||
          titleLower.includes('ações') ||
          titleLower.includes('súmulas') ||
          titleLower.includes('recursos') ||
          titleLower.includes('disciplinar') ||
          titleLower.includes('patrimônio')
        ) {
          level = 'avancado';
        } else if (
          titleLower.includes('prerrogativas') ||
          titleLower.includes('delito') ||
          titleLower.includes('contratos') ||
          titleLower.includes('tutelas') ||
          titleLower.includes('atos') ||
          titleLower.includes('art.')
        ) {
          level = 'intermediario';
        }
      }

      return {
        id: doc.id,
        docId: doc.id,
        title: doc.title,
        subject: doc.subject,
        level,
        content: doc.content,
        wordCount: doc.wordCount || 150,
        lastModified: doc.lastModified,
        tags: doc.tags || [],
        source: 'oab',
        author: 'Fichamento OAB',
        edition: 'Resumo de Estudos',
      };
    });
  }, [documents]);

  // 2. Doctrinal Books & Obsidian Vault
  const doctrinalBooks: BookItem[] = useMemo(() => {
    return library.map((item) => {
      const htmlContent = item.markdownContent
        ? convertMarkdownToHtml(item.markdownContent)
        : item.content || `<p>${item.summary}</p>`;

      const words = item.markdownContent
        ? item.markdownContent.trim().split(/\s+/).length
        : item.summary.split(/\s+/).length;

      return {
        id: item.id,
        title: item.title,
        subject: item.subject,
        level: 'avancado',
        content: htmlContent,
        wordCount: words,
        lastModified: item.createdAt || '2026-10-06T10:00:00Z',
        tags: item.importantArticles ? ['Legislação', ...item.importantArticles] : ['Doutrina'],
        author: item.author || 'Doutrina Consagrada',
        edition: item.edition || 'Edição Consolidada',
        source: item.source || 'doutrina',
        category: item.category,
      };
    });
  }, [library]);

  const activeBooks = libraryMode === 'oab' ? oabBooks : doctrinalBooks;

  // Arrange books into complete shelves
  const shelves = useMemo(() => {
    let filtered: BookItem[] = [];

    activeBooks.forEach((book) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches =
          book.title.toLowerCase().includes(term) ||
          book.subject.toLowerCase().includes(term) ||
          (book.author && book.author.toLowerCase().includes(term)) ||
          book.tags.some((t) => t.toLowerCase().includes(term));
        if (!matches) return;
      }

      if (selectedSubjectFilter !== 'todas' && book.subject !== selectedSubjectFilter) {
        return;
      }

      filtered.push(book);
    });

    if (filtered.length === 0) return [];

    // If single subject filtered
    if (selectedSubjectFilter !== 'todas') {
      const theme = SUBJECT_SPINE_THEMES[selectedSubjectFilter] || DEFAULT_SPINE_THEME;
      return [
        {
          id: 'shelf-filtered',
          title: `§ ${theme.icon} ${getSubjectDisplayName(selectedSubjectFilter as LawSubject)}`,
          subtitle: `${filtered.length} volumes organizados`,
          books: filtered,
        },
      ];
    }

    if (libraryMode === 'oab') {
      const PUBLIC_SUBJECTS = [
        'Direito Constitucional',
        'Direito Administrativo',
        'Ética Profissional (OAB)',
        'Direito Tributário',
        'Direitos Humanos',
        'Direito Ambiental',
      ];
      const CIVIL_SUBJECTS = ['Direito Civil', 'Processo Civil', 'Direito Empresarial'];

      const shelf1 = filtered.filter((b) => PUBLIC_SUBJECTS.includes(b.subject));
      const shelf2 = filtered.filter((b) => CIVIL_SUBJECTS.includes(b.subject));
      const shelf3 = filtered.filter(
        (b) => !PUBLIC_SUBJECTS.includes(b.subject) && !CIVIL_SUBJECTS.includes(b.subject)
      );

      const result: { id: string; title: string; subtitle: string; books: BookItem[] }[] = [];

      if (shelf1.length > 0) {
        result.push({
          id: 'shelf-publico',
          title: 'Direito Público & Deontologia',
          subtitle: `${shelf1.length} ${shelf1.length === 1 ? 'caderno' : 'cadernos'}`,
          books: shelf1,
        });
      }

      if (shelf2.length > 0) {
        result.push({
          id: 'shelf-civil',
          title: 'Direito Privado & Negocial',
          subtitle: `${shelf2.length} ${shelf2.length === 1 ? 'caderno' : 'cadernos'}`,
          books: shelf2,
        });
      }

      if (shelf3.length > 0) {
        result.push({
          id: 'shelf-penal-trabalho',
          title: 'Ciências Criminais & Sociais',
          subtitle: `${shelf3.length} ${shelf3.length === 1 ? 'caderno' : 'cadernos'}`,
          books: shelf3,
        });
      }

      return result;
    } else {
      // Doutrina: exatamente 3 degraus (Códigos, Manuais, Jurisprudências)
      const isCodigo = (b: BookItem) =>
        b.category === 'Códigos' ||
        b.category === 'Constituição' ||
        /código|constituição|estatuto|vade mecum|legislação|decreto-lei|lei\b/i.test(b.title);

      const isJurisprudencia = (b: BookItem) =>
        b.category === 'Jurisprudências' ||
        b.category === 'Jurisprudência' ||
        b.category === 'Súmulas' ||
        /súmula|jurisprudência|enunciado|repercussão geral|tese|stf|stj/i.test(b.title);

      const codigosShelf = filtered.filter((b) => isCodigo(b));
      const jurisprudenciasShelf = filtered.filter((b) => !isCodigo(b) && isJurisprudencia(b));
      const manuaisShelf = filtered.filter((b) => !isCodigo(b) && !isJurisprudencia(b));

      const titleCodigos = profile.customLabels?.shelfCodigos || 'Códigos';
      const titleManuais = profile.customLabels?.shelfManuais || 'Manuais';
      const titleJurisprudencias = profile.customLabels?.shelfJurisprudencias || 'Jurisprudências';

      return [
        {
          id: 'shelf-codigos',
          title: titleCodigos,
          subtitle: `${codigosShelf.length} ${codigosShelf.length === 1 ? 'volume' : 'volumes'}`,
          books: codigosShelf,
        },
        {
          id: 'shelf-manuais',
          title: titleManuais,
          subtitle: `${manuaisShelf.length} ${manuaisShelf.length === 1 ? 'volume' : 'volumes'}`,
          books: manuaisShelf,
        },
        {
          id: 'shelf-jurisprudencias',
          title: titleJurisprudencias,
          subtitle: `${jurisprudenciasShelf.length} ${jurisprudenciasShelf.length === 1 ? 'volume' : 'volumes'}`,
          books: jurisprudenciasShelf,
        },
      ];
    }
  }, [activeBooks, searchTerm, selectedSubjectFilter, libraryMode, profile.customLabels]);

  // Logical pages for currently open book
  const logicalPages = useMemo(() => {
    if (!selectedBook) return [];
    return extractLogicalPages(selectedBook.content, selectedBook.title);
  }, [selectedBook]);

  // Reset page when book changes
  useEffect(() => {
    setCurrentPageIndex(0);
    setPageTurnDirection(null);
  }, [selectedBook?.id]);

  const handleNextPage = () => {
    if (currentPageIndex < logicalPages.length - 1) {
      setPageTurnDirection('forward');
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setPageTurnDirection('backward');
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (pageTurnDirection) {
      const timer = setTimeout(() => setPageTurnDirection(null), 400);
      return () => clearTimeout(timer);
    }
  }, [pageTurnDirection]);

  // Prevent background scroll when cover or reader is open
  useEffect(() => {
    if (selectedBook || inspectingCoverBook || bookToDelete || isClearDemoDialogOpen || expandedShelfCategory || isNewDoctrinalModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBook, inspectingCoverBook, bookToDelete, isClearDemoDialogOpen, expandedShelfCategory, isNewDoctrinalModalOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedShelfCategory) {
          setExpandedShelfCategory(null);
          setExpandedSearchTerm('');
        } else if (inspectingCoverBook) setInspectingCoverBook(null);
        else if (selectedBook) setSelectedBook(null);
        else if (bookToDelete) setBookToDelete(null);
        else if (isClearDemoDialogOpen) setIsClearDemoDialogOpen(false);
        else if (isNewDoctrinalModalOpen) setIsNewDoctrinalModalOpen(false);
      } else if (selectedBook && readingMode === 'horizontal') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') handleNextPage();
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingCoverBook, selectedBook, bookToDelete, isClearDemoDialogOpen, expandedShelfCategory, isNewDoctrinalModalOpen, readingMode, logicalPages.length, currentPageIndex]);

  const handleOpenInEditor = (docId?: string) => {
    if (docId) {
      setCurrentDocId(docId);
      setActiveTab('editor');
    }
  };

  const handleCreateNewBook = () => {
    const newDoc = createDocument('Novo Caderno de Estudo', 'Direito Constitucional');
    setCurrentDocId(newDoc.id);
    setActiveTab('editor');
  };

  // Create new doctrinal work
  const handleCreateDoctrinal = () => {
    if (!newDocTitle.trim()) {
      showToast('Informe o título da obra ou doutrina.', 'info');
      return;
    }

    const htmlContent = convertMarkdownToHtml(newDocContent);
    addLibraryItem({
      title: newDocTitle.trim(),
      author: newDocAuthor.trim() || 'Doutrinador Jurídico',
      subject: newDocSubject,
      category: newDocCategory,
      edition: newDocEdition.trim() || 'Edição 2026',
      summary: newDocContent ? newDocContent.slice(0, 180) + '...' : 'Obra doutrinária cadastrada.',
      markdownContent: newDocContent || `# ${newDocTitle.trim()}\n\nConteúdo doutrinário...`,
      content: htmlContent || `<h1>${newDocTitle.trim()}</h1><p>Conteúdo doutrinário...</p>`,
      source: 'doutrina',
      pinned: true,
    });

    showToast(`Obra "${newDocTitle.trim()}" adicionada à Biblioteca Doutrinária!`);
    setIsNewDoctrinalModalOpen(false);
    setNewDocTitle('');
    setNewDocAuthor('');
    setNewDocEdition('');
    setNewDocContent('');
  };

  // Delete book confirmation
  const handleConfirmDelete = () => {
    if (!bookToDelete) return;

    if (bookToDelete.mode === 'oab') {
      deleteDocument(bookToDelete.id);
      showToast(`Livro "${bookToDelete.title}" excluído da estante.`, 'info');
    } else {
      deleteLibraryItem(bookToDelete.id);
      showToast(`Obra "${bookToDelete.title}" removida da biblioteca.`, 'info');
    }

    if (inspectingCoverBook?.id === bookToDelete.id) {
      setInspectingCoverBook(null);
    }
    if (selectedBook?.id === bookToDelete.id) {
      setSelectedBook(null);
    }

    setBookToDelete(null);
  };

  // Clear all demo notebooks
  const handleClearDemo = () => {
    clearAllDocuments();
    setInspectingCoverBook(null);
    setSelectedBook(null);
    setIsClearDemoDialogOpen(false);
    showToast('Acervo de demonstração limpo com sucesso! Sua estante está pronta para seus novos estudos.', 'info');
  };

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300 pb-4">
      {/* ========================================================= */}
      {/* 1. TOP TOOLBAR BAR: SWITCHER, SEARCH, FILTERS & ACTIONS   */}
      {/* ========================================================= */}
      <div className="glass-panel px-4 py-3 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 border border-slate-200/80 dark:border-white/10">
        {/* Left: Switcher between OAB and Doutrina */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-zinc-900/90 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setLibraryMode('oab')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                libraryMode === 'oab'
                  ? 'bg-theme-accent text-white shadow-theme-accent'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{profile.customLabels?.libraryTabOab || 'OAB'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  libraryMode === 'oab' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10'
                }`}
              >
                {oabBooks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLibraryMode('doutrina')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                libraryMode === 'doutrina'
                  ? 'bg-theme-accent text-white shadow-theme-accent'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>{profile.customLabels?.libraryTabDoutrina || 'Doutrina'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  libraryMode === 'doutrina' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10'
                }`}
              >
                {doctrinalBooks.length}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Search, Filter by Subject, and Minimal Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative min-w-[150px] sm:min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={libraryMode === 'oab' ? 'Buscar no fichamento...' : 'Buscar doutrina ou autor...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent/20"
            />
          </div>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer shrink-0"
          >
            <option
              value="todas"
              style={{
                backgroundColor: theme === 'megapreto' ? '#000000' : theme === 'branco' ? '#ffffff' : '#090d16',
                color: theme === 'branco' ? '#000000' : '#ffffff',
              }}
            >
              Todas as Matérias
            </option>
            {(subjects || LAW_SUBJECTS).map((s) => {
              const count = activeBooks.filter((b) => b.subject === s).length;
              if (count === 0) return null;
              const th = SUBJECT_SPINE_THEMES[s];
              return (
                <option
                  key={s}
                  value={s}
                  style={{
                    backgroundColor: theme === 'megapreto' ? '#000000' : theme === 'branco' ? '#ffffff' : '#090d16',
                    color: theme === 'branco' ? '#000000' : '#ffffff',
                  }}
                >
                  {th ? `${th.icon} ${getSubjectDisplayName(s)}` : `${getSubjectDisplayName(s)}`} ({count})
                </option>
              );
            })}
          </select>

          {/* Actions per Library Mode */}
          {libraryMode === 'oab' ? (
            <div className="flex items-center gap-1.5 shrink-0">
              {oabBooks.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsClearDemoDialogOpen(true)}
                  title="Limpar todos os cadernos de demonstração"
                  className="p-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleCreateNewBook}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-theme-accent cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Caderno</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              {isVaultConnected ? (
                <button
                  type="button"
                  onClick={pullFromVault}
                  disabled={isVaultSyncing}
                  title="Puxar notas e obras de doutrina do Obsidian para a biblioteca"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVaultSyncing ? 'animate-spin' : ''}`} />
                  <span>{isVaultSyncing ? 'Sincronizando...' : 'Sincronizar Obsidian'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={connectObsidianVault}
                  title="Conectar cofre do Obsidian para sincronizar suas obras doutrinárias"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-purple-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0"
                >
                  <FolderSync className="w-3.5 h-3.5 text-purple-500" />
                  <span>Conectar Obsidian</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsNewDoctrinalModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-theme-accent hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all shadow-theme-accent cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Obra</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ESTANTE COMPLETA DE LIVROS (LUXURY HARDCOVER SHELVES)  */}
      {/* ========================================================= */}
      {shelves.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-200/80 dark:border-white/10 space-y-4 max-w-lg mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-theme-accent-tint border border-theme-accent/30 text-theme-accent flex items-center justify-center mx-auto">
            {libraryMode === 'oab' ? <BookOpen className="w-8 h-8" /> : <Library className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {libraryMode === 'oab' ? 'Sua Estante OAB está Limpa!' : 'Nenhuma Obra Doutrinária Cadastrada'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {libraryMode === 'oab'
                ? 'Os livros aparecem aqui automaticamente conforme você estuda os tópicos do seu cronograma no Caderno.'
                : 'Adicione manuais clássicos, códigos ou tratados doutrinários à sua estante.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {libraryMode === 'oab' ? (
              <>
                <button
                  type="button"
                  onClick={handleCreateNewBook}
                  className="px-4 py-2 bg-theme-accent text-white rounded-xl text-xs font-bold shadow-theme-accent cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeiro Caderno</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cronograma')}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Ver Cronograma OAB
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsNewDoctrinalModalOpen(true)}
                className="px-4 py-2 bg-theme-accent text-white rounded-xl text-xs font-bold shadow-theme-accent cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Obra</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-amber-900/60 bg-gradient-to-b from-[#180e09] via-[#24140d] to-[#120a06] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] p-3.5 sm:p-5 space-y-5 relative overflow-hidden">
          {/* Subtle warm overhead library sconce glow */}
          <div className="absolute inset-x-0 top-0 h-48 bg-radial from-amber-500/15 via-amber-700/5 to-transparent pointer-events-none" />

          {/* Subtle vertical classic wood grain lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_46px,rgba(0,0,0,0.5)_46px,rgba(0,0,0,0.5)_48px)]" />

          {/* Shelves Rows */}
          {shelves.map((shelf) => {
            return (
              <div
                key={shelf.id}
                className="relative rounded-2xl bg-black/60 border border-amber-900/40 p-2.5 sm:p-3.5 shadow-2xl backdrop-blur-xs z-10"
              >
                {/* Shelf Plaque Header (Top Brass Engraved Nameplate) */}
                <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-amber-500/20 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 border border-amber-200/60 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    <span className="font-serif uppercase font-extrabold text-amber-200 tracking-widest text-xs flex items-center gap-1.5 drop-shadow-sm">
                      <span>{shelf.title}</span>
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono font-semibold ml-2">
                      ({shelf.books.length} {shelf.books.length === 1 ? 'volume' : 'volumes'})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedShelfCategory({ id: shelf.id, title: shelf.title, books: shelf.books })
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-200 hover:text-amber-100 text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-sm"
                    title="Ver todos os volumes desta estante sem limite de espaço"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ver mais</span>
                    {shelf.books.length > 7 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                        +{shelf.books.length - 7}
                      </span>
                    )}
                  </button>
                </div>

                {/* Books Standing on Shelf (Capped at 7 on the main bookcase) */}
                <div className="relative pt-3 pb-0 overflow-x-auto overflow-y-visible select-none custom-scrollbar">
                  <div className="flex items-end justify-start sm:justify-center gap-2 sm:gap-3 px-3 min-h-[185px] sm:min-h-[205px] overflow-visible pb-0">
                    {shelf.books.slice(0, 7).map((book, bIdx) => {
                      const theme = SUBJECT_SPINE_THEMES[book.subject] || DEFAULT_SPINE_THEME;
                      const levelInfo = LEVEL_CONFIG[book.level];
                      const prevBook = bIdx > 0 ? shelf.books[bIdx - 1] : null;
                      const isNewSubject = !prevBook || prevBook.subject !== book.subject;

                      return (
                        <React.Fragment key={book.id}>
                          {/* Aparador de Livros em Bronze / Brass Bookend */}
                          {isNewSubject && (
                            <div
                              className="flex flex-col items-center justify-end h-38 sm:h-44 px-1 shrink-0 select-none pb-0"
                              title={`Seção: ${getSubjectDisplayName(book.subject)}`}
                            >
                              <div className="w-5 sm:w-6 h-30 sm:h-34 rounded-t-sm bg-gradient-to-b from-[#b45309] via-[#78350f] to-[#291104] border border-amber-400/60 shadow-xl flex flex-col items-center justify-between py-2 px-0.5 relative">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                                <div className="flex flex-col items-center gap-1 my-auto">
                                  <span className="text-[11px] filter drop-shadow-sm">{theme.icon}</span>
                                  <span
                                    className="text-[8px] font-black uppercase text-amber-200 tracking-wider whitespace-nowrap leading-none"
                                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                  >
                                    {getSubjectDisplayName(book.subject)}
                                  </span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                              </div>
                              <div className="w-7 sm:w-8 h-2 bg-gradient-to-r from-[#92400e] via-[#f59e0b] to-[#92400e] rounded-b-xs shadow-md border-t border-amber-300/80" />
                            </div>
                          )}

                          {/* The Book Spine */}
                          <div
                            className="group relative cursor-pointer shrink-0 pb-0 transition-all duration-300 hover:z-30"
                            onClick={() => setInspectingCoverBook(book)}
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-black/95 text-white text-[11px] font-semibold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-white/20 shadow-2xl z-40 max-w-[240px] truncate text-center space-y-0.5">
                              <p className="font-bold truncate">{book.title}</p>
                              {book.author && (
                                <p className="text-[9px] text-amber-300 truncate">✍️ {book.author}</p>
                              )}
                            </div>

                            {/* Lombada Realista */}
                            <div
                              className={`w-9 sm:w-10.5 h-38 sm:h-44 rounded-t-md shadow-2xl bg-gradient-to-r ${theme.spineGradient} border-t-2 border-b-2 border-amber-400/50 relative flex flex-col justify-between py-1.5 px-0.5 transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:scale-[1.04] group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.9),0_0_20px_rgba(251,191,36,0.5)] z-20`}
                              style={{
                                boxShadow:
                                  'inset 2px 0 4px rgba(255,255,255,0.25), inset -3px 0 8px rgba(0,0,0,0.85), 3px 5px 12px rgba(0,0,0,0.6)',
                              }}
                            >
                              {/* Top Golden Ribs & Subject Icon */}
                              <div>
                                <div className="spine-rib w-full mb-0.5" />
                                <div className="spine-rib w-full mb-0.5" />
                                <div className="w-4.5 h-4.5 mx-auto rounded-full border border-amber-400/60 bg-black/40 flex items-center justify-center text-[10px] shadow-inner select-none">
                                  {theme.icon}
                                </div>
                              </div>

                              {/* Inscrição Vertical na Lombada */}
                              <div
                                className="flex-1 flex flex-col items-center justify-center overflow-hidden my-0.5 px-0.5"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                              >
                                {book.author && (
                                  <span className="text-[6.5px] uppercase font-bold text-amber-300/90 tracking-tighter mb-1 truncate max-h-[50px]">
                                    {book.author.split(' ').pop()}
                                  </span>
                                )}
                                <span
                                  className={`uppercase font-black text-amber-100 select-none drop-shadow-md whitespace-nowrap leading-none ${
                                    getSubjectDisplayName(book.subject).length > 10
                                      ? 'text-[7px] sm:text-[7.5px] tracking-normal'
                                      : getSubjectDisplayName(book.subject).length > 7
                                      ? 'text-[8.5px] sm:text-[9px] tracking-wide'
                                      : 'text-[9.5px] sm:text-[10px] tracking-widest'
                                  }`}
                                >
                                  {getSubjectDisplayName(book.subject)}
                                </span>
                              </div>

                              {/* Bottom Ribs, Roman Volume & Bookmark Ribbon */}
                              <div>
                                <span className="text-[7px] font-bold text-amber-300/80 font-mono block text-center mb-0.5 select-none">
                                  {levelInfo.roman.split('•')[0].trim()}
                                </span>
                                <div className="spine-rib w-full" />
                                <div className="spine-rib w-full mt-0.5" />

                                {/* Silk bookmark ribbon hanging below shelf */}
                                <div
                                  className={`w-1.5 h-4 mx-auto ${theme.ribbonColor} shadow-md shadow-black/80 rounded-b-xs transform translate-y-1.5`}
                                />
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {/* Discreet "Ver Mais" Book Spine Card when row has more than 7 books */}
                    {shelf.books.length > 7 && (
                      <div
                        className="group relative cursor-pointer shrink-0 pb-0 transition-all duration-300 hover:z-30"
                        onClick={() =>
                          setExpandedShelfCategory({ id: shelf.id, title: shelf.title, books: shelf.books })
                        }
                        title={`Clique para ver todas as ${shelf.books.length} obras desta estante`}
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-black/95 text-white text-[11px] font-semibold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-amber-400/30 shadow-2xl z-40 text-center">
                          <p className="font-bold text-amber-300">Ver todas as {shelf.books.length} obras</p>
                          <p className="text-[9px] text-zinc-300">Expandir estante completa</p>
                        </div>

                        {/* Elegante Lombada Especial "+X Obras" */}
                        <div
                          className="w-9 sm:w-10.5 h-38 sm:h-44 rounded-t-md shadow-2xl bg-gradient-to-r from-[#2a170e] via-[#451f10] to-[#1c0c05] border-t-2 border-b-2 border-amber-400/60 relative flex flex-col justify-between py-2 px-0.5 transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:scale-[1.04] group-hover:border-amber-300 group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.9),0_0_20px_rgba(251,191,36,0.5)] z-20"
                          style={{
                            boxShadow:
                              'inset 2px 0 4px rgba(255,255,255,0.2), inset -3px 0 8px rgba(0,0,0,0.9), 3px 5px 12px rgba(0,0,0,0.6)',
                          }}
                        >
                          <div>
                            <div className="spine-rib w-full mb-0.5" />
                            <div className="spine-rib w-full mb-0.5" />
                            <div className="w-5 h-5 mx-auto rounded-full border border-amber-400/60 bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-300 font-bold shadow-inner">
                              +{shelf.books.length - 7}
                            </div>
                          </div>

                          <div
                            className="flex-1 flex flex-col items-center justify-center overflow-hidden my-0.5 px-0.5"
                            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                          >
                            <span className="text-[8px] font-black uppercase text-amber-200 tracking-wider whitespace-nowrap drop-shadow-md">
                              VER MAIS • {shelf.books.length} OBRAS
                            </span>
                          </div>

                          <div>
                            <span className="text-[7px] font-bold text-amber-300/80 font-mono block text-center mb-0.5">
                              ACERVO
                            </span>
                            <div className="spine-rib w-full" />
                            <div className="spine-rib w-full mt-0.5" />
                            <div className="w-1.5 h-4 mx-auto bg-amber-400 shadow-md shadow-black/80 rounded-b-xs transform translate-y-1.5" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Physical Oak Shelf Platter */}
                  <div className="w-full h-4 sm:h-5 bg-gradient-to-b from-[#b45309] via-[#78350f] to-[#451a03] border-t-2 border-amber-300/70 shadow-[0_8px_16px_rgba(0,0,0,0.9)] rounded-b-sm relative z-10 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-amber-200/40 opacity-70" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CAPA DE LUXO CENTRALIZADA AO CLICAR NA LOMBADA        */}
      {/* ========================================================= */}
      {inspectingCoverBook && (() => {
        const theme = SUBJECT_SPINE_THEMES[inspectingCoverBook.subject] || DEFAULT_SPINE_THEME;
        const levelInfo = LEVEL_CONFIG[inspectingCoverBook.level];

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setInspectingCoverBook(null);
            }}
          >
            <div className="relative flex flex-col items-center max-w-lg w-full animate-in zoom-in-95 duration-200">
              {/* Top Hint Bar & Close Button */}
              <div className="flex items-center justify-between w-full max-w-[320px] sm:max-w-[360px] mb-2 text-xs text-amber-200/90 font-medium px-1">
                <span className="flex items-center gap-1.5 font-bold text-amber-300">
                  <BookOpen className="w-4 h-4" />
                  <span>Capa da Obra Jurídica</span>
                </span>
                <button
                  type="button"
                  onClick={() => setInspectingCoverBook(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Fechar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* --- A CAPA DE LUXO --- */}
              <div
                onClick={() => {
                  setSelectedBook(inspectingCoverBook);
                  setInspectingCoverBook(null);
                }}
                className={`hardcover-book w-[290px] sm:w-[330px] h-[430px] sm:h-[470px] bg-gradient-to-br ${theme.coverGradient} border-2 ${theme.borderColor} p-6 sm:p-7 text-white shadow-[0_35px_70px_rgba(0,0,0,0.95),0_0_45px_rgba(251,191,36,0.3)] flex flex-col justify-between cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99] select-none`}
                style={{
                  boxShadow:
                    '0 35px 70px -10px rgba(0,0,0,0.95), 0 0 45px rgba(251,191,36,0.25), inset 18px 0 20px -8px rgba(0,0,0,0.9), 6px 0 0 #b45309',
                }}
              >
                {/* 4 Cantoneiras Douradas em Arabesco */}
                <GoldCorner className="top-2.5 left-7" />
                <GoldCorner className="top-2.5 right-2.5 rotate-90" />
                <GoldCorner className="bottom-2.5 right-2.5 rotate-180" />
                <GoldCorner className="bottom-2.5 left-7 -rotate-90" />

                {/* Moldura Dupla em Hot-Stamping Dourado */}
                <div className="absolute inset-2.5 ml-6.5 border border-amber-400/50 rounded-sm pointer-events-none shadow-inner" />
                <div className="absolute inset-3.5 ml-7.5 border border-amber-400/25 rounded-xs pointer-events-none" />

                {/* 1. Selo Superior & Volume */}
                <div className="flex flex-col items-center gap-1.5 pt-2 z-10">
                  <div className="w-11 h-11 rounded-full border-2 border-amber-400/80 bg-gradient-to-b from-amber-400/25 to-amber-700/20 flex items-center justify-center shadow-lg shadow-black/80">
                    <Scale className="w-5 h-5 text-amber-300 drop-shadow" />
                  </div>
                  <span className="text-[10px] font-serif uppercase tracking-widest text-amber-200/90 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 font-bold">
                    {inspectingCoverBook.edition || levelInfo.roman}
                  </span>
                </div>

                {/* 2. A MATÉRIA (Em Destaque Dourado) */}
                <div className="text-center mt-3 z-10 px-2">
                  <h5 className="font-serif uppercase font-black text-sm sm:text-base tracking-[0.22em] gold-foil-title drop-shadow-md leading-relaxed">
                    {getSubjectDisplayName(inspectingCoverBook.subject).toUpperCase()}
                  </h5>
                  {/* Divisor Clássico */}
                  <div className="flex items-center justify-center gap-2 my-2.5 opacity-90">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
                    <span className="text-amber-400 text-xs font-serif">❖</span>
                    <span className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
                  </div>
                </div>

                {/* 3. O ASSUNTO (Destaque Principal Central) */}
                <div className="my-auto py-3 px-3 text-center flex flex-col items-center justify-center z-10 min-h-[100px]">
                  <h4 className="font-serif font-black text-amber-50 text-lg sm:text-xl leading-snug tracking-wide drop-shadow-lg">
                    {inspectingCoverBook.title}
                  </h4>
                  {inspectingCoverBook.author && (
                    <span className="text-xs text-amber-300/90 font-serif italic mt-2 tracking-wide block">
                      {inspectingCoverBook.author}
                    </span>
                  )}
                </div>

                {/* 4. Prompt de Toque */}
                <div className="mt-auto pt-3 border-t border-amber-400/30 text-center z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-xs text-amber-200 font-bold tracking-wide shadow-md">
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Clique na capa para abrir o livro</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ações Abaixo da Capa */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBook(inspectingCoverBook);
                    setInspectingCoverBook(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ler Obra</span>
                </button>

                {inspectingCoverBook.docId && (
                  <button
                    type="button"
                    onClick={() => handleOpenInEditor(inspectingCoverBook.docId)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-white/10"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar no Caderno</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setBookToDelete({
                      id: inspectingCoverBook.id,
                      title: inspectingCoverBook.title,
                      mode: inspectingCoverBook.docId ? 'oab' : 'doutrina',
                    })
                  }
                  className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
                  title="Excluir livro da estante"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* 4. LEITOR ESTILO LIVRO DE VERDADE (CONSULTA & REVISÃO)    */}
      {/* ========================================================= */}
      {selectedBook && (
        <div
          className={`fixed inset-0 z-50 flex flex-col w-screen h-screen transition-all duration-300 ${
            isFocusDimmed ? 'bg-black' : 'bg-slate-950'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBook(null);
          }}
        >
          {/* Full Screen Open Book Container */}
          <div
            className={`w-full h-full flex flex-col overflow-hidden bg-black/95 transition-all duration-300 ${
              isFocusDimmed ? 'ring-1 ring-amber-400/30 shadow-[0_0_90px_rgba(251,191,36,0.2)]' : ''
            }`}
          >
            {/* Book Top Bar */}
            <div className="px-4 py-3 border-b border-amber-500/20 bg-black/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      {getSubjectDisplayName(selectedBook.subject)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${LEVEL_CONFIG[selectedBook.level].color}`}>
                      {selectedBook.edition || LEVEL_CONFIG[selectedBook.level].label}
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5 font-serif">
                    {selectedBook.title}
                  </h2>
                </div>
              </div>

              {/* Reader Controls */}
              <div className="flex items-center gap-2">
                {/* Switch Mode */}
                <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setReadingMode('horizontal')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      readingMode === 'horizontal'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title="Folhear Livro: Páginas com virada realista 3D"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Folhear Livro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReadingMode('vertical')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      readingMode === 'vertical'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title="Rolagem Contínua: Leitura vertical completa"
                  >
                    <Scroll className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Rolagem Contínua</span>
                  </button>
                </div>

                {/* Delete Book from Shelf */}
                <button
                  type="button"
                  onClick={() =>
                    setBookToDelete({
                      id: selectedBook.id,
                      title: selectedBook.title,
                      mode: selectedBook.docId ? 'oab' : 'doutrina',
                    })
                  }
                  title="Excluir livro da estante"
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Focus Dim Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsFocusDimmed(!isFocusDimmed)}
                  title={isFocusDimmed ? 'Ligar luzes externas' : 'Apagar luzes externas para imersão total'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isFocusDimmed
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30'
                      : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {isFocusDimmed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden md:inline">
                    {isFocusDimmed ? 'Luzes Apagadas' : 'Modo Foco'}
                  </span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fechar Leitor (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* --- Reader Body --- */}
            {readingMode === 'horizontal' ? (
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-black/80 p-2 sm:p-4 select-none relative">
                <div className="flex-1 flex items-center justify-center min-h-0 w-full px-2 sm:px-4">
                  {/* Left Page Turn Gutter */}
                  <div className="w-12 sm:w-20 shrink-0 flex items-center justify-center">
                    {currentPageIndex > 0 && (
                      <button
                        type="button"
                        onClick={handlePrevPage}
                        className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all cursor-pointer active:scale-95"
                        title="Página Anterior (Seta Esquerda / PgUp)"
                      >
                        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* Physical Hardcover Book Open Spread */}
                  <div className="relative max-w-4xl w-full h-[calc(100vh-140px)] flex flex-col rounded-2xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)] border-2 border-amber-900/60 bg-[#fffef9] text-slate-900">
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none z-20" />
                    <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/40 via-black/15 to-transparent pointer-events-none z-20" />

                    {/* Page Header */}
                    <div className="px-6 sm:px-10 py-3 border-b border-amber-900/15 flex items-center justify-between text-xs text-slate-500 font-serif shrink-0 bg-[#fbf9f1]/70">
                      <span className="uppercase font-bold tracking-widest text-[10px] text-amber-900/70">
                        {getSubjectDisplayName(selectedBook.subject)} • {selectedBook.title}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-600">
                        Capítulo {currentPageIndex + 1} de {logicalPages.length}
                      </span>
                    </div>

                    {/* Page Body Content */}
                    <div
                      key={currentPageIndex}
                      className={`flex-1 overflow-y-auto px-6 sm:px-12 py-6 sm:py-8 font-serif text-slate-900 leading-relaxed custom-scrollbar ${
                        pageTurnDirection === 'forward'
                          ? 'animate-page-turn-forward'
                          : pageTurnDirection === 'backward'
                          ? 'animate-page-turn-backward'
                          : ''
                      }`}
                    >
                      <div className="max-w-2xl mx-auto space-y-4">
                        <div className="pb-3 border-b border-amber-900/20 mb-4">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-800/80 block">
                            SEÇÃO • PARÁGRAFO §{currentPageIndex + 1}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 mt-0.5 tracking-tight">
                            {logicalPages[currentPageIndex]?.sectionTitle}
                          </h3>
                        </div>

                        <div
                          className="prose prose-slate max-w-none text-slate-900 leading-loose text-sm sm:text-base selection:bg-amber-200"
                          dangerouslySetInnerHTML={{
                            __html: logicalPages[currentPageIndex]?.htmlContent || '',
                          }}
                        />
                      </div>
                    </div>

                    {/* Page Footer */}
                    <div className="px-6 sm:px-10 py-2.5 border-t border-amber-900/15 flex items-center justify-between text-xs text-slate-500 font-serif shrink-0 bg-[#fbf9f1]/70">
                      <span>LexStudy Pro • Leitura Clássica</span>
                      <span className="font-mono font-bold text-amber-950">
                        - {currentPageIndex + 1} -
                      </span>
                    </div>
                  </div>

                  {/* Right Page Turn Gutter */}
                  <div className="w-12 sm:w-20 shrink-0 flex items-center justify-center">
                    {currentPageIndex < logicalPages.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNextPage}
                        className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all cursor-pointer active:scale-95"
                        title="Próxima Página (Seta Direita / PgDown)"
                      >
                        <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Pagination Bar */}
                <div className="py-2 flex items-center justify-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto max-w-md px-2 py-1 bg-black/60 rounded-full border border-white/10">
                    {logicalPages.map((page, idx) => (
                      <button
                        key={page.pageNumber}
                        type="button"
                        onClick={() => {
                          setPageTurnDirection(idx > currentPageIndex ? 'forward' : 'backward');
                          setCurrentPageIndex(idx);
                        }}
                        className={`h-7 px-3 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                          idx === currentPageIndex
                            ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* === MODO ROLAGEM CONTÍNUA VERTICAL === */
              <div
                ref={verticalScrollRef}
                className="flex-1 overflow-y-auto bg-black/85 p-4 sm:p-8 custom-scrollbar"
              >
                <div className="max-w-3xl mx-auto rounded-3xl border-2 border-amber-900/60 bg-[#fffef9] text-slate-900 p-8 sm:p-14 shadow-2xl space-y-10">
                  <div className="pb-6 border-b-2 border-slate-900 text-center space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                      {getSubjectDisplayName(selectedBook.subject)}
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-serif font-black text-slate-950 tracking-tight">
                      {selectedBook.title}
                    </h1>
                    {selectedBook.author && (
                      <p className="text-sm font-serif italic text-amber-900 font-semibold">
                        Por {selectedBook.author}
                      </p>
                    )}
                    <span className="text-xs text-slate-500 font-mono block">
                      {selectedBook.wordCount || 0} palavras • {logicalPages.length} capítulos estruturados
                    </span>
                  </div>

                  {logicalPages.map((page, idx) => (
                    <section key={page.pageNumber} className="space-y-4 pt-4 border-b border-amber-900/10 pb-8">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-900 border border-amber-500/30">
                          § {idx + 1}
                        </span>
                        <h2 className="text-xl font-serif font-bold text-slate-900">
                          {page.sectionTitle}
                        </h2>
                      </div>
                      <div
                        className="prose prose-slate max-w-none text-slate-900 leading-relaxed font-serif text-sm sm:text-base selection:bg-amber-200"
                        dangerouslySetInnerHTML={{ __html: page.htmlContent }}
                      />
                    </section>
                  ))}

                  <div className="pt-6 text-center text-xs text-slate-400 font-serif">
                    Fim do Volume • LexStudy Pro
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: NOVA OBRA DOUTRINÁRIA MANUAL                    */}
      {/* ========================================================= */}
      {isNewDoctrinalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-theme-accent-tint border border-theme-accent/30 text-theme-accent">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Nova Obra Doutrinária
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Cadastre um manual, tratado, código ou resumo na biblioteca
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDoctrinalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Título da Obra:
              </label>
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Ex: Manual de Direito Civil • Volume Único"
                className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Autor / Doutrinador:
                </label>
                <input
                  type="text"
                  value={newDocAuthor}
                  onChange={(e) => setNewDocAuthor(e.target.value)}
                  placeholder="Ex: Prof. Flávio Tartuce"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Volume / Edição:
                </label>
                <input
                  type="text"
                  value={newDocEdition}
                  onChange={(e) => setNewDocEdition(e.target.value)}
                  placeholder="Ex: Edição 2026 • Vol. 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Disciplina Jurídica:
                </label>
                <select
                  value={newDocSubject}
                  onChange={(e) => setNewDocSubject(e.target.value as LawSubject)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white cursor-pointer focus:outline-none"
                >
                  {(subjects || LAW_SUBJECTS).map((s) => (
                    <option key={s} value={s}>
                      {getSubjectDisplayName(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  Categoria:
                </label>
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as LibraryCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white cursor-pointer focus:outline-none"
                >
                  <option value="Códigos">Códigos (Leis & Códigos)</option>
                  <option value="Manuais">Manuais (Doutrina & Teoria)</option>
                  <option value="Jurisprudências">Jurisprudências (Súmulas & Teses)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Conteúdo do Livro (Markdown ou Texto):
              </label>
              <textarea
                rows={7}
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                placeholder="# Capítulo 1 • Introdução&#10;&#10;Escreva ou cole os capítulos da doutrina aqui..."
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 text-xs font-serif text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewDoctrinalModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateDoctrinal}
                className="px-5 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-bold transition-all shadow-theme-accent flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Obra na Estante</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: CONFIRMAR EXCLUSÃO DE LIVRO DA ESTANTE          */}
      {/* ========================================================= */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Excluir da Biblioteca?
                </h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Esta ação não pode ser desfeita
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Tem certeza de que deseja remover permanentemente{' '}
              <strong className="text-slate-900 dark:text-white font-bold">"{bookToDelete.title}"</strong> da
              estante? Todos os textos, anotações e páginas associados serão excluídos.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 cursor-pointer"
              >
                Sim, Excluir Livro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL: CONFIRMAR LIMPEZA DO ACERVO DE DEMONSTRAÇÃO     */}
      {/* ========================================================= */}
      {isClearDemoDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Limpar Acervo de Demonstração?
                </h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Zerar todos os {oabBooks.length} cadernos de exemplo
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              Deseja remover todos os cadernos de estudo iniciais de teste? Sua estante OAB ficará 100% limpa e
              pronta para receber os novos resumos e tópicos que você importar do seu cronograma.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearDemoDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearDemo}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/25 cursor-pointer"
              >
                Sim, Limpar Estante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. MODAL: ESTANTE EXPANDIDA (ACERVO COMPLETO SEM LIMITES) */}
      {/* ========================================================= */}
      {expandedShelfCategory && (() => {
        const filteredExpandedBooks = expandedShelfCategory.books.filter((b) => {
          if (!expandedSearchTerm.trim()) return true;
          const term = expandedSearchTerm.toLowerCase();
          return (
            b.title.toLowerCase().includes(term) ||
            (b.author && b.author.toLowerCase().includes(term)) ||
            b.subject.toLowerCase().includes(term) ||
            b.tags.some((t) => t.toLowerCase().includes(term))
          );
        });

        const CHUNK_SIZE = 7;
        const rows: BookItem[][] = [];
        for (let i = 0; i < filteredExpandedBooks.length; i += CHUNK_SIZE) {
          rows.push(filteredExpandedBooks.slice(i, i + CHUNK_SIZE));
        }

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setExpandedShelfCategory(null);
                setExpandedSearchTerm('');
              }
            }}
          >
            <div className="relative flex flex-col w-full max-w-6xl max-h-[92vh] bg-gradient-to-b from-[#180e09] via-[#24140d] to-[#120a06] border-2 border-amber-900/60 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden">
              {/* Overhead light sconce glow */}
              <div className="absolute inset-x-0 top-0 h-40 bg-radial from-amber-500/15 via-amber-700/5 to-transparent pointer-events-none" />

              {/* Modal Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-amber-500/20 bg-black/50 relative z-10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-amber-200 text-base sm:text-lg tracking-wide flex items-center gap-2">
                      <span>{expandedShelfCategory.title}</span>
                      <span className="text-xs font-mono font-bold text-amber-400/80 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                        {expandedShelfCategory.books.length} {expandedShelfCategory.books.length === 1 ? 'volume' : 'volumes'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-300/70">
                      Acervo completo sem limites • Passe o mouse para detalhes e clique no livro para ler
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative min-w-[180px] sm:min-w-[240px]">
                    <Search className="w-3.5 h-3.5 text-amber-400/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filtrar nesta estante..."
                      value={expandedSearchTerm}
                      onChange={(e) => setExpandedSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-amber-500/30 bg-black/60 text-amber-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-amber-400/40"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setExpandedShelfCategory(null);
                      setExpandedSearchTerm('');
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Fechar (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infinite Shelves Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar relative z-10">
                {rows.length === 0 ? (
                  <div className="p-12 text-center text-amber-300/70 text-sm">
                    Nenhum volume encontrado para "{expandedSearchTerm}".
                  </div>
                ) : (
                  rows.map((rowBooks, rIdx) => (
                    <div
                      key={`expanded-row-${rIdx}`}
                      className="relative rounded-2xl bg-black/50 border border-amber-900/40 p-2.5 sm:p-3.5 shadow-xl"
                    >
                      <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-amber-500/15 px-1">
                        <span className="text-[10px] font-mono text-amber-400/70 uppercase tracking-widest font-bold">
                          Prateleira {rIdx + 1}
                        </span>
                        <span className="text-[10px] text-amber-400/60 font-mono">
                          {rowBooks.length} volumes
                        </span>
                      </div>

                      <div className="relative pt-2 pb-0 overflow-x-auto overflow-y-visible select-none custom-scrollbar">
                        <div className="flex items-end justify-start sm:justify-center gap-2 sm:gap-3 px-3 min-h-[185px] sm:min-h-[205px] overflow-visible pb-0">
                          {rowBooks.map((book, bIdx) => {
                            const theme = SUBJECT_SPINE_THEMES[book.subject] || DEFAULT_SPINE_THEME;
                            const levelInfo = LEVEL_CONFIG[book.level];
                            const prevBook = bIdx > 0 ? rowBooks[bIdx - 1] : null;
                            const isNewSubject = !prevBook || prevBook.subject !== book.subject;

                            return (
                              <React.Fragment key={book.id}>
                                {isNewSubject && (
                                  <div
                                    className="flex flex-col items-center justify-end h-38 sm:h-44 px-1 shrink-0 select-none pb-0"
                                    title={`Seção: ${getSubjectDisplayName(book.subject)}`}
                                  >
                                    <div className="w-5 sm:w-6 h-30 sm:h-34 rounded-t-sm bg-gradient-to-b from-[#b45309] via-[#78350f] to-[#291104] border border-amber-400/60 shadow-xl flex flex-col items-center justify-between py-2 px-0.5 relative">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                                      <div className="flex flex-col items-center gap-1 my-auto">
                                        <span className="text-[11px] filter drop-shadow-sm">{theme.icon}</span>
                                        <span
                                          className="text-[8px] font-black uppercase text-amber-200 tracking-wider whitespace-nowrap leading-none"
                                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                        >
                                          {getSubjectDisplayName(book.subject)}
                                        </span>
                                      </div>
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                                    </div>
                                    <div className="w-7 sm:w-8 h-2 bg-gradient-to-r from-[#92400e] via-[#f59e0b] to-[#92400e] rounded-b-xs shadow-md border-t border-amber-300/80" />
                                  </div>
                                )}

                                <div
                                  className="group relative cursor-pointer shrink-0 pb-0 transition-all duration-300 hover:z-30"
                                  onClick={() => setInspectingCoverBook(book)}
                                >
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-black/95 text-white text-[11px] font-semibold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-white/20 shadow-2xl z-40 max-w-[240px] truncate text-center space-y-0.5">
                                    <p className="font-bold truncate">{book.title}</p>
                                    {book.author && (
                                      <p className="text-[9px] text-amber-300 truncate">✍️ {book.author}</p>
                                    )}
                                  </div>

                                  <div
                                    className={`w-9 sm:w-10.5 h-38 sm:h-44 rounded-t-md shadow-2xl bg-gradient-to-r ${theme.spineGradient} border-t-2 border-b-2 border-amber-400/50 relative flex flex-col justify-between py-1.5 px-0.5 transition-all duration-300 ease-out group-hover:-translate-y-3 group-hover:scale-[1.04] group-hover:shadow-[0_14px_28px_rgba(0,0,0,0.9),0_0_20px_rgba(251,191,36,0.5)] z-20`}
                                    style={{
                                      boxShadow:
                                        'inset 2px 0 4px rgba(255,255,255,0.25), inset -3px 0 8px rgba(0,0,0,0.85), 3px 5px 12px rgba(0,0,0,0.6)',
                                    }}
                                  >
                                    <div>
                                      <div className="spine-rib w-full mb-0.5" />
                                      <div className="spine-rib w-full mb-0.5" />
                                      <div className="w-4.5 h-4.5 mx-auto rounded-full border border-amber-400/60 bg-black/40 flex items-center justify-center text-[10px] shadow-inner select-none">
                                        {theme.icon}
                                      </div>
                                    </div>

                                    <div
                                      className="flex-1 flex flex-col items-center justify-center overflow-hidden my-0.5 px-0.5"
                                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                    >
                                      {book.author && (
                                        <span className="text-[6.5px] uppercase font-bold text-amber-300/90 tracking-tighter mb-1 truncate max-h-[50px]">
                                          {book.author.split(' ').pop()}
                                        </span>
                                      )}
                                      <span
                                        className={`uppercase font-black text-amber-100 select-none drop-shadow-md whitespace-nowrap leading-none ${
                                          getSubjectDisplayName(book.subject).length > 10
                                            ? 'text-[7px] sm:text-[7.5px] tracking-normal'
                                            : getSubjectDisplayName(book.subject).length > 7
                                            ? 'text-[8.5px] sm:text-[9px] tracking-wide'
                                            : 'text-[9.5px] sm:text-[10px] tracking-widest'
                                        }`}
                                      >
                                        {getSubjectDisplayName(book.subject)}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-[7px] font-bold text-amber-300/80 font-mono block text-center mb-0.5 select-none">
                                        {levelInfo.roman.split('•')[0].trim()}
                                      </span>
                                      <div className="spine-rib w-full" />
                                      <div className="spine-rib w-full mt-0.5" />

                                      <div
                                        className={`w-1.5 h-4 mx-auto ${theme.ribbonColor} shadow-md shadow-black/80 rounded-b-xs transform translate-y-1.5`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <div className="w-full h-4 sm:h-5 bg-gradient-to-b from-[#b45309] via-[#78350f] to-[#451a03] border-t-2 border-amber-300/70 shadow-[0_8px_16px_rgba(0,0,0,0.9)] rounded-b-sm relative z-10 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-amber-200/40 opacity-70" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
