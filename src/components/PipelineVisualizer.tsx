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
  ArrowRight,
  Sparkles,
  Zap,
  Terminal,
  Binary,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  Copy,
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
  const [language, setLanguage] = useState<string>('c');
  const [targetArch, setTargetArch] = useState<string>('x86-64');
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PipelineAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (preset: CodePreset) => {
    setSelectedPresetId(preset.id);
    setLanguage(preset.language);
    onCodeChange(preset.code);
  };

  const handleRunAnalysis = async () => {
    if (!code.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          targetArch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to analyze`);
      }

      const data: PipelineAnalysis = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to complete compiler pipeline analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const phases = [
    { id: 'lex', name: '1. Lexical Analysis', subtitle: 'Scanner & Tokens', icon: <Terminal className="w-4 h-4" /> },
    { id: 'parse', name: '2. Syntax Analysis', subtitle: 'Parser & AST', icon: <Layers className="w-4 h-4" /> },
    { id: 'semantic', name: '3. Semantic Analysis', subtitle: 'Types & Symbol Table', icon: <TableProperties className="w-4 h-4" /> },
    { id: 'ir', name: '4. Intermediate Code', subtitle: '3-Address Code / IR', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'opt', name: '5. Optimization', subtitle: 'Constant Fold / DCE', icon: <Zap className="w-4 h-4" /> },
    { id: 'codegen', name: '6. Code Generation', subtitle: 'Target Assembly', icon: <Binary className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-400" />
            Interactive 6-Stage Compiler Visualizer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Input source code to trace how a compiler translates human logic into CPU instructions step by step.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <select
            value={targetArch}
            onChange={(e) => setTargetArch(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="x86-64">Target: x86-64 (Intel/AMD)</option>
            <option value="ARM64">Target: ARM64 (Apple Silicon / AArch64)</option>
          </select>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !code.trim()}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              isAnalyzing || !code.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compiling Phases...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Compiler Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor and Presets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Input & Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                Source Code Editor
              </label>

              {/* Language selection */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Lang:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-300 px-2 py-1 rounded-lg"
                >
                  <option value="c">C</option>
                  <option value="rust">Rust</option>
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                </select>
              </div>
            </div>

            {/* Presets Pills */}
            <div className="mb-3">
              <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                Load Canonical Compiler Example:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CODE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedPresetId === preset.id
                        ? 'bg-indigo-600/80 text-white font-medium border border-indigo-500/40'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {preset.name.split('&')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Textarea */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950">
              <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                rows={10}
                placeholder="Enter source code to compile..."
                className="w-full bg-transparent p-3 text-slate-200 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Lines: {code.split('\n').length}</span>
              <span>Characters: {code.length}</span>
            </p>
          </div>

          {/* Quick Explanation Trigger */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">Interactive Pipeline Bridge</p>
              <p className="text-slate-400 leading-relaxed">
                Clicking <span className="text-indigo-300 font-medium">"Run Compiler Analysis"</span> executes a full pass through the Dragon Book compiler model. You can examine ASTs, Symbol Tables, IR, and Assembly.
              </p>
            </div>
          </div>
        </div>

        {/* Right: 6-Phase Pipeline Results */}
        <div className="lg:col-span-7 space-y-4">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm">
              <p className="font-semibold mb-1">Analysis Error</p>
              <p>{errorMsg}</p>
            </div>
          )}

          {!analysisResult && !isAnalyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/30">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Ready to Trace Compilation</h3>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
                Click the <strong className="text-indigo-300">Run Compiler Analysis</strong> button to inspect the tokens, AST, symbol table, IR, and assembly generated for your code snippet.
              </p>
              <button
                onClick={handleRunAnalysis}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Analyze Current Code
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-slate-800 rounded-2xl p-8 text-center bg-slate-900/40">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Running Compiler Passes</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Scanning tokens → Constructing AST → Type Checking → Generating 3-Address Code → Optimizing → Emitting Assembly...
              </p>
              <div className="flex space-x-2 text-xs text-indigo-400">
                <span className="animate-pulse">Phase 1/6</span>
                <span>•</span>
                <span className="animate-pulse delay-100">Phase 2/6</span>
                <span>•</span>
                <span className="animate-pulse delay-200">Phase 3/6</span>
              </div>
            </div>
          )}

          {analysisResult && !isAnalyzing && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Pipeline Step Navigation Tabs */}
              <div className="flex overflow-x-auto scrollbar-thin border-b border-slate-800 bg-slate-950/70 p-2 gap-1.5">
                {phases.map((phase, idx) => {
                  const isActive = activePhaseIndex === idx;
                  return (
                    <button
                      key={phase.id}
                      onClick={() => setActivePhaseIndex(idx)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      {phase.icon}
                      <span className="font-semibold">{phase.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Phase Content Area */}
              <div className="p-5 space-y-4">
                {/* 1. Lexical Analysis */}
                {activePhaseIndex === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-indigo-400" />
                          Phase 1: Lexical Analysis (Scanner)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {analysisResult.lexicalAnalysis.summary}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onAskInChat(
                            `Can you explain lexical analysis, finite automata, and tokenization in detail based on this code:\n${code}`
                          )
                        }
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI about this</span>
                      </button>
                    </div>

                    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                      <div className="max-h-72 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-900 sticky top-0 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-2 px-3">Line</th>
                              <th className="py-2 px-3">Lexeme</th>
                              <th className="py-2 px-3">Token Type</th>
                              <th className="py-2 px-3">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {analysisResult.lexicalAnalysis.tokens.map((tok, i) => (
                              <tr key={i} className="hover:bg-slate-900/50">
                                <td className="py-2 px-3 text-slate-500 font-mono">{tok.line}</td>
                                <td className="py-2 px-3 font-mono font-bold text-indigo-300">
                                  {tok.lexeme}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                    {tok.type}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-slate-400">{tok.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Syntax Analysis */}
                {activePhaseIndex === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" />
                          Phase 2: Syntax Analysis (Parser & AST)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {analysisResult.syntaxAnalysis.summary}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onAskInChat(
                            `Explain the grammar rules and Abstract Syntax Tree (AST) structure for this snippet:\n${code}`
                          )
                        }
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI about this</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-slate-300">Abstract Syntax Tree (AST):</div>
                      <CodeBlock
                        code={analysisResult.syntaxAnalysis.asciiAst}
                        language="text"
                        showLineNumbers={false}
                        maxHeight="max-h-64"
                      />

                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-300 block mb-2">
                          Recognized AST Node Types:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {analysisResult.syntaxAnalysis.astNodes.map((node, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                            >
                              <div className="font-mono font-bold text-indigo-300 mb-0.5">
                                {node.nodeType}
                              </div>
                              <div className="text-slate-400 text-[11px]">{node.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Semantic Analysis */}
                {activePhaseIndex === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <TableProperties className="w-4 h-4 text-indigo-400" />
                          Phase 3: Semantic Analysis & Symbol Table
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {analysisResult.semanticAnalysis.summary}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onAskInChat(
                            `How does type checking and scope resolution work in the semantic analysis phase for:\n${code}`
                          )
                        }
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI about this</span>
                      </button>
                    </div>

                    {/* Symbol Table */}
                    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-300">
                        Generated Symbol Table
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="py-2 px-3">Identifier</th>
                              <th className="py-2 px-3">Data Type</th>
                              <th className="py-2 px-3">Scope</th>
                              <th className="py-2 px-3">Attributes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {analysisResult.semanticAnalysis.symbolTable.map((entry, i) => (
                              <tr key={i} className="hover:bg-slate-900/50">
                                <td className="py-2 px-3 font-mono font-bold text-indigo-300">
                                  {entry.identifier}
                                </td>
                                <td className="py-2 px-3 font-mono text-cyan-400">{entry.dataType}</td>
                                <td className="py-2 px-3 text-slate-400">{entry.scope}</td>
                                <td className="py-2 px-3 text-slate-400">{entry.attributes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Semantic Checks */}
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block mb-2">
                        Enforced Semantic Validations:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {analysisResult.semanticAnalysis.checks.map((chk, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{chk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 4. Intermediate Code Generation */}
                {activePhaseIndex === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <FileCode2 className="w-4 h-4 text-indigo-400" />
                          Phase 4: Intermediate Representation (IR)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {analysisResult.intermediateRepresentation.summary}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onAskInChat(
                            `Why is Intermediate Representation (like 3AC or LLVM IR) necessary between the AST and target assembly? Code:\n${code}`
                          )
                        }
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI about this</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400">IR Dialect:</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">
                        {analysisResult.intermediateRepresentation.irFormat}
                      </span>
                    </div>

                    <CodeBlock
                      code={analysisResult.intermediateRepresentation.irCode}
                      language="llvm"
                      showLineNumbers={true}
                    />

                    <div>
                      <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                        IR Operations Commentary:
                      </span>
                      <div className="space-y-1.5">
                        {analysisResult.intermediateRepresentation.explanation.map((item, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Optimization */}
                {activePhaseIndex === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          Phase 5: Machine-Independent Optimization
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {analysisResult.optimization.summary}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onAskInChat(
                            `Explain compiler optimizations (constant folding, dead code elimination, loop invariant code motion) for this example:\n${code}`
                          )
                        }
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI about this</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {analysisResult.optimization.passesApplied.map((pass, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-400" />
                              Pass: {pass.passName}
                            </span>
                            <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              {pass.benefit}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Before Pass:
                              </span>
                              <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono overflow-x-auto">
                                {pass.before}
                              </pre>
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                                After Pass:
                              </span>
                              <pre className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono overflow-x-auto">
                                {pass.after}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Code Generation */}
                {activePhaseIndex === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Binary className="w-4 h-4 text-emerald-400" />
                          Phase 6: Code Generation & Assembly ({analysisResult.codeGeneration.architecture})
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {analysisResult.codeGeneration.summary}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onAskInChat(
                            `Can you explain the generated assembly instructions and register calling conventions for this code:\n${analysisResult.codeGeneration.assemblyCode}`
                          )
                        }
                        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI about this</span>
                      </button>
                    </div>

                    <CodeBlock
                      code={analysisResult.codeGeneration.assemblyCode}
                      language="assembly"
                      showLineNumbers={true}
                    />

                    {/* Register Table */}
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block mb-2">
                        Hardware Register Mappings:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {analysisResult.codeGeneration.registerUsage.map((reg, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                          >
                            <span className="font-mono font-bold text-cyan-300">{reg.register}</span>
                            <span className="text-slate-400 text-[11px]">{reg.purpose}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Summary Callout */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">End-to-End Transformation Summary: </strong>
                  <span>{analysisResult.summary}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
