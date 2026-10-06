import { StudyDocument, ScheduleItem, LibraryItem, LawQuestion, LawSubject } from '../types';
import { convertMarkdownToHtml } from '../utils/markdown';

const DB_NAME = 'lexstudy_obsidian_vault_db';
const DB_VERSION = 1;
const STORE_NAME = 'vault_handles';
const HANDLE_KEY = 'active_vault_handle';

// ============================================================================
// 1. INDEXEDDB PERSISTENCE FOR DIRECTORY HANDLE
// ============================================================================

function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB não suportado neste navegador.'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(handle, HANDLE_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSavedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(HANDLE_KEY);
      req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function removeSavedDirectoryHandle(): Promise<void> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(HANDLE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// ============================================================================
// 2. VAULT FOLDERS AND ENTRY HELPERS
// ============================================================================

export const VAULT_FOLDERS = {
  NOTEBOOKS: '01 - Cadernos de Estudo',
  SCHEDULE: '02 - Cronograma de Estudos',
  LIBRARY: '03 - Biblioteca Jurídica',
  FLASHCARDS: '04 - Questões e Flashcards',
};

function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getOrCreateSubdir(
  parent: FileSystemDirectoryHandle,
  dirName: string
): Promise<FileSystemDirectoryHandle> {
  return await parent.getDirectoryHandle(dirName, { create: true });
}

async function writeTextFile(
  dir: FileSystemDirectoryHandle,
  fileName: string,
  content: string
): Promise<void> {
  const fileHandle = await dir.getFileHandle(fileName, { create: true });
  const writable = await (fileHandle as any).createWritable();
  await writable.write(content);
  await writable.close();
}

// ============================================================================
// 3. HTML TO OBSIDIAN MARKDOWN CONVERTER (WITH CALLOUTS & FRONTMATTER)
// ============================================================================

export function htmlToObsidianMarkdown(doc: StudyDocument): string {
  let body = doc.content || '';

  // 1. Convert LexStudy Callout Cards into native Obsidian Callouts (> [!type])
  // Pega FGV / Alerta
  body = body.replace(
    /<div[^>]*border-left:\s*4px\s+solid\s+#e11d48[^>]*>([\s\S]*?)<\/div>/gi,
    (_m, content) => {
      const clean = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return `\n> [!danger] PEGA DA FGV & ALERTA CRÍTICO\n> ${clean}\n\n`;
    }
  );

  // Artigo de Lei
  body = body.replace(
    /<div[^>]*border-left:\s*4px\s+solid\s+#0284c7[^>]*>([\s\S]*?)<\/div>/gi,
    (_m, content) => {
      const clean = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return `\n> [!example] ARTIGO DE LEI & FUNDAMENTO LEGAL\n> ${clean}\n\n`;
    }
  );

  // Jurisprudência
  body = body.replace(
    /<div[^>]*border-left:\s*4px\s+solid\s+#7c3aed[^>]*>([\s\S]*?)<\/div>/gi,
    (_m, content) => {
      const clean = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return `\n> [!quote] JURISPRUDÊNCIA & SÚMULA DOMINANTE\n> ${clean}\n\n`;
    }
  );

  // Macete
  body = body.replace(
    /<div[^>]*border-left:\s*4px\s+solid\s+#059669[^>]*>([\s\S]*?)<\/div>/gi,
    (_m, content) => {
      const clean = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return `\n> [!tip] MACETE & MNEMÔNICO FGV\n> ${clean}\n\n`;
    }
  );

  // Doutrina
  body = body.replace(
    /<div[^>]*border-left:\s*4px\s+solid\s+#b45309[^>]*>([\s\S]*?)<\/div>/gi,
    (_m, content) => {
      const clean = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return `\n> [!abstract] CONCEITO DOUTRINÁRIO\n> ${clean}\n\n`;
    }
  );

  // 2. Standard HTML elements to Markdown
  body = body
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<mark[^>]*>(.*?)<\/mark>/gi, '==$1==')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr[^>]*>/gi, '\n---\n\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n\n')
    .replace(/<[^>]*>/g, ''); // Strip remaining raw tags

  // Clean excessive linebreaks
  body = body.replace(/\n{3,}/g, '\n\n').trim();

  // 3. YAML Frontmatter for Obsidian
  const frontmatter = [
    '---',
    `titulo: "${doc.title.replace(/"/g, '\\"')}"`,
    `materia: "${doc.subject}"`,
    `data_criacao: "${doc.createdAt.slice(0, 10)}"`,
    `ultima_modificacao: "${doc.lastModified.slice(0, 10)}"`,
    `dificuldade: "${doc.difficulty || 'medio'}"`,
    'revisoes:',
    `  d1: true`,
    `  d7: true`,
    `  d30: false`,
    `palavras: ${doc.wordCount || 0}`,
    `tags: [${['oab', 'direito', doc.subject.toLowerCase().replace(/[^a-z0-9]/g, '-'), ...(doc.tags || []).map((t) => t.toLowerCase())]
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((t) => `"${t}"`)
      .join(', ')}]`,
    'origem: "LexStudy Pro"',
    '---',
    '',
  ].join('\n');

  return `${frontmatter}\n${body}\n`;
}

