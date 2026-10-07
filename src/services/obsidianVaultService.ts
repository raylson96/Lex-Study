import { StudyDocument, ScheduleItem, LibraryItem, LawQuestion, LawSubject, LibraryCategory } from '../types';
import { convertMarkdownToHtml } from '../utils/markdown';

const DB_NAME = 'lexstudy_obsidian_vault_db';
const DB_VERSION = 2;
const STORE_NAME = 'vault_handles';
const STORE_DATA = 'vault_data';
const HANDLE_KEY = 'active_vault_handle';

// ============================================================================
// 1. INDEXEDDB PERSISTENCE FOR DIRECTORY HANDLE & LARGE DATA
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
      if (!db.objectStoreNames.contains(STORE_DATA)) {
        db.createObjectStore(STORE_DATA);
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

export async function saveLargeData(key: string, data: any): Promise<void> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATA, 'readwrite');
      const store = tx.objectStore(STORE_DATA);
      const req = store.put(data, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`Erro ao salvar dados grandes em IndexedDB (${key}):`, err);
  }
}

export async function getLargeData<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATA, 'readonly');
      const store = tx.objectStore(STORE_DATA);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
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

export function detectLawSubject(textOrName: string): LawSubject {
  const lower = textOrName.toLowerCase();
  if (lower.includes('penal') || lower.includes('criminal')) return 'Direito Penal';
  if (lower.includes('constitu')) return 'Direito Constitucional';
  if (lower.includes('processual civil') || lower.includes('processo civil') || lower.includes('cpc')) return 'Direito Processual Civil';
  if (lower.includes('civil')) return 'Direito Civil';
  if (lower.includes('processual penal') || lower.includes('processo penal') || lower.includes('cpp')) return 'Direito Processual Penal';
  if (lower.includes('adm') || lower.includes('administrativo')) return 'Direito Administrativo';
  if (lower.includes('processo do trabalho') || lower.includes('proc trabalho')) return 'Direito Processual do Trabalho';
  if (lower.includes('trabalh') || lower.includes('clt')) return 'Direito do Trabalho';
  if (lower.includes('tribut') || lower.includes('ctn')) return 'Direito Tributário';
  if (lower.includes('etic') || lower.includes('étic') || lower.includes('oab')) return 'Ética Profissional (OAB)';
  if (lower.includes('empresarial') || lower.includes('comercial')) return 'Direito Empresarial';
  if (lower.includes('consumidor') || lower.includes('cdc')) return 'Direito do Consumidor';
  if (lower.includes('ambiental')) return 'Direito Ambiental';
  if (lower.includes('humanos')) return 'Direitos Humanos';
  if (lower.includes('internacional')) return 'Direito Internacional';
  return 'Direito Penal';
}

export function detectAuthor(textOrName: string): string {
  const lower = textOrName.toLowerCase();
  if (lower.includes('cleber') || lower.includes('masson')) return 'Cleber Masson';
  if (lower.includes('aury') || lower.includes('lopes jr')) return 'Aury Lopes Jr.';
  if (lower.includes('gonçalves') || lower.includes('goncalves')) return 'Carlos Roberto Gonçalves';
  if (lower.includes('tartuce')) return 'Flávio Tartuce';
  if (lower.includes('moraes') || lower.includes('alexandre')) return 'Alexandre de Moraes';
  if (lower.includes('lenza') || lower.includes('pedro lenza')) return 'Pedro Lenza';
  if (lower.includes('nucci')) return 'Guilherme de Souza Nucci';
  if (lower.includes('barroso')) return 'Luís Roberto Barroso';
  if (lower.includes('dinamarco')) return 'Cândido Rangel Dinamarco';
  if (lower.includes('didier')) return 'Fredie Didier Jr.';
  return 'Doutrina Consagrada';
}

export function detectEdition(textOrName: string): string {
  const match = textOrName.match(/(\d+)[ªaºo]?\s*Edi[çc][ãa]o/i);
  if (match) return `${match[1]}ª Edição`;
  return '2026 (Atualizada)';
}

