import { LawSubject } from '../types';

/**
 * Converts Markdown text into clean semantic HTML suitable for reading and chapter extraction.
 */
export function convertMarkdownToHtml(md: string): string {
  if (!md) return '';

  let text = md.trim();

  // Strip YAML frontmatter if present at the start
  if (text.startsWith('---')) {
    const endIdx = text.indexOf('---', 3);
    if (endIdx !== -1) {
      text = text.slice(endIdx + 3).trim();
    }
  }

  // Escape HTML entities to prevent raw tag injection while preserving formatting
  const lines = text.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(line.trim())) {
      if (inList) { processedLines.push('</ul>'); inList = false; }
      if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
      if (inBlockquote) { processedLines.push('</blockquote>'); inBlockquote = false; }
      processedLines.push('<hr style="border:none; border-top:1px solid rgba(148,163,184,0.3); margin:18px 0;" />');
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inList) { processedLines.push('</ul>'); inList = false; }
      if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
      if (inBlockquote) { processedLines.push('</blockquote>'); inBlockquote = false; }
      processedLines.push(`<h1>${formatInlineMarkdown(line.slice(2).trim())}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { processedLines.push('</ul>'); inList = false; }
      if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
      if (inBlockquote) { processedLines.push('</blockquote>'); inBlockquote = false; }
      processedLines.push(`<h2>${formatInlineMarkdown(line.slice(3).trim())}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { processedLines.push('</ul>'); inList = false; }
      if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
      if (inBlockquote) { processedLines.push('</blockquote>'); inBlockquote = false; }
      processedLines.push(`<h3>${formatInlineMarkdown(line.slice(4).trim())}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      if (inList) { processedLines.push('</ul>'); inList = false; }
      if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
      if (inBlockquote) { processedLines.push('</blockquote>'); inBlockquote = false; }
      processedLines.push(`<h4>${formatInlineMarkdown(line.slice(5).trim())}</h4>`);
      continue;
    }

    // Unordered Lists (- or *)
    const bulletMatch = line.match(/^(\s*)([-*])\s+(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${formatInlineMarkdown(bulletMatch[3].trim())}</li>`);
      continue;
    }

    // Ordered Lists (1., 2.)
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numberMatch) {
      if (!inOrderedList) {
        if (inList) { processedLines.push('</ul>'); inList = false; }
        processedLines.push('<ol>');
        inOrderedList = true;
      }
      processedLines.push(`<li>${formatInlineMarkdown(numberMatch[3].trim())}</li>`);
      continue;
    }

    // Blockquotes (>)
    if (line.startsWith('>')) {
      if (inList) { processedLines.push('</ul>'); inList = false; }
      if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
      if (!inBlockquote) {
        processedLines.push('<blockquote>');
        inBlockquote = true;
      }
      processedLines.push(`<p>${formatInlineMarkdown(line.replace(/^>\s*/, '').trim())}</p>`);
      continue;
    }

    // Close any open lists/quotes if normal line or blank
    if (inList) { processedLines.push('</ul>'); inList = false; }
    if (inOrderedList) { processedLines.push('</ol>'); inOrderedList = false; }
    if (inBlockquote) { processedLines.push('</blockquote>'); inBlockquote = false; }

    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    // Paragraph
    processedLines.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
  }

  if (inList) processedLines.push('</ul>');
  if (inOrderedList) processedLines.push('</ol>');
  if (inBlockquote) processedLines.push('</blockquote>');

  return processedLines.join('\n');
}

/**
 * Formats bold, italic, wikilinks, inline code, and highlights
 */
function formatInlineMarkdown(text: string): string {
  let res = text;

  // Bold & Italic: ***text***
  res = res.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold: **text**
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* or _text_
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  res = res.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Obsidian Wikilinks: [[Link|Alias]] or [[Link]]
  res = res.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<span class="obsidian-wikilink text-theme-accent font-semibold underline decoration-dotted">$2</span>');
  res = res.replace(/\[\[(.*?)\]\]/g, '<span class="obsidian-wikilink text-theme-accent font-semibold underline decoration-dotted">$1</span>');

  // Highlight: ==text==
  res = res.replace(/==(.*?)==/g, '<mark class="bg-amber-200 text-amber-950 px-1 rounded-xs">$1</mark>');

  // Inline code: `code`
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-zinc-800 text-xs font-mono font-bold">$1</code>');

  return res;
}

export interface ParsedObsidianNote {
  title: string;
  author?: string;
  subject?: LawSubject;
  tags?: string[];
  edition?: string;
  rawMarkdown: string;
  htmlContent: string;
}

/**
 * Parses an Obsidian Markdown file content with optional YAML frontmatter.
 */
export function parseObsidianMarkdown(rawText: string, fallbackTitle: string): ParsedObsidianNote {
  let title = fallbackTitle;
  let author = 'Cofre Obsidian';
  let subject: LawSubject = 'Geral / Outros';
  let tags: string[] = ['Obsidian', 'Doutrina'];
  let edition = 'Nota Obsidian';

  let markdownBody = rawText;

  // Parse YAML Frontmatter
  if (rawText.startsWith('---')) {
    const endMatch = rawText.indexOf('---', 3);
    if (endMatch !== -1) {
      const frontmatterText = rawText.slice(3, endMatch).trim();
      markdownBody = rawText.slice(endMatch + 3).trim();

      const fmLines = frontmatterText.split('\n');
      fmLines.forEach((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.slice(0, colonIdx).trim().toLowerCase();
          const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');

          if (key === 'title') title = val;
          if (key === 'author' || key === 'autor' || key === 'doutrinador') author = val;
          if (key === 'subject' || key === 'materia' || key === 'disciplina') {
            subject = val as LawSubject;
          }
          if (key === 'edition' || key === 'edicao' || key === 'volume') edition = val;
          if (key === 'tags' || key === 'tag') {
            const cleanTags = val
              .replace(/^\[|\]$/g, '')
              .split(',')
              .map((t) => t.trim().replace(/^#/, ''))
              .filter(Boolean);
            if (cleanTags.length > 0) tags = cleanTags;
          }
        }
      });
    }
  }

  // If title was not in frontmatter, look for first # Header
  if (title === fallbackTitle) {
    const firstHeaderMatch = markdownBody.match(/^#\s+(.+)$/m);
    if (firstHeaderMatch) {
      title = firstHeaderMatch[1].trim();
    }
  }

  const htmlContent = convertMarkdownToHtml(markdownBody);

  return {
    title,
    author,
    subject,
    tags,
    edition,
    rawMarkdown: markdownBody,
    htmlContent,
  };
}

/**
 * Builds Obsidian-ready Markdown text with full YAML frontmatter.
 */
export function buildObsidianExportMarkdown(params: {
  title: string;
  author?: string;
  subject: string;
  edition?: string;
  content: string;
  tags?: string[];
}): string {
  const { title, author, subject, edition, content, tags = [] } = params;

  // Clean HTML to Markdown if content was rich text
  let body = content;
  if (body.includes('<') && body.includes('>')) {
    body = body
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '');
  }

  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `author: "${(author || 'LexStudy').replace(/"/g, '\\"')}"`,
    `subject: "${subject}"`,
    edition ? `edition: "${edition}"` : null,
    `date: "${new Date().toISOString().slice(0, 10)}"`,
    `tags: [${['oab', 'estudo', ...tags].map((t) => `"${t.toLowerCase()}"`).join(', ')}]`,
    'source: "LexStudy Pro / Obsidian Vault"',
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  return `${frontmatter}\n${body.trim()}\n`;
}