// ============================================================================
// 4. VAULT FILE WRITERS & DELETE HELPERS
// ============================================================================

export async function writeDocumentToVault(
  rootHandle: FileSystemDirectoryHandle,
  doc: StudyDocument
): Promise<void> {
  const notebooksDir = await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.NOTEBOOKS);
  const subjectDirName = sanitizeFileName(doc.subject);
  const subjectDir = await getOrCreateSubdir(notebooksDir, subjectDirName);
  const fileName = `${sanitizeFileName(doc.title)}.md`;

  const mdContent = htmlToObsidianMarkdown(doc);
  await writeTextFile(subjectDir, fileName, mdContent);
}

export async function deleteDocumentFromVault(
  rootHandle: FileSystemDirectoryHandle,
  docTitle: string,
  subject: string
): Promise<void> {
  try {
    const notebooksDir = await rootHandle.getDirectoryHandle(VAULT_FOLDERS.NOTEBOOKS);
    const subjectDir = await notebooksDir.getDirectoryHandle(sanitizeFileName(subject));
    const fileName = `${sanitizeFileName(docTitle)}.md`;
    await subjectDir.removeEntry(fileName);
  } catch {
    // File may not exist or was already removed
  }
}

export async function writeScheduleToVault(
  rootHandle: FileSystemDirectoryHandle,
  schedule: ScheduleItem[]
): Promise<void> {
  const scheduleDir = await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.SCHEDULE);
  const completed = schedule.filter((s) => s.status === 'concluido').length;

  let content = [
    '---',
    'tipo: "cronograma_oab"',
    `atualizado_em: "${new Date().toISOString().slice(0, 10)}"`,
    `total_metas: ${schedule.length}`,
    `concluidas: ${completed}`,
    `progresso_pct: ${schedule.length > 0 ? Math.round((completed / schedule.length) * 100) : 0}%`,
    '---',
    '',
    '# 📅 Cronograma Geral de Estudos OAB 48',
    '',
    `> **Métricas:** ${completed} de ${schedule.length} tópicos concluídos (${schedule.length > 0 ? Math.round((completed / schedule.length) * 100) : 0}%).`,
    '',
    '## 📋 Checklist de Metas Diárias',
    '',
  ].join('\n');

  if (schedule.length === 0) {
    content += '_Nenhuma meta cadastrada no cronograma ainda._\n';
  } else {
    schedule.forEach((item) => {
      const isDone = item.status === 'concluido';
      const check = isDone ? '[x]' : '[ ]';
      const revs = [
        item.revisionD1 ? '24h ✓' : null,
        item.revisionD7 ? '7d ✓' : null,
        item.revisionD30 ? '30d ✓' : null,
      ]
        .filter(Boolean)
        .join(', ');

      content += `- ${check} **${item.date}** • \`[${item.subject}]\` ${item.topic}${revs ? ` *(Revisão: ${revs})*` : ''}\n`;
    });
  }

  await writeTextFile(scheduleDir, 'Cronograma Geral OAB.md', content);
}

