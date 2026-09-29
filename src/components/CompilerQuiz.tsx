import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { COMPILER_CHEATSHEET } from '../utils/presets';
import { CodeBlock } from './CodeBlock';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Layers,
  Award,
} from 'lucide-react';

interface CompilerQuizProps {
  onAskInChat: (question: string) => void;
}

export const CompilerQuiz: React.FC<CompilerQuizProps> = ({ onAskInChat }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'quiz'>('theory');
  const [topic, setTopic] = useState<string>('LL & LR Parsing, Grammars, and ASTs');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [quizError, setQuizError] = useState<string | null>(null);

  const topicsList = [
    'LL & LR Parsing, Grammars, and ASTs',
    'Lexical Analysis, Regex, and Finite Automata',
    'Semantic Analysis, Type Systems, and Symbol Tables',
    'Intermediate Representation (IR) and SSA Form',
    'Compiler Optimizations (DCE, Constant Folding, LICM)',
    'Code Generation, Register Allocation, and Assembly',
  ];

  const handleGenerateQuiz = async () => {
    setIsLoadingQuiz(true);
    setQuizError(null);
    setSelectedAnswers({});
    setRevealedExplanations({});

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz questions');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
      setQuizError(err.message || 'Error creating quiz');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setRevealedExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  // Calculate score
  const totalAnswered = Object.keys(selectedAnswers).length;
  const correctCount = questions
    ? questions.filter((q) => selectedAnswers[q.id] === q.correctIndex).length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Compiler Theory & Knowledge Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Master the architecture of modern compilers through reference maps and interactive AI quizzes.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'theory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Compiler Pipeline Guide
          </button>
          <button
            onClick={() => {
              setActiveTab('quiz');
              if (!questions) handleGenerateQuiz();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Interactive Quiz
          </button>
        </div>
      </div>

      {/* TAB 1: Theory Guide */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              The Canonical 6-Phase Compiler Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              Traditional compilers follow a Frontend → Optimizer (Middle-end) → Backend structure. The frontend handles language-specific syntax and semantics, the middle-end performs language-independent optimization, and the backend maps intermediate code to CPU instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPILER_CHEATSHEET.map((phase, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Phase {idx + 1}
                    </span>
                    <button
                      onClick={() =>
                        onAskInChat(
                          `Can you give me a comprehensive lecture and intuitive examples on ${phase.phase}?`
                        )
                      }
                      className="text-slate-500 group-hover:text-indigo-400 transition-colors p-1"
                      title="Ask in chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{phase.phase.split('. ')[1]}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{phase.role}</p>

                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Core Concepts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.keyConcepts.map((kc, kIdx) => (
                        <span
                          key={kIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700"
                        >
                          {kc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Tools: {phase.tools}</span>
                  <button
                    onClick={() =>
                      onAskInChat(
                        `How does ${phase.phase.split('. ')[1]} work under the hood? Explain key algorithms like ${phase.keyConcepts.join(', ')}.`
                      )
                    }
                    className="text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Learn more <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Dynamic Quiz */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topic:</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 py-1.5 px-3 rounded-lg focus:outline-none"
                >
                  {topicsList.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Difficulty:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 py-1.5 px-3 rounded-lg focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced (Compiler Dev)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {questions && totalAnswered > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300 font-medium">
                    Score: {correctCount} / {questions.length}
                  </span>
                </div>
              )}

              <button
                onClick={handleGenerateQuiz}
                disabled={isLoadingQuiz}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30"
              >
                {isLoadingQuiz ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate New Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {quizError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {quizError}
            </div>
          )}

          {isLoadingQuiz && (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-white">Synthesizing Compiler Challenge Questions...</p>
              <p className="text-xs text-slate-400">Crafting code puzzles and multiple-choice questions</p>
            </div>
          )}

          {!isLoadingQuiz && questions && (
            <div className="space-y-6">
              {questions.map((q, qIdx) => {
                const answered = selectedAnswers[q.id] !== undefined;
                const isCorrect = selectedAnswers[q.id] === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
                            Q{qIdx + 1} • {q.topic}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Concept: {q.keyConcept}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white leading-snug">{q.question}</h3>
                      </div>

                      <button
                        onClick={() =>
                          onAskInChat(
                            `Can you explain the answer to this compiler question in detail?\nQuestion: ${q.question}\nOptions: ${q.options.join(', ')}`
                          )
                        }
                        className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                        title="Discuss in chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Ask AI</span>
                      </button>
                    </div>

                    {q.codeExample && (
                      <CodeBlock code={q.codeExample} language="c" showLineNumbers={false} />
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        const isCorrectOption = q.correctIndex === optIdx;

                        let style =
                          'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900';

                        if (answered) {
                          if (isCorrectOption) {
                            style = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200';
                          } else if (isSelected && !isCorrectOption) {
                            style = 'bg-rose-950/40 border-rose-500/60 text-rose-200';
                          } else {
                            style = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            disabled={answered}
                            className={`p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-start gap-3 cursor-pointer ${style}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>

                            {answered && isCorrectOption && (
                              <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto shrink-0 mt-0.5" />
                            )}
                            {answered && isSelected && !isCorrectOption && (
                              <XCircle className="w-4 h-4 text-rose-400 ml-auto shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Reveal */}
                    {answered && (
                      <div
                        className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                          isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {isCorrect ? (
                            <span className="text-emerald-400">Correct! 🎉</span>
                          ) : (
                            <span className="text-amber-400">Incorrect. Correct answer is option {String.fromCharCode(65 + q.correctIndex)}:</span>
                          )}
                        </div>
                        <p className="text-slate-300">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
