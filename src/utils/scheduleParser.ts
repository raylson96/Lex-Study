import { ScheduleItem, LawSubject, PriorityLevel } from '../types';

export const AI_PROMPT_TEMPLATE = `Por favor, leia o meu cronograma/edital de estudos para a OAB 48 (prova em 10/01/2027) e extraia/organize os tópicos linha por linha no seguinte formato padrão:

DATA | DISCIPLINA | TÓPICO DO ESTUDO | TEMPO_MINUTOS | PRIORIDADE

Exemplo:
15/10/2026 | Direito Constitucional | Controle de Constitucionalidade (ADI, ADC e ADPF) | 90 | Alta
16/10/2026 | Ética Profissional (OAB) | Prerrogativas do Advogado (Art. 7º do EAOAB) | 90 | Alta
17/10/2026 | Direito Civil | Teoria Geral dos Contratos e Vícios Redibitórios | 60 | Média
18/10/2026 | Direito Penal | Teoria do Delito e Excludentes de Ilicitude | 90 | Alta
19/10/2026 | Processo Civil | Tutelas Provisórias (Arts. 300 a 311 CPC) | 90 | Alta
20/10/2026 | Direito Tributário | Princípios Constitucionais e Imunidades | 60 | Média

Disciplinas disponíveis:
- Ética Profissional (OAB)
- Direito Constitucional
- Direito Civil
- Processo Civil
- Direito Penal
- Processo Penal
- Direito Administrativo
- Direito Tributário
- Direito do Trabalho
- Processo do Trabalho
- Direitos Humanos
- Direito Empresarial
- Geral / Outros

Prioridades: Alta, Média, Baixa.`;

export function detectSubject(text: string): LawSubject {
  const lower = text.toLowerCase();
  if (lower.includes('ética') || lower.includes('etica') || lower.includes('eaoab') || lower.includes('estatuto da oab')) {
    return 'Ética Profissional (OAB)';
  }
  if (lower.includes('processo civil') || lower.includes('proc. civil') || lower.includes('proc civil') || lower.includes('cpc')) {
    return 'Processo Civil';
  }
  if (lower.includes('processo penal') || lower.includes('proc. penal') || lower.includes('proc penal') || lower.includes('cpp')) {
    return 'Processo Penal';
  }
  if (lower.includes('processo do trabalho') || lower.includes('proc. trabalho') || lower.includes('proc trabalho')) {
    return 'Processo do Trabalho';
  }
  if (lower.includes('constitucional')) {
    return 'Direito Constitucional';
  }
  if (lower.includes('administrativo') || lower.includes('adm')) {
    return 'Direito Administrativo';
  }
  if (lower.includes('tributário') || lower.includes('tributario') || lower.includes('ctn')) {
    return 'Direito Tributário';
  }
  if (lower.includes('trabalho') || lower.includes('clt')) {
    return 'Direito do Trabalho';
  }
  if (lower.includes('penal')) {
    return 'Direito Penal';
  }
  if (lower.includes('civil')) {
    return 'Direito Civil';
  }
  if (lower.includes('humanos')) {
    return 'Direitos Humanos';
  }
  if (lower.includes('empresarial') || lower.includes('comercial')) {
    return 'Direito Empresarial';
  }
  return 'Geral / Outros';
}

