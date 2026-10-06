import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LawSubject, LawQuestion } from '../../types';
import { getSubjectColor } from '../../utils/formatters';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Award,
  Filter,
  Upload,
  Plus,
  X,
  FileText,
  AlertCircle,
  Sparkles,
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
  'Direito Ambiental',
  'Geral / Outros',
];

export const QuestionsView: React.FC = () => {
  const {
    questions,
    answerQuestion,
    clearQuestionAnswers,
    importQuestions,
    subjects,
    theme,
    getSubjectDisplayName,
    showToast,
  } = useApp();

  const [subjectFilter, setSubjectFilter] = useState<string>('todas');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importError, setImportError] = useState('');

  const filteredQuestions = questions.filter(
    (q) => subjectFilter === 'todas' || q.subject === subjectFilter
  );

  const answeredCount = questions.filter((q) => q.userAnswer !== undefined).length;
  const correctCount = questions.filter((q) => q.userAnswer === q.correctOptionId).length;
  const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Carrega exemplo JSON pronto no modal
  const handleLoadSampleJson = () => {
    const sample: Partial<LawQuestion>[] = [
      {
        id: `q-custom-${Date.now()}-1`,
        subject: 'Ética Profissional (OAB)',
        topic: 'Sigilo Profissional',
        examOrigin: 'OAB Inédita FGV',
        question:
          'Advogado é intimado como testemunha em processo penal no qual seu antigo constituinte figura como réu. Sobre o dever de sigilo profissional:',
        options: [
          { id: 'a', text: 'Deve depor compulsoriamente sob pena de crime de desobediência.' },
          { id: 'b', text: 'Tem o dever de recusar-se a depor sobre fatos de que tomou conhecimento em razão do exercício profissional, mesmo se desobrigado pelo constituinte.' },
          { id: 'c', text: 'Pode prestar depoimento desde que autorizado verbalmente pelo juiz presidente.' },
          { id: 'd', text: 'O sigilo cessa automaticamente após 5 anos da renúncia ao mandato.' },
        ],
        correctOptionId: 'b',
        explanation:
          'Art. 7º, XIX do EAOAB: É direito do advogado recusar-se a depor como testemunha sobre fatos de que tomou conhecimento no exercício da profissão, ainda que desobrigado pelo cliente.',
      },
      {
        id: `q-custom-${Date.now()}-2`,
        subject: 'Direito Constitucional',
        topic: 'Eficácia das Normas Constitucionais',
        examOrigin: 'OAB FGV Simulado',
        question:
          'Dispositivo constitucional que assegura o livre exercício de qualquer trabalho, ofício ou profissão, atendidas as qualificações profissionais que a lei estabelecer, classifica-se como norma de eficácia:',
        options: [
          { id: 'a', text: 'Plena, produzindo efeitos imediatos sem qualquer possibilidade de restrição infraconstitucional.' },
          { id: 'b', text: 'Contida, que nasce com aplicabilidade direta e imediata, mas passível de restrição ou redução pelo legislador ordinário.' },
          { id: 'c', text: 'Limitada de princípio institutivo, dependendo de lei para gerar qualquer efeito.' },
          { id: 'd', text: 'Diferida, condicionada à promulgação de emenda à Constituição.' },
        ],
        correctOptionId: 'b',
        explanation:
          'Art. 5º, XIII da CF/88: Conforme lição clássica de José Afonso da Silva, cuida-se de norma de eficácia contida, pois já produz todos os seus efeitos desde logo, podendo a lei ordinária apenas impor qualificações restritivas.',
      },
    ];
    setImportJsonText(JSON.stringify(sample, null, 2));
    setImportError('');
  };

  // Processa o arquivo ou texto importado
  const handleExecuteImport = () => {
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('Por favor, cole o JSON com as questões ou selecione um arquivo.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setImportError('O JSON deve ser um array contendo ao menos uma questão jurídica.');
        return;
      }

      // Validação básica dos campos de cada questão
      const validated: LawQuestion[] = parsed.map((item: any, idx: number) => {
        if (!item.question || !item.options || !Array.isArray(item.options) || !item.correctOptionId) {
          throw new Error(`Questão no índice #${idx + 1} está com campos obrigatórios ausentes.`);
        }
        return {
          id: item.id || `q-imported-${Date.now()}-${idx}`,
          subject: item.subject || 'Geral / Outros',
          topic: item.topic || 'Geral',
          examOrigin: item.examOrigin || 'Importada FGV',
          question: item.question,
          options: item.options.map((opt: any) => ({
            id: String(opt.id).toLowerCase(),
            text: opt.text,
          })),
          correctOptionId: String(item.correctOptionId).toLowerCase(),
          explanation: item.explanation || 'Gabarito oficial FGV.',
          userAnswer: undefined, // Garante que entre sem resposta para o aluno resolver
        };
      });

      importQuestions(validated, importMode === 'replace');
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err: any) {
      setImportError(`Erro no formato JSON: ${err.message || 'Estrutura inválida.'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportJsonText(content);
        setImportError('');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Questões Respondidas
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
              {answeredCount} / {questions.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Banco de questões ativas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Acertos
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {correctCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Respostas corretas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Aproveitamento
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">
              {accuracyPct}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Taxa de assertividade</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Subject Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4 text-theme-accent" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Disciplina:
            </span>
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-black text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-theme-accent"
          >
            <option
              value="todas"
              style={{
                backgroundColor: theme === 'megapreto' ? '#000000' : theme === 'branco' ? '#ffffff' : '#090d16',
                color: theme === 'branco' ? '#000000' : '#ffffff',
              }}
            >
              Todas as disciplinas ({questions.length})
            </option>
            {(subjects || LAW_SUBJECTS).map((s) => {
              const countInSub = questions.filter((q) => q.subject === s).length;
              return (
                <option
                  key={s}
                  value={s}
                  style={{
                    backgroundColor: theme === 'megapreto' ? '#000000' : theme === 'branco' ? '#ffffff' : '#090d16',
                    color: theme === 'branco' ? '#000000' : '#ffffff',
                  }}
                >
                  {getSubjectDisplayName(s)} ({countInSub})
                </option>
              );
            })}
          </select>
        </div>

        {/* Action Buttons: Import & Reset */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer active:scale-95"
            title="Zera as respostas marcadas mantendo as questões intactas"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Zerar Respostas</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-theme-accent text-white hover:opacity-90 text-xs font-extrabold transition-all shadow-theme-accent cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Questões (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhuma questão encontrada para este filtro
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Selecione outra matéria ou clique em "Subir Questões" para adicionar novas questões ao banco de dados.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, qIndex) => {
            const subColor = getSubjectColor(q.subject);
            const isAnswered = q.userAnswer !== undefined;

            return (
              <div
                key={q.id}
                className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Questão #{qIndex + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${subColor.bg} ${subColor.text} ${subColor.border}`}
                    >
                      {q.subject}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      • {q.topic}
                    </span>
                  </div>
                  {q.examOrigin && (
                    <span className="text-xs bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg font-bold">
                      {q.examOrigin}
                    </span>
                  )}
                </div>

                {/* Question Body */}
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {q.question}
                </p>

                {/* Options */}
                <div className="space-y-2.5 pt-2">
                  {q.options.map((opt) => {
                    const isSelected = q.userAnswer === opt.id;
                    const isCorrect = q.correctOptionId === opt.id;

                    let optionStyle =
                      'border-slate-200 dark:border-white/10 bg-white/40 dark:bg-zinc-950/70 hover:border-theme-accent dark:hover:border-theme-accent text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-white/5';
                    let icon = null;

                    if (isAnswered) {
                      if (isCorrect) {
                        optionStyle =
                          'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold';
                        icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
                      } else if (isSelected) {
                        optionStyle =
                          'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-bold';
                        icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
                      } else {
                        optionStyle =
                          'border-slate-200/50 dark:border-white/5 opacity-50 text-slate-600 dark:text-zinc-400';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => answerQuestion(q.id, opt.id)}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-3 transition-all cursor-pointer disabled:cursor-default ${optionStyle}`}
                      >
                        <span className="font-bold uppercase text-theme-accent shrink-0 mt-0.5">
                          {opt.id})
                        </span>
                        <span className="flex-1 leading-relaxed">{opt.text}</span>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {/* Answer Explanation & Law device rationale */}
                {isAnswered && (
                  <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs space-y-1.5 animate-in fade-in duration-300">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <BookOpen className="w-4 h-4 text-theme-accent" />
                      <span>Justificativa Jurídica & Gabarito Comentado:</span>
                    </div>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog: Zerar Respostas */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          clearQuestionAnswers();
          setIsResetConfirmOpen(false);
        }}
        title="Zerar Respostas dos Simulados"
        message="Deseja limpar todas as respostas marcadas e voltar o contador de questões respondidas para 0? Seu banco de questões permanecerá integralmente salvo."
        confirmLabel="Sim, Zerar Respostas (0/25)"
      />

      {/* Modal: Subir / Importar Questões */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-7 space-y-5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/15 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-theme-accent-tint border border-theme-accent flex items-center justify-center text-theme-accent">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Importar Banco de Questões Jurídicas
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Faça upload de arquivo .JSON ou cole o texto formatado das questões.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Opções de Importação */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Modo de Inserção:</span>
                  <div className="inline-flex rounded-lg border border-slate-200 dark:border-white/10 p-0.5 bg-slate-50 dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => setImportMode('append')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        importMode === 'append'
                          ? 'bg-theme-accent text-white shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Somar ao Banco (+ Novas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        importMode === 'replace'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Substituir Banco Atual
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-700 dark:text-zinc-300 font-bold cursor-pointer transition-colors">
                    <FileText className="w-3.5 h-3.5 text-theme-accent" />
                    <span>Upload Arquivo .JSON</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSampleJson}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exemplo Pronto</span>
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Conteúdo JSON das Questões:</span>
                  <span className="text-[10px] text-slate-400">
                    Campos esperados: subject, topic, question, options (a,b,c,d), correctOptionId, explanation
                  </span>
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    if (importError) setImportError('');
                  }}
                  rows={10}
                  placeholder="Cole aqui o array JSON com as questões ou clique em 'Exemplo Pronto'..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-theme-accent"
                />
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-extrabold shadow-theme-accent transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Salvar Questões no Banco</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
