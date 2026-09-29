import React, { useState } from 'react';
import { PipelineAnalysis } from '../types';
import { CODE_PRESETS, CodePreset } from '../utils/presets';
import { CodeBlock } from './CodeBlock';
import {
  Play,
  Cpu,
  Layers,
  FileCode2,
  TableProperties,
  Zap,
  Terminal,
  Binary,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface PipelineVisualizerProps {
  onAskInChat: (question: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  onAskInChat,
  code,
  onCodeChange,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CODE_PRESETS[0].id);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PipelineAnalysis | null>(null);

  const handleSelectPreset = (preset: CodePreset) => {
    setSelectedPresetId(preset.id);
    onCodeChange(preset.code);
  };

  const handleRunAnalysis = async () => {
    if (!code.trim() || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: 'c',
          targetArch: 'x86-64',
        }),
      });

      const data: PipelineAnalysis = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.log('Using standard analysis pipeline');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const phases = [
    { title: '1. Scanner (Tokens)', icon: <Terminal className="w-3.5 h-3.5" /> },
    { title: '2. Parser (AST)', icon: <Layers className="w-3.5 h-3.5" /> },
    { title: '3. Semantics (Types)', icon: <TableProperties className="w-3.5 h-3.5" /> },
    { title: '4. IR Code', icon: <FileCode2 className="w-3.5 h-3.5" /> },
    { title: '5. Optimizer', icon: <Zap className="w-3.5 h-3.5" /> },
    { title: '6. Assembly', icon: <Binary className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Title */}
      <div className="text-center sm:text-left">
        <h1 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          6-Phase Compiler Visualizer
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          See how human code transforms through the 6 classic compiler stages.
        </p>
      </div>

      {/* Quick Example Presets (Horizontal Scrollable on mobile) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Choose Code Example:</span>
          <span className="text-[11px] text-slate-500">Language: C</span>
        </div>

        <div className="flex overflow-x-auto pb-1 gap-1.5 scrollbar-none">
          {CODE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                selectedPresetId === preset.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {preset.name.split('&')[0]}
            </button>
          ))}
        </div>

        {/* Code Input */}
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            rows={5}
            placeholder="Type or paste code here..."
            className="w-full bg-transparent p-3 text-slate-200 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Run Button */}
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || !code.trim()}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Compiler Stages...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Trace 6 Compiler Steps</span>
            </>
          )}
        </button>
      </div>

      {/* Results Area */}
      {analysisResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Phase Tabs Bar (Horizontal scrolling on mobile) */}
          <div className="flex overflow-x-auto scrollbar-none border-b border-slate-800 bg-slate-950/80 p-1.5 gap-1">
            {phases.map((phase, idx) => {
              const isActive = activePhaseIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {phase.icon}
                  <span>{phase.title}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation bar for quick mobile jumping */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800/80 text-xs text-slate-400">
            <button
              onClick={() => setActivePhaseIndex((prev) => Math.max(0, prev - 1))}
              disabled={activePhaseIndex === 0}
              className="flex items-center gap-1 disabled:opacity-30 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev Step
            </button>
            <span className="font-semibold text-indigo-300">
              Step {activePhaseIndex + 1} of 6
            </span>
            <button
              onClick={() => setActivePhaseIndex((prev) => Math.min(5, prev + 1))}
              disabled={activePhaseIndex === 5}
              className="flex items-center gap-1 disabled:opacity-30 hover:text-white cursor-pointer"
            >
              Next Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stage Details */}
          <div className="p-4 sm:p-5 space-y-3">
            {/* Phase 1: Lexer */}
            {activePhaseIndex === 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Phase 1: Lexical Analysis (Tokens)</h3>
                  <button
                    onClick={() => onAskInChat(`Explain the lexical analysis phase for this code:\n${code}`)}
                    className="text-[11px] text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask in Chat
                  </button>
                </div>
                <p className="text-xs text-slate-400">{analysisResult.lexicalAnalysis.summary}</p>

                <div className="rounded-xl border border-slate-800 overflow-x-auto bg-slate-950">
                  <table className="w-full text-left text-xs min-w-[320px]">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-1.5 px-3">Line</th>
                        <th className="py-1.5 px-3">Token</th>
                        <th className="py-1.5 px-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {analysisResult.lexicalAnalysis.tokens.slice(0, 10).map((tok, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">{tok.line}</td>
                          <td className="py-1.5 px-3 font-mono font-bold text-indigo-300">{tok.lexeme}</td>
                          <td className="py-1.5 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                              {tok.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Phase 2: Parser */}
            {activePhaseIndex === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Phase 2: Syntax Analysis (AST)</h3>
                  <button
                    onClick={() => onAskInChat(`Explain the Abstract Syntax Tree (AST) structure for this code:\n${code}`)}
                    className="text-[11px] text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask in Chat
                  </button>
                </div>
                <p className="text-xs text-slate-400">{analysisResult.syntaxAnalysis.summary}</p>
                <CodeBlock
                  code={analysisResult.syntaxAnalysis.asciiAst}
                  language="text"
                  showLineNumbers={false}
                  maxHeight="max-h-56"
                />
              </div>
            )}

            {/* Phase 3: Semantic */}
            {activePhaseIndex === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Phase 3: Semantic Analysis & Types</h3>
                  <button
                    onClick={() => onAskInChat(`Explain how type checking and the symbol table work for:\n${code}`)}
                    className="text-[11px] text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask in Chat
                  </button>
                </div>
                <p className="text-xs text-slate-400">{analysisResult.semanticAnalysis.summary}</p>

                <div className="rounded-xl border border-slate-800 overflow-x-auto bg-slate-950">
                  <table className="w-full text-left text-xs min-w-[320px]">
                    <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-1.5 px-3">Symbol</th>
                        <th className="py-1.5 px-3">Data Type</th>
                        <th className="py-1.5 px-3">Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {analysisResult.semanticAnalysis.symbolTable.map((entry, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-3 font-mono font-bold text-indigo-300">{entry.identifier}</td>
                          <td className="py-1.5 px-3 font-mono text-cyan-400">{entry.dataType}</td>
                          <td className="py-1.5 px-3 text-slate-400 text-[11px]">{entry.scope}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1 pt-1">
                  {analysisResult.semanticAnalysis.checks.slice(0, 3).map((chk, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 4: IR */}
            {activePhaseIndex === 3 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Phase 4: Intermediate Code (TAC / IR)</h3>
                  <button
                    onClick={() => onAskInChat(`Explain Intermediate Representation and 3-Address Code for:\n${code}`)}
                    className="text-[11px] text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask in Chat
                  </button>
                </div>
                <p className="text-xs text-slate-400">{analysisResult.intermediateRepresentation.summary}</p>
                <CodeBlock
                  code={analysisResult.intermediateRepresentation.irCode}
                  language="llvm"
                  showLineNumbers={true}
                  maxHeight="max-h-56"
                />
              </div>
            )}

            {/* Phase 5: Optimizer */}
            {activePhaseIndex === 4 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Phase 5: Machine-Independent Optimization</h3>
                  <button
                    onClick={() => onAskInChat(`Explain constant folding and dead code elimination for:\n${code}`)}
                    className="text-[11px] text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask in Chat
                  </button>
                </div>
                <p className="text-xs text-slate-400">{analysisResult.optimization.summary}</p>

                <div className="space-y-2">
                  {analysisResult.optimization.passesApplied.map((pass, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-indigo-300">{pass.passName}</strong>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {pass.benefit}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <pre className="p-2 bg-slate-900 rounded font-mono text-slate-400 overflow-x-auto">
                          {pass.before}
                        </pre>
                        <pre className="p-2 bg-slate-900 rounded font-mono text-emerald-300 border border-emerald-500/20 overflow-x-auto">
                          {pass.after}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Phase 6: Assembly */}
            {activePhaseIndex === 5 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Phase 6: Native Machine Assembly</h3>
                  <button
                    onClick={() => onAskInChat(`Explain this generated assembly code:\n${analysisResult.codeGeneration.assemblyCode}`)}
                    className="text-[11px] text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask in Chat
                  </button>
                </div>
                <p className="text-xs text-slate-400">{analysisResult.codeGeneration.summary}</p>
                <CodeBlock
                  code={analysisResult.codeGeneration.assemblyCode}
                  language="assembly"
                  showLineNumbers={true}
                  maxHeight="max-h-56"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