export function parseScheduleText(rawText: string): ScheduleItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const items: ScheduleItem[] = [];

  let currentDate = new Date().toISOString().slice(0, 10);

  for (const line of lines) {
    // Ignore header rows from markdown or tables
    if (line.startsWith('|---') || line.toLowerCase().includes('data | disciplina') || line.toLowerCase().includes('data | matéria')) {
      continue;
    }

    // Pipe separated format (e.g. 15/10/2026 | Constitucional | Controle...)
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        let datePart = parts[0];
        let subjectPart = parts[1];
        let topicPart = parts[2] || '';
        let durationPart = parts[3] || '90';
        let priorityPart = parts[4] || 'alta';

        // Check if first part is actually a date
        const parsedDate = parseDateStringToIso(datePart);
        if (parsedDate) {
          currentDate = parsedDate;
        } else {
          // Maybe first part was subject
          topicPart = subjectPart;
          subjectPart = datePart;
        }

        const subject = detectSubject(subjectPart);
        const duration = parseInt(durationPart.replace(/\D/g, '')) || 90;
        const priority: PriorityLevel = priorityPart.toLowerCase().includes('baixa')
          ? 'baixa'
          : priorityPart.toLowerCase().includes('méd') || priorityPart.toLowerCase().includes('med')
          ? 'media'
          : 'alta';

        if (topicPart || subjectPart) {
          items.push({
            id: `sch-imp-${Date.now()}-${items.length}`,
            subject,
            topic: topicPart || subjectPart,
            date: currentDate,
            durationMinutes: duration,
            status: 'pendente',
            priority,
            notes: `Importado em ${new Date().toLocaleDateString('pt-BR')}`,
            revisionD1: false,
            revisionD7: false,
            revisionD30: false,
          });
          continue;
        }
      }
    }

    // Check regex pattern: Date followed by separator (-, :, |) and content
    // e.g. "15/10/2026 - Direito Constitucional: Controle de Constitucionalidade"
    // e.g. "15/10 - Penal: Crimes contra a vida"
    const dateMatch = line.match(/(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/);
    if (dateMatch) {
      const parsedDate = parseDateStringToIso(dateMatch[1]);
      if (parsedDate) {
        currentDate = parsedDate;
      }
    }

    // Clean line without date
    let cleanLine = line.replace(/^\d+[\.\)\-]\s*/, ''); // remove "1. " or "1) "
    if (dateMatch) {
      cleanLine = cleanLine.replace(dateMatch[0], '').replace(/^[\s\-–—:|]+/, '').trim();
    }

    if (!cleanLine || cleanLine.length < 3) continue;

    const subject = detectSubject(cleanLine);

    // Extract duration if line mentions "90 min" or "2h"
    let duration = 90;
    const durationMatch = cleanLine.match(/(\d+)\s*(?:min|m\b|horas?|h\b)/i);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      if (durationMatch[0].toLowerCase().includes('h')) {
        duration = num * 60;
      } else {
        duration = num;
      }
    }

    // Determine priority
    let priority: PriorityLevel = 'alta';
    if (cleanLine.toLowerCase().includes('baixa')) priority = 'baixa';
    else if (cleanLine.toLowerCase().includes('média') || cleanLine.toLowerCase().includes('media')) priority = 'media';

    // Extract topic (strip subject from beginning if present: "Direito Penal: Homicídio" -> "Homicídio")
    let topic = cleanLine;
    const colonIndex = cleanLine.indexOf(':');
    const dashIndex = cleanLine.indexOf(' - ');
    if (colonIndex > -1 && colonIndex < 35) {
      topic = cleanLine.substring(colonIndex + 1).trim();
    } else if (dashIndex > -1 && dashIndex < 35) {
      topic = cleanLine.substring(dashIndex + 3).trim();
    }

    items.push({
      id: `sch-imp-${Date.now()}-${items.length}`,
      subject,
      topic: topic || cleanLine,
      date: currentDate,
      durationMinutes: duration,
      status: 'pendente',
      priority,
      notes: `Importado automaticamente`,
      revisionD1: false,
      revisionD7: false,
      revisionD30: false,
    });
  }

  return items;
}

export function parseDateStringToIso(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // Format DD/MM/YYYY or DD-MM-YYYY
  const parts = clean.split(/[/-]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }

  // Format DD/MM (infer year 2026/2027)
  if (parts.length === 2) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const mNum = parseInt(month);
    // If month is January (1), it's 2027; otherwise 2026 for OAB 48
    const year = mNum === 1 ? '2027' : '2026';
    return `${year}-${month}-${day}`;
  }

  return null;
}
