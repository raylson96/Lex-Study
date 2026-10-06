import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  parseScheduleText,
  AI_PROMPT_TEMPLATE,
} from '../../utils/scheduleParser';
import { getSubjectColor, formatDateShort, getPriorityBadge } from '../../utils/formatters';
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  ListPlus,
  RefreshCw,
} from 'lucide-react';

interface ImportScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportScheduleModal: React.FC<ImportScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { importScheduleItems, showToast } = useApp();

  const [rawText, setRawText] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const parsedItems = parseScheduleText(rawText);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
    setCopiedPrompt(true);
    showToast('Prompt copiado! Cole no ChatGPT, Gemini ou Claude junto com seu PDF.');
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;
    importScheduleItems(parsedItems, replaceMode);
    setRawText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Cronograma com IA ou Texto"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Helper Banner for AI Prompt */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                Tem um PDF de cronograma? Use a IA para formatar!
              </h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300/80 leading-relaxed mt-0.5">
                Copie o prompt pronto abaixo, cole no <strong>ChatGPT</strong>, <strong>Claude</strong> ou <strong>Gemini</strong> junto com o seu PDF e cole o resultado aqui.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-indigo-200 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">Prompt Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Prompt para IA</span>
              </>
            )}
          </button>
        </div>

        {/* Text Area for Pasting */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Cole o texto do seu cronograma abaixo:
            </label>
            {rawText.trim() && (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/40 dark:border-indigo-800/40 px-2 py-0.5 rounded-full">
                {parsedItems.length} {parsedItems.length === 1 ? 'tópico identificado' : 'tópicos identificados'}
              </span>
            )}
          </div>

          <textarea
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Exemplos aceitos:
15/10/2026 | Direito Constitucional | Controle Concentrado (ADI, ADC) | 90 | Alta
16/10/2026 | Ética Profissional (OAB) | Prerrogativas do Advogado | 90 | Alta
17/10/2026 - Direito Civil: Vícios Redibitórios e Evicção
18/10/2026: Direito Penal - Furto, Roubo e Extorsão`}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
          />
        </div>

        {/* Live Preview of parsed items */}
        {parsedItems.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Pré-visualização dos Tópicos Reconhecidos:
            </span>
            <div className="max-h-52 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-xl divide-y divide-slate-100 dark:divide-white/5 bg-slate-50/50 dark:bg-slate-900/40">
              {parsedItems.map((item, idx) => {
                const subColor = getSubjectColor(item.subject);
                const priorityBadge = getPriorityBadge(item.priority);

                return (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        {formatDateShort(item.date)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${subColor.bg} ${subColor.text} ${subColor.border}`}
                      >
                        {item.subject}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.topic}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.durationMinutes} min</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityBadge.color}`}
                      >
                        {priorityBadge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Import Mode Options */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Modo de Importação:</span>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={!replaceMode}
                onChange={() => setReplaceMode(false)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Adicionar ao cronograma existente (mantém metas atuais)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={replaceMode}
                onChange={() => setReplaceMode(true)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-rose-600 dark:text-rose-400 font-medium">Substituir todo o cronograma atual</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={parsedItems.length === 0}
            onClick={handleConfirmImport}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <ListPlus className="w-4 h-4" />
            <span>Confirmar e Importar {parsedItems.length > 0 ? `(${parsedItems.length})` : ''}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