export function cleanBookTitle(rawName: string): string {
  return rawName
    .replace(/\.md$/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseObsidianLibraryFile(
  rawContent: string,
  fileName: string,
  categoryFolder: string
): LibraryItem | null {
  const cleanName = cleanBookTitle(fileName);
  let title = cleanName;
  let author = detectAuthor(fileName);
  let subject: LawSubject = detectLawSubject(fileName);
  let category: LibraryCategory = 'Doutrina & Resumos';
  let edition = detectEdition(fileName);
  let markdownBody = rawContent;

  const catLower = categoryFolder.toLowerCase();
  if (catLower.includes('código') || catLower.includes('lei')) category = 'Códigos';
  else if (catLower.includes('súmula')) category = 'Súmulas';
  else if (catLower.includes('juris')) category = 'Jurisprudência';
  else category = 'Doutrina & Resumos';

  // Frontmatter extraction
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
          if (k === 'autor' || k === 'author') author = v;
          if (k === 'materia' || k === 'subject') subject = detectLawSubject(v);
          if (k === 'categoria' || k === 'category') {
            if (v.toLowerCase().includes('lei') || v.toLowerCase().includes('código')) category = 'Códigos';
            else if (v.toLowerCase().includes('súmula')) category = 'Súmulas';
            else if (v.toLowerCase().includes('juris')) category = 'Jurisprudência';
            else category = 'Doutrina & Resumos';
          }
          if (k === 'edicao' || k === 'edition') edition = v;
        }
      });
    }
  }

  // Summary preview (clean first 300 characters, ignoring base64/images)
  const cleanText = markdownBody
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const summary = cleanText.slice(0, 320) || 'Obra jurídica completa integrada com o cofre do Obsidian.';

  return {
    id: `lib-obsidian-${sanitizeFileName(title).toLowerCase()}`,
    title,
    author,
    subject,
    category,
    edition,
    summary,
    markdownContent: markdownBody,
    source: 'doutrina',
    pinned: false,
    createdAt: new Date().toISOString(),
  };
}

export async function readLibraryFromVault(
  rootHandle: FileSystemDirectoryHandle
): Promise<LibraryItem[]> {
  const libraryItems: LibraryItem[] = [];

  try {
    const libDir = await rootHandle.getDirectoryHandle(VAULT_FOLDERS.LIBRARY);

    for await (const [entryName, entry] of (libDir as any).entries()) {
      if (entry.kind === 'directory') {
        const catDir = entry as FileSystemDirectoryHandle;
        for await (const [fileName, fileEntry] of (catDir as any).entries()) {
          if (fileEntry.kind === 'file' && fileName.endsWith('.md')) {
            try {
              const file = await (fileEntry as FileSystemFileHandle).getFile();
              const text = await file.text();
              const item = parseObsidianLibraryFile(text, fileName, entryName);
              if (item) {
                libraryItems.push(item);
              }
            } catch (err) {
              console.warn(`Erro ao ler arquivo da biblioteca: ${fileName}`, err);
            }
          }
        }
      } else if (entry.kind === 'file' && entryName.endsWith('.md')) {
        try {
          const file = await (entry as FileSystemFileHandle).getFile();
          const text = await file.text();
          const item = parseObsidianLibraryFile(text, entryName, 'Doutrina');
          if (item) {
            libraryItems.push(item);
          }
        } catch (err) {
          console.warn(`Erro ao ler arquivo da biblioteca: ${entryName}`, err);
        }
      }
    }
  } catch (err) {
    // Library folder may not exist yet
  }

  return libraryItems;
}

