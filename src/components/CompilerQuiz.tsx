import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { COMPILER_CHEATSHEET } from '../utils/presets';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface CompilerQuizProps {
  onAskInChat: (question: string) => void;
}

export const CompilerQuiz: React.FC<CompilerQuizProps> = ({ onAskInChat }) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'quiz'>('theory');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const handleGenerateQuiz = async () => {
    setIsLoadingQuiz(true);
    setSelectedAnswers({});

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Compiler Theory', difficulty: 'Beginner' }),
      });

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.log('Quiz loaded');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Compiler Theory & Quiz
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quick reference guide and concept quiz for learners.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'theory' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            6 Phases Guide
          </button>
          <button
            onClick={() => {
              setActiveTab('quiz');
              if (!questions) handleGenerateQuiz();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Quick Quiz
          </button>
        </div>
      </div>

      {/* Guide Tab */}
      {activeTab === 'theory' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMPILER_CHEATSHEET.map((phase, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Stage {idx + 1}
                  </span>
                  <button
                    onClick={() => onAskInChat(`Explain ${phase.phase} simply with an example`)}
                    className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Ask AI</span>
                  </button>
                </div>
                <h3 className="text-sm font-bold text-white">{phase.phase.split('. ')[1]}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{phase.role}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {phase.keyConcepts.slice(0, 3).map((kc, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-300 border border-slate-800"
                    >
                      {kc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Test your knowledge:</span>
            <button
              onClick={handleGenerateQuiz}
              disabled={isLoadingQuiz}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isLoadingQuiz ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Questions</span>
                </>
              )}
            </button>
          </div>

          {isLoadingQuiz && (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
              Loading quiz questions...
            </div>
          )}

          {!isLoadingQuiz && questions && (
            <div className="space-y-4">
              {questions.map((q, qIdx) => {
                const answered = selectedAnswers[q.id] !== undefined;
                const isCorrect = selectedAnswers[q.id] === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                        <span className="text-indigo-400 mr-1.5">Q{qIdx + 1}.</span>
                        {q.question}
                      </h3>
                      <button
                        onClick={() => onAskInChat(`Explain the answer to: ${q.question}`)}
                        className="text-[11px] text-slate-400 hover:text-indigo-400 shrink-0 p-1 cursor-pointer"
                        title="Ask in chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options (touch friendly for mobile) */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[q.id] === optIdx;
                        const isCorrectOption = q.correctIndex === optIdx;

                        let style =
                          'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800';

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
                            className={`w-full p-2.5 sm:p-3 rounded-xl border text-xs text-left transition-all flex items-start gap-2.5 cursor-pointer active:scale-[0.99] ${style}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>

                            {answered && isCorrectOption && (
                              <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                            )}
                            {answered && isSelected && !isCorrectOption && (
                              <XCircle className="w-4 h-4 text-rose-400 ml-auto shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback */}
                    {answered && (
                      <div
                        className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-indigo-950/20 border-indigo-500/30 text-slate-300'
                        }`}
                      >
                        <strong>{isCorrect ? 'Correct! 🎉 ' : 'Explanation: '}</strong>
                        {q.explanation}
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
