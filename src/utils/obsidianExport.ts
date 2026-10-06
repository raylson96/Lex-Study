import JSZip from 'jszip';
import {
  StudentProfile,
  StudyDocument,
  ScheduleItem,
  LibraryItem,
  LawQuestion,
  StudySession,
} from '../types';

export interface ObsidianExportData {
  profile: StudentProfile;
  documents: StudyDocument[];
  schedule: ScheduleItem[];
  library: LibraryItem[];
  questions: LawQuestion[];
  sessions: StudySession[];
}

/**
 * Converte HTML básico (produzido pelo editor) para Markdown formatado nativo do Obsidian
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  // Cabeçalhos
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');

  // Negrito e Itálico
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '<u>$1</u>');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~');

  // Citações / Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, p1) => {
    const cleanLines = p1
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .map((l: string) => `> ${l}`)
      .join('\n');
    return `\n${cleanLines}\n`;
  });

  // Callouts estilo Obsidian para divs estilizadas
  md = md.replace(/<div[^>]*border-left[^>]*>([\s\S]*?)<\/div>/gi, (_match, p1) => {
    return `\n> [!NOTE] Destaque Jurídico\n> ${p1.replace(/<[^>]+>/g, '').trim()}\n`;
  });

  // Listas
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');

  // Parágrafos e quebras
  md = md.replace(/<br\s*[\/]?>/gi, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Remove demais tags HTML
  md = md.replace(/<[^>]+>/g, '');

  // Decodifica entidades HTML comuns
  md = md
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Ajusta excesso de quebras de linha
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

/**
 * Sanitiza nome de arquivo para ser válido no Windows, Mac e Linux
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Gera cabeçalho YAML Frontmatter nativo para Obsidian
 */