export async function writeLibraryToVault(
  rootHandle: FileSystemDirectoryHandle,
  library: LibraryItem[]
): Promise<void> {
  const libDir = await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.LIBRARY);

  for (const item of library) {
    const categoryName = sanitizeFileName(item.category || 'Doutrina');
    const catDir = await getOrCreateSubdir(libDir, categoryName);
    const fileName = `${sanitizeFileName(item.title)}.md`;

    const content = [
      '---',
      `titulo: "${item.title.replace(/"/g, '\\"')}"`,
      `autor: "${(item.author || 'Doutrina').replace(/"/g, '\\"')}"`,
      `materia: "${item.subject}"`,
      `categoria: "${item.category}"`,
      `edicao: "${item.edition || '2026'}"`,
      'tipo: "biblioteca_juridica"',
      'tags: ["doutrina", "oab", "vade-mecum"]',
      '---',
      '',
      `# ${item.title}`,
      `*Autor:* ${item.author || 'Não informado'} • *Disciplina:* ${item.subject}`,
      '',
      item.markdownContent || item.summary || 'Conteúdo da obra doutrinária.',
      '',
    ].join('\n');

    await writeTextFile(catDir, fileName, content);
  }
}

export async function writeQuestionsToVault(
  rootHandle: FileSystemDirectoryHandle,
  questions: LawQuestion[]
): Promise<void> {
  const qDir = await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.FLASHCARDS);

  let content = [
    '---',
    'tipo: "flashcards_questoes"',
    `total_questoes: ${questions.length}`,
    'tags: ["#flashcards", "#oab", "#simulado"]',
    '---',
    '',
    '# 🎯 Banco Oficial de Questões FGV OAB (#flashcards)',
    '',
    '> [!tip] Plugin Spaced Repetition',
    '> Este arquivo é 100% compatível com o plugin **Spaced Repetition** do Obsidian. As perguntas e respostas utilizam a sintaxe de flashcards do Obsidian (`?`).',
    '',
  ].join('\n');

  questions.forEach((q, idx) => {
    content += `## Questão ${idx + 1}: ${q.subject} • ${q.topic} (${q.examOrigin})\n\n`;
    content += `${q.question}\n\n`;
    q.options.forEach((opt) => {
      content += `- **(${opt.id.toUpperCase()})** ${opt.text}\n`;
    });
    content += `\n?\n\n`;
    content += `**Gabarito Oficial:** Alternativa **(${q.correctOptionId.toUpperCase()})**\n\n`;
    content += `> [!info] Fundamentação Jurídica & Comentário FGV\n> ${q.explanation}\n\n`;
    content += `---\n\n`;
  });

  await writeTextFile(qDir, 'Banco de Questões OAB FGV.md', content);
}

// ============================================================================
// 5. BIDIRECTIONAL PULL: READ FROM OBSIDIAN VAULT BACK INTO LEXSTUDY
// ============================================================================

export async function readDocumentsFromVault(
  rootHandle: FileSystemDirectoryHandle
): Promise<StudyDocument[]> {
  const documents: StudyDocument[] = [];

  try {
    const notebooksDir = await rootHandle.getDirectoryHandle(VAULT_FOLDERS.NOTEBOOKS);

    // Iterate through subject directories
    for await (const [subjectName, subjectEntry] of (notebooksDir as any).entries()) {
      if (subjectEntry.kind === 'directory') {
        const subDir = subjectEntry as FileSystemDirectoryHandle;
        for await (const [fileName, fileEntry] of (subDir as any).entries()) {
          if (fileEntry.kind === 'file' && fileName.endsWith('.md')) {
            try {
              const file = await (fileEntry as FileSystemFileHandle).getFile();
              const text = await file.text();
              const parsed = parseObsidianDocFile(text, fileName.replace(/\.md$/, ''), subjectName);
              if (parsed) {
                documents.push(parsed);
              }
            } catch (err) {
              console.warn(`Erro ao ler arquivo do vault: ${fileName}`, err);
            }
          }
        }
      }
    }
  } catch (err) {
    // Folder may not exist yet
  }

  return documents;
}

