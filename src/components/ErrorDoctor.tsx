import React, { useState } from 'react';
import { ErrorDiagnosis } from '../types';
import { ERROR_PRESETS, ErrorPreset } from '../utils/presets';
import { CodeBlock } from './CodeBlock';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Bug,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  FileCode,
  Layers,
} from 'lucide-react';

interface ErrorDoctorProps {
  onAskInChat: (question: string) => void;
}

export const ErrorDoctor: React.FC<ErrorDoctorProps> = ({ onAskInChat }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ERROR_PRESETS[0].id);
  const [compiler, setCompiler] = useState<string>('gcc');
  const [errorLog, setErrorLog] = useState<string>(ERROR_PRESETS[0].errorLog);
  const [codeSnippet, setCodeSnippet] = useState<string>(ERROR_PRESETS[0].codeSnippet);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<ErrorDiagnosis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedFix, setCopiedFix] = useState<boolean>(false);

  const handleSelectPreset = (preset: ErrorPreset) => {
    setSelectedPresetId(preset.id);
    setCompiler(preset.compiler);
    setErrorLog(preset.errorLog);
    setCodeSnippet(preset.codeSnippet);
  };

  const handleDiagnose = async () => {
    if (!errorLog.trim() || isDiagnosing) return;
    setIsDiagnosing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorLog,
          codeSnippet,
          compiler,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to diagnose error`);
      }

      const data: ErrorDiagnosis = await response.json();
      setDiagnosis(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to diagnose compiler error');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Stethoscope className="w-6 h-6 text-rose-400" />
            Compiler Error Doctor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Paste any cryptic GCC, Clang, rustc, javac, or linker diagnostic to decipher what the compiler actually detected and how to fix it.
          </p>
        </div>

        <button
          onClick={handleDiagnose}
          disabled={isDiagnosing || !errorLog.trim()}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            isDiagnosing || !errorLog.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/30'
          }`}
        >
          {isDiagnosing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Diagnosing Error...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Diagnose Error</span>
            </>
          )}
        </button>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Presets + Error Log + Code */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
            {/* Presets */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Sample Confusing Errors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ERROR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left ${
                      selectedPresetId === preset.id
                        ? 'bg-rose-600/80 text-white font-medium border border-rose-500/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Compiler Selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Compiler / Diagnostic tool:</span>
              <select
                value={compiler}
                onChange={(e) => setCompiler(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-300 px-2 py-1 rounded-lg"
              >
                <option value="gcc">GCC (C / C++)</option>
                <option value="clang">Clang / LLVM</option>
                <option value="rustc">rustc (Rust)</option>
                <option value="g++">g++ / GNU ld Linker</option>
                <option value="javac">javac (Java)</option>
                <option value="tsc">tsc (TypeScript)</option>
              </select>
            </div>

            {/* Error Log Area */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  Compiler Error Output / Diagnostic Log:
                </span>
              </label>
              <div className="rounded-xl overflow-hidden border border-rose-500/30 bg-slate-950">
                <textarea
                  value={errorLog}
                  onChange={(e) => setErrorLog(e.target.value)}
                  rows={6}
                  placeholder="Paste compiler error message here..."
                  className="w-full bg-transparent p-3 text-rose-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Code Snippet (Optional) */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                Associated Source Code (Optional, helps provide exact fix):
              </label>
              <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950">
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={6}
                  placeholder="Paste code where the error occurred..."
                  className="w-full bg-transparent p-3 text-slate-200 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Detailed Diagnostic Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm">
              <p className="font-semibold mb-1">Diagnostic Error</p>
              <p>{errorMsg}</p>
            </div>
          )}

          {!diagnosis && !isDiagnosing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/30">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Error Doctor Standing By</h3>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
                Paste any compiler warning, error message, or linker failure to analyze which compiler stage caught it, why it happened, and how to fix it cleanly.
              </p>
              <button
                onClick={handleDiagnose}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Diagnose Sample Error
              </button>
            </div>
          )}

          {isDiagnosing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-slate-800 rounded-2xl p-8 text-center bg-slate-900/40">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-rose-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Analyzing Compiler Diagnostic</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Parsing diagnostic flags → Isolating failing phase → Consulting language specifications → Formulating verified fix...
              </p>
            </div>
          )}

          {diagnosis && !isDiagnosing && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    {diagnosis.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {diagnosis.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Detected in: {diagnosis.compilerPhase}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {diagnosis.severity}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onAskInChat(
                      `Explain this compiler error in deep detail:\n${diagnosis.title}\nLog:\n${errorLog}`
                    )
                  }
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer shadow-sm shadow-indigo-600/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss in Chat</span>
                </button>
              </div>

              {/* Plain English Meaning */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                  In Plain English:
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {diagnosis.plainEnglishExplanation}
                </p>
              </div>

              {/* Why the Compiler Complained */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Why the Compiler Complained (Language Rules):
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {diagnosis.whyCompilerComplained}
                </p>
              </div>

              {/* Culprit Location */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-500 font-medium">Culprit:</span>
                <span className="font-mono text-indigo-300 font-semibold">{diagnosis.culpritLocation.file}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-mono">Line {diagnosis.culpritLocation.line}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-mono">Col {diagnosis.culpritLocation.column}</span>
                <span className="text-slate-500">•</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-rose-300">
                  {diagnosis.culpritLocation.tokenOrSymbol}
                </span>
              </div>

              {/* Verified Code Fix */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified Solution & Fix:
                  </span>
                  <button
                    onClick={() => handleCopyFix(diagnosis.suggestedFix.fixedSnippet)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    {copiedFix ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Fixed Code</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300">{diagnosis.suggestedFix.explanation}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
                      Problematic Code:
                    </span>
                    <CodeBlock
                      code={diagnosis.suggestedFix.originalSnippet}
                      language={compiler}
                      showLineNumbers={false}
                      maxHeight="max-h-48"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                      Corrected Code:
                    </span>
                    <CodeBlock
                      code={diagnosis.suggestedFix.fixedSnippet}
                      language={compiler}
                      showLineNumbers={false}
                      maxHeight="max-h-48"
                    />
                  </div>
                </div>
              </div>

              {/* Pitfalls & Best Practices */}
              {diagnosis.pitfallsAndTips?.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Pitfalls to Avoid & Pro Tips:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {diagnosis.pitfallsAndTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
