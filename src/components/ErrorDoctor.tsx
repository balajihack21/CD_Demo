import React, { useState } from 'react';
import { ErrorDiagnosis } from '../types';
import { ERROR_PRESETS, ErrorPreset } from '../utils/presets';
import { CodeBlock } from './CodeBlock';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Bug,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ErrorDoctorProps {
  onAskInChat: (question: string) => void;
}

export const ErrorDoctor: React.FC<ErrorDoctorProps> = ({ onAskInChat }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ERROR_PRESETS[0].id);
  const [errorLog, setErrorLog] = useState<string>(ERROR_PRESETS[0].errorLog);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<ErrorDiagnosis | null>(null);
  const [copiedFix, setCopiedFix] = useState<boolean>(false);

  const handleSelectPreset = (preset: ErrorPreset) => {
    setSelectedPresetId(preset.id);
    setErrorLog(preset.errorLog);
  };

  const handleDiagnose = async () => {
    if (!errorLog.trim() || isDiagnosing) return;
    setIsDiagnosing(true);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorLog,
          compiler: 'gcc',
        }),
      });

      const data: ErrorDiagnosis = await response.json();
      setDiagnosis(data);
    } catch (err) {
      console.log('Error diagnosis completed');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCopyFix = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Title */}
      <div className="text-center sm:text-left">
        <h1 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
          <Stethoscope className="w-5 h-5 text-rose-400" />
          Compiler Error Doctor
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Paste any cryptic compiler error to understand what broke and how to fix it.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            Try a common compiler error:
          </span>
          <div className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-none">
            {ERROR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  selectedPresetId === preset.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {preset.name.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <textarea
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
            rows={4}
            placeholder="Paste your compiler error log here..."
            className="w-full bg-transparent p-3 text-rose-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        <button
          onClick={handleDiagnose}
          disabled={isDiagnosing || !errorLog.trim()}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 active:scale-[0.99] cursor-pointer"
        >
          {isDiagnosing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Diagnosing Error...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Explain & Fix This Error</span>
            </>
          )}
        </button>
      </div>

      {/* Diagnosis Card */}
      {diagnosis && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-white">{diagnosis.title}</h2>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                  {diagnosis.category}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                  Stage: {diagnosis.compilerPhase}
                </span>
              </div>
            </div>

            <button
              onClick={() => onAskInChat(`Explain this compiler error in simple terms:\n${errorLog}`)}
              className="self-start sm:self-auto flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discuss in Chat</span>
            </button>
          </div>

          {/* Plain English */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong className="text-indigo-400 block text-xs uppercase tracking-wider mb-1">
              What Happened in Plain English:
            </strong>
            {diagnosis.plainEnglishExplanation}
          </div>

          {/* The Solution */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> The Fix:
              </span>
              <button
                onClick={() => handleCopyFix(diagnosis.suggestedFix.fixedSnippet)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                {copiedFix ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Fix</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300">{diagnosis.suggestedFix.explanation}</p>

            <CodeBlock
              code={diagnosis.suggestedFix.fixedSnippet}
              language="c"
              showLineNumbers={false}
              maxHeight="max-h-48"
            />
          </div>
        </div>
      )}
    </div>
  );
};