function parseObsidianDocFile(
  rawContent: string,
  fileName: string,
  folderSubject: string
): StudyDocument | null {
  let title = fileName;
  let subject: LawSubject = (folderSubject as LawSubject) || 'Direito Constitucional';
  let createdAt = new Date().toISOString();
  let lastModified = new Date().toISOString();
  let difficulty: 'facil' | 'medio' | 'dificil' = 'medio';
  let tags: string[] = ['Obsidian'];

  let markdownBody = rawContent;

  // Extract YAML frontmatter
  if (rawContent.startsWith('---')) {
    const endIdx = rawContent.indexOf('---', 3);
    if (endIdx !== -1) {
      const frontmatter = rawContent.slice(3, endIdx).trim();
      markdownBody = rawContent.slice(endIdx + 3).trim();

      const lines = frontmatter.split('\n');
      lines.forEach((line) => {
        const colon = line.indexOf(':');
        if (colon !== -1) {
          const k = line.slice(0, colon).trim().toLowerCase();
          const v = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '');
          if (k === 'titulo' || k === 'title') title = v;
          if (k === 'materia' || k === 'subject') subject = v as LawSubject;
          if (k === 'data_criacao' || k === 'created') createdAt = v;
          if (k === 'ultima_modificacao' || k === 'updated') lastModified = v;
          if (k === 'dificuldade' && (v === 'facil' || v === 'medio' || v === 'dificil')) {
            difficulty = v;
          }
          if (k === 'tags') {
            const parsedTags = v
              .replace(/^\[|\]$/g, '')
              .split(',')
              .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
              .filter(Boolean);
            if (parsedTags.length > 0) tags = parsedTags;
          }
        }
      });
    }
  }

  const htmlContent = convertMarkdownToHtml(markdownBody);
  const words = markdownBody.trim().split(/\s+/).filter(Boolean).length;

  return {
    id: `doc-obsidian-${sanitizeFileName(title).toLowerCase()}`,
    title,
    subject,
    content: htmlContent,
    wordCount: words,
    createdAt,
    lastModified,
    difficulty,
    tags,
    favorite: false,
  };
}

// ============================================================================
// 6. MASTER SYNC FUNCTION
// ============================================================================

export async function syncAllToVault(
  rootHandle: FileSystemDirectoryHandle,
  data: {
    documents: StudyDocument[];
    schedule: ScheduleItem[];
    library: LibraryItem[];
    questions: LawQuestion[];
  }
): Promise<{ success: boolean; notesCount: number; error?: string }> {
  try {
    // 1. Create main folder hierarchy
    await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.NOTEBOOKS);
    await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.SCHEDULE);
    await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.LIBRARY);
    await getOrCreateSubdir(rootHandle, VAULT_FOLDERS.FLASHCARDS);

    // 2. Write all documents
    for (const doc of data.documents) {
      await writeDocumentToVault(rootHandle, doc);
    }

    // 3. Write schedule
    await writeScheduleToVault(rootHandle, data.schedule);

    // 4. Write library
    await writeLibraryToVault(rootHandle, data.library);

    // 5. Write questions flashcards
    await writeQuestionsToVault(rootHandle, data.questions);

    return {
      success: true,
      notesCount: data.documents.length,
    };
  } catch (err: any) {
    console.error('Erro na sincronização com o Obsidian:', err);
    return {
      success: false,
      notesCount: 0,
      error: err.message || 'Falha ao sincronizar arquivos com o cofre.',
    };
  }
}
