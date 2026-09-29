import React from 'react';
import { AppMode, AssistantDepth } from '../types';
import { Bot, Cpu, Stethoscope, BookOpen, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  depth: AssistantDepth;
  onDepthChange: (depth: AssistantDepth) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  depth,
  onDepthChange,
}) => {
  const modes: { id: AppMode; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'chat',
      label: 'Assistant Chat',
      shortLabel: 'Chat',
      icon: <Bot className="w-4 h-4 md:w-4 md:h-4" />,
    },
    {
      id: 'pipeline',
      label: '6-Phase Visualizer',
      shortLabel: 'Visualizer',
      icon: <Cpu className="w-4 h-4 md:w-4 md:h-4" />,
    },
    {
      id: 'doctor',
      label: 'Error Doctor',
      shortLabel: 'Errors',
      icon: <Stethoscope className="w-4 h-4 md:w-4 md:h-4" />,
    },
    {
      id: 'quiz',
      label: 'Theory & Quiz',
      shortLabel: 'Quiz',
      icon: <BookOpen className="w-4 h-4 md:w-4 md:h-4" />,
    },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div
              onClick={() => onSelectMode('chat')}
              className="flex items-center space-x-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-white tracking-tight text-sm sm:text-base">
                    Compiler<span className="text-indigo-400">AI</span>
                  </span>
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Assistant
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Simple & Interactive Compiler Guide
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Hidden on mobile) */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {modes.map((mode) => {
                const isActive = currentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onSelectMode(mode.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Depth Selector (Compact on mobile) */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-400 hidden sm:inline flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Level:
              </span>
              <div className="relative">
                <select
                  value={depth}
                  onChange={(e) => onDepthChange(e.target.value as AssistantDepth)}
                  className="appearance-none bg-slate-900 border border-slate-700/80 text-[11px] sm:text-xs text-slate-200 font-medium py-1 sm:py-1.5 pl-2.5 pr-6 rounded-lg hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Explanation Depth"
                >
                  <option value="beginner">🌱 Beginner</option>
                  <option value="intermediate">🎓 Student</option>
                  <option value="advanced">⚡ Dev</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible only on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'
                }`}
              >
                {mode.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{mode.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