function createFrontmatter(data: Record<string, any>): string {
  const lines: string[] = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach((v) => lines.push(`  - "${v}"`));
    } else if (typeof value === 'string') {
      lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

/**
 * Exporta a base completa de dados para um cofre Obsidian estruturado em arquivo ZIP
 */
export async function exportToObsidianVault(data: ObsidianExportData): Promise<void> {
  const zip = new JSZip();
  const rootFolderName = `LexStudy-Cofre-Obsidian`;
  const vault = zip.folder(rootFolderName);

  if (!vault) {
    throw new Error('Falha ao instanciar estrutura de pastas do Obsidian.');
  }

  // =========================================================================
  // 1. CONFIGURAÇÕES NATIVAS DO OBSIDIAN (.obsidian/)
  // =========================================================================
  const obsidianConfig = vault.folder('.obsidian');
  if (obsidianConfig) {
    obsidianConfig.file(
      'app.json',
      JSON.stringify(
        {
          legacyEditor: false,
          livePreview: true,
          spellcheck: true,
          spellcheckLanguages: ['pt-BR'],
          showLineNumber: true,
          useTab: false,
          tabSize: 2,
          foldHeading: true,
          foldIndent: true,
          autoPairMarkdown: true,
          autoPairBrackets: true,
          strictLineBreaks: false,
        },
        null,
        2
      )
    );

    obsidianConfig.file(
      'core-plugins.json',
      JSON.stringify(
        [
          'file-explorer',
          'global-search',
          'switcher',
          'graph',
          'backlink',
          'canvas',
          'outgoing-link',
          'tag-pane',
          'page-preview',
          'daily-notes',
          'templates',
          'command-palette',
          'outline',
          'word-count',
        ],
        null,
        2
      )
    );

    obsidianConfig.file(
      'graph.json',
      JSON.stringify(
        {
          'collapse-filter': true,
          search: '',
          showTags: true,
          showAttachments: false,
          hideUnresolved: false,
          showOrphans: true,
          'collapse-color-groups': true,
          colorGroups: [],
          'collapse-display': true,
          showArrow: true,
          textFadeMultiplier: 0,
          nodeSizeMultiplier: 1.1,
          lineSizeMultiplier: 1,
          'collapse-forces': true,
          centerStrength: 0.518713248970312,
          repelStrength: 10,
          linkStrength: 1,
          linkDistance: 250,
          scale: 1,
        },
        null,
        2
      )
    );
  }

  // =========================================================================
  // 2. CADERNOS DE RESUMO (01 - Cadernos de Resumo/)
  // =========================================================================
  const cadernosFolder = vault.folder('01 - Cadernos de Resumo');
  if (cadernosFolder) {
    // Índice de Cadernos
    let indiceCadernos = `# 📚 Índice do Acervo de Cadernos Jurídicos\n\n`;
    indiceCadernos += `> Cofre sincronizado do **${data.profile.platformTitle || 'LexStudy'}** para o candidato **${data.profile.name || 'Estudante'}**.\n\n`;
    indiceCadernos += `## Sumário de Anotações por Disciplina\n\n`;

    const docsBySubject: Record<string, StudyDocument[]> = {};
    data.documents.forEach((doc) => {
      const subj = doc.subject || 'Geral';
      if (!docsBySubject[subj]) docsBySubject[subj] = [];
      docsBySubject[subj].push(doc);
    });

    for (const [subject, docs] of Object.entries(docsBySubject)) {
      const subjectFolderName = sanitizeFileName(subject);
      const subjectSubFolder = cadernosFolder.folder(subjectFolderName);

      indiceCadernos += `### ${subject}\n`;

      docs.forEach((doc) => {
        const safeTitle = sanitizeFileName(doc.title || `Anotacao-${doc.id}`);
        indiceCadernos += `- [[${subjectFolderName}/${safeTitle}|${doc.title}]] (${doc.wordCount || 0} palavras)\n`;

        const frontmatter = createFrontmatter({
          title: doc.title,
          disciplina: doc.subject,
          tags: ['oab', sanitizeFileName(doc.subject).toLowerCase().replace(/\s+/g, '-'), 'resumo'],
          criado: doc.createdAt ? doc.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
          atualizado: doc.lastModified ? doc.lastModified.slice(0, 10) : new Date().toISOString().slice(0, 10),
          palavras: doc.wordCount || 0,
          favorito: doc.favorite || false,
          cofre: 'LexStudy',
        });

        const noteBody = htmlToMarkdown(doc.content);
        const fullContent = `${frontmatter}\n\n# ${doc.title}\n\n${noteBody}\n\n---\n*Nota exportada automaticamente do LexStudy Pro.*`;

        if (subjectSubFolder) {
          subjectSubFolder.file(`${safeTitle}.md`, fullContent);
        }
      });

      indiceCadernos += `\n`;
    }

    cadernosFolder.file(`_Indice_Geral_Cadernos.md`, indiceCadernos);
  }

  // =========================================================================
  // 3. CRONOGRAMA DE ESTUDOS (02 - Cronograma OAB/)
  // =========================================================================
  const cronogramaFolder = vault.folder('02 - Cronograma OAB');
  if (cronogramaFolder) {
    let cronoMd = `# 📅 Cronograma Geral de Estudos — ${data.profile.examTarget || 'OAB 48'}\n\n`;
    cronoMd += `> Meta Diária: **${data.profile.dailyGoalHours}h** | Total de Tópicos Planejados: **${data.schedule.length}**\n\n`;
    cronoMd += `| Data | Disciplina | Tópico | Status | D1 | D7 | D30 |\n`;
    cronoMd += `| :--- | :--- | :--- | :---: | :---: | :---: | :---: |\n`;

    data.schedule.forEach((item) => {
      const d1 = item.revisionD1 ? '✅' : '⬜';
      const d7 = item.revisionD7 ? '✅' : '⬜';
      const d30 = item.revisionD30 ? '✅' : '⬜';
      const statusIcon =
        item.status === 'concluido'
          ? '🟢 Concluído'
          : item.status === 'em_andamento'
          ? '🟡 Em Andamento'
          : item.status === 'revisao'
          ? '🟣 Revisão'
          : '⚪ Pendente';

      cronoMd += `| ${item.date} | ${item.subject} | [[${sanitizeFileName(item.topic)}]] | ${statusIcon} | ${d1} | ${d7} | ${d30} |\n`;

      // Cria nota individual para cada tópico do cronograma com checklist de revisão
      const topicSafeName = sanitizeFileName(`${item.date} - ${item.subject} - ${item.topic}`);
      const topicFrontmatter = createFrontmatter({
        data: item.date,
        disciplina: item.subject,
        topico: item.topic,
        status: item.status,
        tags: ['oab', 'cronograma', sanitizeFileName(item.subject).toLowerCase().replace(/\s+/g, '-')],
      });

      const topicNote = `${topicFrontmatter}\n\n# 📌 ${item.topic}\n\n- **Disciplina:** ${item.subject}\n- **Data de Estudo:** ${item.date}\n- **Status:** ${item.status}\n\n## 🔄 Ciclo de Revisão Espaçada\n- [${item.revisionD1 ? 'x' : ' '}] Revisão de 24 Horas (D1)\n- [${item.revisionD7 ? 'x' : ' '}] Revisão de 7 Dias (D7)\n- [${item.revisionD30 ? 'x' : ' '}] Revisão de 30 Dias (D30)\n\n## 📝 Apontamentos e Resumo da Sessão\n*(Adicione suas notas rápidas deste tópico aqui)*\n\n---\n*Sincronizado do Cronograma LexStudy.*`;

      cronogramaFolder.file(`${topicSafeName}.md`, topicNote);
    });

    cronogramaFolder.file(`_Painel_Cronograma_Geral.md`, cronoMd);
  }

  // =========================================================================
  // 4. BIBLIOTECA JURÍDICA & DOUTRINA (03 - Vade Mecum & Doutrina/)
  // =========================================================================
  const bibliotecaFolder = vault.folder('03 - Vade Mecum & Doutrina');
  if (bibliotecaFolder) {
    const categories: Record<string, string> = {
      vademecum: 'Codigos e Legislacao',
      doutrina: 'Doutrina e Manuais',
      sumulas: 'Jurisprudencia e Sumulas',
      outro: 'Diversos',
    };

    let bibliotecaIndice = `# 📖 Biblioteca Jurídica — Catálogo de Obras\n\n`;

    data.library.forEach((book) => {
      const subCat = categories[book.category] || sanitizeFileName(book.category) || 'Doutrina e Manuais';
      const catFolder = bibliotecaFolder.folder(subCat);
      const safeTitle = sanitizeFileName(book.title);
      const authorText = book.author || 'Autor(a) da Obra';
      const editionText = book.edition ? ` (${book.edition})` : '';

      bibliotecaIndice += `- **${book.title}**${editionText} — *${authorText}* [${book.subject}]\n`;

      const bookFrontmatter = createFrontmatter({
        titulo: book.title,
        autor: authorText,
        disciplina: book.subject,
        categoria: book.category,
        edicao: book.edition || '1ª Edição',
        tags: ['livro', 'doutrina', sanitizeFileName(book.subject).toLowerCase().replace(/\s+/g, '-')],
      });

      const bodyText = htmlToMarkdown(book.content || book.markdownContent || book.summary);

      const articlesList =
        book.importantArticles && book.importantArticles.length > 0
          ? `\n\n## ⚖️ Artigos e Dispositivos Chave\n${book.importantArticles.map((a) => `- **${a}**`).join('\n')}`
          : '';

      const bookContent = `${bookFrontmatter}\n\n# ${book.title}\n\n- **Autor(a):** ${authorText}\n- **Edição/Volume:** ${book.edition || 'Consolidado'}\n- **Ramo do Direito:** ${book.subject}\n\n## 📑 Síntese / Conteúdo da Obra\n${bodyText}${articlesList}\n\n---\n*Ficha cadastrada na Biblioteca LexStudy Pro.*`;

      if (catFolder) {
        catFolder.file(`${safeTitle}.md`, bookContent);
      }
    });

    bibliotecaFolder.file(`_Catalogo_Geral_Biblioteca.md`, bibliotecaIndice);
  }

  // =========================================================================
  // 5. BANCO DE QUESTÕES FGV (04 - Banco de Questoes FGV/)
  // =========================================================================
  const questoesFolder = vault.folder('04 - Banco de Questoes FGV');
  if (questoesFolder) {
    // 5.1 Arquivo Geral com Flashcards compatíveis com o plugin Spaced Repetition do Obsidian
    let questoesFlashcards = `# 🎯 Banco Oficial de Questões OAB FGV — Modo Flashcards & Spaced Repetition\n\n`;
    questoesFlashcards += `> Este arquivo utiliza a sintaxe compatível com o plugin **Obsidian Spaced Repetition** (\`#flashcards\`).\n\n`;

    data.questions.forEach((q, idx) => {
      const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

      questoesFlashcards += `## Questão #${idx + 1} — ${q.subject} (${q.topic})\n`;
      questoesFlashcards += `**Exame:** ${q.examOrigin || 'FGV'} #flashcards\n\n`;
      questoesFlashcards += `**Enunciado:**\n${q.question}\n\n`;

      q.options.forEach((opt) => {
        questoesFlashcards += `(${opt.id.toUpperCase()}) ${opt.text}\n`;
      });

      questoesFlashcards += `\n?\n`;
      questoesFlashcards += `**Gabarito Correto:** Alternativa **(${q.correctOptionId.toUpperCase()})**\n`;
      questoesFlashcards += `> **Fundamentação Jurídica:**\n> ${q.explanation}\n\n`;
      questoesFlashcards += `---\n\n`;

      // Arquivo individual por questão
      const qSafeName = sanitizeFileName(`Questao_${String(idx + 1).padStart(2, '0')}_${q.subject}_${q.topic}`);
      const qFrontmatter = createFrontmatter({
        disciplina: q.subject,
        topico: q.topic,
        gabarito: q.correctOptionId.toUpperCase(),
        tags: ['questao-oab', 'fgv', sanitizeFileName(q.subject).toLowerCase().replace(/\s+/g, '-')],
      });

      const qNote = `${qFrontmatter}\n\n# ⚖️ Questão #${idx + 1} — ${q.subject}\n\n**Origem:** ${q.examOrigin || 'Exame de Ordem FGV'}\n**Tópico:** ${q.topic}\n\n### Enunciado\n${q.question}\n\n### Alternativas\n${q.options.map((o) => `- **${o.id.toUpperCase()})** ${o.text}`).join('\n')}\n\n---\n\n## 💡 Gabarito Comentado\n> **Alternativa Correta: (${q.correctOptionId.toUpperCase()})** — ${correctOpt?.text || ''}\n\n### Fundamento Jurídico\n${q.explanation}\n`;

      questoesFolder.file(`${qSafeName}.md`, qNote);
    });

    questoesFolder.file(`_Caderno_Flashcards_Geral.md`, questoesFlashcards);
  }

  // =========================================================================
  // 6. PAINEL DE MÉTRICAS & CANDIDATO (05 - Rendimento & Metricas/)
  // =========================================================================
  const metricasFolder = vault.folder('05 - Rendimento & Metricas');
  if (metricasFolder) {
    const totalMinutes = data.sessions.reduce((acc, s) => acc + s.minutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    let metricasMd = `# 📊 Relatório Geral de Rendimento e Preparação OAB\n\n`;
    metricasMd += `- **Candidato(a):** ${data.profile.name || 'Estudante'}\n`;
    metricasMd += `- **Foco:** ${data.profile.examTarget || 'OAB 48'}\n`;
    metricasMd += `- **Data da Prova:** ${data.profile.targetExamDate || 'Não definida'}\n`;
    metricasMd += `- **Horas Líquidas Registradas:** ${totalHours}h\n`;
    metricasMd += `- **Meta Diária:** ${data.profile.dailyGoalHours}h\n`;
    metricasMd += `- **Total de Tópicos no Cronograma:** ${data.schedule.length}\n`;
    metricasMd += `- **Obras no Acervo:** ${data.library.length}\n`;
    metricasMd += `- **Questões no Banco:** ${data.questions.length}\n\n`;
    metricasMd += `## 🕒 Histórico de Sessões de Estudo\n\n`;

    if (data.sessions.length === 0) {
      metricasMd += `*(Nenhuma sessão registrada até o momento. Comece seus estudos no LexStudy para registrar horas líquidas).* \n`;
    } else {
      metricasMd += `| Data | Disciplina | Duração (min) |\n`;
      metricasMd += `| :--- | :--- | :---: |\n`;
      data.sessions.forEach((s) => {
        metricasMd += `| ${s.date} | ${s.subject} | ${s.minutes} min |\n`;
      });
    }

    metricasFolder.file(`Painel_Geral_Rendimento.md`, metricasMd);
  }

  // =========================================================================
  // 7. GUIA DE BOAS-VINDAS E INSTRUÇÕES OBSIDIAN (README.md na raiz)
  // =========================================================================
  const readmeMd = `# 🏛️ Cofre Obsidian — LexStudy Pro

Bem-vindo(a) ao seu cofre jurídico completo configurado para o **Obsidian**!

Este cofre foi gerado diretamente a partir da sua base de dados do **LexStudy**, convertendo todos os seus cadernos, tópicos de cronograma, obras e simulados em notas Markdown interligadas.

---

## 🚀 Como abrir este cofre no Obsidian (Passo a Passo)

1. **Extraia o arquivo ZIP** baixado em qualquer pasta do seu computador (exemplo: \`Documentos/Obsidian/LexStudy\`).
2. Abra o aplicativo **Obsidian**.
3. Na tela inicial do Obsidian, clique na opção **"Abrir pasta como cofre"** (*Open folder as vault*).
4. Selecione a pasta **\`${rootFolderName}\`** que você acabou de extrair.
5. Pronto! Todas as notas, links bidirecionais e pastas aparecerão instantaneamente no painel lateral do Obsidian.

---

## 🗂️ Estrutura das Pastas

- \`01 - Cadernos de Resumo/\`: Todas as suas anotações e doutrina separadas por disciplinas do Direito.
- \`02 - Cronograma OAB/\`: O cronograma diário com controle de revisões D1, D7 e D30.
- \`03 - Vade Mecum & Doutrina/\`: O acervo com sinopses e fichamentos das suas obras.
- \`04 - Banco de Questoes FGV/\`: Questões comentadas e flashcards formatados para estudo ativo.
- \`05 - Rendimento & Metricas/\`: Resumo do seu progresso, metas e horas líquidas de estudo.

---

## 🧩 Plugins Comunitários Recomendados para este Cofre

Para uma experiência profissional avançada com este cofre no Obsidian, recomendamos instalar:
- **Dataview**: Para criar tabelas e consultas dinâmicas automáticas sobre suas notas e matérias.
- **Spaced Repetition**: Para transformar a pasta \`04 - Banco de Questoes FGV\` em baralhos de repetição espaçada inteligentes com atalhos de teclado.
- **Kanban**: Para visualizar as revisões do cronograma em formato de quadro ágil.
- **Omnisearch**: Para pesquisar em milissegundos dentro de todas as suas notas e súmulas.

---
*Gerado pelo LexStudy Pro Plataforma Jurídica — Bons estudos rumo à aprovação!*
`;

  vault.file('README_COFRE_OBSIDIAN.md', readmeMd);

  // =========================================================================
  // 8. GERAÇÃO DO BLOB E DOWNLOAD NO NAVEGADOR
  // =========================================================================
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `LexStudy-Cofre-Obsidian-${todayStr}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