export async function readDocumentsFromVault(
  rootHandle: FileSystemDirectoryHandle
): Promise<StudyDocument[]> {
  const documents: StudyDocument[] = [];
  const processedTitles = new Set<string>();

  // 1. Scan 01 - Cadernos de Estudo
  try {
    const notebooksDir = await rootHandle.getDirectoryHandle(VAULT_FOLDERS.NOTEBOOKS);

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
                processedTitles.add(parsed.title.toLowerCase().trim());
              }
            } catch (err) {
              console.warn(`Erro ao ler caderno do vault: ${fileName}`, err);
            }
          }
        }
      } else if (subjectEntry.kind === 'file' && subjectName.endsWith('.md')) {
        try {
          const file = await (subjectEntry as FileSystemFileHandle).getFile();
          const text = await file.text();
          const parsed = parseObsidianDocFile(text, subjectName.replace(/\.md$/, ''), 'Direito Constitucional');
          if (parsed) {
            documents.push(parsed);
            processedTitles.add(parsed.title.toLowerCase().trim());
          }
        } catch (err) {}
      }
    }
  } catch (err) {}

  // 2. Also scan 03 - Biblioteca Jurídica (Doutrina, etc.) to expose as study documents
  try {
    const libDir = await rootHandle.getDirectoryHandle(VAULT_FOLDERS.LIBRARY);

    for await (const [catName, catEntry] of (libDir as any).entries()) {
      if (catEntry.kind === 'directory') {
        const subDir = catEntry as FileSystemDirectoryHandle;
        for await (const [fileName, fileEntry] of (subDir as any).entries()) {
          if (fileEntry.kind === 'file' && fileName.endsWith('.md')) {
            const cleanTitle = cleanBookTitle(fileName);
            if (!processedTitles.has(cleanTitle.toLowerCase().trim())) {
              try {
                const file = await (fileEntry as FileSystemFileHandle).getFile();
                const text = await file.text();
                const subject = detectLawSubject(fileName);
                const parsed = parseObsidianDocFile(text, cleanTitle, subject);
                if (parsed) {
                  parsed.tags = Array.from(new Set([...(parsed.tags || []), 'Doutrina', catName]));
                  documents.push(parsed);
                  processedTitles.add(cleanTitle.toLowerCase().trim());
                }
              } catch (err) {
                console.warn(`Erro ao converter obra em caderno: ${fileName}`, err);
              }
            }
          }
        }
      }
    }
  } catch (err) {}

  // 3. Scan Vault Root for any loose markdown notes created by the user
  try {
    for await (const [entryName, entry] of (rootHandle as any).entries()) {
      if (entry.kind === 'file' && entryName.endsWith('.md')) {
        // Skip system README and index files
        if (
          entryName.toLowerCase().startsWith('readme') ||
          entryName.toLowerCase().startsWith('bem-vindo') ||
          entryName.toLowerCase().startsWith('cronograma geral') ||
          entryName.toLowerCase().startsWith('banco de questões')
        ) {
          continue;
        }

        const cleanTitle = cleanBookTitle(entryName);
        if (!processedTitles.has(cleanTitle.toLowerCase().trim())) {
          try {
            const file = await (entry as FileSystemFileHandle).getFile();
            const text = await file.text();
            const subject = detectLawSubject(entryName);
            const parsed = parseObsidianDocFile(text, cleanTitle, subject);
            if (parsed) {
              documents.push(parsed);
              processedTitles.add(cleanTitle.toLowerCase().trim());
            }
          } catch (err) {}
        }
      }
    }
  } catch (err) {}

  return documents;
}

function parseObsidianDocFile(
  rawContent: string,
  fileName: string,
  folderSubject: string
): StudyDocument | null {
  let title = cleanBookTitle(fileName);
  let subject: LawSubject = detectLawSubject(folderSubject || fileName);
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
          if (k === 'materia' || k === 'subject') subject = detectLawSubject(v);
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

export async function readVaultData(rootHandle: FileSystemDirectoryHandle): Promise<{
  documents: StudyDocument[];
  library: LibraryItem[];
}> {
  const [documents, library] = await Promise.all([
    readDocumentsFromVault(rootHandle),
    readLibraryFromVault(rootHandle),
  ]);
  return { documents, library };
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
